# CLAUDE.md — Agent Instructions for lee.ai

## 1. Business Overview

**lee.ai** is the personal brand and contracting platform for Rich Lee — a senior software engineer turned AI-first technical partner. The site markets AI-augmented development services to businesses seeking rapid, scalable feature delivery.

- **Owner:** Richard A. Lee (@ricanthonylee on LinkedIn)
- **Revenue Model:** Retainer-based ($2-4K/mo per client), project-based, profit sharing
- **Target Revenue:** $4K/mo (1-2 active clients)
- **Target Clients:** Businesses with legacy/slow tech stacks, e-commerce brands, startups needing rapid iteration — specifically those open to AI-first development approaches
- **Not targeting:** Companies looking for W-2 employees, businesses with no interest in AI

---

## 2. Architecture

### Monorepo Structure

Turborepo monorepo with npm workspaces, modeled after the loveamethystrose project architecture.

```
lee.ai/
├── CLAUDE.md              # This file — agent instructions
├── .env                   # API credentials (gitignored)
├── package.json           # Root workspace config
├── turbo.json             # Turborepo task config
├── .gitignore
├── docs/
│   └── internal/          # Gitignored — separate private repo (lee.ai-internal)
├── apps/
│   ├── features/          # Legacy local copies (now standalone: sos-dev-tools)
│   ├── research/          # Automated web content pipeline
│   │   ├── research.py    # CLI: sources, sync, summarize, search, read, stats
│   │   ├── research.db    # SQLite database (gitignored)
│   │   └── proposed-sources.md
│   ├── studio/            # Internal content studio dashboard (Next.js)
│   │   └── src/
│   │       ├── app/        # Pages: /, /research, /generate, /queue, /sources
│   │       ├── generators/ # Prompt templates (linkedin, blog, report, etc.)
│   │       ├── components/ # Shared UI (Markdown, ArticleCard)
│   │       └── lib/        # DB layer (reads research.db)
│   └── web/               # Public marketing site (Next.js)
│       └── src/
│           ├── app/        # App Router pages + layout
│           └── components/ # React components
└── (future apps/packages)
```

### Repositories

| Repo | Visibility | Purpose |
|------|-----------|---------|
| `Strategies-Over-Stress/lee.ai` | Public | Code, CLAUDE.md, public docs — the showcase |
| `Strategies-Over-Stress/lee.ai-internal` | Private | Business strategy, marketing research, pricing docs |

The internal repo is cloned into `docs/internal/` which is gitignored from the public repo.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, standalone output) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion 12 |
| **Build System** | Turborepo 2 |
| **Hosting** | DigitalOcean (shared server with loveamethystrose.com) |

### Key Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (via Turborepo)
npm run lint         # ESLint
npm run type-check   # TypeScript validation
```

### Credentials

All API credentials live in `.env` at the project root. **Never hardcode credentials.**

| Key | Purpose |
|-----|---------|
| `JIRA_BASE_URL` | Jira instance URL |
| `JIRA_EMAIL` | Jira API user email |
| `JIRA_API_TOKEN` | Jira API token |
| `JIRA_PROJECT_KEY` | Default Jira project (RICH) |

---

## 3. Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `midnight` | `#0a0a0f` | Page background |
| `surface` | `#111118` | Card/panel background |
| `surface-light` | `#1a1a24` | Elevated surfaces, borders |
| `accent` | `#6366f1` | Primary actions, links |
| `accent-bright` | `#818cf8` | Hover states, highlights |
| `emerald` | `#10b981` | Success, positive states |
| `amber` | `#f59e0b` | Warnings, medium states |
| `rose` | `#f43f5e` | Errors, negative states |

### Typography

- **Sans:** Inter (300-900 weights)
- **Mono:** JetBrains Mono (terminal/code elements)

### Key Patterns

- **Terminal blocks:** Used to display technical credibility (dark bg, colored dots header, monospace)
- **Gradient text:** `.text-gradient` — indigo to emerald gradient
- **Glow effect:** `.glow` — subtle indigo box-shadow
- **Grid background:** `.grid-bg` — faint indigo grid overlay

---

## 4. Development Workflow

Every change follows: **Ticket → Branch → PR → Merge**. The `sos-feature` and `sos-jira` global CLI tools automate the Jira ↔ Git lifecycle so ticket status always reflects reality.

### Install

```bash
pip install git+https://github.com/Strategies-Over-Stress/sos-dev-tools.git
```

This provides two global commands: `sos-jira` and `sos-feature`. They auto-discover issue types and workflow transitions from the Jira API — no hardcoded IDs. The CLI walks up from CWD to find the nearest `.env`, so each project gets its own Jira config.

### The Flow

```
sos-feature create "description"   → Creates ticket (TO DO) + branch (does not check out)
  ↓  (ready to work)
sos-feature start 5                → Checks out branch, ticket → IN PROGRESS
  ↓  (do the work, commit)
sos-feature pr                     → Pushes, creates GitHub PR, ticket → IN REVIEW
  ↓  (review, merge PR)
sos-jira move RICH-X "DONE"       → Manually mark done after merge
```

### Feature Branch Commands (`sos-feature`)

```bash
# Create a feature — ticket (TO DO) + branch created, stays on current branch
sos-feature create "Add risk reversal to contact section"
sos-feature create "Rewrite hero copy" -d "## Context\n\nResearch shows..."
sos-feature create "Deploy pipeline" -f docs/deploy-ticket.md
sos-feature create "Fix button animation" -t subtask -p RICH-1

# Start working — checks out branch, moves ticket to IN PROGRESS
sos-feature start 5          # shorthand for RICH-5

# Switch to a different feature branch (no status change — just context switching)
sos-feature switch 5

# Push + create PR — moves ticket to IN REVIEW, links PR in Jira comment
sos-feature pr
sos-feature pr --title "Custom PR title" --body "Custom body"

# Check current branch and linked ticket status
sos-feature status
```

### Branching Convention

- **`main`** — stable, production-ready. All PRs merge here. Never commit directly.
- **`feature/RICH-{N}-description`** — feature branches tied to Jira tickets.
- Branch names are auto-generated from ticket summary: `feature/RICH-5-add-risk-reversal-to-contact`

### Ticket Status ↔ Git State

| Git state | Ticket status | How it happens |
|-----------|--------------|----------------|
| Ticket + branch created | **To Do** | `sos-feature create` |
| Branch checked out to begin work | **In Progress** | `sos-feature start` |
| Branch checked out (context switch) | *(no change)* | `sos-feature switch` |
| PR opened | **IN REVIEW** | `sos-feature pr` |
| PR merged | **Done** | `sos-jira move RICH-X "DONE"` (manual) |

**Rule:** Never move tickets manually unless marking as DONE after merge. Let the tools handle TO DO, IN PROGRESS, and IN REVIEW transitions to avoid drift between ticket status and git state.

---

## 5. Jira CLI (`sos-jira`)

Direct ticket management. Zero external dependencies — Python stdlib only. Issue types and transitions are auto-discovered from the Jira API on first use.

```bash
# Create
sos-jira create -s "Title" -d "## Markdown description"
sos-jira create -s "Title" --file description.md
sos-jira create -s "Subtask" -t subtask -p RICH-1

# Edit
sos-jira edit RICH-1 -s "New title"
sos-jira edit RICH-1 -d "## New description"
sos-jira edit RICH-1 --file updated.md

# Move / Delete
sos-jira move RICH-1 "DONE"
sos-jira delete RICH-3

# View / List
sos-jira view RICH-1
sos-jira list
sos-jira list --status "To Do" --type epic

# Comment
sos-jira comment RICH-1 "## Update\n\nFinished the **hero rewrite**."

# Create Project
sos-jira create-project -k PILOT -n "Pilot Development"
sos-jira create-project -k CRM -n "CRM Platform" -t software --template kanban
```

### Markdown → ADF

Descriptions and comments support markdown, automatically converted to Atlassian Document Format:

| Markdown | Renders as |
|----------|-----------|
| `## Heading` | ADF heading block |
| `**bold**` | Strong/bold text |
| `` `code` `` | Inline code |
| `- item` | Bullet list |
| `1. item` | Ordered list |
| Blank line | Paragraph separator |

### Issue Types

Issue types are auto-discovered from your Jira project. Common types:

| Type | Flag | Use for |
|------|------|---------|
| Task | `-t task` (default) | Standard work items |
| Epic | `-t epic` | Large initiatives grouping multiple tasks |
| Subtask | `-t subtask -p RICH-1` | Smaller items under a parent task/epic |

Override via `.env` if auto-discovery doesn't match: `JIRA_ISSUE_TYPE_TASK=10122` etc.

---

## 6. Site Sections

1. **Hero** — "Hire me once. I'll automate myself out of a job." + rotating typewriter subtitles + stats bar
2. **Case Study** — Before/after comparison of loveamethystrose.com transformation + terminal showcase
3. **Differentiator** — Interactive tabs showing speed/quality/ownership advantages
4. **Assessment** — 5-question interactive quiz ("Is your business ready?") with personalized results
5. **Process** — 4-step engagement flow (Discovery → Audit → Sprint → Partnership)
6. **Contact** — LinkedIn + email CTAs with availability status

---

## 7. Conventions

- **Components:** One component per file in `src/components/`, PascalCase
- **Client components:** Mark with `"use client"` — most components use Framer Motion
- **Animations:** Use Framer Motion `motion` components, `useInView` for scroll-triggered animations
- **No hardcoded credentials** — follow the same `.env` pattern as loveamethystrose
- **Responsive:** Mobile-first, breakpoints at `sm:`, `md:`, `lg:`
