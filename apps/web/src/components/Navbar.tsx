"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastScrollY.current && y > 100);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-midnight/95 border-b border-surface-light/80"
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.3s ease",
        willChange: "transform",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16 sm:h-28 py-2 sm:py-4">
        <a href="/" className="flex items-center gap-2">
          <Image
            src="/notsaas-logo.png"
            alt="NotSaaS"
            width={80}
            height={80}
            className="w-12 h-12 sm:w-20 sm:h-20"
          />
        </a>

        <a
          href="#assess"
          className="text-sm px-4 py-2 bg-accent hover:bg-accent-bright rounded-lg font-semibold text-white transition-all"
        >
          Free Assessment
        </a>
      </div>
    </nav>
  );
}
