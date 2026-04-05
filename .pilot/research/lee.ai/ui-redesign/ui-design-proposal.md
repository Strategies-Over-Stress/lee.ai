# UI Design Proposal: lee.ai Reimagined

## Overall Vision
Keep the dark aesthetic (91% of users prefer dark mode) but transform from a developer portfolio into a scroll-driven narrative that tells the VISITOR'S story. The page is a receipt — the visitor scrolls down and sees their own money being wasted, then sees it stop, then sees what they get instead.

Stack: Next.js 15 App Router, Framer Motion 12, Tailwind CSS 4. No new dependencies needed.

---

## Section 1: HERO — "The Recurring Charge"

**Current:** Static headline + rotating typewriter + stats bar (e-commerce focused)

**Proposed:** Animated "billing statement" that scrolls through their pain.

A dark, glowing mock renewal notification renders line by line on scroll (Framer Motion stagger):

```
 ┌──────────────────────────────────────────┐
 │  ⚠ Renewal Notice                        │
 │                                           │
 │  Project management tool    $29/mo        │
 │  CRM you use 5% of         $199/mo  ← red│
 │  Email platform (outgrew)  $79/mo        │
 │  Analytics (200 reports,    $149/mo  ← red│
 │    you read 3)                           │
 │  Integration duct tape     $99/mo        │
 │  ─────────────────────────────────────── │
 │  Total                     $1,547/mo     │
 │                                           │
 │  [Renews in 3 days]                      │
 └──────────────────────────────────────────┘
```

Each line fades in with subtle red glow on worst offenders. Total pulses.

Then the headline fades in below:

**"What if this number was $0?"**

Sub: "I build custom software that replaces your subscriptions — guaranteed cheaper, or you don't pay."

CTA: "Find out how much you're wasting" / "See the proof"

**Why:** It's not abstract. It's THEIR credit card statement. They feel it immediately.

### Stats Bar (below hero)
| $1,500+/mo | 47% | 80-95% | $0/mo |
|------------|-----|--------|-------|
| Wasted on average on SaaS | Of licenses go unused | Of AI projects fail without guidance | Your cost after we build — forever |

---

## Section 2: CASE STUDIES — Interactive Drag Slider

**Current:** Static before/after bullet lists (e-commerce only)

**Proposed:** Tabbed case studies with horizontal drag sliders.

Two tabs: **"E-Commerce Owner"** / **"Financial Advisor"**

Each tab shows:
- Horizontal **drag slider** splitting the screen — left is "before" (red-tinted, chaotic, subscription logos stacked messily), right is "after" (clean, green-tinted, unified dashboard)
- Below slider: the **money line** in large type
- Below that: **3 key stats** with animated counters on scroll

LAR money line: "She stopped renting 8 tools that did 60% of the job and started owning one system that does 100%."

Financial Advisor money line: "Salesforce charged her $2,400/year for a tool she used 5% of. Now she owns something that does 100% — and will never send her another invoice."

Framer Motion `drag` constraint handles the slider natively. Touch-friendly for mobile.

---

## Section 3: THE GUARANTEE — Full-Width Showstopper

**Current:** Doesn't exist

**Proposed:** Full-width section with radial emerald glow that stops the scroll.

Large centered text:
> **"If it's not cheaper AND better — you don't pay."**

Three guarantee badges in a row:
- Shield: "Cheaper than your current stack — or free"
- Check: "Custom to your exact needs — or free"
- Key: "You own everything we build"

Below: "Not a 'satisfaction guarantee' with fine print. If I can't save you money, the engagement is free. Period."

**Why emerald glow:** Green = money = trust = go. Subconscious positive association.

---

## Section 4: DIFFERENTIATORS — Pain-First Tabs

**Current:** Developer-focused tabs (hostage, sleep, breaks, compound)

**Proposed:** Keep tab pattern, rewrite content pain-first:

### Tab 1: "Stop paying for features you don't use"
Stat callout: "47%" in giant gradient text — "of software licenses go completely unused — Zylo, 2026"

### Tab 2: "Own it. Don't rent it."
Stat callout: "$0/mo" — "The cost of your software in 2029. Because you already own it."

### Tab 3: "AI without the risk"
Stat callout: "45%" — "of AI-generated code fails security tests — Veracode, 2025"

### Tab 4: "No more duct tape"
Stat callout: "$6/mo" — "replaces $100/mo Zapier chains with real integrations"

Each tab detail panel has the stat as a giant animated number + description + 3 highlight bullets.

---

## Section 5: THE ARTICLE — /build-not-buy with Toggle

**Current:** Doesn't exist

**Proposed:** Dedicated route `/build-not-buy` linked from landing page ("Read the full analysis").

### The Toggle
Segmented control at top of article:

```
[ For Business Owners ]  [ For the Nerds ]
```

Default: "For Business Owners" (accent highlighted).

Clicking toggles entire article body with smooth crossfade (Framer AnimatePresence). Choice stored in localStorage for repeat visitors. URL doesn't change.

Small line underneath: "Can't decide? That's what I'm for."

### Article Layout
- Clean long-form, generous whitespace
- Pull quotes from research in large accent-colored text between paragraphs
- Stat callouts as full-width animated bars on scroll
- Source links inline
- All stats hyperlinked to sources

### Content
- Business Owner version: article-build-not-buy-operators.md
- Technical version: article-build-not-buy.md

---

## Section 6: ASSESSMENT — Personalized Quiz with Running Waste Counter

**Current:** 5 e-commerce questions

**Proposed:** Keep quiz mechanic, rewrite questions for owner-operators (from landing-page-proposal.md).

New feature: **Running "waste estimate"** counter in the corner. After each answer, a small counter updates with an estimated monthly waste based on their answers.

Final result shows personalized number:
> "Based on your answers, you may be wasting approximately **$1,200/month** on underperforming software."

This feeds directly into the CTA — making the result feel calculated, not generic.

### Questions (from research)
1. How many software subscriptions? (1-3 / 4-8 / 9-15 / 16+)
2. How many used weekly? (All / Most / Half / A few)
3. Kept paying because canceling felt risky? (No / Once / Yes / Don't track)
4. Tried AI to build/automate? (Yes worked / Yes failed / Curious / Skeptical)
5. Vendor doubles price tomorrow? (Fine / Scramble / Manage / Panic)

---

## Section 7: ROI CALCULATOR — New Interactive Element

**Current:** Doesn't exist

**Proposed:** Three sliders between assessment and CTA:

1. "How many subscriptions?" (1-20)
2. "Average cost per subscription?" ($10-$500)
3. "How many do you actually need?" (1-10)

Live-updating output:
```
Current annual cost:      $14,400/year
After we build:           $240/year (hosting only)
You save:                 $14,160/year
Over 5 years:             $70,800
```

The "Over 5 years" number is the killer — makes $0/month visceral. Animated counting numbers with Framer Motion useMotionValue.

---

## Section 8: PROCESS — Plain Language

**Current:** Developer jargon (CI/CD, architecture, feature delivery)

**Proposed:** Same 4-step structure, plain language:

1. **Free Consultation** — "30 minutes. We look at what you're spending and what you're getting. No pitch."
2. **Software Review** — "I map every tool — cost, function, gaps, lock-in. Clear picture in 48 hours."
3. **Build Phase** — "Replace the waste with software you own. Results in weeks, not months."
4. **Handoff** — "You own everything. No monthly fees. No lock-in. $0/month forever."

---

## Section 9: CONTACT / CTA — Guarantee Reminder + Booking

**Current:** LinkedIn + email + availability badge

**Proposed:** Keep LinkedIn + email. Add:
- **Calendly embed** or "Book a free 30-minute consultation" button
- **Guarantee reminder** right above CTA: "Remember: if it's not cheaper AND better, you don't pay."
- Risk reversal badges: Month-to-month / You own all code / Cheaper guaranteed

Footer tagline: **"Your solution. Your software. $0/month forever."**

---

## Page Map Summary

```
lee.ai/
├── / (landing page)
│   ├── Hero — animated billing receipt + headline
│   ├── Case Studies — drag slider + tabbed (LAR + Financial Advisor)
│   ├── Guarantee — full-width emerald glow showstopper
│   ├── Differentiators — pain-first tabs with stat callouts
│   ├── Assessment — quiz with running waste counter
│   ├── ROI Calculator — 3 sliders, live savings projection
│   ├── Process — 4 plain-language steps
│   └── Contact — CTA + Calendly + guarantee reminder
│
└── /build-not-buy (article page)
    ├── Toggle: "For Business Owners" / "For the Nerds"
    ├── Article body (switches between two versions)
    └── CTA at bottom linking back to consultation
```

---

## Animation Inventory (Framer Motion)

| Element | Animation Type | Trigger |
|---------|---------------|---------|
| Billing receipt lines | Stagger fade-in + glow | Scroll into view |
| Stats bar numbers | Count-up | Scroll into view |
| Case study drag slider | Drag constraint | User interaction |
| Case study stats | Count-up | Tab switch + scroll |
| Guarantee section | Scale-in + emerald glow | Scroll into view |
| Differentiator stat numbers | Count-up | Tab switch |
| Assessment progress bar | Width animation | Answer selection |
| Waste counter | Number tick | Answer selection |
| ROI calculator output | Count-up | Slider change |
| Article toggle | AnimatePresence crossfade | Click |
| Process steps | Stagger slide-in | Scroll into view |

All achievable with existing Framer Motion 12 — no GSAP, Three.js, or additional animation libraries needed.

---

## Research Sources

Design trends:
- https://swipepages.com/blog/12-best-saas-landing-page-examples-of-2026/
- https://www.thethunderclap.com/blog/best-landing-page-designs
- https://www.framer.com/blog/website-animation-examples/
- https://motion.dev/docs/react-scroll-animations
- https://www.awwwards.com/websites/scrolling/

Toggle patterns:
- https://cieden.com/book/atoms/toggle-switch/the-art-of-toggle-ui
- https://www.nngroup.com/articles/toggle-switch-guidelines/

Before/after sliders:
- https://elfsight.com/before-and-after-slider-widget/
- https://segmentui.com/uikit/before-after-slider

ROI calculators:
- https://www.convertcalculator.com/use-cases/roi-savings-calculator/
