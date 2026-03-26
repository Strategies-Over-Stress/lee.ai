"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const features = [
  {
    id: "speed",
    title: "10x Development Speed",
    subtitle: "Not a buzzword. A methodology.",
    description:
      "I pair with AI agents that have full context of your codebase — architecture, conventions, deployment rules, business logic. Every line of code is informed by a 33K+ character instruction set. This isn't copy-pasting from ChatGPT.",
    terminal: [
      { prompt: "git log --oneline | head -5", output: "60+ commits with structured ticket references" },
      { prompt: "wc -l CLAUDE.md", output: "675 lines of agent-ready documentation" },
      { prompt: "ls tests/e2e/ | wc -l", output: "11 test suites, all automated" },
    ],
  },
  {
    id: "quality",
    title: "Production-Grade from Day 1",
    subtitle: "Not a prototype. Not an MVP. Production.",
    description:
      "Every project gets CI/CD pipelines, automated testing, Docker environments, atomic deployments with rollback, and comprehensive documentation. Because cutting corners now means paying triple later.",
    terminal: [
      { prompt: "make deploy-production", output: "✓ Backup created. ✓ Deployed. ✓ Health check passed." },
      { prompt: "make rollback-production", output: "✓ Restored previous backup in 3 seconds." },
      { prompt: "npx playwright test", output: "11 passed (42.3s)" },
    ],
  },
  {
    id: "ownership",
    title: "You Own Everything",
    subtitle: "No vendor lock-in. No proprietary tools.",
    description:
      "Your code, your infrastructure, your documentation. When (if) you hire a team, they can pick up exactly where I left off. The CLAUDE.md file alone is a complete onboarding guide for any developer or AI agent.",
    terminal: [
      { prompt: "cat CLAUDE.md | head -1", output: "# Agent Instructions for [Your Business]" },
      { prompt: "git remote -v", output: "origin  git@github.com:you/your-project.git" },
      { prompt: "ssh your-server 'ls backups/'", output: "Your infrastructure. Your backups. Your control." },
    ],
  },
];

export default function Differentiator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const active = features.find((f) => f.id === activeFeature)!;

  return (
    <section className="relative py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Why This Is Different
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            Not another freelancer
          </h2>
          <p className="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
            The difference between hiring a developer and partnering with an
            AI-first engineer is the difference between renting labor and
            installing infrastructure.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8">
          {/* Feature tabs */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                onClick={() => setActiveFeature(feature.id)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                  activeFeature === feature.id
                    ? "border-accent/50 bg-accent/5 glow"
                    : "border-surface-light bg-surface hover:border-accent/20"
                }`}
              >
                <h3
                  className={`font-bold text-lg ${
                    activeFeature === feature.id
                      ? "text-text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {feature.subtitle}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Feature detail + terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-text-secondary text-lg mb-6">
                {active.description}
              </p>

              {/* Terminal */}
              <div className="rounded-2xl border border-surface-light bg-surface overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-light bg-surface-light/50">
                  <div className="w-3 h-3 rounded-full bg-rose/60" />
                  <div className="w-3 h-3 rounded-full bg-amber/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald/60" />
                  <span className="ml-2 text-xs font-mono text-text-muted">
                    terminal
                  </span>
                </div>
                <div className="p-5 font-mono text-sm space-y-3">
                  {active.terminal.map((line, i) => (
                    <div key={i}>
                      <div>
                        <span className="text-emerald">$</span>{" "}
                        <span className="text-text-secondary">
                          {line.prompt}
                        </span>
                      </div>
                      <div className="text-accent-bright">{line.output}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
