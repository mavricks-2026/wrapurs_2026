import type { Config } from "tailwindcss";
import { colors, fonts, radii, shadows, layout } from "./src/config/theme";

/**
 * Tailwind is generated entirely from `src/config/theme.ts`.
 * No raw colours are hardcoded in components — always use these utilities.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class", // dark mode scaffolded but intentionally unused for the MVP
  theme: {
    container: { center: true },
    extend: {
      colors: {
        brand: { DEFAULT: colors.brand, dark: colors.brandDark },
        surface: colors.surfaceBg,
        section: colors.sectionBg,
        line: colors.borderPink,
        plum: { DEFAULT: colors.plumDark, muted: colors.plumMuted },
        feedback: {
          error: colors.error,
          errorBg: colors.errorBg,
          success: colors.success,
          star: colors.star,
        },
        white: colors.white,
      },
      fontFamily: {
        display: [fonts.heading],
        body: [fonts.body],
        mono: [fonts.mono],
      },
      borderRadius: radii,
      boxShadow: shadows,
      maxWidth: { site: layout.container },
      spacing: { header: layout.headerHeight },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
