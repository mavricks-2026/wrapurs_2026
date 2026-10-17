/**
 * motion.ts — CENTRAL ANIMATION CONFIG.
 *
 * Every animation in the app reads from here. Tweak `intensity` to scale the
 * whole site up/down, or override individual values. Nothing else hardcodes
 * durations or easings. See README → "How to edit animations".
 */

export type Intensity = "subtle" | "medium" | "bold";

const baseEase = [0.22, 1, 0.36, 1] as const; // easeOutQuint-ish
const inOutEase = [0.65, 0, 0.35, 1] as const;

/** Scale factors per intensity level */
const intensityScale: Record<Intensity, { distance: number; duration: number; stagger: number }> = {
  subtle: { distance: 12, duration: 0.45, stagger: 0.05 },
  medium: { distance: 24, duration: 0.6, stagger: 0.08 },
  bold: { distance: 40, duration: 0.8, stagger: 0.12 },
};

export const animationConfig = {
  /** Global intensity knob: 'subtle' | 'medium' | 'bold' */
  intensity: "medium" as Intensity,

  duration: {
    fast: 0.35,
    base: 0.6,
    slow: 0.9,
    page: 0.45,
  },

  ease: {
    out: baseEase,
    inOut: inOutEase,
  },

  /** Distance (px) elements travel on entrance */
  distance: 24,
  /** Stagger between children in a group */
  stagger: 0.08,
  /** Only animate the first time an element enters the viewport */
  viewportOnce: true,
  /** How much of the element must be visible before animating */
  viewportAmount: 0.2,
} as const;

/** Resolved scaled values (used by the motion primitives) */
export function motionPreset(intensity: Intensity = animationConfig.intensity) {
  const s = intensityScale[intensity];
  return {
    distance: s.distance,
    duration: animationConfig.duration.base * (s.duration / intensityScale.medium.duration),
    stagger: s.stagger,
  };
}

export const motionVars = {
  /** Hero / display text reveal */
  text: { duration: animationConfig.duration.slow, ease: animationConfig.ease.out },
  /** Cards & sections */
  card: { duration: animationConfig.duration.base, ease: animationConfig.ease.out },
  /** Micro-interactions (hover, taps) */
  micro: { duration: animationConfig.duration.fast, ease: animationConfig.ease.out },
} as const;

export type AnimationConfig = typeof animationConfig;
