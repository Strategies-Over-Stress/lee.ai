"use client";

import { motion } from "framer-motion";

const lineItems = [
  { name: "Project management tool", cost: "$29", waste: false },
  { name: "CRM you use 5% of", cost: "$199", waste: true },
  { name: "Email platform (outgrew it 2 years ago)", cost: "$79", waste: false },
  { name: "Analytics dashboard — 200 reports, you read 3", cost: "$149", waste: true },
  { name: "Integration duct tape (Zapier)", cost: "$99", waste: false },
  { name: "AI tool tokens", cost: "$50", waste: false },
];

const total = "$1,547";

export default function BillingReceipt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-lg mx-auto rounded-2xl border border-surface-light bg-surface/80 backdrop-blur-sm overflow-hidden mb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-surface-light bg-surface">
        <span className="text-amber text-sm">&#9888;</span>
        <span className="text-sm font-mono text-text-muted">Renewal Notice</span>
        <span className="ml-auto text-xs text-text-muted">Renews in 3 days</span>
      </div>

      {/* Line items */}
      <div className="px-6 py-4 space-y-3">
        {lineItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
            className="flex items-center justify-between"
          >
            <span className={"text-sm " + (item.waste ? "text-rose" : "text-text-muted")}>
              {item.name}
            </span>
            <span className={"text-sm font-mono font-medium " + (item.waste ? "text-rose" : "text-text-secondary")}>
              {item.cost}/mo
            </span>
          </motion.div>
        ))}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="h-px bg-surface-light origin-left"
        />

        {/* Total */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex items-center justify-between pt-1"
        >
          <span className="text-sm font-semibold text-text-primary">Total</span>
          <motion.span
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-lg font-mono font-bold text-rose"
          >
            {total}/mo
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
