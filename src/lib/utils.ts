import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { site } from "@/config/site";

/** Merge Tailwind classes safely (handles conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of rupees into the site currency, e.g. 599 -> "₹599". */
export function formatPrice(value: number, opts: { decimals?: boolean } = {}) {
  const { symbol, locale } = site.currency;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(value);
  return `${symbol}${formatted}`;
}

/** Convert a URL slug into Title Case, e.g. "heart-photo-lamp" -> "Heart Photo Lamp". */
export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Percentage discount between compareAt and price, e.g. 40 */
export function discountPercent(price: number, compareAt: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Human-friendly delivery estimate, e.g. "Wed, 15 Oct" (default: 5 days out). */
export function deliveryDateLabel(offsetDays = 5) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

/** Long-form date, e.g. "Wednesday, 15 October 2025" (used on order confirmation). */
export function longDateLabel(date: Date | string = new Date()) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Date (`Date`) `offsetDays` after the given date (default: today + 5 days). */
export function deliveryDate(offsetDays = 5, from: Date | string = new Date()) {
  const d = typeof from === "string" ? new Date(from) : new Date(from.getTime());
  d.setDate(d.getDate() + offsetDays);
  return d;
}
