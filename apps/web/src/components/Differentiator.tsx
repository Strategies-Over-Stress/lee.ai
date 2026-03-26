"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

const features = [
  {
    id: "hostage",
    title: "Never get held hostage by a developer again",
    subtitle: "Your business runs even if I disappear tomorrow.",
    description:
      "Every system I build comes with complete documentation — written so that any developer (or even an AI agent) can pick up exactly where I left off. Your code, your infrastructure, your servers. No proprietary tools, no vendor lock-in, no \"only I know how this works.\"",
    highlights: [
      "Complete documentation included with every project",
      "Your code, your servers, your full control",
      "Any developer can onboard using the docs alone",
    ],
  },
  {
    id: "sleep",
    title: "Your marketing runs while you sleep",
    subtitle: "Automation isn't a feature. It's the entire point.",
    description:
      "Email campaigns, ad performance tracking, social media scheduling, sales reports — all wired together and running without you touching anything. You wake up to results, not to-do lists.",
    highlights: [
      "Email, ads, and social media on autopilot",
      "Real-time campaign tracking with actual ROI numbers",
      "Reports delivered to your inbox automatically",
    ],
  },
  {
    id: "breaks",
    title: "Your site never breaks on a big day",
    subtitle: "Peak traffic should mean peak revenue, not panic.",
    description:
      "Every change is tested automatically before it goes live. Every deployment has an instant rollback. Your site stays up on Black Friday, product launches, and viral moments — because the systems protecting it never sleep.",
    highlights: [
      "Every update tested automatically before going live",
      "Bad changes reversed instantly — one command",
      "Built for your highest-traffic days, not your average ones",
    ],
  },
  {
    id: "compound",
    title: "It gets faster every month",
    subtitle: "The systems compound. Your competitors' don't.",
    description:
      "I don't just automate your business — I automate the process that builds those automations. Every month, the AI tools I've set up handle more on their own, with the same quality and security. Month two is faster than month one. Month three is faster than month two.",
    highlights: [
      "AI tools that learn your business and improve over time",
      "Less manual oversight needed every month",
      "The same budget buys more output as the systems mature",
    ],
  },
];

export default function Differentiator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const active = features.find((f: Feature) => f.id === activeFeature)!;

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
            Freelancers write code and leave. I build systems that run your
            business — then hand you the keys.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8">
          {/* Feature tabs */}
          <div className="space-y-3">
            {features.map((feature: Feature, index: number) => (
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

          {/* Feature detail */}
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

              <ul className="space-y-3">
                {active.highlights.map((item: string) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-text-secondary"
                  >
                    <span className="text-emerald mt-0.5">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
