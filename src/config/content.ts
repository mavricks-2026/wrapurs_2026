/**
 * content.ts — ALL copy + demo data for the storefront.
 *
 * Components never hardcode text. Swap copy here, or (later) replace the
 * `products` / `categories` arrays with a Prisma/API call in `src/services/`
 * without touching any UI.
 */

/**
 * Product data lives in `src/config/catalog.ts` (the single catalogue).
 * Re-exported here so existing imports keep working.
 */
export type { Product, CatalogProduct, FilterChip } from "./catalog";
export { featuredProducts as products } from "./catalog";

export type Category = { name: string; icon: string; href: string };

export type Step = { step: string; title: string; description: string; icon: string };

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  rating: number;
  image: string;
};

export type Hero = {
  title: string;
  /** Word(s) in `title` rendered in brand colour */
  highlight: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  image: string;
};

/* ── Hero ─────────────────────────────────────────────────────────── */
export const hero: Hero = {
  title: "Gifts Designed By You, Made With Love",
  highlight: "Love",
  subtitle: "Add your photo, your name, your story. We turn it into a gift they will keep forever.",
  primaryCta: { label: "Explore Collection", href: "/shop" },
  secondaryCta: { label: "Our Story", href: "/about" },
  image: "/images/home/hero.jpg",
};

/* ── Categories ───────────────────────────────────────────────────── */
export const categories: Category[] = [
  { name: "Hampers", icon: "featured_seasonal_and_gifts", href: "/collections/hampers" },
  { name: "Birthday", icon: "cake", href: "/collections/birthday" },
  { name: "Love", icon: "local_florist", href: "/collections/love" },
  { name: "Greetings", icon: "mail", href: "/collections/greetings" },
  { name: "Gift Cards", icon: "card_giftcard", href: "/collections/gift-cards" },
  { name: "All Gifts", icon: "shopping_bag", href: "/shop" },
];

export const categoriesSection = {
  title: "Shop by Category",
  highlight: "Category",
};

export const trendingSection = {
  title: "Trending Now",
  highlight: "Trending",
  subtitle: "Discover the latest designs everyone is talking about",
  loadMoreLabel: "Load More",
  viewAll: { label: "View All", href: "/shop" },
  /** How many cards to show on the home page initially */
  visibleCount: 8,
};

/* ── How it works ─────────────────────────────────────────────────── */
export const howItWorks = {
  title: "How we create your keepsake",
  highlight: "keepsake",
  steps: [
    {
      step: "Step 01",
      title: "Choose a gift",
      description: "Explore our handcrafted catalog of lamps, frames, bracelets, and hampers.",
      icon: "redeem",
    },
    {
      step: "Step 02",
      title: "Add your photo or name",
      description: "Upload your sweetest picture, milestone date, or meaningful initials.",
      icon: "edit_note",
    },
    {
      step: "Step 03",
      title: "Preview and confirm",
      description: "Check the bespoke layout mockup and confirm with full confidence.",
      icon: "visibility",
    },
    {
      step: "Step 04",
      title: "We craft and deliver",
      description: "Precision made by artisans and swiftly shipped safe to your doorstep.",
      icon: "local_shipping",
    },
  ] satisfies Step[],
};

/* ── Testimonials ─────────────────────────────────────────────────── */
export const testimonialsSection = {
  title: "Stories of love",
  highlight: "love",
  subtitle: "Real moments, real smiles from gift givers across India.",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "The heart photo lamp made my partner cry happy tears on our 3rd anniversary. The glow is so warm and gentle!",
    name: "Aanya S.",
    location: "Mumbai",
    rating: 5,
    image: "/images/home/testimonial-1.jpg",
  },
  {
    quote:
      "The attention to detail and packaging was stunning. Truly boutique handcrafted quality. Delivered right on schedule.",
    name: "Kabir & Riya",
    location: "Bangalore",
    rating: 5,
    image: "/images/home/testimonial-2.jpg",
  },
  {
    quote:
      "I ordered a custom hamper box for my best friend's wedding. The engraved initials and handwritten card made it so personal.",
    name: "Sneha P.",
    location: "Delhi",
    rating: 5,
    image: "/images/home/testimonial-3.jpg",
  },
];

/* ── Newsletter ───────────────────────────────────────────────────── */
export const newsletter = {
  title: "Get 10% off your first personalized gift",
  highlight: "10% off",
  subtitle:
    "Sign up to receive sweetest keepsake inspirations, secret discounts, and early access drops.",
  cta: "Claim 10% Off",
  placeholder: "you@example.com",
  successMessage: "You're in! Your 10% code is on its way to your inbox.",
};

/* ── Footer ───────────────────────────────────────────────────────── */
export const footer = {
  blurb: "Handcrafted personalized keepsakes celebrating your sweetest milestones.",
  badge: "100% Safe & Hand-inspected",
  copyright: "© 2024 WrapUrs. Handcrafted with love. All rights reserved.",
  socialTitle: "Follow Along",
  paymentsTitle: "Payment Methods",
};

export const trustBadges = [
  { icon: "verified", label: "100% Handcrafted" },
  { icon: "package_2", label: "Carefully Gift Boxed" },
  { icon: "lock", label: "Safe Express Delivery" },
];
