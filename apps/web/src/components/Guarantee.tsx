"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const badges = [
  { icon: "\ud83d\udee1\ufe0f", text: "Cheaper than your current stack \u2014 or free" },
  { icon: "\u2705", text: "Custom to your exact needs \u2014 or free" },
  { icon: "\ud83d\udd11", text: "You own everything we build" },
];

const quotes = [
  {
    name: "Shantel S.",
    text: "Rich completely transformed my website \u2014 it\u2019s lightning fast now. He showed me a system that lets me upload 20\u201330 products in under an hour, something that used to take days. I used to spend hours clicking around in my email marketing tools; now I type a prompt and my emails are generated and scheduled automatically. And that\u2019s not even the half of it. My workflow will never be the same. I consider Rich a go-to partner for my business.",
  },
  {
    name: "Dominique W.",
    text: "Incredibly fast turnaround \u2014 we talked through an idea and he had a working demo of my website plus a full CRM integration the same day. It\u2019s like he reads my mind and proposes solutions that fit my business process even better than I imagined. I was already using AI, but Rich opened my eyes to how much I was missing \u2014 and helped me cut costs in the process.",
  },
  {
    name: "Brian L.",
    text: "I\u2019m glad I wasn\u2019t locked into some expensive retainer just to keep our software running \u2014 everything runs automatically on our own system for almost nothing. I\u2019d already wasted a lot of money on AI solutions that just didn\u2019t deliver. Rich helped us kill the useless subscriptions and built exactly what we needed for a fraction of the price.",
  },
];

function QuoteCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 7000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = (i: number) => {
    setCurrent(i);
    startTimer();
  };

  return (
    <div
      className="max-w-3xl mx-auto mb-12"
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
      onMouseLeave={() => startTimer()}
    >
      {/* All quotes share one grid cell, so the container auto-sizes to the
          tallest with no JS measurement or absolute positioning — robust on
          mobile regardless of any transformed ancestor. Only the current one
          is visible; the rest stay in flow (invisible) to hold the height. */}
      <div className="grid">
        {quotes.map((q, i) => (
          <div
            key={i}
            style={{ gridArea: "1 / 1" }}
            aria-hidden={i !== current}
            className={"text-center transition-opacity duration-500 " +
              (i === current ? "opacity-100" : "opacity-0 pointer-events-none")}
          >
            <blockquote className="text-xl sm:text-2xl text-white/90 font-light leading-relaxed italic">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <p className="mt-6 text-emerald font-semibold text-sm tracking-wide uppercase">
              &mdash; {q.name}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-6">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={"h-2.5 rounded-full transition-all cursor-pointer " +
              (i === current ? "w-8 bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "w-2.5 bg-emerald/30 hover:bg-emerald/50")}
          />
        ))}
      </div>
    </div>
  );
}

export default function Guarantee() {
  return (
    <section className="relative py-32 px-6 bg-emerald/[0.03]">
      {/* Emerald glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-emerald/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="reveal">
          {/* Money icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
              <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-emerald text-sm tracking-widest uppercase">
            The Only Guarantee in AI Consulting
          </span>

          <h2 className="text-4xl sm:text-6xl font-black mt-6 mb-8">
            If it&apos;s not cheaper{" "}
            <span className="text-emerald">AND</span> better
            <br />
            &mdash; you don&apos;t pay.
          </h2>

          <QuoteCarousel />

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {badges.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald/20 bg-emerald/5"
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm text-white/80">{badge.text}</span>
              </div>
            ))}
          </div>

          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Not a &ldquo;satisfaction guarantee&rdquo; with fine print. If I can&apos;t save you money while giving you better software, the engagement is free. Period.
          </p>
        </div>
      </div>
    </section>
  );
}
