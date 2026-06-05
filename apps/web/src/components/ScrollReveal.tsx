"use client";

import { useEffect } from "react";

/**
 * Reveals `.reveal` sections as they scroll into view by setting [data-shown],
 * which triggers a one-time CSS transition (see globals.css). Uses an
 * IntersectionObserver — a plain transition, not a scroll-coupled
 * animation-timeline — so it's smooth and reliable on iOS Safari. Content is
 * always visible (only offset), so nothing is gated on JS.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    // No IntersectionObserver (or reduced-motion) → just show everything.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
