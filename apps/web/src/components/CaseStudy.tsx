"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const cases = [
  {
    id: "ecommerce",
    tab: "LoveAmethystRose.com",
    site: "https://loveamethystrose.com",
    before: [
      "$1,500+/mo in WordPress plugins and SaaS subscriptions",
      "Site crashed on biggest sales day",
      "Copying data between tools by hand",
      "Fragile stack — nothing talked to each other",
    ],
    after: [
      "Dumped $1,500+ in plugins and SaaS products",
      "More performant AND more attractive site",
      "Every feature those plugins provided — customized for her",
      "She truly got her cake and ate it too",
      "Fully integrated — no more paying to access her own data",
    ],
    moneyLine: "She rebuilt the wheel — and it rolls better. Dumped $1,500+/mo in WordPress plugins and SaaS products, got a site that’s faster, more beautiful, with every feature custom-built for her business.",
    stats: [
      { value: "$30K", label: "Revenue month", sub: "zero downtime" },
      { value: "10x", label: "Faster page loads", sub: "30s → 3s" },
      { value: "$0/mo", label: "Plugin/SaaS fees", sub: "for replaced tools" },
    ],
  },
  {
    id: "advisor",
    tab: "DominiqueWells.com",
    site: "https://dominiquewells.com",
    before: [
      "$4,000+/year in CRM and SaaS subscriptions",
      "Using a fraction of the features she paid for",
      "Trapped by compliance fears — SEC regulations",
      "Vendor lock-in on client data",
    ],
    after: [
      "Custom CRM built for her exact workflow",
      "Fully self-hosted — she owns every byte",
      "SEC-compliant from the architecture up",
      "Saved $4,000+ in annual expenses",
      "Fully integrated — one system, zero limitations",
    ],
    moneyLine: "Dominique rebuilt the wheel — and saved $4,000+ a year doing it. Her CRM is compliant, self-hosted, and will never send her another invoice.",
    stats: [
      { value: "$4K+", label: "Annual savings", sub: "vs previous subscriptions" },
      { value: "100%", label: "Feature fit", sub: "her exact workflow" },
      { value: "3 wks", label: "Time to build", sub: "SEC-compliant" },
    ],
  },
];

function BeforePanel({ items }: { items: string[] }) {
  return (
    <div className="w-full h-full bg-rose/5 p-8 flex flex-col justify-center">
      <h3 className="text-xl font-bold text-rose mb-4">Before</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="text-rose">✗</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AfterPanel({ items }: { items: string[] }) {
  return (
    <div className="w-full h-full bg-emerald/5 p-8 flex flex-col justify-center">
      <h3 className="text-xl font-bold text-emerald mb-4">After</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="text-emerald">✓</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CaseStudy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("ecommerce");
  const [showAfter, setShowAfter] = useState(false);
  const activeCase = cases.find((c) => c.id === activeTab)!;

  return (
    <section id="proof" className="relative py-32 px-6 bg-surface/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Real Businesses. Real Savings.
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            The Transformation
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto text-lg">
            These aren&apos;t hypotheticals. These are owner-operators who were in exactly your position.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={"px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer " +
                (activeTab === c.id
                  ? "bg-accent/10 border border-accent/50 text-text-primary"
                  : "border border-surface-light text-text-secondary hover:border-accent/30")}
            >
              {c.tab}
            </button>
          ))}
        </div>

        {/* Site link */}
        <div className="text-center mb-6">
          <a
            href={activeCase.site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-bright hover:text-accent transition-colors font-mono"
          >
            {activeCase.site} &rarr;
          </a>
        </div>

        {/* Before / After toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-xl border border-surface-light bg-surface p-1">
            <button
              onClick={() => setShowAfter(false)}
              className={"px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer " +
                (!showAfter ? "bg-rose/20 text-rose" : "text-text-secondary hover:text-text-primary")}
            >
              Before
            </button>
            <button
              onClick={() => setShowAfter(true)}
              className={"px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer " +
                (showAfter ? "bg-emerald/20 text-emerald" : "text-text-secondary hover:text-text-primary")}
            >
              After
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showAfter ? (
            <motion.div
              key={activeTab + "-before"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-rose/20 overflow-hidden"
            >
              <BeforePanel items={activeCase.before} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab + "-after"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-emerald/20 overflow-hidden"
            >
              <AfterPanel items={activeCase.after} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Money line */}
        <motion.p
          key={activeTab + "-money"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-lg sm:text-xl text-accent-bright font-medium mt-10 max-w-3xl mx-auto italic"
        >
          &ldquo;{activeCase.moneyLine}&rdquo;
        </motion.p>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10 max-w-2xl mx-auto">
          {activeCase.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-text-primary mt-1">{stat.label}</div>
              <div className="text-xs text-text-muted mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
