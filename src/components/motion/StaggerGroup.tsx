"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { animationConfig, motionPreset } from "@/config/motion";
import type { ReactNode } from "react";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between each child */
  stagger?: number;
  delay?: number;
  once?: boolean;
  as?: "div" | "ul" | "section";
};

/**
 * StaggerGroup — parent that staggers its <StaggerItem> children in.
 * Use for product grids, category tiles, step lists.
 */
export function StaggerGroup({
  children,
  className,
  stagger,
  delay = 0,
  once = animationConfig.viewportOnce,
}: StaggerGroupProps) {
  const reduce = useReducedMotion();
  const preset = motionPreset();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: animationConfig.viewportAmount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger ?? preset.stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  className?: string;
  distance?: number;
};

/** Child of <StaggerGroup />. */
export function StaggerItem({ className, children, distance, ...rest }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const preset = motionPreset();

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
      variants={{
        hidden: { opacity: 0, y: distance ?? preset.distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: preset.duration, ease: animationConfig.ease.out },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
