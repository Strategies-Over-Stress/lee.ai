"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Free Consultation",
    description: "30 minutes. We look at what you’re spending on software and what you’re actually getting for it. No pitch. No commitment. Just an honest look at the numbers.",
    detail: "Free. No strings attached.",
    icon: "📞",
  },
  {
    number: "02",
    title: "Software Review",
    description: "I map every tool you’re paying for \u2014 what it costs, what it does, what it doesn’t do, and what’s trapping you. You get a clear picture of where your money goes.",
    detail: "Delivered in 48 hours.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "Build Phase",
    description: "We replace the waste with software you own. Built with AI for speed, reviewed by a professional for safety. You see working software in weeks, not months.",
    detail: "Weekly check-ins. Transparent progress.",
    icon: "⚡",
  },
  {
    number: "04",
    title: "Handoff",
    description: "You own everything. No monthly fees. No lock-in. No renewal notices. Ever. I’m available if you want to keep building \u2014 but you’ll never need me to keep the lights on.",
    detail: "Your code. Your servers. Your freedom.",
    icon: "🔑",
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
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-surface border border-surface-light group-hover:border-accent/50 flex items-center justify-center transition-all duration-300">
                  <span className="text-2xl">{step.icon}</span>
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
