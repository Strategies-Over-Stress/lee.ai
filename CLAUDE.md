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
│   ├── features/          # Project management CLI tools (future standalone package)
│   │   ├── jira.py        # Jira CLI (create, edit, move, view, list, comment, delete)
│   │   └── feature.py     # Feature branch manager (create, start, switch, pr, status)
│   └── web/               # Next.js 15 marketing site
│       ├── src/
│       │   ├── app/        # App Router pages + layout
│       │   ├── components/ # React components
│       │   └── lib/        # Utilities
│       ├── public/         # Static assets
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── postcss.config.mjs
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

Every change follows: **Ticket → Branch → PR → Merge**. The `feature.py` script automates the Jira ↔ Git lifecycle so ticket status always reflects reality.

### The Flow

```
feature.py create "description"   → Creates ticket (TO DO) + branch (does not check out)
  ↓  (ready to work)
feature.py start RICH-5           → Checks out branch, ticket → IN PROGRESS
  ↓  (do the work, commit)
feature.py pr                     → Pushes, creates GitHub PR, ticket → IN REVIEW
  ↓  (review, merge PR)
jira.py move RICH-X "DONE"       → Manually mark done after merge
```

### Feature Branch Commands (`apps/features/feature.py`)

```bash
# Create a feature — ticket (TO DO) + branch created, stays on current branch
python3 apps/features/feature.py create "Add risk reversal to contact section"
python3 apps/features/feature.py create "Rewrite hero copy" -d "## Context\n\nResearch shows..."
python3 apps/features/feature.py create "Deploy pipeline" -f docs/deploy-ticket.md
python3 apps/features/feature.py create "Fix button animation" -t subtask -p RICH-1

# Start working — checks out branch, moves ticket to IN PROGRESS
python3 apps/features/feature.py start RICH-5

# Switch to a different feature branch (no status change — just context switching)
python3 apps/features/feature.py switch RICH-5

# Push + create PR — moves ticket to IN REVIEW, links PR in Jira comment
python3 apps/features/feature.py pr
python3 apps/features/feature.py pr --title "Custom PR title" --body "Custom body"

# Check current branch and linked ticket status
python3 apps/features/feature.py status
```

### Branching Convention

- **`main`** — stable, production-ready. All PRs merge here. Never commit directly.
- **`feature/RICH-{N}-description`** — feature branches tied to Jira tickets.
- Branch names are auto-generated from ticket summary: `feature/RICH-5-add-risk-reversal-to-contact`

### Ticket Status ↔ Git State

| Git state | Ticket status | How it happens |
|-----------|--------------|----------------|
| Ticket + branch created | **To Do** | `feature.py create` |
| Branch checked out to begin work | **In Progress** | `feature.py start` |
| Branch checked out (context switch) | *(no change)* | `feature.py switch` |
| PR opened | **IN REVIEW** | `feature.py pr` |
| PR merged | **Done** | `jira.py move RICH-X "DONE"` (manual) |

**Rule:** Never move tickets manually unless marking as DONE after merge. Let the scripts handle TO DO, IN PROGRESS, and IN REVIEW transitions to avoid drift between ticket status and git state.

---

## 5. Jira CLI (`apps/features/jira.py`)

Direct ticket management. Zero external dependencies — Python stdlib only.

```bash
# Create
python3 apps/features/jira.py create -s "Title" -d "## Markdown description"
python3 apps/features/jira.py create -s "Title" --file description.md
python3 apps/features/jira.py create -s "Subtask" -t subtask -p RICH-1

# Edit
python3 apps/features/jira.py edit RICH-1 -s "New title"
python3 apps/features/jira.py edit RICH-1 -d "## New description"
python3 apps/features/jira.py edit RICH-1 --file updated.md

# Move / Delete
python3 apps/features/jira.py move RICH-1 "DONE"
python3 apps/features/jira.py delete RICH-3

# View / List
python3 apps/features/jira.py view RICH-1
python3 apps/features/jira.py list
python3 apps/features/jira.py list --status "To Do" --type epic

# Comment
python3 apps/features/jira.py comment RICH-1 "## Update\n\nFinished the **hero rewrite**."
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

| Type | Flag | Use for |
|------|------|---------|
| Task | `-t task` (default) | Standard work items |
| Epic | `-t epic` | Large initiatives grouping multiple tasks |
| Subtask | `-t subtask -p RICH-1` | Smaller items under a parent task/epic |

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
