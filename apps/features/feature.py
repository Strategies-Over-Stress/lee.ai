#!/usr/bin/env python3
"""Feature branch manager — ties Git branches to Jira ticket lifecycle.

Usage:
    python scripts/feature.py create "Title" [-d "desc"] [-f file.md] [-t task] [-p RICH-1]
    python scripts/feature.py start RICH-5
    python scripts/feature.py switch RICH-5
    python scripts/feature.py pr [--title "..."] [--body "..."]
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
import re
import subprocess
import sys
from pathlib import Path

from jira import (
    api,
    md_to_adf,
    get_issue_type_id,
    transition_ticket,
    BASE_URL,
    PROJECT_KEY,
)

# ---------------------------------------------------------------------------
# Git / GitHub helpers
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
# Commands
# ---------------------------------------------------------------------------

def cmd_create(args):
    desc_text = None
    if args.file:
        desc_text = Path(args.file).read_text()
    elif args.description:
        desc_text = args.description

    issue_type_id = get_issue_type_id(args.type)
    fields = {
        "project": {"key": PROJECT_KEY},
        "issuetype": {"id": issue_type_id},
        "summary": args.summary,
    }
    if desc_text:
        fields["description"] = md_to_adf(desc_text)
    if args.parent:
        fields["parent"] = {"key": args.parent}

    result = api("POST", "/issue", {"fields": fields})
    ticket_key = result["key"]
    print(f"Created {ticket_key} — {BASE_URL}/browse/{ticket_key}")

    slug = slugify(args.summary)
    branch_name = f"feature/{ticket_key}-{slug}"
    git("branch", branch_name)
    print(f"Branch created: {branch_name}")
    print(f"{ticket_key} → TO DO")


def cmd_start(args):
    ticket_key = resolve_ticket(args.ticket)

    all_branches = git("branch", "--list", f"feature/{ticket_key}-*").strip()
    if not all_branches:
        print(f"Error: no branch found for {ticket_key}", file=sys.stderr)
        sys.exit(1)

    branch_name = all_branches.strip().lstrip("* ").split("\n")[0].strip()
    git("checkout", branch_name)
    print(f"Checked out {branch_name}")

    transition_ticket(ticket_key, "IN PROGRESS")
    print(f"{ticket_key} → IN PROGRESS")


def cmd_switch(args):
    ticket_key = resolve_ticket(args.ticket)

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

    issue = api("GET", f"/issue/{ticket_key}")
    summary = issue["fields"]["summary"]
    ticket_url = f"{BASE_URL}/browse/{ticket_key}"

    git("push", "-u", "origin", branch)
    print(f"Pushed {branch}")

    pr_title = args.title or f"[{ticket_key}] {summary}"
    pr_body = args.body or f"## Summary\n\nResolves [{ticket_key}]({ticket_url})\n\n## Test plan\n\n- [ ] Verify changes locally\n- [ ] Review in staging"

    pr_url = gh(
        "pr", "create",
        "--title", pr_title,
        "--body", pr_body,
        "--base", "main",
    )
    print(f"PR created — {pr_url}")

    api("POST", f"/issue/{ticket_key}/comment", {
        "body": md_to_adf(f"PR opened: {pr_url}"),
    })

    transition_ticket(ticket_key, "IN REVIEW")
    print(f"{ticket_key} → IN REVIEW")


def cmd_status(args):
    branch = current_branch()
    ticket_key = ticket_from_branch(branch)

    if not ticket_key:
        print(f"  Branch:  {branch}")
        print(f"  Ticket:  (none — not a feature branch)")
        return

    issue = api("GET", f"/issue/{ticket_key}")
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
    p_create.add_argument("-t", "--type", default="task", type=str.lower, help="Issue type (auto-discovered from Jira)")
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
