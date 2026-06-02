"use client";

import { MotionConfig } from "framer-motion";

/**
 * Wraps the app so every Framer Motion component honors the user's
 * "reduce motion" OS setting automatically — transform/opacity animations
 * are skipped and elements render at their target state immediately,
 * so content is never gated behind an entrance animation.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
