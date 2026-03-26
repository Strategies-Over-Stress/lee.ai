"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const beforeItems = [
  { label: "Site crashed on every big sales day", icon: "🔴" },
  { label: "Updating products took an entire day", icon: "🔴" },
  { label: "No idea which marketing campaigns actually worked", icon: "🔴" },
  { label: "One developer change could break the whole site", icon: "🔴" },
  { label: "No way to undo a bad update", icon: "🔴" },
  { label: "Paying multiple freelancers, nothing connected", icon: "🔴" },
  { label: "Every task required manual, repetitive work", icon: "🔴" },
];

const afterItems = [
  { label: "100% uptime during $30K sales month", icon: "🟢" },
  { label: "New products go live in under 10 minutes", icon: "🟢" },
  { label: "Every campaign tracked with real ROI data", icon: "🟢" },
  { label: "Changes tested automatically before going live", icon: "🟢" },
  { label: "Bad updates reversed in one command, instantly", icon: "🟢" },
  { label: "8 tools connected and running on autopilot", icon: "🟢" },
  { label: "Marketing emails, ads, and reports fully automated", icon: "🟢" },
];


export default function CaseStudy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="proof" className="relative py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Case Study
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            The Transformation
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto text-lg">
            A real e-commerce brand was bleeding time and money on a broken tech
            stack. Here&apos;s what changed when we rebuilt it with AI-first engineering.
          </p>
        </motion.div>

        {/* Before / After comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl border border-rose/20 bg-rose/5"
          >
            <h3 className="text-2xl font-bold text-rose mb-6">Before</h3>
            <ul className="space-y-3">
              {beforeItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-text-secondary"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-2xl border border-emerald/20 bg-emerald/5"
          >
            <h3 className="text-2xl font-bold text-emerald mb-6">After</h3>
            <ul className="space-y-3">
              {afterItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-text-secondary"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Results highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-2xl border border-accent/20 bg-accent/5 p-8 glow"
        >
          <h3 className="text-xl font-bold mb-6 text-center">The Results</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "10x", label: "Faster page loads", sub: "30 seconds → 3 seconds" },
              { value: "$0.79", label: "Cost per add-to-cart", sub: "87% below industry average" },
              { value: "29%", label: "Visitors adding to cart", sub: "industry avg is 5-10%" },
              { value: "19-27%", label: "Email capture rate", sub: "industry avg is 3-5%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-text-primary mt-1">{stat.label}</div>
                <div className="text-xs text-text-muted mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
