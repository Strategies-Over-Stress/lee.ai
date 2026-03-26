"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
}

export default function TypewriterText({ texts, className = "" }: TypewriterTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting && currentCharIndex < currentText.length) {
          setCurrentCharIndex(currentCharIndex + 1);
        } else if (!isDeleting && currentCharIndex === currentText.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && currentCharIndex > 0) {
          setCurrentCharIndex(currentCharIndex - 1);
        } else if (isDeleting && currentCharIndex === 0) {
          setIsDeleting(false);
          setCurrentTextIndex((currentTextIndex + 1) % texts.length);
        }
      },
      isDeleting ? 30 : 60,
    );

    return () => clearTimeout(timeout);
  }, [currentCharIndex, isDeleting, currentTextIndex, texts]);

  return (
    <span className={`relative inline-grid ${className}`}>
      {/* Hidden texts that reserve space for the tallest one */}
      {texts.map((text) => (
        <span
          key={text}
          className="invisible col-start-1 row-start-1"
          aria-hidden
        >
          {text}
        </span>
      ))}
      {/* Visible typing text overlaid in the same grid cell */}
      <span className="col-start-1 row-start-1">
        {texts[currentTextIndex].substring(0, currentCharIndex)}
        <motion.span
          className="cursor-blink inline-block w-[3px] h-[1em] bg-accent-bright ml-0.5 align-middle"
          aria-hidden
        />
      </span>
    </span>
  );
}
