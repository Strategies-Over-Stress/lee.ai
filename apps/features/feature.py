#!/usr/bin/env python3
"""Feature branch manager — ties Git branches to Jira ticket lifecycle.

Usage:
    python scripts/feature.py create "Add risk reversal" [-d "description"] [-f file.md] [-t epic] [-p RICH-1]
    python scripts/feature.py start RICH-5
    python scripts/feature.py switch RICH-5
    python scripts/feature.py pr [--title "PR title"] [--body "PR body"]
    python scripts/feature.py status

Lifecycle:
    create  → creates Jira ticket (TO DO) + git branch (does not check out)
    start   → checks out feature branch, moves ticket to IN PROGRESS
    switch  → checks out feature branch (no status change — for context switching)
    pr      → pushes branch, creates GitHub PR, moves ticket to IN REVIEW
    (manual) → jira.py move RICH-X "DONE" after PR merge

Environment variables (from .env):
    JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def load_env():
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

ISSUE_TYPES = {
    "task": "10122",
    "epic": "10123",
    "subtask": "10124",
}

TRANSITIONS = {
    "TO DO": "11",
    "IN PROGRESS": "21",
    "IN REVIEW": "2",
    "DONE": "31",
}

# ---------------------------------------------------------------------------
# Jira API helpers (shared with jira.py)
# ---------------------------------------------------------------------------

def _auth_header():
    import base64
    creds = base64.b64encode(f"{EMAIL}:{API_TOKEN}".encode()).decode()
    return f"Basic {creds}"


def jira_api(method, path, data=None):
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
        print(f"Jira API error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def md_to_adf(text):
    """Import md_to_adf from jira.py to avoid duplication."""
    scripts_dir = Path(__file__).resolve().parent
    sys.path.insert(0, str(scripts_dir))
    from jira import md_to_adf as _md_to_adf
    return _md_to_adf(text)

# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

def git(*args):
    result = subprocess.run(
        ["git"] + list(args),
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"git error: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def gh(*args):
    result = subprocess.run(
        ["gh"] + list(args),
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"gh error: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def current_branch():
    return git("rev-parse", "--abbrev-ref", "HEAD")


def resolve_ticket(ref):
    """Resolve a ticket reference to a full key. '5' → 'RICH-5', 'RICH-5' → 'RICH-5'."""
    ref = ref.strip().upper()
    if re.match(r"^\d+$", ref):
        return f"{PROJECT_KEY}-{ref}"
    return ref


def ticket_from_branch(branch=None):
    """Extract ticket key from branch name like feature/RICH-5-some-description."""
    branch = branch or current_branch()
    match = re.match(rf"feature/({PROJECT_KEY}-\d+)", branch)
    if not match:
        return None
    return match.group(1)


def slugify(text):
    """Convert text to branch-safe slug."""
    slug = text.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:50]

# ---------------------------------------------------------------------------
# Jira ticket helpers
# ---------------------------------------------------------------------------

def create_ticket(summary, description=None, issue_type="task", parent=None):
    fields = {
        "project": {"key": PROJECT_KEY},
        "issuetype": {"id": ISSUE_TYPES[issue_type]},
        "summary": summary,
    }
    if description:
        fields["description"] = md_to_adf(description)
    if parent:
        fields["parent"] = {"key": parent}

    result = jira_api("POST", "/issue", {"fields": fields})
    return result["key"]


def transition_ticket(ticket_key, status):
    status = status.upper()
    if status not in TRANSITIONS:
        return
    jira_api("POST", f"/issue/{ticket_key}/transitions", {
        "transition": {"id": TRANSITIONS[status]},
    })


def get_ticket(ticket_key):
    return jira_api("GET", f"/issue/{ticket_key}")

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_create(args):
    # Resolve description
    desc_text = None
    if args.file:
        desc_text = Path(args.file).read_text()
    elif args.description:
        desc_text = args.description

    # Create Jira ticket (stays in TO DO)
    ticket_key = create_ticket(
        summary=args.summary,
        description=desc_text,
        issue_type=args.type,
        parent=args.parent,
    )
    print(f"Created {ticket_key} — {BASE_URL}/browse/{ticket_key}")

    # Create feature branch (but stay on current branch)
    slug = slugify(args.summary)
    branch_name = f"feature/{ticket_key}-{slug}"
    git("branch", branch_name)
    print(f"Branch created: {branch_name}")
    print(f"{ticket_key} → TO DO")


def cmd_start(args):
    ticket_key = resolve_ticket(args.ticket)

    # Find the branch matching this ticket
    all_branches = git("branch", "--list", f"feature/{ticket_key}-*").strip()
    if not all_branches:
        print(f"Error: no branch found for {ticket_key}", file=sys.stderr)
        sys.exit(1)

    branch_name = all_branches.strip().lstrip("* ").split("\n")[0].strip()
    git("checkout", branch_name)
    print(f"Checked out {branch_name}")

    # Move ticket to IN PROGRESS
    transition_ticket(ticket_key, "IN PROGRESS")
    print(f"{ticket_key} → IN PROGRESS")


def cmd_switch(args):
    ticket_key = resolve_ticket(args.ticket)

    # Find the branch matching this ticket
    all_branches = git("branch", "--list", f"feature/{ticket_key}-*").strip()
    if not all_branches:
        print(f"Error: no branch found for {ticket_key}", file=sys.stderr)
        sys.exit(1)

    branch_name = all_branches.strip().lstrip("* ").split("\n")[0].strip()
    git("checkout", branch_name)
    print(f"Checked out {branch_name}")


def cmd_pr(args):
    branch = current_branch()
    ticket_key = ticket_from_branch(branch)

    if not ticket_key:
        print(f"Error: current branch '{branch}' doesn't match feature/{{TICKET}}-* pattern", file=sys.stderr)
        sys.exit(1)

    # Get ticket info for PR defaults
    issue = get_ticket(ticket_key)
    summary = issue["fields"]["summary"]
    ticket_url = f"{BASE_URL}/browse/{ticket_key}"

    # Push branch
    git("push", "-u", "origin", branch)
    print(f"Pushed {branch}")

    # Build PR title and body
    pr_title = args.title or f"[{ticket_key}] {summary}"
    pr_body = args.body or f"## Summary\n\nResolves [{ticket_key}]({ticket_url})\n\n## Test plan\n\n- [ ] Verify changes locally\n- [ ] Review in staging"

    # Create PR
    pr_url = gh(
        "pr", "create",
        "--title", pr_title,
        "--body", pr_body,
        "--base", "main",
    )
    print(f"PR created — {pr_url}")

    # Add PR link as comment on ticket
    jira_api("POST", f"/issue/{ticket_key}/comment", {
        "body": md_to_adf(f"PR opened: {pr_url}"),
    })

    # Move ticket to IN REVIEW
    transition_ticket(ticket_key, "IN REVIEW")
    print(f"{ticket_key} → IN REVIEW")


def cmd_status(args):
    branch = current_branch()
    ticket_key = ticket_from_branch(branch)

    if not ticket_key:
        print(f"  Branch:  {branch}")
        print(f"  Ticket:  (none — not a feature branch)")
        return

    issue = get_ticket(ticket_key)
    fields = issue["fields"]

    print(f"  Branch:  {branch}")
    print(f"  Ticket:  {ticket_key}")
    print(f"  Summary: {fields['summary']}")
    print(f"  Status:  {fields['status']['name']}")
    print(f"  URL:     {BASE_URL}/browse/{ticket_key}")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Feature branch manager — ties Git branches to Jira tickets",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # create
    p_create = sub.add_parser("create", help="Create ticket + branch (stays in TO DO)")
    p_create.add_argument("summary", help="Ticket title (also used to generate branch name)")
    p_create.add_argument("-d", "--description", default=None, help="Ticket description (supports markdown)")
    p_create.add_argument("-f", "--file", default=None, help="Read description from a markdown file")
    p_create.add_argument("-t", "--type", default="task", choices=ISSUE_TYPES.keys(), help="Issue type (default: task)")
    p_create.add_argument("-p", "--parent", default=None, help="Parent issue key for subtasks")

    # start
    p_start = sub.add_parser("start", help="Checkout feature branch, move ticket to IN PROGRESS")
    p_start.add_argument("ticket", help="Ticket key (e.g., RICH-5)")

    # switch
    p_switch = sub.add_parser("switch", help="Switch to a different feature branch (no status change)")
    p_switch.add_argument("ticket", help="Ticket key (e.g., RICH-5)")

    # pr
    p_pr = sub.add_parser("pr", help="Push branch, create PR, move ticket to IN REVIEW")
    p_pr.add_argument("--title", default=None, help="PR title (default: [TICKET] summary)")
    p_pr.add_argument("--body", default=None, help="PR body (default: auto-generated)")

    # status
    sub.add_parser("status", help="Show current branch and linked ticket status")

    args = parser.parse_args()

    commands = {
        "create": cmd_create,
        "start": cmd_start,
        "switch": cmd_switch,
        "pr": cmd_pr,
        "status": cmd_status,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
