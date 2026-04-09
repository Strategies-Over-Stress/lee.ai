"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate } from "framer-motion";
import BillingReceipt from "./BillingReceipt";

function CountUp({ value, start }: { value: string; start: boolean }) {
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!start || hasAnimated.current) return;
    hasAnimated.current = true;
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const prefix = value.match(/^[^0-9]*/)?.[0] || "";
    const valueSuffix = value.match(/[^0-9.]*$/)?.[0] || "";
    if (isNaN(numeric)) { setDisplay(value); return; }

    const controls = animate(0, numeric, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => {
        if (numeric >= 100) {
          setDisplay(prefix + Math.round(v).toLocaleString() + valueSuffix);
        } else {
          setDisplay(prefix + Math.round(v) + valueSuffix);
        }
      },
    });
    return () => controls.stop();
  }, [value, start]);

  return <span>{display}</span>;
}

const SLIDE_COUNT = 4;
const SWIPE_THRESHOLD = 50;

// Auto-advance delays per slide (ms) — slide 1 (receipt) waits for onComplete callback
const SLIDE_DELAYS: Record<number, number> = {
  0: 3000,   // Hook — 3s to read
  // 1: controlled by BillingReceipt onComplete
  2: 6000,   // Solution — 6s to read
  // 3: no auto-advance (final slide)
};

const stats = [
  { value: "$18K+", label: "Avg. annual savings", sub: "per client engagement" },
  { value: "24hrs", label: "Fastest time to launch", sub: "from zero to live" },
  { value: "100%", label: "Guarantee", sub: "outperforms or it\u2019s free" },
  { value: "10+", label: "Years of engineering", sub: "backing every build" },
];

const fadeVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

function DotIndicators({
  current,
  total,
  onDotClick,
}: {
  current: number;
  total: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-4">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 h-2.5 bg-accent"
              : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
          }`}
        />
      ))}
    </div>
  );
}


function MobileCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteracted = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= SLIDE_COUNT || index === slideIndex) return;
      userInteracted.current = true;
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      setSlideIndex(index);
    },
    [slideIndex]
  );

  const next = useCallback(() => {
    if (slideIndex < SLIDE_COUNT - 1) {
      setSlideIndex(slideIndex + 1);
    }
  }, [slideIndex]);

  // Auto-advance for timed slides (0 and 2)
  useEffect(() => {
    if (userInteracted.current) return;
    const delay = SLIDE_DELAYS[slideIndex];
    if (delay) {
      autoAdvanceRef.current = setTimeout(next, delay);
      return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
    }
  }, [slideIndex, next]);

  // BillingReceipt completion triggers next slide
  const handleReceiptComplete = useCallback(() => {
    if (!userInteracted.current && slideIndex === 1) {
      next();
    }
  }, [slideIndex, next]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      userInteracted.current = true;
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      const { offset, velocity } = info;
      const swipe = Math.abs(offset.x) * velocity.x;

      if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
        if (slideIndex < SLIDE_COUNT - 1) setSlideIndex(slideIndex + 1);
      } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
        if (slideIndex > 0) setSlideIndex(slideIndex - 1);
      }
    },
    [slideIndex]
  );

  return (
    <section className="relative md:hidden min-h-[100dvh] flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slideIndex}
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center px-6 touch-pan-y"
          >
            {slideIndex === 0 && <SlideHook />}
            {slideIndex === 1 && <SlidePain onComplete={handleReceiptComplete} />}
            {slideIndex === 2 && <SlideSolution />}
            {slideIndex === 3 && <SlideProof />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 pb-6 pt-2 px-6">
        <DotIndicators
          current={slideIndex}
          total={SLIDE_COUNT}
          onDotClick={goTo}
        />
      </div>
    </section>
  );
}

function SlideHook() {
  return (
    <div className="text-center z-10">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-5xl font-black tracking-tight leading-[0.95] text-white"
      >
        Are you ready for
        <br />
        <span className="text-gradient">your next SaaS bill?</span>
      </motion.h1>
    </div>
  );
}

function SlidePain({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className="w-full z-10">
      <BillingReceipt onComplete={onComplete} />
    </div>
  );
}

function SlideSolution() {
  return (
    <div className="text-center z-10 max-w-md mx-auto">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-2xl text-white/80 font-light mb-6"
      >
        Tired of tools that overpromise? I cut through the AI noise and build
        what works &mdash; at a fraction of the cost.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-2xl mb-6"
      >
        <span className="text-gradient font-semibold">Results you own</span>
        <span className="text-white/80 font-light">, not rent.</span>
      </motion.p>
    </div>
  );
}

function SlideProof() {
  const [countStarted, setCountStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCountStarted(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center z-10 w-full max-w-md mx-auto">
      {/* Guarantee */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xl font-bold mb-8"
      >
        If it doesn&apos;t outperform what you have now,{" "}
        <span className="text-gradient">you don&apos;t pay.</span>
      </motion.p>
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 gap-6 mb-10"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-gradient"><CountUp value={stat.value} start={countStarted} /></div>
            <div className="text-xs text-text-primary mt-1">{stat.label}</div>
            <div className="text-xs text-text-muted mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <a
          href="#assess"
          className="group relative w-full px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg text-center transition-all duration-300 glow"
        >
          See what AI can do for you
          <span className="absolute inset-0 rounded-xl bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
        </a>
        <a
          href="#proof"
          className="w-full px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary text-center transition-all duration-300"
        >
          See the proof
        </a>
        <a
          href="/build-not-buy"
          className="text-sm text-accent-bright hover:text-white font-medium transition-all duration-300 mt-2"
        >
          Read: Rebuilding the Wheel &rarr;
        </a>
      </motion.div>
    </div>
  );
}

function DesktopHero() {
  return (
    <section className="hidden md:flex relative pt-36 sm:pt-44 pb-16 items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-4 text-white"
        >
          Are you ready for
          <br />
          <span className="text-gradient">your next SaaS bill?</span>
        </motion.h1>

        {/* Billing receipt */}
        <div className="mt-8 mb-8">
          <BillingReceipt />
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-2xl sm:text-3xl md:text-4xl text-white/80 font-light mb-16 max-w-3xl mx-auto"
        >
          Tired of tools that overpromise? I cut through the AI noise
          and build what works &mdash; at a fraction of the cost.
          <br />
          <span className="text-gradient font-semibold">Results you own</span>, not rent.
          <br />
          <span className="text-lg sm:text-xl text-white font-semibold mt-10 block">
            If it doesn&apos;t outperform what you have now, you don&apos;t pay.
          </span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-col items-center gap-6 mt-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#assess"
              className="group relative px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
            >
              See what AI can do for you
              <span className="absolute inset-0 rounded-xl bg-accent/20 blur-xl group-hover:blur-2xl transition-all duration-300 -z-10" />
            </a>
            <a
              href="#proof"
              className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-lg text-text-secondary hover:text-text-primary transition-all duration-300"
            >
              See the proof
            </a>
          </div>
          <a
            href="/build-not-buy"
            className="text-sm text-accent-bright hover:text-white font-medium transition-all duration-300"
          >
            Read: Rebuilding the Wheel &rarr;
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-text-primary mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {stat.sub}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 rounded-full border-2 border-text-muted/30 flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-text-muted/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function Hero() {
  return (
    <>
      <MobileCarousel />
      <DesktopHero />
    </>
  );
}
