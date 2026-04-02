"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function CountUp({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
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

  return <span ref={ref}>{display}</span>;
}

const cases = [
  {
    name: "LoveAmethystRose.com",
    site: "https://loveamethystrose.com",
    industry: "E-Commerce / Crystal Jewelry",
    screenshots: [
      "/case-studies/lar-crystals.png",
      "/case-studies/lar-charms.png",
    ],
    pain: [
      "$1,500+/mo in WordPress plugins and SaaS subscriptions",
      "Site crashed on biggest sales day",
      "Copying data between tools by hand",
      "Fragile stack — nothing talked to each other",
    ],
    results: [
      "Dumped $1,500+/mo in plugins and SaaS products",
      "More performant AND more attractive site",
      "Every feature those plugins provided — customized for her",
      "Fully integrated — no more paying to access her own data",
    ],
    quote: "She rebuilt the wheel — and it rolls better. Dumped $1,500+/mo in WordPress plugins and SaaS products, got a site that's faster, more beautiful, with every feature custom-built for her business.",
    stats: [
      { value: "$30K", label: "Revenue month", sub: "zero downtime" },
      { value: "10x", label: "Faster page loads", sub: "30s → 3s" },
      { value: "$0/mo", label: "Plugin/SaaS fees", sub: "for replaced tools" },
    ],
  },
  {
    name: "DominiqueWells.com",
    site: "https://dominiquewells.com",
    industry: "Financial Advisory",
    screenshots: [
      "/case-studies/dominique-wells-hero.png",
    ],
    pain: [
      "$4,000+/year in CRM and SaaS subscriptions",
      "Using a fraction of the features she paid for",
      "Trapped by compliance fears — SEC regulations",
      "Vendor lock-in on client data",
    ],
    results: [
      "Custom CRM built for her exact workflow",
      "Fully self-hosted — she owns every byte",
      "SEC-compliant from the architecture up",
      "Saved $4,000+ in annual expenses",
    ],
    quote: "Dominique rebuilt the wheel — and saved $4,000+ a year doing it. Her CRM is compliant, self-hosted, and will never send her another invoice.",
    stats: [
      { value: "$4K+", label: "Annual savings", sub: "vs previous subscriptions" },
      { value: "100%", label: "Feature fit", sub: "her exact workflow" },
      { value: "3 wks", label: "Time to build", sub: "SEC-compliant" },
    ],
  },
];

function CaseCard({ c, index }: { c: typeof cases[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isReversed = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-surface-light bg-surface/50 overflow-hidden"
    >
      <div className={"grid md:grid-cols-2 gap-0 " + (isReversed ? "md:direction-rtl" : "")}>
        {/* Screenshots side */}
        <div className={"p-6 sm:p-8 bg-midnight/50 " + (isReversed ? "md:order-2" : "")}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-accent uppercase tracking-wider">{c.industry}</span>
          </div>
          <div className="space-y-4">
            {c.screenshots.map((src) => (
              <div key={src} className="rounded-lg overflow-hidden border border-surface-light shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={c.name} className="w-full h-auto" />
              </div>
            ))}
          </div>
          <a
            href={c.site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-accent-bright hover:text-white font-mono transition-colors"
          >
            {c.site} &rarr;
          </a>
        </div>

        {/* Story side */}
        <div className={"p-6 sm:p-8 flex flex-col justify-center " + (isReversed ? "md:order-1" : "")}>
          <h3 className="text-2xl sm:text-3xl font-bold mb-6">{c.name}</h3>

          {/* Pain points */}
          <div className="mb-6">
            <span className="text-xs font-mono text-rose uppercase tracking-wider mb-3 block">The Problem</span>
            <ul className="space-y-2">
              {c.pain.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-rose mt-0.5 shrink-0">&#10007;</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Results */}
          <div className="mb-6">
            <span className="text-xs font-mono text-emerald uppercase tracking-wider mb-3 block">The Result</span>
            <ul className="space-y-2">
              {c.results.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-emerald mt-0.5 shrink-0">&#10003;</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <p className="text-accent-bright text-sm italic mb-6 border-l-2 border-accent/30 pl-4">
            &ldquo;{c.quote}&rdquo;
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {c.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gradient">
                  <CountUp value={stat.value} />
                </div>
                <div className="text-xs text-text-primary mt-1">{stat.label}</div>
                <div className="text-xs text-text-muted">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CaseStudy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="proof" className="relative py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 16L3 12M3 12L7 8M3 12H16" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L21 12M21 12L17 16M21 12H8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Real Businesses. Real Results.
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            The Transformation
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto text-lg">
            Owner-operators who were in exactly your position. Here&apos;s what changed.
          </p>
        </motion.div>

        {/* Case study cards — stacked */}
        <div className="space-y-12">
          {cases.map((c, i) => (
            <CaseCard key={c.name} c={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
