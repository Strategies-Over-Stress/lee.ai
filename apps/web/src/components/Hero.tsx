"use client";

import { motion } from "framer-motion";
import BillingReceipt from "./BillingReceipt";

export default function Hero() {
  return (
    <section className="relative pt-36 sm:pt-44 pb-16 flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-4 text-white"
        >
          Are you ready for
          <br />
          <span className="text-gradient">your next SaaS bill?</span>
        </motion.h1>

        {/* Billing receipt */}
        <div className="mt-8 mb-8">
          <BillingReceipt />
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-2xl sm:text-3xl md:text-4xl text-white/80 font-light mb-16 max-w-3xl mx-auto"
        >
          A senior Software Engineer turned AI Consultant &mdash; I automate
          your business with AI. No useless subscriptions that don&apos;t deliver.
          For a fraction of the price. Solutions you{" "}
          <span className="text-gradient font-semibold">own</span>, not rent.
          <br />
          <span className="text-lg sm:text-xl text-white font-semibold mt-10 block">
            If it doesn&apos;t outperform what you have now, you don&apos;t pay.
          </span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-col items-center gap-6 mt-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#assess"
              className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
            >
              See what AI can do for you
              <span className="absolute inset-0 rounded-xl bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
            </a>
            <a
              href="#proof"
              className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              See the proof
            </a>
          </div>
          <a
            href="/build-not-buy"
            className="text-sm text-accent-bright hover:text-white font-medium transition-all duration-300"
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
