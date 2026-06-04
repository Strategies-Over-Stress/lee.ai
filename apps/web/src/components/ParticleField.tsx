"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  count?: number;
  mobileCount?: number;
  opacity?: number;
}

export default function ParticleField({ count = 120, mobileCount = 40, opacity = 0.7 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Honor reduced-motion: skip the animation entirely.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let running = false;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      // Recompute on every (re)init so a resize/rotation across the 640px
      // breakpoint uses the right count — no desktop→mobile reflow on mount.
      const activeCount = window.innerWidth < 640 ? mobileCount : count;
      particles = Array.from({ length: activeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
      }));
    };

    // Paint the current constellation (no position update, no scheduling).
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Constellation lines
      const maxDist = 130;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const lineOpacity = (1 - dist / maxDist) * 0.15 * opacity;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${0.5 * opacity})`;
        ctx.fill();
      }
    };

    const draw = () => {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      render();
      // Only schedule the next frame while the loop is meant to be running,
      // so a stop() during this draw() (unmount / tab hidden) can't restart it.
      if (running) animId = requestAnimationFrame(draw);
    };

    init();

    // On touch devices (phones/tablets), do NOT run a continuous animation: a
    // position:fixed canvas that repaints every frame makes content above it
    // flicker / disappear-and-reappear while scrolling on iOS Safari. Render a
    // single static constellation instead — the fixed layer stays unchanged
    // during scroll, so content composites cleanly. Desktop keeps the motion.
    const isTouch = window.matchMedia?.("(hover: none)")?.matches ?? false;
    if (isTouch) {
      render();
      const onResize = () => { init(); render(); };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const start = () => {
      if (running) return;
      running = true;
      animId = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const handleResize = () => { init(); };
    // Pause the loop while the tab is hidden — no point burning the CPU.
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    // Defer the first frame until the browser is idle so the rAF loop does
    // not compete with React hydration during the critical first paint.
    const ric =
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback : undefined;
    const idleHandle = ric
      ? ric(start, { timeout: 500 })
      : window.setTimeout(start, 200);

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      if (ric && window.cancelIdleCallback) window.cancelIdleCallback(idleHandle as number);
      else window.clearTimeout(idleHandle as number);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [count, mobileCount, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
