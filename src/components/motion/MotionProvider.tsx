"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * MotionProvider — wraps the app and globally respects the user's
 * `prefers-reduced-motion` setting. Any animation that uses `transform`
 * (y, scale, rotate) is automatically disabled for those users.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
