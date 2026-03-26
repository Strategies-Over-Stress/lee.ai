"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Discovery Call",
    description:
      "30-minute call to understand your business, tech stack, and pain points. No sales pitch — just an honest assessment of whether AI-first development can help you.",
    detail: "Free. No commitment.",
    icon: "📞",
  },
  {
    number: "02",
    title: "Technical Audit",
    description:
      "I dive into your codebase, infrastructure, and workflows. You get a concrete report: what's working, what's burning time, and exactly what I'd change.",
    detail: "Delivered in 48 hours.",
    icon: "🔍",
  },
  {
    number: "03",
    title: "Transformation Sprint",
    description:
      "We start building. CI/CD pipelines, automated testing, AI-collaborative architecture, feature delivery. You see results in the first week, not the first quarter.",
    detail: "Weekly check-ins. Transparent progress.",
    icon: "⚡",
  },
  {
    number: "04",
    title: "Handoff — or Keep Building",
    description:
      "Once your systems are automated and documented, you own everything. Most clients are self-sufficient at this point. Some choose to keep me on retainer for new features — but you'll never need to.",
    detail: "Your choice. No lock-in. Month-to-month if you stay.",
    icon: "🔑",
  },
];

export default function Process() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            The Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            How it works
          </h2>
          <p className="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
            From first call to production code. No bloated proposals, no
            six-month timelines.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
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
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-surface border border-surface-light group-hover:border-accent/50 flex items-center justify-center transition-all duration-300">
                  <span className="text-2xl">{step.icon}</span>
                </div>

                {/* Step content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-accent text-sm">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-text-secondary mb-2">
                    {step.description}
                  </p>
                  <span className="text-sm font-mono text-accent-bright">
                    {step.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
