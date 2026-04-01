"use client";

import { motion, useInView, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function CountUp({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    // Extract numeric part
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const prefix = value.match(/^[^0-9]*/)?.[0] || "";
    const valueSuffix = value.match(/[^0-9.]*$/)?.[0] || "";

    if (isNaN(numeric)) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, numeric, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => {
        if (numeric >= 100) {
          setDisplay(prefix + Math.round(v).toLocaleString() + valueSuffix);
        } else if (numeric >= 1) {
          setDisplay(prefix + Math.round(v) + valueSuffix);
        } else {
          setDisplay(prefix + v.toFixed(1) + valueSuffix);
        }
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

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

function MockupBefore() {
  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-lg mb-4" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#1a1a24" rx="8"/>
      {/* Chaotic toolbar */}
      <rect x="0" y="0" width="400" height="32" fill="#2a2a3a" rx="8"/>
      <circle cx="16" cy="16" r="5" fill="#f43f5e"/>
      <circle cx="32" cy="16" r="5" fill="#f59e0b"/>
      <circle cx="48" cy="16" r="5" fill="#6b7280"/>
      {/* Scattered plugin boxes */}
      <rect x="12" y="44" width="80" height="50" fill="#f43f5e" opacity="0.15" rx="4"/>
      <rect x="100" y="44" width="60" height="50" fill="#f59e0b" opacity="0.15" rx="4"/>
      <rect x="168" y="44" width="90" height="50" fill="#f43f5e" opacity="0.15" rx="4"/>
      <rect x="266" y="44" width="70" height="50" fill="#6b7280" opacity="0.15" rx="4"/>
      <rect x="344" y="44" width="44" height="50" fill="#f43f5e" opacity="0.15" rx="4"/>
      {/* Messy rows */}
      <rect x="12" y="104" width="180" height="8" fill="#6b7280" opacity="0.2" rx="2"/>
      <rect x="12" y="120" width="120" height="8" fill="#f43f5e" opacity="0.2" rx="2"/>
      <rect x="200" y="104" width="100" height="8" fill="#6b7280" opacity="0.2" rx="2"/>
      <rect x="12" y="140" width="376" height="6" fill="#6b7280" opacity="0.1" rx="2"/>
      <rect x="12" y="154" width="200" height="6" fill="#6b7280" opacity="0.1" rx="2"/>
      <rect x="12" y="168" width="300" height="6" fill="#f43f5e" opacity="0.1" rx="2"/>
      {/* Error badge */}
      <rect x="310" y="106" width="78" height="22" fill="#f43f5e" opacity="0.3" rx="4"/>
      <text x="324" y="121" fill="#f43f5e" fontSize="10" fontFamily="monospace">3 errors</text>
    </svg>
  );
}

function MockupAfter() {
  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-lg mb-4" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="#f8fafc" rx="8"/>
      {/* Clean nav */}
      <rect x="0" y="0" width="400" height="32" fill="#ffffff" rx="8"/>
      <circle cx="16" cy="16" r="5" fill="#10b981"/>
      <rect x="60" y="12" width="40" height="8" fill="#6366f1" opacity="0.3" rx="2"/>
      <rect x="110" y="12" width="50" height="8" fill="#e2e8f0" rx="2"/>
      <rect x="170" y="12" width="35" height="8" fill="#e2e8f0" rx="2"/>
      {/* Dashboard cards */}
      <rect x="12" y="44" width="120" height="64" fill="#ffffff" rx="6" stroke="#e2e8f0"/>
      <rect x="24" y="56" width="50" height="8" fill="#6366f1" opacity="0.3" rx="2"/>
      <text x="24" y="84" fill="#1e293b" fontSize="18" fontWeight="bold" fontFamily="sans-serif">$30K</text>
      <rect x="144" y="44" width="120" height="64" fill="#ffffff" rx="6" stroke="#e2e8f0"/>
      <rect x="156" y="56" width="60" height="8" fill="#10b981" opacity="0.3" rx="2"/>
      <text x="156" y="84" fill="#10b981" fontSize="18" fontWeight="bold" fontFamily="sans-serif">100%</text>
      <rect x="276" y="44" width="112" height="64" fill="#ffffff" rx="6" stroke="#e2e8f0"/>
      <rect x="288" y="56" width="45" height="8" fill="#6366f1" opacity="0.3" rx="2"/>
      <text x="288" y="84" fill="#1e293b" fontSize="18" fontWeight="bold" fontFamily="sans-serif">3s</text>
      {/* Chart area */}
      <rect x="12" y="120" width="376" height="68" fill="#ffffff" rx="6" stroke="#e2e8f0"/>
      <polyline points="24,172 80,155 140,160 200,140 260,145 320,130 376,135" fill="none" stroke="#6366f1" strokeWidth="2"/>
      <polyline points="24,175 80,168 140,170 200,158 260,160 320,150 376,148" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5"/>
    </svg>
  );
}

function BeforePanel({ items }: { items: string[] }) {
  return (
    <div className="w-full bg-rose-50 p-8">
      <MockupBefore />
      <h3 className="text-xl font-bold text-rose-600 mb-4">Before</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-rose-500">&#10007;</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AfterPanel({ items }: { items: string[] }) {
  return (
    <div className="w-full bg-emerald-50 p-8">
      <MockupAfter />
      <h3 className="text-xl font-bold text-emerald-600 mb-4">After</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-emerald-500">&#10003;</span> {item}
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
    <section id="proof" className="relative py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Transformation icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16L3 12M3 12L7 8M3 12H16" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L21 12M21 12L17 16M21 12H8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Real Businesses. Real Savings.
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 text-gray-900">
            The Transformation
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
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
                  ? "bg-accent/10 border border-accent/50 text-gray-900"
                  : "border border-gray-200 text-gray-500 hover:border-accent/30")}
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
              <div className="text-3xl font-bold text-gradient"><CountUp value={stat.value} /></div>
              <div className="text-sm text-gray-900 mt-1">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
