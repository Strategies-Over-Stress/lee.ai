"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const businessArticle = `It’s Time to Rebuild the Wheel

You already know the feeling. Another month, another stack of software subscriptions auto-renewing. Salesforce. QuickBooks. Zapier. Mailchimp. Slack. That project management tool nobody actually uses but someone signed up for in 2023.

They told you “don’t reinvent the wheel” — just subscribe to someone else’s. But their wheel costs you $1,500/month, does 60% of what you need, and they raise the price every year. Maybe it’s time to rebuild the wheel. One that actually fits your car.

You’re not imagining it — 41% of business owners report subscription fatigue. The average company uses 130+ software subscriptions and only actually uses about half of them. That’s not a rounding error. That’s money walking out the door every month.

And it’s getting worse. Software costs per employee hit $9,100 in 2025 and are heading toward $10,800 this year. If you’re a small business, you’re spending 6-12% of your entire revenue just on software tools. Tools that do 80% of what you need and charge you 100% of the price.

That missing 20%? It used to not be worth fighting for. That’s changed.

The $39.99/Month Trap

For years, the pitch was simple: Why build something custom when you can just subscribe?

And it made sense. Custom software was expensive. Six figures, minimum. Months of development. Ongoing maintenance. The math didn’t work for most businesses.

But AI has rewritten that math.

What used to cost $200,000 and take six months can now be built in weeks for a fraction of the price — if you know what you’re doing. That’s a big “if,” and we’ll get to it.

The Risk Nobody Tells You About

45% of AI-generated code samples failed security tests, introducing OWASP Top 10 vulnerabilities. 62% of AI-generated code contains design flaws or known security vulnerabilities.

Then there’s the exposure of private keys — first to the AI provider itself, then scattered across your codebase, logs, local files, and environment variables.

So What’s the Solution?

Human-in-the-loop AI software development. A professional who knows what’s worth paying for. What you can safely automate. And what requires direct, hands-on professional development.

Your solution. Your software. My decades of experience. For a fraction of the cost of your annual SaaS subscriptions.`;

const technicalArticle = `For the First Time in History, It’s Cheaper to Rebuild the Wheel

AI models can now more reliably build software from scratch than maintain older, tangled codebases. Large-scale rewrites to existing software are technically possible — but dramatically more risky.

According to RAND Corporation (2025), 80% of AI projects fail to deliver intended business value. MIT’s 2025 study puts it even higher: 95% of generative AI pilots fail, mostly due to brittle workflows and misaligned expectations.

The “code is a liability” argument is now multiplied. When your codebase depends on an AI’s context window, and sweeping changes produce broken code you’ll spend more time debugging than building, the economics of maintaining legacy software are worse than ever.

SaaS Subscription Fatigue: The Numbers

\u2022 SaaS costs per employee: $8,700 (2024) \u2192 $9,100 (2025) \u2192 $10,800 projected (2026)
\u2022 Average company uses 130+ SaaS apps, wastes $18 billion collectively
\u2022 Organizations use only 47% of their SaaS licenses
\u2022 Small businesses spend 6-12% of revenue on SaaS

AI-Generated Code Security

Veracode’s 2025 report found that 45% of AI-generated code samples failed security tests. 86% failed to defend against cross-site scripting (CWE-80). 88% were vulnerable to log injection attacks (CWE-117).

Check Point Research discovered vulnerabilities in AI coding tools that allow remote code execution and API key theft through malicious project configurations.

Custom Software vs SaaS Economics

Custom software development: $100K-$400K for medium projects. SaaS: $10-$300 per user/month. Break-even at years 2-4 — faster with AI-assisted development.

The tipping point: when monthly SaaS costs exceed $2,000-3,000, custom becomes viable. With AI, that threshold drops dramatically.`;

export default function BuildNotBuy() {
  const [view, setView] = useState<"business" | "technical">("business");

  useEffect(() => {
    const saved = localStorage.getItem("article-view");
    if (saved === "technical") setView("technical");
  }, []);

  const toggle = (v: "business" | "technical") => {
    setView(v);
    localStorage.setItem("article-view", v);
  };

  return (
    <main className="relative grid-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Back link */}
        <a href="/" className="text-sm text-text-muted hover:text-accent-bright transition-colors mb-12 block">
          &larr; Back to lee.ai
        </a>

        {/* Toggle */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-xl border border-surface-light bg-surface p-1">
            <button
              onClick={() => toggle("business")}
              className={"px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer " +
                (view === "business" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary")}
            >
              For Business Owners
            </button>
            <button
              onClick={() => toggle("technical")}
              className={"px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer " +
                (view === "technical" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary")}
            >
              For the Nerds
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-text-muted mb-16">
          Can&apos;t decide? That&apos;s what I&apos;m for.
        </p>

        {/* Article */}
        <AnimatePresence mode="wait">
          <motion.article
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="prose-custom"
          >
            {(view === "business" ? businessArticle : technicalArticle)
              .split("

")
              .map((para, i) => {
                if (para.startsWith("\u2022 ")) {
                  return (
                    <ul key={i} className="space-y-2 my-6 text-text-secondary">
                      {para.split("
").map((line, j) => (
                        <li key={j} className="text-sm">{line.replace("\u2022 ", "")}</li>
                      ))}
                    </ul>
                  );
                }
                if (para.length < 80 && !para.includes(".")) {
                  return <h2 key={i} className="text-2xl sm:text-3xl font-bold mt-12 mb-4 text-text-primary">{para}</h2>;
                }
                return <p key={i} className="text-text-secondary text-lg leading-relaxed mb-6">{para}</p>;
              })}
          </motion.article>
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-20 text-center border-t border-surface-light pt-16">
          <h3 className="text-2xl font-bold mb-4">Ready to stop renting software?</h3>
          <p className="text-text-secondary mb-8">If it&apos;s not cheaper AND better &mdash; you don&apos;t pay.</p>
          <a
            href="/#contact"
            className="inline-flex px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
          >
            Book a free consultation
          </a>
        </div>
      </div>
    </main>
  );
}
