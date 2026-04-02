"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stepIcons: Record<string, React.ReactNode> = {
  "01": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "02": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="#6366f1" strokeWidth="2"/>
      <path d="M21 21l-4.35-4.35" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "03": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "04": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const steps = [
  {
    number: "01",
    title: "Free Consultation",
    description: "30 minutes. We learn your goals, understand your current tech stack, and identify where custom software can boost efficiency and cut costs. No pitch \u2014 just a clear picture of what’s possible.",
    detail: "Free. No strings attached.",
  },
  {
    number: "02",
    title: "Custom Plan",
    description: "We craft a tailored roadmap \u2014 what to build, what to replace, and what to keep. Every recommendation is tied to a guaranteed outcome. If we can’t deliver measurable savings, no charge.",
    detail: "Delivered in 48 hours.",
  },
  {
    number: "03",
    title: "Build Phase",
    description: "We replace the waste with software you own. Built with AI for speed, reviewed by a professional for safety. You see working software in weeks, not months.",
    detail: "Weekly check-ins. Transparent progress.",
  },
  {
    number: "04",
    title: "Handoff",
    description: "You own everything. No monthly fees. No lock-in. No renewal notices. Ever. I’m available if you want to keep building \u2014 but you’ll never need me to keep the lights on.",
    detail: "Your code. Your servers. Your freedom.",
  },
];

export default function Process() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-6 bg-accent/[0.02]" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 18l6-6-6-6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
              <path d="M3 18l6-6-6-6" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            From first call to software you own
          </h2>
          <p className="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
            No bloated proposals. No six-month timelines.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent hidden md:block" />
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="relative flex gap-6 md:gap-8 group"
              >
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-accent/10 border border-surface-light group-hover:border-accent/50 flex items-center justify-center transition-all duration-300">
                  {stepIcons[step.number]}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-accent text-sm">{step.number}</span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-text-secondary mb-2">{step.description}</p>
                  <span className="text-sm font-mono text-accent-bright">{step.detail}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
