"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Let&apos;s Build
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold mt-4 mb-6">
            Ready to see what{" "}
            <span className="text-gradient">AI can do for your business?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-4 max-w-2xl mx-auto">
            I take on 1-2 clients at a time so every engagement gets my full attention. Start with a free 30-minute call &mdash; let me show you what&apos;s possible when AI is applied the right way.
          </p>

          {/* Guarantee reminder */}
          <p className="text-emerald font-semibold mb-8">
            If it doesn&apos;t outperform what you have now, you don&apos;t pay.
          </p>

          {/* Risk reversal */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-text-muted">
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> Bi-weekly, cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> You own all the code
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> Cheaper than your stack &mdash; guaranteed
            </span>
          </div>

          <div className="flex justify-center mb-16">
            <a
              href="#assess"
              className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              Book a free consultation
            </a>
          </div>

          {/* Availability */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald/20 bg-emerald/5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-sm text-emerald">Currently accepting new clients</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-32 border-t border-surface-light pt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted text-sm">
          <span>&copy; {new Date().getFullYear()} Rich Lee</span>
          <a href="/build-not-buy" className="text-accent-bright hover:text-accent transition-colors">
            Read: Why building beats subscribing &rarr;
          </a>
          <span className="font-mono">Your solution. Your software. $0/month forever.</span>
        </div>
      </div>
    </section>
  );
}
