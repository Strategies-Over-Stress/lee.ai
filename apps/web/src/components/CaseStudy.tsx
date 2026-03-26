"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const beforeItems = [
  { label: "WordPress spaghetti", icon: "🔴" },
  { label: "No version control on production", icon: "🔴" },
  { label: "Manual FTP deployments", icon: "🔴" },
  { label: "Zero automated testing", icon: "🔴" },
  { label: "No staging environment", icon: "🔴" },
  { label: "Hardcoded credentials everywhere", icon: "🔴" },
  { label: "No marketing automation", icon: "🔴" },
];

const afterItems = [
  { label: "Production-grade monorepo", icon: "🟢" },
  { label: "Git-tracked with PR workflow", icon: "🟢" },
  { label: "Atomic deploys with instant rollback", icon: "🟢" },
  { label: "11 Playwright E2E test suites", icon: "🟢" },
  { label: "Docker staging mirrors production", icon: "🟢" },
  { label: "Centralized .env, never hardcoded", icon: "🟢" },
  { label: "8+ API integrations automated", icon: "🟢" },
];

const techStack = [
  "WordPress/WooCommerce",
  "PHP 8.1",
  "Docker",
  "GitHub Actions CI",
  "Playwright",
  "Python/FastAPI",
  "React 19",
  "Meta Ads API",
  "Klaviyo",
  "Jira API",
  "Mailgun",
  "Sentry",
];

export default function CaseStudy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="proof" className="relative py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Case Study
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            The Transformation
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto text-lg">
            How I took a stale WordPress e-commerce site and rebuilt it into a
            production-grade, AI-collaborative operation — as a one-person team.
          </p>
        </motion.div>

        {/* Before / After comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl border border-rose/20 bg-rose/5"
          >
            <h3 className="text-2xl font-bold text-rose mb-6">Before</h3>
            <ul className="space-y-3">
              {beforeItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-text-secondary"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-2xl border border-emerald/20 bg-emerald/5"
          >
            <h3 className="text-2xl font-bold text-emerald mb-6">After</h3>
            <ul className="space-y-3">
              {afterItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-text-secondary"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Terminal-style highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-2xl border border-surface-light bg-surface overflow-hidden glow"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-light bg-surface-light/50">
            <div className="w-3 h-3 rounded-full bg-rose/60" />
            <div className="w-3 h-3 rounded-full bg-amber/60" />
            <div className="w-3 h-3 rounded-full bg-emerald/60" />
            <span className="ml-2 text-xs font-mono text-text-muted">
              loveamethystrose — transformation summary
            </span>
          </div>

          {/* Terminal content */}
          <div className="p-6 font-mono text-sm space-y-2">
            <div>
              <span className="text-emerald">$</span>{" "}
              <span className="text-text-secondary">cat CLAUDE.md | wc -c</span>
            </div>
            <div className="text-accent-bright">33,792 bytes of agent-ready documentation</div>
            <div className="mt-3">
              <span className="text-emerald">$</span>{" "}
              <span className="text-text-secondary">ls mu-plugins/ | wc -l</span>
            </div>
            <div className="text-accent-bright">30 custom plugins, each independently deployable</div>
            <div className="mt-3">
              <span className="text-emerald">$</span>{" "}
              <span className="text-text-secondary">make deploy-production</span>
            </div>
            <div className="text-accent-bright">
              Atomic deploy with timestamped backup. Rollback in 1 command.
            </div>
            <div className="mt-3">
              <span className="text-emerald">$</span>{" "}
              <span className="text-text-secondary">npx playwright test</span>
            </div>
            <div className="text-accent-bright">
              11 test suites. Smoke, checkout, attribution, deep links — all green.
            </div>
          </div>
        </motion.div>

        {/* Tech stack pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full border border-surface-light bg-surface/50 text-sm text-text-secondary hover:border-accent/50 hover:text-text-primary transition-all duration-300"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
