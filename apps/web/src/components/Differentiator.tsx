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
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    id: "waste",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"><path d="M19 7l-7 7-3-3-4 4"/><path d="M22 7h-5V2"/></svg>,
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
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
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
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2"/></svg>,
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
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94L14.7 6.3z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <br />
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
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                    <div>
                    <h3 className={"font-bold text-xl " + (isOpen ? "text-white" : "text-white/70")}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/60 mt-1">{feature.subtitle}</p>
                    </div>
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
                          <div className="text-sm text-white/50 mt-2">{feature.statLabel}</div>
                        </div>

                        <p className="text-white/80 text-lg mb-6">{feature.description}</p>

                        <ul className="space-y-3">
                          {feature.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-3 text-white/80">
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
