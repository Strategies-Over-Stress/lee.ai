Implement a full redesign of the lee.ai landing page at apps/web/ and add a new /build-not-buy article page.

ALL visual and interaction design decisions MUST follow ui-design-proposal.md. Where any other attached research doc conflicts with the design proposal, the design proposal wins. The research docs provide copy and content — the design proposal dictates how it looks, animates, and behaves.

## What to build

### 1. Landing page (apps/web/src/app/page.tsx + components)

Replace all existing sections with the following, in this order:

- **Hero**: Animated billing receipt (stagger fade-in per line, red glow on worst items, pulsing total) followed by "What if this number was $0?" headline. Use the exact copy, CTAs, and stats bar from landing-page-copy-primary.md. Receipt animation spec is in ui-design-proposal.md Section 1.

- **Case Studies**: Tabbed (E-Commerce Owner / Financial Advisor) with horizontal drag slider (before/after). Copy from landing-page-copy-primary.md case studies. Slider and tab behavior per ui-design-proposal.md Section 2. Use Framer Motion drag constraint.

- **Guarantee**: Full-width emerald glow section. Copy from landing-page-copy-primary.md guarantee section. Visual spec per ui-design-proposal.md Section 3.

- **Differentiators**: 4 pain-first tabs with giant animated stat callouts. Tab titles and copy from landing-page-copy-primary.md differentiators. Stat presentation per ui-design-proposal.md Section 4.

- **Assessment**: 5-question quiz rewritten for owner-operators. Questions and scoring from landing-page-copy-primary.md assessment. Add the running waste estimate counter per ui-design-proposal.md Section 6.

- **ROI Calculator**: 3 sliders with live-updating savings projection. Spec per ui-design-proposal.md Section 7. This is a new component.

- **Process**: 4 plain-language steps. Copy from landing-page-copy-primary.md process. Visual style per ui-design-proposal.md Section 8.

- **Contact**: Revised CTAs with guarantee reminder and Calendly placeholder. Copy from landing-page-copy-primary.md contact. Footer tagline: "Your solution. Your software. $0/month forever."

### 2. Article page (apps/web/src/app/build-not-buy/page.tsx)

New route at /build-not-buy with:

- Segmented toggle at top: "For Business Owners" / "For the Nerds"
- Default to "For Business Owners"
- Toggle switches article body with Framer AnimatePresence crossfade
- Store choice in localStorage
- Line underneath toggle: "Can't decide? That's what I'm for."
- Business owner content from article-build-not-buy-operators.md
- Technical content from article-build-not-buy.md
- Clean long-form layout with pull quotes, stat callouts, inline source links
- CTA at bottom linking to consultation on the main page

### 3. Navigation

- Add a link to /build-not-buy from the landing page (in the case studies or differentiators section: "Read the full analysis")
- The article page should have a back link to the landing page

## Language and tone

The ENTIRE landing page must use owner-operator friendly language. No developer jargon. No "CI/CD", "architecture", "codebase", "context window", "OWASP", "deployment pipeline." If a technical concept needs to be communicated, translate it into what it means for their business and their money.

The ONLY place technical language appears is behind the "For the Nerds" toggle on the /build-not-buy article page. The landing page itself speaks one language: money, time, risk, and ownership.

Refer to landing-page-copy-primary.md for the exact copy to use on the landing page — it has already been written in operator-first language. Do not improvise or revert to developer-speak.

## Technical constraints

- Next.js 15 App Router, TypeScript, Tailwind CSS 4, Framer Motion 12
- No new dependencies — everything is buildable with what's already in the project
- Keep the existing design system tokens (midnight, surface, accent, emerald, etc.)
- Mobile-first responsive design
- All Framer Motion animations use useInView for scroll triggers and AnimatePresence for transitions
- The billing receipt, drag slider, and ROI calculator are all custom React components — no third-party widgets

## Files to modify or create

- Modify: apps/web/src/app/page.tsx (update section order and imports)
- Modify or replace: every component in apps/web/src/components/ (Hero, CaseStudy, Differentiator, Assessment, Process, Contact, Audience)
- Create: apps/web/src/components/Guarantee.tsx
- Create: apps/web/src/components/ROICalculator.tsx  
- Create: apps/web/src/components/BillingReceipt.tsx
- Create: apps/web/src/components/DragSlider.tsx
- Create: apps/web/src/app/build-not-buy/page.tsx
- Remove: Audience.tsx (its concerns are absorbed into the redesigned Assessment and Hero)
