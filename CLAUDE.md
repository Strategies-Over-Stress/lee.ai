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
├── package.json           # Root workspace config
├── turbo.json             # Turborepo task config
├── .gitignore
├── apps/
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

## 4. Site Sections

1. **Hero** — "I don't apply for jobs. I transform businesses." + rotating typewriter subtitles + stats bar
2. **Case Study** — Before/after comparison of loveamethystrose.com transformation + terminal showcase
3. **Differentiator** — Interactive tabs showing speed/quality/ownership advantages
4. **Assessment** — 5-question interactive quiz ("Is your business ready?") with personalized results
5. **Process** — 4-step engagement flow (Discovery → Audit → Sprint → Partnership)
6. **Contact** — LinkedIn + email CTAs with availability status

---

## 5. Conventions

- **Components:** One component per file in `src/components/`, PascalCase
- **Client components:** Mark with `"use client"` — most components use Framer Motion
- **Animations:** Use Framer Motion `motion` components, `useInView` for scroll-triggered animations
- **No hardcoded credentials** — follow the same `.env` pattern as loveamethystrose
- **Responsive:** Mobile-first, breakpoints at `sm:`, `md:`, `lg:`
