"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const lineItems = [
  { name: "Project management tool", cost: 29, waste: false },
  { name: "CRM you use 5% of", cost: 199, waste: true },
  { name: "Email platform (outgrew it 2 years ago)", cost: 79, waste: false },
  { name: "Analytics dashboard — 200 reports, you read 3", cost: 149, waste: true },
  { name: "Integration glue code", cost: 99, waste: false },
  { name: "AI tool tokens", cost: 50, waste: false },
];

const specialistItem = {
  name: "SaaS tool specialist (to operate the above)",
  cost: 4500,
  waste: true,
};

const totalAmount = 6047;
const COUNT_DURATION = 600; // ms per item count-up
const ITEM_STAGGER = 0.15; // seconds between each item appearing

function useCountUp(target: number, duration: number, startDelay: number, shouldStart: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [target, duration, startDelay, shouldStart]);

  return value;
}

function LineItemPrice({ target, waste, startDelay, shouldStart }: { target: number; waste: boolean; startDelay: number; shouldStart: boolean }) {
  const value = useCountUp(target, COUNT_DURATION, startDelay, shouldStart);
  return (
    <span className={"text-base font-mono font-semibold " + (waste ? "text-red-600" : "text-gray-500")}>
      ${value}/mo
    </span>
  );
}

function TotalPrice({ startDelay, shouldStart }: { startDelay: number; shouldStart: boolean }) {
  const value = useCountUp(totalAmount, 800, startDelay, shouldStart);
  const formatted = value.toLocaleString();
  return (
    <motion.span
      animate={{ opacity: [1, 0.6, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-2xl font-mono font-black text-red-600"
    >
      ${formatted}/mo
    </motion.span>
  );
}

export default function BillingReceipt() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Specialist line appears after all regular items
  const specialistAppearDelay = 0.3 + lineItems.length * ITEM_STAGGER + COUNT_DURATION / 1000 + 0.6;
  // Time when the total line should appear (after specialist has counted)
  const totalAppearDelay = specialistAppearDelay + COUNT_DURATION / 1000 + 0.8;
  // Time when the caution emoji should bounce in
  const cautionDelay = totalAppearDelay + 0.8;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg mx-auto rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-accent/10 overflow-hidden mb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-amber text-sm">&#9888;</span>
        <span className="text-sm font-mono text-gray-600">Renewal Notice</span>
        <span className="ml-auto text-xs text-red-500 font-medium">Renews in 3 days</span>
      </div>

      {/* Line items */}
      <div className="px-6 py-4 space-y-3">
        {lineItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * ITEM_STAGGER }}
            className="flex items-start justify-between gap-4"
          >
            <span className={"text-base text-left " + (item.waste ? "text-red-600 font-medium" : "text-gray-700")}>
              {item.name}
            </span>
            <span className="shrink-0">
              <LineItemPrice
                target={item.cost}
                waste={item.waste}
                startDelay={(0.3 + i * ITEM_STAGGER) * 1000}
                shouldStart={isInView}
              />
            </span>
          </motion.div>
        ))}

        {/* Specialist line — the punchline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: specialistAppearDelay }}
          className="flex items-start justify-between gap-4 pt-2 mt-2 border-t border-dashed border-red-200"
        >
          <span className="text-base text-left text-red-600 font-bold">
            {specialistItem.name}
          </span>
          <span className="shrink-0">
            <LineItemPrice
              target={specialistItem.cost}
              waste={true}
              startDelay={specialistAppearDelay * 1000}
              shouldStart={isInView}
            />
          </span>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: totalAppearDelay - 0.2 }}
          className="h-px bg-gray-200 origin-left"
        />

        {/* Total */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: totalAppearDelay }}
          className="flex items-center justify-between pt-1"
        >
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.4, 0.9, 1.15, 1] }}
              transition={{ duration: 0.6, delay: cautionDelay, ease: "easeOut" }}
              className="text-xl"
            >
              ⚠️
            </motion.span>
            <span className="text-lg font-bold text-gray-900">Total</span>
          </div>
          <TotalPrice
            startDelay={totalAppearDelay * 1000}
            shouldStart={isInView}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
