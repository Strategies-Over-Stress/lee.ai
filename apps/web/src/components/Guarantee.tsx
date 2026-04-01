"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const badges = [
  { icon: "\ud83d\udee1\ufe0f", text: "Cheaper than your current stack \u2014 or free" },
  { icon: "\u2705", text: "Custom to your exact needs \u2014 or free" },
  { icon: "\ud83d\udd11", text: "You own everything we build" },
];

export default function Guarantee() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-6 bg-emerald/[0.03]" ref={ref}>
      {/* Emerald glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-emerald/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Money icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
              <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-emerald text-sm tracking-widest uppercase">
            The Only Guarantee in AI Consulting
          </span>

          <h2 className="text-4xl sm:text-6xl font-black mt-6 mb-8">
            If it&apos;s not cheaper{" "}
            <span className="text-emerald">AND</span> better
            <br />
            &mdash; you don&apos;t pay.
          </h2>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {badges.map((badge) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald/20 bg-emerald/5"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm text-white/80">{badge.text}</span>
              </motion.div>
            ))}
          </div>

          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Not a &ldquo;satisfaction guarantee&rdquo; with fine print. If I can&apos;t save you money while giving you better software, the engagement is free. Period.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
