"use client";

import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

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
        } else {
          setDisplay(prefix + Math.round(v) + valueSuffix);
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
      "/case-studies/lar-analytics.png",
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
  {
    name: "ThePenthouseKitchen.com",
    site: "https://thepenthousekitchen.com",
    industry: "High-End Private Chef / Catering",
    screenshots: [
      "/case-studies/penthouse-kitchen-hero.png",
      "/case-studies/penthouse-kitchen-menu.png",
    ],
    pain: [
      "Postponing launch was costing more than building it",
      "High-end Miami clients waiting with no way to book",
      "Trying to figure out the tech on his own",
      "No online presence to match the caliber of his food",
    ],
    results: [
      "Full site live within 24 hours",
      "Online booking, menu showcase, and event pages from day one",
      "Brand presence that matches the premium experience",
      "Serving high-end clients immediately — no more lost revenue",
    ],
    quote: "A high-end Miami chef was losing money every day he didn\u2019t launch. We got him from zero to fully operational in 24 hours — bookings, menu, events, all of it.",
    stats: [
      { value: "24hrs", label: "Time to launch", sub: "from zero to live" },
      { value: "$0", label: "Revenue lost", sub: "after launch day" },
      { value: "100%", label: "Online presence", sub: "booking + menu + events" },
    ],
  },
];

function BrowserSlideshow({ screenshots, site, name }: { screenshots: string[]; site: string; name: string }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenshots.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % screenshots.length);
    }, 4000);
  }, [screenshots.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (i: number) => {
    setCurrent(i);
    startTimer();
  };

  const domain = site.replace(/^https?:\/\//, "");

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-white rounded-md px-3 py-1 text-xs font-mono text-gray-500 truncate border border-gray-200">
            {domain}
          </div>
        </div>
      </div>
      {/* Screenshot area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={screenshots[current]}
            src={screenshots[current]}
            alt={`${name} screenshot ${current + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </AnimatePresence>
      </div>
      {/* Dots */}
      {screenshots.length > 1 && (
        <div className="flex justify-center gap-2 py-2.5 bg-gray-100 border-t border-gray-200">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={"h-2 rounded-full transition-all cursor-pointer " +
                (i === current ? "w-5 bg-accent" : "w-2 bg-gray-300 hover:bg-gray-400")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProblemResultToggle({ pain, results }: { pain: string[]; results: string[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [showResult, setShowResult] = useState(false);
  const hasAutoSwitched = useRef(false);

  useEffect(() => {
    if (!isInView || hasAutoSwitched.current) return;
    const timer = setTimeout(() => {
      setShowResult(true);
      hasAutoSwitched.current = true;
    }, 4000);
    return () => clearTimeout(timer);
  }, [isInView]);

  return (
    <div ref={ref}>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-5 bg-midnight/80 rounded-lg p-1 w-fit border border-white/[0.08]">
        <button
          onClick={() => setShowResult(false)}
          className={"px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer " +
            (!showResult
              ? "bg-rose/15 text-rose"
              : "text-white/40 hover:text-white/60")}
        >
          Problem
        </button>
        <button
          onClick={() => setShowResult(true)}
          className={"px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer " +
            (showResult
              ? "bg-emerald/15 text-emerald"
              : "text-white/40 hover:text-white/60")}
        >
          Result
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.ul
            key="pain"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {pain.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-rose mt-0.5 shrink-0 text-sm">&#10007;</span>
                <span className="text-white/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.ul
            key="results"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {results.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-emerald mt-0.5 shrink-0 text-sm">&#10003;</span>
                <span className="text-white/90 leading-relaxed">{item}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function CaseCard({ c, index }: { c: typeof cases[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-white/[0.14] overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.08),0_4px_20px_rgba(0,0,0,0.3)]"
      style={{ background: "linear-gradient(180deg, #222235 0%, #1c1c2e 100%)" }}
    >
      {/* Header bar */}
      <div className="px-6 sm:px-10 pt-8 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-wider">{c.industry}</span>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-white">{c.name}</h3>
        </div>
        <a
          href={c.site}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent-bright hover:bg-accent/20 hover:text-white font-mono transition-all shrink-0"
        >
          Visit site &rarr;
        </a>
      </div>

      {/* Browser mockup + Problem/Result side by side on desktop */}
      <div className="grid md:grid-cols-5 gap-6 px-6 sm:px-10 py-8">
        <div className="md:col-span-3">
          <BrowserSlideshow screenshots={c.screenshots} site={c.site} name={c.name} />
        </div>
        <div className="md:col-span-2 flex flex-col justify-center">
          <ProblemResultToggle pain={c.pain} results={c.results} />
        </div>
      </div>

      {/* Quote */}
      <div className="mx-6 sm:mx-10 pb-8 pt-2 border-t border-white/[0.06]">
        <div className="bg-accent/[0.04] rounded-lg px-6 py-5">
          <p className="text-accent-bright italic border-l-3 border-accent/50 pl-5 max-w-3xl leading-relaxed text-[15px]">
            &ldquo;{c.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-t border-white/[0.10]" style={{ background: "rgba(99,102,241,0.06)" }}>
        {c.stats.map((stat) => (
          <div key={stat.label} className="text-center py-7 border-r border-white/[0.08] last:border-r-0">
            <div className="text-2xl sm:text-3xl font-bold text-gradient">
              <CountUp value={stat.value} />
            </div>
            <div className="text-sm text-white/90 mt-1">{stat.label}</div>
            <div className="text-xs text-white/40 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function CaseStudy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => (i - 1 + cases.length) % cases.length);
  const next = () => setActiveIndex((i) => (i + 1) % cases.length);

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

        {/* Carousel */}
        <div className="relative">
          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-light border border-white/[0.12] hover:border-accent/60 hover:bg-accent/10 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-light border border-white/[0.12] hover:border-accent/60 hover:bg-accent/10 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <CaseCard c={cases[activeIndex]} index={activeIndex} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots + counter */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {cases.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveIndex(i)}
              className={"h-2 rounded-full transition-all cursor-pointer " +
                (i === activeIndex ? "w-8 bg-accent" : "w-2 bg-text-muted/30 hover:bg-text-muted/50")}
            />
          ))}
          <span className="text-xs text-text-muted font-mono ml-2">
            {activeIndex + 1} / {cases.length}
          </span>
        </div>
      </div>
    </section>
  );
}
