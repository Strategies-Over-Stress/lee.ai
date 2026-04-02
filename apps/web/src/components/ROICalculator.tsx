"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function ROICalculator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [subCount, setSubCount] = useState(8);
  const [avgCost, setAvgCost] = useState(100);
  const [needed, setNeeded] = useState(3);

  const currentMonthly = subCount * avgCost;
  const currentAnnual = currentMonthly * 12;
  const afterMonthly = 15; // hosting
  const afterAnnual = afterMonthly * 12;
  const savings = currentAnnual - afterAnnual;
  const fiveYear = savings * 5;

  return (
    <section className="relative py-32 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="#6366f1" strokeWidth="2"/>
              <path d="M8 6h8M8 10h8M8 14h4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="2" fill="#6366f1"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            ROI Calculator
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            See your savings
          </h2>
          <p className="text-text-secondary mt-4 text-lg">
            Adjust the sliders to match your situation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Sliders */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Subscriptions you pay for</span>
                <span className="font-mono font-bold text-white">{subCount}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={subCount}
                onChange={(e) => setSubCount(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Average cost per subscription</span>
                <span className="font-mono font-bold text-white">${avgCost}/mo</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={avgCost}
                onChange={(e) => setAvgCost(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">How many do you actually need?</span>
                <span className="font-mono font-bold text-white">{needed}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={needed}
                onChange={(e) => setNeeded(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Results */}
          <div className="rounded-2xl border border-surface-light bg-surface p-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Estimated annual cost</span>
                <span className="text-xl font-mono font-bold text-rose">${currentAnnual.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Estimated cost after we build</span>
                <span className="text-xl font-mono font-bold text-emerald">${afterAnnual}/yr</span>
              </div>
              <div className="h-px bg-surface-light" />
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Estimated savings</span>
                <span className="text-2xl font-mono font-bold text-gradient">${savings.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-surface-light">
                <span className="text-white font-bold text-lg">Over 5 years</span>
                <span className="text-3xl font-mono font-black text-gradient">${fiveYear.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-6">
              *Assumes $15/month average hosting cost for custom software. Actual costs vary by project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
