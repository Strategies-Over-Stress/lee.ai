# Pilot — AI-Assisted Build Planning & Execution System

Pilot is a desktop app + CLI workflow for planning, reviewing, and executing code changes through a structured session-based process.

## Overview

Pilot bridges the gap between a Claude Code conversation (where you research and decide what to build) and the actual code changes. Instead of Claude writing code directly, it creates a **session** — a plan with a build script — that you review, comment on, iterate, and approve before anything touches your codebase.

## Architecture

```
┌──────────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Claude Code (CLI)   │────▶│  .pilot/sessions/ │◀────│  Pilot App     │
│                      │     │  .pilot/research/ │     │  (Tauri/React) │
│  /pilot "goal"       │     │  .pilot/pilot.json│     │                │
│  /pilot-run          │     └──────────────────┘     │  Review/Comment│
│  /pilot-init         │                               │  Approve/Iterate│
└──────────────────────┘                               └────────────────┘
                                                              │
                                                              ▼
                                                       ┌────────────────┐
                                                       │  SQLite DB     │
                                                       │  (Tauri data)  │
                                                       │                │
                                                       │  Sessions      │
                                                       │  Research      │
                                                       │  Versions      │
                                                       │  Comments      │
                                                       │  Projects      │
                                                       └────────────────┘
```

## Prerequisites

- **Rust toolchain** — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Node.js 20+** — for the React frontend
- **Claude Code** — for `/pilot` and `/pilot-run` commands

## Installation

```bash
# From the project root
cd apps/pilot
npm install
npm run dev    # First run compiles Rust (~60s), then instant
```

## Slash Commands

### `/pilot-init`

Initializes Pilot in the current project directory:
- Creates `.pilot/sessions/` and `.pilot/research/`
- Creates `.pilot/pilot.json` with the project name

### `/pilot "goal"`

Creates a new session:
1. Reads `.pilot/research/context.json` for active research context
2. Reads relevant source files
3. Generates `session.json` (the plan) + `build.py` (the execution script)
4. Writes both to `.pilot/sessions/<id>/`

**Rules enforced:**
- No web searches or research — that happens in conversation, not in Pilot
- Prefers `edit_file()` over full rewrites
- Every change requires detailed `details` and `snippet` fields
- Research context comes from enqueued files, not live searches

### `/pilot-run`

Handles the current session based on status:
- **iterating** — processes comments, updates build script, clears comments
- **approved** — executes `python3 build.py`
- **awaiting_review** — tells you to review first
- **failed** — shows error, offers to iterate

## Session Lifecycle

```
/pilot "goal"
    │
    ▼
awaiting_review  ←──────────────────┐
    │                                │
    ├── User reviews in Pilot app    │
    ├── Adds comments                │
    ├── Clicks "Iterate"             │
    │       │                        │
    │       ▼                        │
    │   iterating                    │
    │       │                        │
    │       ▼ (/pilot-run)           │
    │   Comments processed           │
    │   Build script updated ────────┘
    │
    ├── User clicks "Approve"
    │       │
    │       ▼
    │   approved
    │       │
    │       ▼ (/pilot-run)
    │   Build script executes
    │       │
    │       ├── Success → done
    │       └── Failure → failed
    │                       │
    │                       ├── Re-approve → approved (retry)
    │                       └── Iterate → fix and retry
    │
    └── done ✓
```

## Research Management

Research files are stored in the SQLite database, scoped per project.

### Adding Research
Research is created during Claude Code conversations. Save findings to `.pilot/research/` or add them directly in the Pilot app's Research page.

### Enqueuing for /pilot
1. Open the Pilot app → Research tab
2. Check the files you want as context
3. Click **"Enqueue"**
4. This writes the checked files to `.pilot/research/` on disk + `context.json`
5. Next `/pilot` run reads these files as context

### Why Enqueue?
The `/pilot` command runs in Claude Code, which reads files from disk. The database lives in Tauri's app data directory. Enqueue bridges the gap — it writes DB content to disk where Claude can read it.

## Project Scoping

Each project has a `.pilot/pilot.json` file (committed to git):

```json
{"project": "lee.ai"}
```

This name is used to scope sessions and research in the database. When you open the Pilot app, select your project from the dropdown in the sidebar.

## Session Versioning

Every status transition (approve, iterate, fail) creates a snapshot in `session_versions`. This preserves:
- The build script at each iteration
- The status and failure reason
- A full JSON snapshot of the session state

This history is used for:
- Debugging failed builds
- Understanding how a session evolved
- Training data for improving Pilot

## File Structure

```
project/
├── .pilot/
│   ├── pilot.json          # Project name (committed)
│   ├── sessions/           # Session files for /pilot command (gitignored)
│   │   └── <id>/
│   │       ├── session.json
│   │       └── build.py
│   ├── research/           # Enqueued research files (gitignored)
│   │   ├── context.json
│   │   └── *.md
│   └── workspace/          # Temp build execution (gitignored)
│
└── apps/pilot/             # The Tauri desktop app
    ├── src-tauri/          # Rust backend (SQLite, IPC commands)
    ├── src/                # React frontend
    └── package.json
```

## Database Location

The SQLite database lives at:
- **macOS:** `~/Library/Application Support/ai.lee.pilot/pilot.db`
- **Linux:** `~/.local/share/ai.lee.pilot/pilot.db`
- **Windows:** `C:\Users\<user>\AppData\Roaming\ai.lee.pilot\pilot.db`

This is global — one database for all projects. The project dropdown filters by project.

## Training Data

Session history is preserved for training AI to write better build scripts. Each session captures:
- The goal (what the user wanted)
- The research context (what information was available)
- Each iteration (comments → build script changes → result)
- Success/failure outcomes with reasons
- The final build script that worked

Export training data with SQL queries against `pilot.db`.
