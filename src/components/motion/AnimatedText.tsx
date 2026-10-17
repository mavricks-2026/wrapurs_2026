"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { animationConfig, motionVars } from "@/config/motion";

type SplitMode = "words";

type AnimatedTextProps = {
  /** The full string to render */
  text: string;
  /** Semantic element, e.g. "h1" | "h2" | "p" | "span" */
  as?: ElementType;
  className?: string;
  /** Phrase(s) inside `text` to render in the accent colour */
  highlight?: string | string[];
  highlightClassName?: string;
  /** Seconds to wait before the first word animates in */
  delay?: number;
  /** Seconds between each word */
  stagger?: number;
  duration?: number;
  /** Animate once on scroll-in (default) or immediately on mount */
  onView?: boolean;
  once?: boolean;
  split?: SplitMode;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * AnimatedText — masked, staggered word-by-word reveal.
 *
 * <AnimatedText as="h1" text="Gifts Made With Love" highlight="Love" />
 */
export function AnimatedText({
  text,
  as = "span",
  className,
  highlight,
  highlightClassName = "text-brand",
  delay = 0,
  stagger = animationConfig.stagger,
  duration = motionVars.text.duration,
  onView = true,
  once = animationConfig.viewportOnce,
}: AnimatedTextProps) {
  const reduce = useReducedMotion();

  // Build highlight ranges (supports multi-word phrases)
  const phrases = (Array.isArray(highlight) ? highlight : highlight ? [highlight] : []).filter(
    Boolean,
  );
  const ranges: [number, number][] = [];
  for (const phrase of phrases) {
    const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      ranges.push([m.index, m.index + m[0].length]);
    }
  }

  // Tokenise into words with highlight flags
  const items: { word: string; hi: boolean }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    items.push({ word: m[0], hi: ranges.some(([a, b]) => start >= a && end <= b) });
  }

  // Reduced-motion / SSR fallback: plain text, no masking
  if (reduce) {
    return createElement(
      as,
      { className },
      items.map((item, i) => (
        <span key={i} className={cn(item.hi && highlightClassName)}>
          {item.word}
          {i < items.length - 1 ? " " : ""}
        </span>
      )),
    );
  }

  const MotionTag = motion[as as unknown as keyof typeof motion] as typeof motion.span;

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  const child = {
    hidden: { y: "115%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration, ease: animationConfig.ease.out },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      {...(onView
        ? { whileInView: "visible", viewport: { once, amount: animationConfig.viewportAmount } }
        : { animate: "visible" })}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="mr-[0.24em] inline-block overflow-hidden align-bottom last:mr-0"
        >
          <motion.span
            variants={child}
            className={cn("inline-block", item.hi && highlightClassName)}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
