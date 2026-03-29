#!/usr/bin/env python3
"""Source discovery — finds new relevant websites and adds them to the approval queue.

Usage:
    python apps/research/discover.py crawl [--limit 20]
    python apps/research/discover.py suggest [--limit 10]

Methods:
    crawl    — Scans outbound links from existing articles to find new blogs/sites
    suggest  — Uses Anthropic API to suggest relevant sources based on business context

Both methods add discovered sources as 'pending' — they never auto-approve.
Review via: python apps/research/research.py sources review
Or via the Studio UI: localhost:3001/sources
"""

import json
import os
import re
import sqlite3
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

DB_PATH = Path(__file__).resolve().parent / "research.db"


def load_env():
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


load_env()


def get_db():
    db = sqlite3.connect(str(DB_PATH))
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    return db


USER_AGENT = "lee-ai-research/1.0 (source discovery)"

# Domains to never suggest (too broad, not blogs, or paywalled)
DOMAIN_BLACKLIST = {
    "google.com", "youtube.com", "facebook.com", "twitter.com", "x.com",
    "instagram.com", "linkedin.com", "reddit.com", "wikipedia.org",
    "amazon.com", "apple.com", "microsoft.com", "github.com",
    "stackoverflow.com", "medium.com", "substack.com", "notion.so",
    "docs.google.com", "drive.google.com", "fonts.googleapis.com",
    "cdn.jsdelivr.net", "unpkg.com", "cloudflare.com",
    "w3.org", "schema.org", "googleapis.com", "gstatic.com",
}

# Patterns that indicate a blog/article section
BLOG_PATTERNS = [
    r"/blog/?$", r"/articles/?$", r"/posts/?$", r"/insights/?$",
    r"/resources/?$", r"/news/?$", r"/journal/?$", r"/writing/?$",
]

# ---------------------------------------------------------------------------
# Crawl — discover sources from outbound links in existing articles
# ---------------------------------------------------------------------------

def extract_outbound_domains(html_content, source_domain):
    """Extract unique external domains from HTML content."""
    domains = set()
    for match in re.finditer(r'href=["\']https?://([^/\s"\']+)', html_content):
        domain = match.group(1).lower()
        # Strip www.
        if domain.startswith("www."):
            domain = domain[4:]
        # Skip same domain and blacklisted
        if domain == source_domain or domain in DOMAIN_BLACKLIST:
            continue
        # Skip subdomains of blacklisted
        if any(domain.endswith(f".{bl}") for bl in DOMAIN_BLACKLIST):
            continue
        domains.add(domain)
    return domains


def find_blog_url(domain):
    """Try to find a blog/articles page on a domain."""
    # Try common blog paths
    for path in ["/blog", "/blog/", "/articles", "/insights", "/resources", "/news", "/posts"]:
        url = f"https://{domain}{path}"
        try:
            req = Request(url)
            req.add_header("User-Agent", USER_AGENT)
            with urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    return url
        except Exception:
            continue

    # Fallback to root domain
    try:
        req = Request(f"https://{domain}")
        req.add_header("User-Agent", USER_AGENT)
        with urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                content = resp.read().decode("utf-8", errors="replace")
                # Check if the homepage has article-like links
                for pattern in BLOG_PATTERNS:
                    match = re.search(rf'href=["\']([^"\']*{pattern})', content)
                    if match:
                        href = match.group(1)
                        if href.startswith("/"):
                            return f"https://{domain}{href}"
                        return href
    except Exception:
        pass

    return None


def cmd_crawl(args):
    """Discover new sources by scanning outbound links from existing articles."""
    db = get_db()

    # Get existing source domains to skip
    existing = db.execute("SELECT domain FROM sources").fetchall()
    existing_domains = {r["domain"].lower().replace("www.", "") for r in existing}

    # Get raw HTML from recent articles
    articles = db.execute(
        "SELECT raw_content, url FROM articles ORDER BY fetched_at DESC LIMIT 100"
    ).fetchall()

    if not articles:
        print("No articles to scan. Run sync first.")
        return

    print(f"  Scanning {len(articles)} articles for outbound links...\n")

    # Collect all outbound domains
    discovered_domains = {}
    for article in articles:
        source_domain = re.match(r"https?://([^/]+)", article["url"])
        if not source_domain:
            continue
        sd = source_domain.group(1).lower().replace("www.", "")

        domains = extract_outbound_domains(article["raw_content"] or "", sd)
        for domain in domains:
            clean = domain.replace("www.", "")
            if clean not in existing_domains:
                discovered_domains[clean] = discovered_domains.get(clean, 0) + 1

    # Sort by frequency (most referenced = most likely relevant)
    ranked = sorted(discovered_domains.items(), key=lambda x: -x[1])[:args.limit]

    if not ranked:
        print("  No new domains discovered.")
        return

    print(f"  Found {len(ranked)} new domains. Checking for blog pages...\n")

    added = 0
    for domain, count in ranked:
        blog_url = find_blog_url(domain)
        if not blog_url:
            print(f"    ✕ {domain} (no blog found, referenced {count}x)")
            continue

        try:
            db.execute(
                "INSERT INTO sources (url, name, domain, status) VALUES (?, ?, ?, 'pending')",
                (blog_url, domain, domain),
            )
            added += 1
            print(f"    + {domain} → {blog_url} (referenced {count}x)")
        except sqlite3.IntegrityError:
            print(f"    ~ {domain} (already exists)")

        time.sleep(0.5)  # Rate limit

    db.commit()
    print(f"\n  {added} new source(s) added to pending queue")


# ---------------------------------------------------------------------------
# Suggest — use AI to recommend new sources
# ---------------------------------------------------------------------------

SUGGEST_PROMPT = """Based on the following list of research sources I already follow, suggest new websites and blogs I should add to my research pipeline.

BUSINESS CONTEXT:
I'm an AI-first technical consultant targeting non-technical founders of DTC/e-commerce brands ($500K-$5M revenue). I need sources covering: AI development workflows, fractional CTO / consulting business models, e-commerce technology, LinkedIn marketing, and freelance/indie business strategy.

CURRENT SOURCES:
{sources}

RULES:
- Suggest {limit} new sources I'm NOT already following
- Each suggestion must be a specific blog/articles URL, not a homepage
- Focus on high-quality, regularly updated sources
- No paywalled content, no social media platforms, no generic news sites
- Return ONLY a JSON array of objects with "url" and "reason" fields
- Example: [{{"url": "https://example.com/blog", "reason": "Leading voice on fractional CTO positioning"}}]"""


def cmd_suggest(args):
    """Use Anthropic API to suggest new relevant sources."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set in .env", file=sys.stderr)
        sys.exit(1)

    db = get_db()
    sources = db.execute("SELECT url, name FROM sources WHERE status = 'approved'").fetchall()
    source_list = "\n".join(f"- {s['name']} ({s['url']})" for s in sources)

    prompt = SUGGEST_PROMPT.format(sources=source_list, limit=args.limit)

    payload = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1500,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()

    req = Request("https://api.anthropic.com/v1/messages", data=payload, method="POST")
    req.add_header("x-api-key", api_key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("content-type", "application/json")

    print("  Asking AI for source suggestions...\n")

    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            text = data["content"][0]["text"]
    except HTTPError as e:
        print(f"  API error {e.code}: {e.read().decode()}", file=sys.stderr)
        sys.exit(1)

    # Parse JSON from response
    json_match = re.search(r"\[.*\]", text, re.DOTALL)
    if not json_match:
        print(f"  Could not parse suggestions. Raw response:\n{text}")
        return

    try:
        suggestions = json.loads(json_match.group())
    except json.JSONDecodeError:
        print(f"  Invalid JSON in response:\n{text}")
        return

    added = 0
    for s in suggestions:
        url = s.get("url", "").rstrip("/")
        reason = s.get("reason", "")
        if not url:
            continue

        domain = re.match(r"https?://([^/]+)", url)
        if not domain:
            continue
        domain = domain.group(1)

        try:
            db.execute(
                "INSERT INTO sources (url, name, domain, status) VALUES (?, ?, ?, 'pending')",
                (url, domain, domain),
            )
            added += 1
            print(f"    + {url}")
            print(f"      {reason}")
        except sqlite3.IntegrityError:
            print(f"    ~ {url} (already exists)")

    db.commit()
    print(f"\n  {added} new source(s) added to pending queue")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Discover new research sources",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_crawl = sub.add_parser("crawl", help="Discover sources from outbound links in existing articles")
    p_crawl.add_argument("--limit", type=int, default=20, help="Max domains to check (default: 20)")

    p_suggest = sub.add_parser("suggest", help="Get AI-suggested sources based on business context")
    p_suggest.add_argument("--limit", type=int, default=10, help="Number of suggestions (default: 10)")

    args = parser.parse_args()
    {"crawl": cmd_crawl, "suggest": cmd_suggest}[args.command](args)


if __name__ == "__main__":
    main()
