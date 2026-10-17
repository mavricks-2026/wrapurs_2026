"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { animationConfig } from "@/config/motion";

/**
 * PageTransition — wraps every route via `src/app/template.tsx`.
 * Gives a soft fade + rise on navigation. Respects reduced motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationConfig.duration.page, ease: animationConfig.ease.out }}
    >
      {children}
    </motion.div>
  );
}
