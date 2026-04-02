#!/usr/bin/env python3
"""Jira CLI for the lee.ai project.

Usage:
    python scripts/jira.py create --summary "Title" [--description "Body"] [--type task|epic|subtask] [--parent RICH-1]
    python scripts/jira.py create --summary "Title" --file description.md
    python scripts/jira.py move RICH-1 "IN PROGRESS"
    python scripts/jira.py view RICH-1
    python scripts/jira.py list [--status "To Do"] [--type task|epic]
    python scripts/jira.py comment RICH-1 "Comment text"

Descriptions support markdown:
    ## Headings        → ADF heading blocks
    **bold**           → bold/strong marks
    `code`             → inline code marks
    - bullet items     → bullet list
    1. numbered items  → ordered list
    plain paragraphs   → paragraph blocks

Environment variables (from .env):
    JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
"""

import argparse
import base64
import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def load_env():
    """Load .env from project root."""
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if not env_path.exists():
        print(f"Error: .env not found at {env_path}", file=sys.stderr)
        sys.exit(1)
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env()

BASE_URL = os.environ["JIRA_BASE_URL"]
EMAIL = os.environ["JIRA_EMAIL"]
API_TOKEN = os.environ["JIRA_API_TOKEN"]
PROJECT_KEY = os.environ.get("JIRA_PROJECT_KEY", "RICH")

# ---------------------------------------------------------------------------
# HTTP / API
# ---------------------------------------------------------------------------

def _auth_header():
    creds = base64.b64encode(f"{EMAIL}:{API_TOKEN}".encode()).decode()
    return f"Basic {creds}"


def api(method, path, data=None):
    url = f"{BASE_URL}/rest/api/3{path}"
    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, method=method)
    req.add_header("Authorization", _auth_header())
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    try:
        with urlopen(req) as resp:
            if resp.status == 204:
                return {}
            return json.loads(resp.read())
    except HTTPError as e:
        error_body = e.read().decode()
        print(f"Error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)

# ---------------------------------------------------------------------------
# Issue type auto-discovery
# ---------------------------------------------------------------------------

_issue_type_cache = None
_CACHE_FILE = Path(__file__).resolve().parent.parent.parent / ".jira-cache.json"
_CACHE_TTL = 86400  # 24 hours


def _load_disk_cache():
    """Load cached issue types from disk if fresh. Returns dict or None."""
    if not _CACHE_FILE.exists():
        return None
    try:
        data = json.loads(_CACHE_FILE.read_text())
        entry = data.get(BASE_URL)
        if not entry:
            return None
        import time
        if time.time() - entry.get("ts", 0) > _CACHE_TTL:
            return None
        return entry["types"]
    except (json.JSONDecodeError, KeyError):
        return None


def _save_disk_cache(types):
    """Persist issue types to disk, keyed by Jira instance URL."""
    import time
    data = {}
    if _CACHE_FILE.exists():
        try:
            data = json.loads(_CACHE_FILE.read_text())
        except json.JSONDecodeError:
            pass
    data[BASE_URL] = {"types": types, "ts": time.time()}
    _CACHE_FILE.write_text(json.dumps(data, indent=2))


def get_issue_types():
    """Auto-discover issue types from the Jira instance. Returns {lowercase_name: id}."""
    global _issue_type_cache
    if _issue_type_cache is not None:
        return _issue_type_cache

    # Check for env overrides first (JIRA_ISSUE_TYPE_TASK=10122 etc.)
    env_types = {}
    for key, val in os.environ.items():
        if key.startswith("JIRA_ISSUE_TYPE_"):
            type_name = key[len("JIRA_ISSUE_TYPE_"):].lower()
            env_types[type_name] = val
    if env_types:
        _issue_type_cache = env_types
        return _issue_type_cache

    # Check disk cache
    cached = _load_disk_cache()
    if cached:
        _issue_type_cache = cached
        return _issue_type_cache

    # Discover from API
    try:
        all_types = api("GET", "/issuetype")
        types = {}
        for it in all_types:
            name = it["name"].lower().replace(" ", "")
            types[name] = str(it["id"])
        _issue_type_cache = types
        _save_disk_cache(types)
        return _issue_type_cache
    except SystemExit:
        print("Error: could not discover issue types. Set JIRA_ISSUE_TYPE_TASK etc. in .env", file=sys.stderr)
        sys.exit(1)


def get_issue_type_id(name):
    """Get issue type ID by name (case-insensitive). Exits on failure."""
    name = name.lower().replace(" ", "")
    types = get_issue_types()
    if name in types:
        return types[name]
    # Fuzzy match
    for key, val in types.items():
        if name in key or key in name:
            return val
    available = ", ".join(sorted(types.keys()))
    print(f"Error: issue type '{name}' not found. Available: {available}", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Transition auto-discovery
# ---------------------------------------------------------------------------

def get_transitions(ticket_key):
    """Discover available transitions for a ticket. Returns {UPPERCASE_NAME: id}."""
    result = api("GET", f"/issue/{ticket_key}/transitions")
    return {t["name"].upper(): str(t["id"]) for t in result.get("transitions", [])}


def transition_ticket(ticket_key, status):
    """Move a ticket to a new status. Discovers valid transitions from the API."""
    status = status.upper()
    transitions = get_transitions(ticket_key)
    if status not in transitions:
        valid = ", ".join(f'"{s}"' for s in sorted(transitions.keys()))
        print(f"Error: transition to \"{status}\" not available. Valid: {valid}", file=sys.stderr)
        sys.exit(1)
    api("POST", f"/issue/{ticket_key}/transitions", {
        "transition": {"id": transitions[status]},
    })

# ---------------------------------------------------------------------------
# Markdown → ADF converter
# ---------------------------------------------------------------------------

def _parse_inline(text):
    """Parse inline markdown (**bold**, `code`) into ADF text nodes."""
    nodes = []
    pattern = r"(\*\*(.+?)\*\*|`(.+?)`)"
    last_end = 0

    for match in re.finditer(pattern, text):
        if match.start() > last_end:
            plain = text[last_end : match.start()]
            if plain:
                nodes.append({"type": "text", "text": plain})

        if match.group(2):  # **bold**
            nodes.append({
                "type": "text",
                "text": match.group(2),
                "marks": [{"type": "strong"}],
            })
        elif match.group(3):  # `code`
            nodes.append({
                "type": "text",
                "text": match.group(3),
                "marks": [{"type": "code"}],
            })

        last_end = match.end()

    if last_end < len(text):
        remaining = text[last_end:]
        if remaining:
            nodes.append({"type": "text", "text": remaining})

    return nodes if nodes else [{"type": "text", "text": text}]


def md_to_adf(text):
    """Convert markdown-formatted text to Atlassian Document Format.

    Supported syntax:
        ## Heading          → heading (level 2)
        ### Heading         → heading (level 3)
        **bold**            → strong mark
        `code`              → code mark
        - item              → bulletList
        1. item             → orderedList
        blank line          → paragraph separator
    """
    if not text:
        return {"version": 1, "type": "doc", "content": []}

    lines = text.split("\n")
    blocks = []
    i = 0

    while i < len(lines):
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading_match:
            level = len(heading_match.group(1))
            blocks.append({
                "type": "heading",
                "attrs": {"level": level},
                "content": _parse_inline(heading_match.group(2)),
            })
            i += 1
            continue

        if re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                item_text = re.sub(r"^\s*[-*]\s+", "", lines[i])
                items.append({
                    "type": "listItem",
                    "content": [{
                        "type": "paragraph",
                        "content": _parse_inline(item_text),
                    }],
                })
                i += 1
            blocks.append({"type": "bulletList", "content": items})
            continue

        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                item_text = re.sub(r"^\s*\d+\.\s+", "", lines[i])
                items.append({
                    "type": "listItem",
                    "content": [{
                        "type": "paragraph",
                        "content": _parse_inline(item_text),
                    }],
                })
                i += 1
            blocks.append({
                "type": "orderedList",
                "attrs": {"order": 1},
                "content": items,
            })
            continue

        para_lines = []
        while (
            i < len(lines)
            and lines[i].strip()
            and not re.match(r"^#{1,6}\s+", lines[i])
            and not re.match(r"^\s*[-*]\s+", lines[i])
            and not re.match(r"^\s*\d+\.\s+", lines[i])
        ):
            para_lines.append(lines[i])
            i += 1

        if para_lines:
            blocks.append({
                "type": "paragraph",
                "content": _parse_inline(" ".join(para_lines)),
            })

    return {"version": 1, "type": "doc", "content": blocks}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_create(args):
    issue_type_id = get_issue_type_id(args.type)
    fields = {
        "project": {"key": PROJECT_KEY},
        "issuetype": {"id": issue_type_id},
        "summary": args.summary,
    }

    desc_text = None
    if args.file:
        desc_text = Path(args.file).read_text()
    elif args.description:
        desc_text = args.description

    if desc_text:
        fields["description"] = md_to_adf(desc_text)
    if args.parent:
        fields["parent"] = {"key": args.parent}

    result = api("POST", "/issue", {"fields": fields})
    key = result["key"]
    url = f"{BASE_URL}/browse/{key}"
    print(f"Created {key} — {url}")
    return key


def cmd_move(args):
    ticket = args.ticket.upper()
    transition_ticket(ticket, args.status)
    print(f"{ticket} → {args.status.upper()}")


def cmd_view(args):
    ticket = args.ticket.upper()
    issue = api("GET", f"/issue/{ticket}")
    fields = issue["fields"]

    print(f"  Key:     {issue['key']}")
    print(f"  Summary: {fields['summary']}")
    print(f"  Status:  {fields['status']['name']}")
    print(f"  Type:    {fields['issuetype']['name']}")
    if fields.get("parent"):
        print(f"  Parent:  {fields['parent']['key']}")
    print(f"  URL:     {BASE_URL}/browse/{issue['key']}")

    desc = fields.get("description")
    if desc and desc.get("content"):
        print(f"  ---")
        for block in desc["content"]:
            if block["type"] == "paragraph":
                text = "".join(
                    node.get("text", "") for node in block.get("content", [])
                )
                print(f"  {text}")
            elif block["type"] == "heading":
                text = "".join(
                    node.get("text", "") for node in block.get("content", [])
                )
                print(f"\n  ## {text}")
            elif block["type"] in ("orderedList", "bulletList"):
                for i, item in enumerate(block.get("content", []), 1):
                    for p in item.get("content", []):
                        text = "".join(
                            node.get("text", "") for node in p.get("content", [])
                        )
                        prefix = f"  {i}." if block["type"] == "orderedList" else "  -"
                        print(f"  {prefix} {text}")


def cmd_list(args):
    jql_parts = [f"project = {PROJECT_KEY}"]
    if args.status:
        jql_parts.append(f'status = "{args.status}"')
    if args.type:
        jql_parts.append(f'issuetype = "{args.type}"')

    jql = " AND ".join(jql_parts) + " ORDER BY created DESC"
    result = api("POST", "/search/jql", {
        "jql": jql,
        "maxResults": 50,
        "fields": ["summary", "status", "issuetype", "parent"],
    })

    issues = result.get("issues", [])
    if not issues:
        print("No issues found.")
        return

    for issue in issues:
        f = issue["fields"]
        parent = f""" (parent: {f["parent"]["key"]})""" if f.get("parent") else ""
        print(f'  {issue["key"]}  [{f["status"]["name"]}]  {f["summary"]}{parent}')

    print(f"\n  {len(issues)} issue(s)")


def cmd_edit(args):
    ticket = args.ticket.upper()
    fields = {}

    if args.summary:
        fields["summary"] = args.summary

    desc_text = None
    if args.file:
        desc_text = Path(args.file).read_text()
    elif args.description:
        desc_text = args.description

    if desc_text:
        fields["description"] = md_to_adf(desc_text)

    if not fields:
        print("Error: provide --summary, --description, or --file to edit", file=sys.stderr)
        sys.exit(1)

    api("PUT", f"/issue/{ticket}", {"fields": fields})
    print(f"Updated {ticket} — {BASE_URL}/browse/{ticket}")


def cmd_delete(args):
    ticket = args.ticket.upper()
    api("DELETE", f"/issue/{ticket}")
    print(f"Deleted {ticket}")


def cmd_comment(args):
    ticket = args.ticket.upper()
    api("POST", f"/issue/{ticket}/comment", {"body": md_to_adf(args.text)})
    print(f"Comment added to {ticket}")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Jira CLI for lee.ai",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # create
    p_create = sub.add_parser("create", help="Create a new issue")
    p_create.add_argument("--summary", "-s", required=True, help="Issue title")
    p_create.add_argument("--description", "-d", default=None, help="Issue description (supports markdown)")
    p_create.add_argument("--file", "-f", default=None, help="Read description from a markdown file")
    p_create.add_argument("--type", "-t", default="task", type=str.lower, help="Issue type (auto-discovered from Jira)")
    p_create.add_argument("--parent", "-p", default=None, help="Parent issue key for subtasks (e.g., RICH-1)")

    # edit
    p_edit = sub.add_parser("edit", help="Edit an existing issue")
    p_edit.add_argument("ticket", help="Issue key (e.g., RICH-1)")
    p_edit.add_argument("--summary", "-s", default=None, help="New summary/title")
    p_edit.add_argument("--description", "-d", default=None, help="New description (supports markdown)")
    p_edit.add_argument("--file", "-f", default=None, help="Read new description from a markdown file")

    # move
    p_move = sub.add_parser("move", help="Transition an issue to a new status")
    p_move.add_argument("ticket", help="Issue key (e.g., RICH-1)")
    p_move.add_argument("status", help='Target status (auto-discovered from Jira)')

    # view
    p_view = sub.add_parser("view", help="View issue details")
    p_view.add_argument("ticket", help="Issue key (e.g., RICH-1)")

    # list
    p_list = sub.add_parser("list", help="List issues")
    p_list.add_argument("--status", default=None, help="Filter by status")
    p_list.add_argument("--type", default=None, help="Filter by issue type")

    # delete
    p_delete = sub.add_parser("delete", help="Delete an issue")
    p_delete.add_argument("ticket", help="Issue key (e.g., RICH-3)")

    # comment
    p_comment = sub.add_parser("comment", help="Add a comment to an issue")
    p_comment.add_argument("ticket", help="Issue key (e.g., RICH-1)")
    p_comment.add_argument("text", help="Comment text")

    args = parser.parse_args()

    commands = {
        "create": cmd_create,
        "edit": cmd_edit,
        "delete": cmd_delete,
        "move": cmd_move,
        "view": cmd_view,
        "list": cmd_list,
        "comment": cmd_comment,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
