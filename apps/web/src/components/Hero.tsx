"use client";

import { motion } from "framer-motion";
import TypewriterText from "./TypewriterText";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Terminal-style intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-surface-light bg-surface/50 backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span className="text-sm font-mono text-text-secondary">
            available for new engagements
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
        >
          Hire me once.
          <br />
          <span className="text-gradient">I&apos;ll automate myself</span>
          <br />
          out of a job.
        </motion.h1>

        {/* Rotating subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl sm:text-2xl text-text-secondary font-light mb-12 min-h-[3.5rem] sm:min-h-[2rem] flex items-start justify-center"
        >
          <TypewriterText
            texts={[
              "CI/CD pipelines — on autopilot",
              "E2E testing — on autopilot",
              "Deployments with rollback — on autopilot",
              "Marketing pipelines — on autopilot",
            ]}
          />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#assess"
            className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
          >
            See if we&apos;re a fit
            <span className="absolute inset-0 rounded-xl bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
          </a>
          <a
            href="#proof"
            className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300"
          >
            See the proof
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "7+", label: "Years enterprise" },
            { value: "30+", label: "Custom plugins shipped" },
            { value: "10x", label: "Faster delivery" },
            { value: "$30K", label: "Peak monthly sales" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-text-muted mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 rounded-full border-2 border-text-muted/30 flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-text-muted/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
