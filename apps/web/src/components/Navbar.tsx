"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Home", href: "/" },
  { label: "Build Not Buy", href: "/build-not-buy" },
  { label: "Don\u2019t Go Alone", href: "/dont-go-alone" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "bg-midnight/90 backdrop-blur-md border-b border-surface-light"
          : "bg-transparent")
      }
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="/" className="font-bold text-lg text-white">
          Rich Lee
        </a>
        <div className="flex items-center gap-6">
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
      </div>
    </motion.nav>
  );
}
