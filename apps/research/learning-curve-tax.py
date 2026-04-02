#!/usr/bin/env python3
"""Research script: The Learning Curve Tax

Thesis: The true cost of SaaS isn't the subscription — it's the human cost
of operating it. Businesses hire specialists just to manage tools, creating
a sunk-cost spiral: subscription + specialist + training + shelfware.

Custom software eliminates the learning curve entirely because it's built
for YOUR workflow, not a generic one.

Usage:
    python apps/research/learning-curve-tax.py              # Print report
    python apps/research/learning-curve-tax.py --json       # JSON output
    python apps/research/learning-curve-tax.py --markdown   # Save to docs/
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Research Data (sourced April 2026)
# ---------------------------------------------------------------------------

SPECIALIST_SALARIES = {
    "title": "The Specialist Tax: What You Pay to Operate the Tools",
    "insight": (
        "These roles exist ONLY because the tools are too complex for the "
        "people who actually need them. You're paying for the subscription "
        "AND a full-time human to make it usable."
    ),
    "data": [
        {
            "role": "Salesforce Administrator",
            "salary_range": "$80,000 - $125,000/yr",
            "salary_midpoint": 99734,
            "monthly_cost": "$6,600 - $10,400/mo",
            "sources": [
                "https://www.salesforceben.com/salesforce-administrator-salary/",
                "https://www.glassdoor.com/Salaries/salesforce-administrator-salary-SRCH_KO0,24.htm",
                "https://www.ziprecruiter.com/Salaries/Salesforce-Administrator-Salary",
            ],
        },
        {
            "role": "HubSpot Consultant (SMB retainer)",
            "salary_range": "$3,000 - $7,500/mo",
            "salary_midpoint": 63000,
            "monthly_cost": "$3,000 - $7,500/mo",
            "sources": [
                "https://www.aboutinbound.com/blog/hubspot-consultant-pricing-brwhat-it-really-costs-to-hire-expert-help",
                "https://www.impactplus.com/blog/how-much-does-working-with-a-hubspot-partner-agency-cost",
            ],
        },
        {
            "role": "Marketo Specialist",
            "salary_range": "$220/hr (~$38K/mo full-time)",
            "salary_midpoint": 456000,
            "monthly_cost": "$5,000 - $15,000/mo (retainer)",
            "sources": [
                "https://www.foundhq.com/blog/salesforce-marketing-cloud-consultant-cost",
            ],
        },
        {
            "role": "Marketing Automation Consultant (SMB platforms)",
            "salary_range": "$95/hr avg",
            "salary_midpoint": 190000,
            "monthly_cost": "$2,500 - $5,000/mo",
            "sources": [
                "https://www.quora.com/What-is-the-market-hourly-rate-for-Pardot-HubSpot-and-other-marketing-automation-consultants",
            ],
        },
    ],
}

ADOPTION_FAILURE = {
    "title": "The Learning Curve Wall: Why People Don't Use What You Pay For",
    "insight": (
        "70% of software implementations fail due to poor adoption. "
        "The tools aren't broken — they're just too complex for the people "
        "who need them. So businesses hire specialists, eat the cost, "
        "and call it 'digital transformation.'"
    ),
    "data": [
        {
            "stat": "70% of software implementations fail",
            "detail": "Primary cause: poor user adoption, not technical failure",
            "source": "https://blog.meltingspot.io/why-digital-transformation-projects-fail/",
        },
        {
            "stat": "83% of executives say biggest challenge is getting staff to use software",
            "detail": "Leadership knows the tools aren't being used — they just can't fix it",
            "source": "https://blog.meltingspot.io/software-adoption-roi/",
        },
        {
            "stat": "45% of employees say software is introduced without adequate training",
            "detail": "Companies buy first, train later (if ever)",
            "source": "https://apty.ai/blog/solving-low-software-adoption-rates-10-proven-strategies/",
        },
        {
            "stat": "63% of employees stop using new tech if they don't see relevance",
            "detail": "Generic tools feel irrelevant because they ARE irrelevant to specific workflows",
            "source": "https://apty.ai/blog/solving-low-software-adoption-rates-10-proven-strategies/",
        },
        {
            "stat": "91% of enterprise software errors = people using it wrong",
            "detail": "Not a bug problem — a complexity problem",
            "source": "https://erpsoftwareblog.com/2023/10/key-statistics-on-digital-adoption-and-how-to-make-yours-a-success/",
        },
        {
            "stat": "Employees forget 70% of training within 24 hours",
            "detail": "Training is a band-aid, not a fix. Simpler software IS the fix.",
            "source": "https://www.saasworthy.com/blog/onboarding-statistics",
        },
    ],
}

SHELFWARE_WASTE = {
    "title": "Shelfware: Paying for Software Nobody Uses",
    "insight": (
        "Nearly half of all SaaS licenses go unused. Companies keep paying "
        "because canceling feels like admitting the investment was a mistake. "
        "Classic sunk cost fallacy."
    ),
    "data": [
        {
            "stat": "53% of SaaS licenses are unused or underused",
            "detail": "More than half of what you pay for sits idle",
            "source": "https://zylo.com/blog/saas-statistics/",
        },
        {
            "stat": "Average org wastes $19.8M/yr on unused licenses",
            "detail": "Enterprise figure — SMBs waste proportionally similar %",
            "source": "https://www.vertice.one/blog/saas-wastage-shelfware",
        },
        {
            "stat": "25-40% of software licenses go unused in any given year",
            "detail": "Consistent across company sizes and industries",
            "source": "https://www.openlm.com/blog/shelfware-licenses-identifying-and-reducing-wasted-software-costs/",
        },
        {
            "stat": "47% of SMBs report SaaS sprawl as a growing budget problem",
            "detail": "They know it's a problem but can't stop the bleeding",
            "source": "https://zylo.com/blog/saas-statistics/",
        },
        {
            "stat": "30% of SaaS spend is 'toxic' — unused licenses and features",
            "detail": "Nearly 1/3 of every dollar is literally wasted",
            "source": "https://www.vertice.one/blog/saas-wastage-shelfware",
        },
    ],
}

SMB_SPEND = {
    "title": "The SMB SaaS Burden: Death by a Thousand Subscriptions",
    "insight": (
        "SMBs pay MORE per employee than enterprises because they lack "
        "volume discounts. They're the most price-sensitive AND the most overcharged."
    ),
    "data": [
        {
            "stat": "SMBs spend $11,196/employee/year on SaaS",
            "detail": "vs $7,492 for enterprises — SMBs pay 49% MORE per head",
            "source": "https://threadgoldconsulting.com/research/saas-spend-per-employee-benchmarks-2025",
        },
        {
            "stat": "Average company uses 87 distinct SaaS applications",
            "detail": "87 logins, 87 learning curves, 87 renewal dates",
            "source": "https://zylo.com/blog/saas-statistics/",
        },
        {
            "stat": "34% of those apps are unused or underused",
            "detail": "~30 apps collecting dust while you pay for them",
            "source": "https://zylo.com/blog/saas-statistics/",
        },
        {
            "stat": "SMB SaaS spend up 21% year-on-year in 2025",
            "detail": "The problem is accelerating, not stabilizing",
            "source": "https://threadgoldconsulting.com/research/saas-spend-per-employee-benchmarks-2025",
        },
    ],
}

SUNK_COST_SPIRAL = {
    "title": "The Sunk Cost Spiral: Why Businesses Can't Stop",
    "insight": (
        "Step 1: Buy the tool ($199/mo). "
        "Step 2: Nobody can use it. "
        "Step 3: Hire a specialist ($5K/mo). "
        "Step 4: Can't fire the specialist — you'd lose the tool. "
        "Step 5: Can't cancel the tool — you'd lose the specialist's work. "
        "Step 6: Buy another tool to compensate for the first one's gaps. "
        "Repeat."
    ),
    "data": [
        {
            "stat": "Onboarding cost per employee: $7,500 - $28,000",
            "detail": "60% is 'soft costs' (lost time), 40% is tools/resources",
            "source": "https://www.saasworthy.com/blog/onboarding-statistics",
        },
        {
            "stat": "75% of IT teams don't know what SaaS apps are being used",
            "detail": "They can't optimize what they can't see",
            "source": "https://cloudcoach.com/blog/51-statistics-you-need-to-know-the-state-of-saas-onboarding-and-implementation/",
        },
        {
            "stat": "50% of SaaS licenses unused for 90+ days",
            "detail": "Paying quarterly for tools nobody has touched in a quarter",
            "source": "https://cloudcoach.com/blog/51-statistics-you-need-to-know-the-state-of-saas-onboarding-and-implementation/",
        },
    ],
}

# ---------------------------------------------------------------------------
# The Pitch: Invoice Card Line Item
# ---------------------------------------------------------------------------

INVOICE_CARD_SUGGESTION = {
    "title": "Suggested Invoice Card Addition",
    "current_total": 1547,
    "suggested_line_item": {
        "name": "SaaS tool specialist (to operate the above)",
        "cost_range": "$3,000 - $7,500/mo",
        "suggested_display": 4500,
        "waste": True,
        "note": "HubSpot/Salesforce/Marketo admin retainer — the real cost nobody talks about",
    },
    "new_total": 6047,
    "narrative": (
        "The specialist line should be the LARGEST item on the invoice. "
        "It reframes every line above it: you're not just paying for tools, "
        "you're paying for tools SO complex they require their own employee. "
        "The total jumps from $1,547 to $6,047 — a 4x increase that hits hard."
    ),
}

# ---------------------------------------------------------------------------
# Report Generation
# ---------------------------------------------------------------------------

ALL_SECTIONS = [
    SPECIALIST_SALARIES,
    ADOPTION_FAILURE,
    SHELFWARE_WASTE,
    SMB_SPEND,
    SUNK_COST_SPIRAL,
]


def print_report():
    """Print formatted research report to stdout."""
    print("=" * 70)
    print("THE LEARNING CURVE TAX")
    print("Research Brief — The Hidden Human Cost of SaaS")
    print(f"Compiled: {datetime.now().strftime('%Y-%m-%d')}")
    print("=" * 70)
    print()
    print("THESIS: The true cost of SaaS isn't the subscription — it's the")
    print("human cost of operating it. Businesses hire specialists, burn")
    print("through training budgets, and sink deeper into tools they can't")
    print("quit. Custom software eliminates the learning curve entirely.")
    print()

    for section in ALL_SECTIONS:
        print("-" * 70)
        print(f"\n## {section['title']}\n")
        print(f"   {section['insight']}\n")

        if "data" in section:
            for item in section["data"]:
                if "stat" in item:
                    print(f"   * {item['stat']}")
                    print(f"     → {item['detail']}")
                    print(f"     Source: {item['source']}")
                elif "role" in item:
                    print(f"   * {item['role']}")
                    print(f"     Salary: {item['salary_range']}")
                    print(f"     Monthly: {item['monthly_cost']}")
                    for src in item.get("sources", []):
                        print(f"     Source: {src}")
                print()

    print("-" * 70)
    print(f"\n## {INVOICE_CARD_SUGGESTION['title']}\n")
    sugg = INVOICE_CARD_SUGGESTION
    li = sugg["suggested_line_item"]
    print(f"   Add: \"{li['name']}\"")
    print(f"   Display cost: ${li['suggested_display']}/mo ({li['cost_range']})")
    print(f"   Current total: ${sugg['current_total']}/mo")
    print(f"   New total:     ${sugg['new_total']}/mo (+{sugg['new_total'] - sugg['current_total']})")
    print(f"\n   {sugg['narrative']}")
    print()

    print("=" * 70)
    print("KEY MESSAGING ANGLES")
    print("=" * 70)
    print()
    print("1. \"You're not paying $199/mo for a CRM. You're paying $5,199/mo")
    print("    for a CRM someone else has to run for you.\"")
    print()
    print("2. \"70% of software implementations fail — not because the software")
    print("    is broken, but because it's too complex for the people paying for it.\"")
    print()
    print("3. \"Custom software has zero learning curve because it's built for")
    print("    how YOU already work — not how Salesforce thinks you should.\"")
    print()
    print("4. \"The average SMB pays $11,196 per employee per year on SaaS.")
    print("    A third of that is shelfware. Another third needs a specialist to run.\"")
    print()
    print("5. \"Every SaaS tool you add is another login, another learning curve,")
    print("    another renewal you'll forget about. Custom software is ONE thing")
    print("    that does exactly what you need.\"")
    print()


def save_markdown():
    """Save report as markdown to docs/."""
    docs_dir = Path(__file__).resolve().parent.parent.parent / "docs"
    docs_dir.mkdir(exist_ok=True)
    out_path = docs_dir / "learning-curve-tax-research.md"

    lines = []
    lines.append("# The Learning Curve Tax: Research Brief\n")
    lines.append(f"*Compiled: {datetime.now().strftime('%Y-%m-%d')}*\n")
    lines.append("## Thesis\n")
    lines.append(
        "The true cost of SaaS isn't the subscription — it's the human cost "
        "of operating it. Businesses hire specialists, burn through training "
        "budgets, and sink deeper into tools they can't quit. Custom software "
        "eliminates the learning curve entirely.\n"
    )

    for section in ALL_SECTIONS:
        lines.append(f"---\n\n## {section['title']}\n")
        lines.append(f"_{section['insight']}_\n")

        if "data" in section:
            for item in section["data"]:
                if "stat" in item:
                    lines.append(f"- **{item['stat']}**")
                    lines.append(f"  - {item['detail']}")
                    lines.append(f"  - [Source]({item['source']})")
                elif "role" in item:
                    lines.append(f"- **{item['role']}**: {item['salary_range']}")
                    lines.append(f"  - Monthly: {item['monthly_cost']}")
                    for src in item.get("sources", []):
                        lines.append(f"  - [Source]({src})")
                lines.append("")

    lines.append("---\n\n## Invoice Card Suggestion\n")
    sugg = INVOICE_CARD_SUGGESTION
    li = sugg["suggested_line_item"]
    lines.append(f"Add line: **\"{li['name']}\"** — ${li['suggested_display']}/mo\n")
    lines.append(f"- Current total: **${sugg['current_total']}/mo**")
    lines.append(f"- New total: **${sugg['new_total']}/mo** (+${sugg['new_total'] - sugg['current_total']})\n")
    lines.append(f"_{sugg['narrative']}_\n")

    lines.append("---\n\n## Key Messaging Angles\n")
    lines.append(
        '1. "You\'re not paying $199/mo for a CRM. You\'re paying $5,199/mo '
        'for a CRM someone else has to run for you."\n'
    )
    lines.append(
        '2. "70% of software implementations fail — not because the software '
        'is broken, but because it\'s too complex for the people paying for it."\n'
    )
    lines.append(
        '3. "Custom software has zero learning curve because it\'s built for '
        'how YOU already work — not how Salesforce thinks you should."\n'
    )
    lines.append(
        '4. "The average SMB pays $11,196 per employee per year on SaaS. '
        'A third of that is shelfware. Another third needs a specialist to run."\n'
    )
    lines.append(
        '5. "Every SaaS tool you add is another login, another learning curve, '
        'another renewal you\'ll forget about. Custom software is ONE thing '
        'that does exactly what you need."\n'
    )

    out_path.write_text("\n".join(lines))
    print(f"Saved to {out_path}")


def dump_json():
    """Dump all research data as JSON."""
    payload = {
        "title": "The Learning Curve Tax",
        "compiled": datetime.now().isoformat(),
        "thesis": (
            "The true cost of SaaS isn't the subscription — it's the human "
            "cost of operating it."
        ),
        "sections": ALL_SECTIONS,
        "invoice_suggestion": INVOICE_CARD_SUGGESTION,
    }
    print(json.dumps(payload, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Learning Curve Tax Research")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--markdown", action="store_true", help="Save markdown to docs/")
    args = parser.parse_args()

    if args.json:
        dump_json()
    elif args.markdown:
        save_markdown()
    else:
        print_report()


if __name__ == "__main__":
    main()
