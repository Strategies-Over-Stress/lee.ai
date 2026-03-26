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
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Let&apos;s Build
          </span>
          <h2 className="text-4xl sm:text-6xl font-bold mt-4 mb-6">
            Ready to{" "}
            <span className="text-gradient">stop fighting your tech stack?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            I take on 1-2 clients at a time so every engagement gets my full
            attention. Start with a free technical audit — no commitment, no
            sales pitch. Just an honest look at what&apos;s costing you time and money.
          </p>

          {/* Risk reversal */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-text-muted">
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> Month-to-month, cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> No lock-in contracts
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald">&#10003;</span> You own all the code
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="https://www.linkedin.com/in/ricanthonylee"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Connect on LinkedIn
            </a>
            <a
              href="mailto:rich@strategiesoverstress.com"
              className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email me directly
            </a>
          </div>

          {/* Availability note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald/20 bg-emerald/5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-sm text-emerald">
              Currently accepting new clients
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-32 border-t border-surface-light pt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted text-sm">
          <span>&copy; {new Date().getFullYear()} Rich Lee</span>
          <span className="font-mono">Built with AI. Obviously.</span>
        </div>
      </div>
    </section>
  );
}
