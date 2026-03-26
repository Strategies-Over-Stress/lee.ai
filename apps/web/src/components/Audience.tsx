"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const idealClients = [
  {
    title: "E-commerce brands hitting a ceiling",
    description:
      "Your WordPress or Shopify site got you this far, but now it's slow, fragile, and can't keep up with your growth.",
  },
  {
    title: "Founders with no technical co-founder",
    description:
      "You're making technical decisions you're not equipped to make, and you've been burned by freelancers who over-promised.",
  },
  {
    title: "Businesses drowning in manual work",
    description:
      "You're copying data between tools, sending emails by hand, and updating spreadsheets that should update themselves.",
  },
  {
    title: "Teams that know AI can help but don't know where to start",
    description:
      "You've heard the hype. You want real results — not a chatbot, but actual automation that saves hours every week.",
  },
];

export default function Audience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Who This Is For
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            Sound like you?
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 mb-20">
          {idealClients.map((client, index) => (
            <motion.div
              key={client.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="p-6 rounded-xl border border-surface-light bg-surface hover:border-accent/30 transition-all duration-300"
            >
              <h3 className="font-bold text-lg mb-2">{client.title}</h3>
              <p className="text-text-secondary text-sm">
                {client.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Objection buster */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-2xl border border-surface-light bg-surface p-8 sm:p-10">
            <h3 className="text-2xl font-bold mb-4 text-center">
              &ldquo;Can one person really do all this?&rdquo;
            </h3>
            <p className="text-text-secondary text-lg mb-6 text-center">
              It&apos;s the first question everyone asks. Here&apos;s the honest answer:
            </p>
            <div className="space-y-4 text-text-secondary">
              <p>
                I&apos;m not working alone — I&apos;m working with AI. Every project I
                build has a comprehensive instruction set that gives AI agents
                full context of the codebase, the business rules, and the
                deployment process. That means I write code at the speed of a
                small team, with the consistency of one person who knows every
                line.
              </p>
              <p>
                But here&apos;s what matters more: everything I build is{" "}
                <span className="text-text-primary font-medium">
                  documented so thoroughly
                </span>{" "}
                that any developer — or any AI tool — can pick it up and run
                with it. You&apos;re not betting on me being available forever.
                You&apos;re betting on systems that work without me.
              </p>
              <p className="text-accent-bright font-medium">
                That&apos;s the whole point: hire me once, and I&apos;ll automate myself
                out of a job.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
