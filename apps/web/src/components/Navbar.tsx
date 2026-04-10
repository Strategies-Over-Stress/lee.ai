"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const links = [
  { label: "Home", href: "/" },
  { label: "Build Not Buy", href: "/build-not-buy" },
  { label: "Don\u2019t Go Alone", href: "/dont-go-alone" },
  { label: "Contact", href: "#contact" },
];

const SCROLL_DEAD_ZONE = 15;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDelta = useRef(0);
  const isHidden = useRef(false);
  const isScrolled = useRef(false);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;

    // Only update scrolled state when it actually changes
    const nowScrolled = y > 50;
    if (nowScrolled !== isScrolled.current) {
      isScrolled.current = nowScrolled;
      setScrolled(nowScrolled);
    }

    const delta = y - lastScrollY.current;

    let nowHidden = isHidden.current;
    if (y <= 100) {
      nowHidden = false;
      scrollDelta.current = 0;
    } else {
      if (
        (delta > 0 && scrollDelta.current < 0) ||
        (delta < 0 && scrollDelta.current > 0)
      ) {
        scrollDelta.current = delta;
      } else {
        scrollDelta.current += delta;
      }

      if (scrollDelta.current > SCROLL_DEAD_ZONE) {
        nowHidden = true;
      } else if (scrollDelta.current < -SCROLL_DEAD_ZONE) {
        nowHidden = false;
      }
    }

    // Only update hidden state when it actually changes
    if (nowHidden !== isHidden.current) {
      isHidden.current = nowHidden;
      setHidden(nowHidden);
    }

    lastScrollY.current = y;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: hidden && !menuOpen ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 300ms ease-out",
        willChange: "transform",
      }}
    >
    <nav
      className={
        "transition-colors duration-300 " +
        (scrolled || menuOpen
          ? "bg-midnight/95 backdrop-blur-md border-b border-surface-light"
          : "bg-transparent")
      }
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#assess"
            className="text-sm px-4 py-2 bg-accent hover:bg-accent-bright rounded-lg font-semibold text-white transition-all"
          >
            Free Assessment
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-surface-light"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-text-secondary hover:text-white transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#assess"
                onClick={() => setMenuOpen(false)}
                className="block text-sm px-4 py-3 bg-accent hover:bg-accent-bright rounded-lg font-semibold text-white text-center transition-all"
              >
                Free Assessment
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </div>
  );
}
