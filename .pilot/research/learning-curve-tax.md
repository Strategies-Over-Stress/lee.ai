# The Learning Curve Tax: Research Brief

*Compiled: 2026-04-02*

## Thesis

The true cost of SaaS isn't the subscription -- it's the human cost of operating it. Businesses hire specialists, burn through training budgets, and sink deeper into tools they can't quit. Custom software eliminates the learning curve entirely because it's built for YOUR workflow, not a generic one.

This is an under-articulated pain point. Nobody markets against the learning curve. Everyone compares features or price. Nobody says "you won't need to hire someone to use this."

---

## The Sunk Cost Spiral (Rich's Original Insight)

One big price associated with using all these SaaS tools is the learning curve can be so steep that you have to hire people to manage the confusing tools. The sunken cost fallacy: you're throwing money at professionals to use the already costly tools because if you try to depend on your own skill you lose time and money, so you sink money into hiring hoping to bring the plane up from a nose dive, only to nose dive faster.

**The spiral:**
1. Buy the tool ($199/mo)
2. Nobody can use it
3. Hire a specialist ($5K/mo)
4. Can't fire the specialist -- you'd lose the tool
5. Can't cancel the tool -- you'd lose the specialist's work
6. Buy another tool to compensate for the first one's gaps
7. Repeat

Custom software = eliminated learning curve.

---

## Section 1: The Specialist Tax

These roles exist ONLY because the tools are too complex for the people who actually need them.

| Role | Salary/Cost | Monthly |
|------|-------------|---------|
| Salesforce Administrator | $80,000 - $125,000/yr | $6,600 - $10,400/mo |
| HubSpot Consultant (SMB) | $3,000 - $7,500/mo retainer | $3,000 - $7,500/mo |
| Marketo Specialist | $220/hr (~$38K/mo full-time) | $5,000 - $15,000/mo |
| Marketing Automation Consultant | $95/hr avg | $2,500 - $5,000/mo |

Sources:
- https://www.salesforceben.com/salesforce-administrator-salary/
- https://www.glassdoor.com/Salaries/salesforce-administrator-salary-SRCH_KO0,24.htm
- https://www.ziprecruiter.com/Salaries/Salesforce-Administrator-Salary
- https://www.aboutinbound.com/blog/hubspot-consultant-pricing-brwhat-it-really-costs-to-hire-expert-help
- https://www.impactplus.com/blog/how-much-does-working-with-a-hubspot-partner-agency-cost
- https://www.foundhq.com/blog/salesforce-marketing-cloud-consultant-cost

---

## Section 2: The Learning Curve Wall

- **70% of software implementations fail** -- primary cause: poor user adoption, not technical failure
  - Source: https://blog.meltingspot.io/why-digital-transformation-projects-fail/
- **83% of executives say biggest challenge is getting staff to use software** -- leadership knows the tools aren't being used, they just can't fix it
  - Source: https://blog.meltingspot.io/software-adoption-roi/
- **45% of employees say software is introduced without adequate training** -- companies buy first, train later (if ever)
  - Source: https://apty.ai/blog/solving-low-software-adoption-rates-10-proven-strategies/
- **63% of employees stop using new tech if they don't see relevance** -- generic tools feel irrelevant because they ARE irrelevant to specific workflows
  - Source: https://apty.ai/blog/solving-low-software-adoption-rates-10-proven-strategies/
- **91% of enterprise software errors = people using it wrong** -- not a bug problem, a complexity problem
  - Source: https://erpsoftwareblog.com/2023/10/key-statistics-on-digital-adoption-and-how-to-make-yours-a-success/
- **Employees forget 70% of training within 24 hours** -- training is a band-aid, not a fix. Simpler software IS the fix.
  - Source: https://www.saasworthy.com/blog/onboarding-statistics

---

## Section 3: Shelfware -- Paying for Software Nobody Uses

- **53% of SaaS licenses are unused or underused**
  - Source: https://zylo.com/blog/saas-statistics/
- **Average org wastes $19.8M/yr on unused licenses** (enterprise figure, SMBs waste proportionally similar %)
  - Source: https://www.vertice.one/blog/saas-wastage-shelfware
- **25-40% of software licenses go unused in any given year**
  - Source: https://www.openlm.com/blog/shelfware-licenses-identifying-and-reducing-wasted-software-costs/
- **47% of SMBs report SaaS sprawl as a growing budget problem**
  - Source: https://zylo.com/blog/saas-statistics/
- **30% of SaaS spend is 'toxic'** -- unused licenses and features
  - Source: https://www.vertice.one/blog/saas-wastage-shelfware

---

## Section 4: The SMB SaaS Burden

SMBs pay MORE per employee than enterprises because they lack volume discounts. Most price-sensitive AND most overcharged.

- **SMBs spend $11,196/employee/year on SaaS** vs $7,492 for enterprises -- SMBs pay 49% MORE per head
  - Source: https://threadgoldconsulting.com/research/saas-spend-per-employee-benchmarks-2025
- **Average company uses 87 distinct SaaS applications** -- 87 logins, 87 learning curves, 87 renewal dates
  - Source: https://zylo.com/blog/saas-statistics/
- **34% of those apps are unused or underused** -- ~30 apps collecting dust
  - Source: https://zylo.com/blog/saas-statistics/
- **SMB SaaS spend up 21% year-on-year in 2025** -- accelerating, not stabilizing
  - Source: https://threadgoldconsulting.com/research/saas-spend-per-employee-benchmarks-2025

---

## Section 5: Additional Hidden Costs

- **Onboarding cost per employee: $7,500 - $28,000** -- 60% is 'soft costs' (lost time)
  - Source: https://www.saasworthy.com/blog/onboarding-statistics
- **75% of IT teams don't know what SaaS apps are being used** -- can't optimize what you can't see
  - Source: https://cloudcoach.com/blog/51-statistics-you-need-to-know-the-state-of-saas-onboarding-and-implementation/
- **50% of SaaS licenses unused for 90+ days** -- paying quarterly for tools nobody touched in a quarter
  - Source: https://cloudcoach.com/blog/51-statistics-you-need-to-know-the-state-of-saas-onboarding-and-implementation/

---

## Invoice Card Implementation

Added to BillingReceipt.tsx:

| Line Item | Cost |
|-----------|------|
| Project management tool | $29/mo |
| CRM you use 5% of | $199/mo |
| Email platform (outgrew it 2 years ago) | $79/mo |
| Analytics dashboard -- 200 reports, you read 3 | $149/mo |
| Integration glue code | $99/mo |
| AI tool tokens | $50/mo |
| **SaaS tool specialist (to operate the above)** | **$4,500/mo** |
| **Total** | **$6,047/mo** |

The specialist line is the LARGEST item. It reframes every line above it: you're not just paying for tools, you're paying for tools SO complex they require their own employee. Total jumps from $1,547 to $6,047 -- a 4x increase.

---

## Key Messaging Angles

1. "You're not paying $199/mo for a CRM. You're paying $5,199/mo for a CRM someone else has to run for you."
2. "70% of software implementations fail -- not because the software is broken, but because it's too complex for the people paying for it."
3. "Custom software has zero learning curve because it's built for how YOU already work -- not how Salesforce thinks you should."
4. "The average SMB pays $11,196 per employee per year on SaaS. A third of that is shelfware. Another third needs a specialist to run."
5. "Every SaaS tool you add is another login, another learning curve, another renewal you'll forget about. Custom software is ONE thing that does exactly what you need."
