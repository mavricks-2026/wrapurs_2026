/**
 * theme.ts — SINGLE SOURCE OF TRUTH for design tokens.
 *
 * Every colour, font, radius and shadow used across the app lives here.
 * `tailwind.config.ts` imports these values, so changing a value here
 * updates the whole site. See README → "How to edit the theme".
 *
 * Values are taken 1:1 from the Stitch design ("WrapUrs Personalized Gift Storefront").
 */

export const colors = {
  /* Primary / brand */
  brand: "#B96CB4",
  brandDark: "#854880",

  /* Surfaces */
  surfaceBg: "#FCF6FC",
  sectionBg: "#F7EAF6",
  white: "#FFFFFF",

  /* Lines */
  borderPink: "#EBD0E9",

  /* Text */
  plumDark: "#2B1A29",
  plumMuted: "#6E5A6C",

  /* Feedback */
  error: "#BA1A1A",
  errorBg: "#FFDAD6",
  success: "#2F7D5B",
  star: "#F5A623",
} as const;

/**
 * Type system — "editorial" front style (inspired by the maison-rouge reference):
 *   display → Cormorant Garamond serif, all headings ("font-display")
 *   body    → Jost humanist sans, body copy & UI   ("font-body")
 *   mono    → IBM Plex Mono, eyebrows / labels / CTA ("font-mono")
 * Families are loaded in `src/app/layout.tsx`; the whole site follows from here.
 */
export const fonts = {
  /** Display / heading face ("font-display") */
  heading: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
  /** Body / UI face ("font-body") */
  body: "var(--font-body), 'Jost', system-ui, sans-serif",
  /** Monospace accent face for eyebrows, labels & buttons ("font-mono") */
  mono: "var(--font-mono), 'IBM Plex Mono', ui-monospace, monospace",
} as const;

export const radii = {
  DEFAULT: "1rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  full: "9999px",
} as const;

export const shadows = {
  soft: "0 4px 18px -2px rgba(185, 108, 180, 0.12)",
  card: "0 10px 25px -4px rgba(185, 108, 180, 0.12), 0 4px 10px -2px rgba(185, 108, 180, 0.08)",
  cardHover: "0 18px 32px -4px rgba(185, 108, 180, 0.22)",
  glow: "0 8px 30px rgba(185, 108, 180, 0.45)",
} as const;

/** Layout */
export const layout = {
  /** Max content width used across the design */
  container: "1240px",
  headerHeight: "5rem",
} as const;
