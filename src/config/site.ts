/** Global site configuration — brand, contact, SEO defaults, feature flags. */

export const site = {
  name: "WrapUrs",
  tagline: "Handcrafted Personalized Gifts & Keepsakes",
  description:
    "WrapUrs turns your photos, names and memories into handcrafted personalized gifts — glowing photo lamps, engraved bracelets, memory frames and curated hampers. Made with love, delivered across India.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  currency: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
  },
  contact: {
    email: "hello@wrapurs.com",
    whatsapp: "+91 90433 69943",
    whatsappLink: "https://wa.me/919043369943",
    address: "14 Blossom Lane, Artisan District, Bengaluru, India",
    hours: "Mon – Sat, 10 AM – 7 PM IST",
  },
  social: [
    { name: "Instagram", icon: "photo_camera", href: "https://instagram.com" },
    { name: "Facebook", icon: "public", href: "https://facebook.com" },
    { name: "Pinterest", icon: "push_pin", href: "https://pinterest.com" },
  ],
  payments: ["UPI", "Cards", "COD"],
} as const;

export const features = {
  cod: process.env.NEXT_PUBLIC_ENABLE_COD !== "false",
  razorpay: process.env.NEXT_PUBLIC_ENABLE_RAZORPAY !== "false",
} as const;

export type Site = typeof site;
