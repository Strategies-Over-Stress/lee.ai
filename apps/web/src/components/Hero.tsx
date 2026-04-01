"use client";

import { motion } from "framer-motion";
import BillingReceipt from "./BillingReceipt";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Availability badge */}
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

        {/* Billing receipt animation */}
        <BillingReceipt />

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6 text-white"
        >
          What if this number
          <br />
          <span className="text-gradient">was $0?</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="text-xl sm:text-2xl text-text-secondary font-light mb-12 max-w-3xl mx-auto"
        >
          I build custom software that replaces your subscriptions &mdash;
          guaranteed cheaper, or you don&apos;t pay.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#assess"
            className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
          >
            Find out how much you&apos;re wasting
            <span className="absolute inset-0 rounded-xl bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
          </a>
          <a
            href="#proof"
            className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300"
          >
            See the proof
          </a>
          <a
            href="/build-not-buy"
            className="px-8 py-4 text-accent-bright hover:text-white font-semibold text-lg transition-all duration-300"
          >
            Read: Rebuilding the Wheel &rarr;
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { value: "$1,500+", label: "Wasted on average", sub: "on SaaS every month" },
            { value: "47%", label: "Of licenses go unused", sub: "that\u2019s your money" },
            { value: "80-95%", label: "Of AI projects fail", sub: "without guidance" },
            { value: "$0/mo", label: "Your cost after we build", sub: "you own it forever" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-text-primary mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {stat.sub}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
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
