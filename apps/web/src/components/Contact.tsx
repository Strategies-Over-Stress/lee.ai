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
              Book a free consultation
            </a>
            <a
              href="mailto:rich@strategiesoverstress.com"
              className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email me directly
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
