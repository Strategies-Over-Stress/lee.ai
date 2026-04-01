"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  stat: string;
  statLabel: string;
  description: string;
  highlights: string[];
}

const features: Feature[] = [
  {
    id: "waste",
    title: "Stop paying for features you don’t use",
    subtitle: "You’re subsidizing someone else’s product roadmap.",
    stat: "47%",
    statLabel: "of software licenses go completely unused — Zylo, 2026",
    description: "That enterprise CRM with 400 features? You use 12 of them. Those other 388 are why your bill keeps going up every year. I build exactly what you need — nothing more, nothing less. And it costs $0/month to keep running.",
    highlights: [
      "Built for YOUR workflow, not a generic one-size-fits-all",
      "No features you’ll never use inflating your bill",
      "$0/month subscription fees — you own it outright",
    ],
  },
  {
    id: "own",
    title: "Own it. Don’t rent it.",
    subtitle: "SaaS companies love recurring revenue. You shouldn’t love giving it to them.",
    stat: "$0/mo",
    statLabel: "The cost of your software in 2029. Because you already own it.",
    description: "Custom software you own has no renewal date, no annual price increases, no ‘we’re updating our terms of service’ emails. Two years from now, it’s still running. Still $0/month. Still yours.",
    highlights: [
      "No price increases. Ever.",
      "No vendor lock-in. Your data stays yours.",
      "Five years from now? Still $0/month.",
      "Fully integrated — no more paying to access your own data",
      "Redirect resources to building software that makes YOU stand out",
    ],
  },
  {
    id: "risk",
    title: "AI without the risk",
    subtitle: "You don’t need to understand vulnerabilities. You need someone who does.",
    stat: "45%",
    statLabel: "of AI-generated code fails security tests — Veracode, 2025",
    description: "I use AI to build faster and cheaper, but every line is reviewed with a decade of professional engineering judgment. Your data stays safe. Your compliance stays intact. Your business stays protected.",
    highlights: [
      "Every line of code reviewed by a professional",
      "Compliance built into the architecture from day one",
      "Your private data stays private",
    ],
  },
  {
    id: "duct",
    title: "No more duct tape",
    subtitle: "Replace $100/month Zapier chains with real integrations.",
    stat: "$6/mo",
    statLabel: "replaces $100/month in duct-tape automation",
    description: "You’ve got Zapier connecting your email tool to your CRM to your spreadsheet to your calendar. 20 steps. $100/month. One break and the whole chain goes down. I replace duct-tape integrations with real systems that run reliably.",
    highlights: [
      "Replace $100/month Zapier chains with $6/month solutions",
      "Real integrations that don’t break when one tool updates",
      "One system instead of 12 tools pretending to talk to each other",
    ],
  },
];

export default function Differentiator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openId, setOpenId] = useState<string | null>(features[0].id);

  return (
    <section className="relative py-32 px-6 bg-accent/[0.02]" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Why This Is Different
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            Not another subscription
          </h2>
          <p className="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
            This isn&apos;t another tool to pay for. It&apos;s software you own &mdash; built by someone who&apos;s been doing this for a decade.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {features.map((feature, index) => {
            const isOpen = openId === feature.id;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className={"rounded-xl border transition-all duration-300 overflow-hidden " +
                  (isOpen ? "border-accent/50 bg-accent/5 glow" : "border-surface-light bg-surface hover:border-accent/20")}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : feature.id)}
                  className="w-full text-left p-5 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className={"font-bold text-lg " + (isOpen ? "text-text-primary" : "text-text-secondary")}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">{feature.subtitle}</p>
                  </div>
                  <span className={"text-text-muted transition-transform duration-300 mt-1 " + (isOpen ? "rotate-180" : "")}>
                    &#9660;
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6">
                        {/* Giant stat */}
                        <div className="mb-6">
                          <div className="text-5xl sm:text-6xl font-black text-gradient">{feature.stat}</div>
                          <div className="text-sm text-text-muted mt-2">{feature.statLabel}</div>
                        </div>

                        <p className="text-text-secondary text-lg mb-6">{feature.description}</p>

                        <ul className="space-y-3">
                          {feature.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-text-secondary">
                              <span className="text-emerald mt-0.5">&#10003;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
