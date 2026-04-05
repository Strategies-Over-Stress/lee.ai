#!/usr/bin/env python3
"""Research pipeline cron orchestrator.

Runs the full autonomous pipeline:
    1. Discover new sources (crawl outbound links + AI suggestions)
    2. Sync articles from approved sources
    3. Summarize new articles via Anthropic API

Usage:
    python apps/research/cron.py              # Run full pipeline
    python apps/research/cron.py --skip-discover  # Skip discovery step
    python apps/research/cron.py --dry-run    # Show what would run

Install cron:
    python apps/research/cron.py --install    # Adds daily 6am cron job
    python apps/research/cron.py --uninstall  # Removes the cron job
"""

import argparse
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
LOG_DIR = SCRIPT_DIR / "logs"

CRON_SCHEDULE = "0 6 * * *"
CRON_MARKER = "# lee-ai-research-pipeline"


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)

    # Also write to log file
    LOG_DIR.mkdir(exist_ok=True)
    log_file = LOG_DIR / f"{datetime.now().strftime('%Y-%m-%d')}.log"
    with open(log_file, "a") as f:
        f.write(line + "\n")


def run_step(name, cmd):
    """Run a pipeline step, capture output, log results."""
    log(f"Starting: {name}")
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(PROJECT_ROOT),
        timeout=600,  # 10 minute timeout per step
    )

    # Log output
    if result.stdout.strip():
        for line in result.stdout.strip().split("\n"):
            log(f"  {line}")
    if result.returncode != 0:
        log(f"  ERROR (exit {result.returncode}): {result.stderr.strip()}")
        return False

    log(f"Completed: {name}")
    return True


def run_pipeline(skip_discover=False):
    """Run the full research pipeline."""
    log("=" * 60)
    log("Research pipeline started")
    log("=" * 60)

    python = sys.executable
    steps = []

    if not skip_discover:
        steps.append(("Discover sources (crawl)", [python, str(SCRIPT_DIR / "discover.py"), "crawl", "--limit", "10"]))
        steps.append(("Discover sources (suggest)", [python, str(SCRIPT_DIR / "discover.py"), "suggest", "--limit", "5"]))

    steps.append(("Sync articles", [python, str(SCRIPT_DIR / "research.py"), "sync", "--limit", "10"]))
    steps.append(("Summarize articles", [python, str(SCRIPT_DIR / "research.py"), "summarize", "--run", "--limit", "30"]))

    success = 0
    for name, cmd in steps:
        if run_step(name, cmd):
            success += 1

    log(f"\nPipeline complete: {success}/{len(steps)} steps succeeded")

    # Cleanup old logs (keep 30 days)
    if LOG_DIR.exists():
        cutoff = datetime.now().timestamp() - (30 * 86400)
        for log_file in LOG_DIR.glob("*.log"):
            if log_file.stat().st_mtime < cutoff:
                log_file.unlink()


def install_cron():
    """Install the daily cron job."""
    python = sys.executable
    script = str(Path(__file__).resolve())

    cron_cmd = f'{CRON_SCHEDULE} cd {PROJECT_ROOT} && {python} {script} >> {LOG_DIR / "cron.log"} 2>&1 {CRON_MARKER}'

    # Get existing crontab
    result = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    existing = result.stdout if result.returncode == 0 else ""

    # Check if already installed
    if CRON_MARKER in existing:
        print("Cron job already installed. Use --uninstall first to update.")
        return

    # Add new cron job
    new_crontab = existing.rstrip() + "\n" + cron_cmd + "\n"
    subprocess.run(["crontab", "-"], input=new_crontab, text=True, check=True)

    LOG_DIR.mkdir(exist_ok=True)
    print(f"Cron job installed: runs daily at 6:00 AM")
    print(f"  Schedule: {CRON_SCHEDULE}")
    print(f"  Logs: {LOG_DIR}/")
    print(f"  Remove: python {script} --uninstall")


def uninstall_cron():
    """Remove the daily cron job."""
    result = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    if result.returncode != 0:
        print("No crontab found.")
        return

    lines = [line for line in result.stdout.split("\n") if CRON_MARKER not in line]
    new_crontab = "\n".join(lines)

    if new_crontab.strip():
        subprocess.run(["crontab", "-"], input=new_crontab, text=True, check=True)
    else:
        subprocess.run(["crontab", "-r"], check=True)

    print("Cron job removed.")


def main():
    parser = argparse.ArgumentParser(description="Research pipeline cron orchestrator")
    parser.add_argument("--skip-discover", action="store_true", help="Skip source discovery step")
    parser.add_argument("--dry-run", action="store_true", help="Show what would run")
    parser.add_argument("--install", action="store_true", help="Install daily cron job")
    parser.add_argument("--uninstall", action="store_true", help="Remove cron job")

    args = parser.parse_args()

    if args.install:
        install_cron()
        return
    if args.uninstall:
        uninstall_cron()
        return
    if args.dry_run:
        print("Pipeline steps:")
        print("  1. Discover sources (crawl outbound links, limit 10)")
        print("  2. Discover sources (AI suggestions, limit 5)")
        print("  3. Sync articles from approved sources (limit 10/source)")
        print("  4. Summarize new articles via Anthropic API (limit 30)")
        print(f"\nWould run from: {PROJECT_ROOT}")
        print(f"Logs would go to: {LOG_DIR}/")
        return

    run_pipeline(skip_discover=args.skip_discover)


if __name__ == "__main__":
    main()
