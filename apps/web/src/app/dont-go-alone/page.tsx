"use client";

import { motion } from "framer-motion";

export default function DontGoAlone() {
  return (
    <main className="relative grid-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <a href="/" className="text-sm text-text-muted hover:text-accent-bright transition-colors mb-12 block">
          &larr; Back to lee.ai
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl font-black mb-6">
            Everyone says AI will transform your business.
            <br />
            <span className="text-gradient">They don\u2019t mention the 95% failure rate.</span>
          </h1>

          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            AI-built software CAN cost less than your SaaS stack, run better, and belong to you.
            But only if you don\u2019t go alone.
          </p>

          <div className="space-y-8 text-text-secondary text-lg leading-relaxed">
            <div className="p-8 rounded-2xl bg-surface border border-surface-light">
              <h2 className="text-2xl font-bold text-white mb-4">The Math Nobody Shares</h2>
              <p className="mb-4">
                Enterprises invested <span className="text-rose font-bold">$684 billion</span> in AI in 2025.
                Over <span className="text-rose font-bold">$547 billion</span> of that\u2014 80%+\u2014 failed to deliver intended business value.
              </p>
              <p>
                At your scale, that\u2019s not billions. It\u2019s three months of evenings wasted on a tool that doesn\u2019t work,
                plus the subscriptions you kept paying \u201cjust in case\u201d while you figured it out.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-accent/5 border border-accent/20">
              <h2 className="text-2xl font-bold text-white mb-4">Working With Me Costs Less Than Going Alone</h2>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-bold text-rose mb-3">Going Alone</h3>
                  <ul className="space-y-2 text-sm">
                    <li>\u2717 AI tool subscriptions: $50\u2013200/month</li>
                    <li>\u2717 Token costs: $20\u2013100/month</li>
                    <li>\u2717 Time: 40\u2013100+ hours building</li>
                    <li>\u2717 Another 40\u2013100 hours debugging</li>
                    <li>\u2717 Security audit: $2,000\u2013$5,000</li>
                    <li>\u2717 Risk of breach: incalculable</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-emerald mb-3">Working With Me</h3>
                  <ul className="space-y-2 text-sm">
                    <li>\u2713 My fee: included in the guarantee</li>
                    <li>\u2713 AI tools: I bring my own</li>
                    <li>\u2713 Time to working software: weeks</li>
                    <li>\u2713 Security: built in from day one</li>
                    <li>\u2713 Ongoing: $5\u201320/month hosting</li>
                    <li>\u2713 Year 2+: $5\u201320/month. Forever.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-emerald/5 border border-emerald/20">
              <h2 className="text-2xl font-bold text-emerald mb-4">The Guarantee</h2>
              <p className="text-xl">
                If my fee + the solution I build doesn\u2019t cost you <span className="font-bold text-white">less</span> than
                what you\u2019re currently spending on software subscriptions AND deliver a
                <span className="font-bold text-white"> better</span> product\u2014 you don\u2019t pay.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="/#contact"
              className="inline-flex px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
            >
              Book a free consultation
            </a>
            <p className="text-text-muted text-sm mt-4">
              You don\u2019t have to go alone.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
