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
      // breakpoint uses the right count.
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
      if (running) animId = requestAnimationFrame(draw);
    };

    init();

    // On touch devices render a single static frame — a continuously repainting
    // canvas isn't worth the cost on mobile and a static one is cheaper to
    // composite. Desktop animates.
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
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

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
    // Confined to the hero (top viewport of <main>) instead of position:fixed
    // full-page. A fixed full-page canvas behind scrolling content forces iOS
    // Safari to re-composite every section on scroll (visible flicker); an
    // absolute, one-viewport canvas just scrolls away with the hero. No
    // will-change either — it forced an extra compositing layer.
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 right-0 h-screen pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
