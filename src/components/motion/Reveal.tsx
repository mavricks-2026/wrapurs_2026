"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { animationConfig, motionPreset } from "@/config/motion";
import type { ReactNode } from "react";

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  /** Direction the element travels from */
  from?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  /** Stagger delay for lists of Reveals */
  once?: boolean;
  className?: string;
};

/**
 * Reveal — scroll-triggered fade + slide, plays once when the element
 * enters the viewport. The workhorse for section-level animations.
 *
 * <Reveal delay={0.2}>…</Reveal>
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  duration,
  distance,
  once = animationConfig.viewportOnce,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const preset = motionPreset();
  const d = distance ?? preset.distance;
  const dur = duration ?? preset.duration;

  const offset = {
    up: { y: d },
    down: { y: -d },
    left: { x: d },
    right: { x: -d },
    none: {},
  }[from];

  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: animationConfig.viewportAmount }}
      transition={{ duration: dur, delay, ease: animationConfig.ease.out }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
