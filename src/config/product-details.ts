/**
 * product-details.ts — the extra, page-only content shown on a Product Details
 * page (PDP): gallery, long description, feature checklist, spec table, care
 * copy, offers, LED colour options and reviews.
 *
 * Only `heart-photo-lamp` has bespoke content taken from the design screen.
 * Every other product falls back to a sensible generic template via
 * `getProductDetail()` — so the PDP is complete for the whole catalogue.
 */

import type { Product } from "./catalog";

export type LedColor = { name: string; hex: string };

export type SpecItem = { label: string; value: string };

export type Review = {
  title: string;
  body: string;
  name: string;
  location: string;
  /** Published this many days ago */
  daysAgo: number;
  rating: number;
  image?: string;
};

export type RatingBreakdown = { stars: number; percent: number };

export type ProductDetail = {
  /** Gallery images (first one is the card image for most products) */
  gallery: string[];
  /** Wide image shown beside the "Story & Craft" copy */
  storyImage: string;
  /** Image shown inside the "Simulated Carving Preview" modal */
  previewImage: string;
  /** Long-form description paragraphs (Story & Craft tab) */
  longDescription: string[];
  /** Feature checklist shown beside the story */
  features: string[];
  /** Specification table rows */
  specs: SpecItem[];
  /** Care & Delivery copy */
  care: string[];
  /** Offer bullets in the purchase panel */
  offers: string[];
  /** Optional LED base illumination choices */
  ledColors?: LedColor[];
  reviewSummary: { rating: number; total: number; breakdown: RatingBreakdown[] };
  reviews: Review[];
};

/* ──────────────────────────────────────────────────────────────────────────
   SHARED DEFAULTS
   ────────────────────────────────────────────────────────────────────────── */
const DEFAULT_OFFERS = [
  "Extra 10% off on prepaid orders using code WRAPPREPAID",
  "Free express insured shipping on domestic orders above ₹999",
  "Buy any 2 personalized keepsakes & get ₹100 flat discount at checkout",
];

const DEFAULT_BREAKDOWN: RatingBreakdown[] = [
  { stars: 5, percent: 76 },
  { stars: 4, percent: 17 },
  { stars: 3, percent: 4 },
  { stars: 2, percent: 2 },
  { stars: 1, percent: 1 },
];

const GENERIC_REVIEWS: Review[] = [
  {
    title: "Beautifully made and so personal",
    body: "The engraving came out crisp and the packaging felt like a proper boutique gift. My partner was genuinely delighted — it is now on our bedside table.",
    name: "Riya M.",
    location: "Mumbai, Maharashtra",
    daysAgo: 6,
    rating: 5,
  },
  {
    title: "Great quality for the price",
    body: "Wasn't sure what to expect at this price but the finish is lovely and it arrived well before the date I needed it. Would order again.",
    name: "Kabir T.",
    location: "Bangalore, Karnataka",
    daysAgo: 10,
    rating: 5,
  },
  {
    title: "Support was wonderful",
    body: "They messaged me on WhatsApp to confirm the layout before making it. Small details like that make a gift feel really special.",
    name: "Ananya R.",
    location: "Pune, Maharashtra",
    daysAgo: 15,
    rating: 4,
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   PER-PRODUCT OVERRIDES (design-faithful)
   ────────────────────────────────────────────────────────────────────────── */
export const productDetails: Record<string, Partial<ProductDetail>> = {
  "heart-photo-lamp": {
    gallery: [
      "/images/pdp/heart-photo-lamp/gallery-1.jpg",
      "/images/pdp/heart-photo-lamp/gallery-2.jpg",
      "/images/pdp/heart-photo-lamp/gallery-3.jpg",
      "/images/pdp/heart-photo-lamp/gallery-4.jpg",
      "/images/pdp/heart-photo-lamp/gallery-5.jpg",
      "/images/pdp/heart-photo-lamp/gallery-6.jpg",
    ],
    storyImage: "/images/pdp/heart-photo-lamp/story.jpg",
    previewImage: "/images/pdp/heart-photo-lamp/preview.jpg",
    longDescription: [
      "Capture your most cherished moments in soft ambient light. Each WrapUrs Heart Photo Lamp is precision laser-etched onto optical-grade imported cast acrylic, converting your favorite portraits into an ethereal glowing silhouette that gently warms up any bedroom, study desk, or bedside.",
      "Resting comfortably upon a solid, sustainably sourced beechwood plinth, our low-voltage warm LED system is built for quiet nighttime reading and ambient mood illumination without overheating.",
    ],
    features: [
      "5mm Shatterproof Cast Acrylic",
      "Solid Kiln-Dried Beechwood Base",
      "Subtle In-Line On/Off Switch",
      "Micron-Precision Laser Carving",
    ],
    specs: [
      { label: "Acrylic Dimensions", value: "18 cm (H) x 15 cm (W) x 5 mm (Thickness)" },
      {
        label: "Wooden Base Material",
        value: "Natural Kiln-Dried European Beechwood, hand polished",
      },
      {
        label: "Power Connector",
        value: "Standard 5V USB Type-A cable (1.2m length) with inline toggle switch",
      },
      {
        label: "Box Inclusions",
        value:
          "1x Custom Carved Acrylic Panel, 1x Beechwood LED Plinth, 1x Microfiber Polishing Cloth, Keepsake Gift Box",
      },
      {
        label: "Cleaning Protocol",
        value: "Wipe gently using included dry microfiber cloth. Avoid alcohol sprays.",
      },
    ],
    care: [
      "Every custom piece is handmade to order at our boutique studio in Jaipur, Rajasthan. Standard dispatch occurs within 24 to 48 hours of photo preview confirmation.",
      "Metro Deliveries: 2 to 4 business days via Bluedart Express.",
      "Rest of India: 4 to 6 business days.",
      "Damage Protection Guarantee: If transit damage occurs, we immediately reissue a new keepsake free of charge upon viewing unboxing footage.",
    ],
    offers: DEFAULT_OFFERS,
    ledColors: [
      { name: "Warm Golden", hex: "#FFE8C2" },
      { name: "Blush Glow", hex: "#FEB4F4" },
      { name: "Rose Sunset", hex: "#D97D9D" },
    ],
    reviewSummary: {
      rating: 4.6,
      total: 1284,
      breakdown: [
        { stars: 5, percent: 78 },
        { stars: 4, percent: 16 },
        { stars: 3, percent: 4 },
        { stars: 2, percent: 1 },
        { stars: 1, percent: 1 },
      ],
    },
    reviews: [
      {
        title: "Brought genuine tears of joy on our anniversary!",
        body: "I was skeptical about how clear our low-light photo would look once laser engraved, but the WrapUrs team did miraculous work. The couple silhouette looks lifelike and the warm beechwood base creates the coziest evening glow.",
        name: "Sneha Patel",
        location: "Mumbai, Maharashtra",
        daysAgo: 4,
        rating: 5,
        image: "/images/pdp/reviews/review-1.jpg",
      },
      {
        title: "Impeccable craft and premium packaging",
        body: "Ordered this for my fiancé's birthday. The packaging itself was like opening a luxury perfume box. Very well secured with shock absorbent inserts. The wooden finish is smooth with no jagged edges.",
        name: "Arjun Nair",
        location: "Bangalore, Karnataka",
        daysAgo: 12,
        rating: 5,
      },
      {
        title: "Fast delivery and responsive customer support",
        body: "I asked their WhatsApp support to adjust the text placement to the right corner so our names wouldn't block the skyline in the photograph. They sent me a WhatsApp proof in 30 minutes! Truly memorable experience.",
        name: "Pooja Sharma",
        location: "Pune, Maharashtra",
        daysAgo: 21,
        rating: 5,
      },
    ],
  },
};

/** Merge bespoke overrides with the generic PDP template for any product. */
export function getProductDetail(product: Product): ProductDetail {
  const override = productDetails[product.slug] ?? {};
  return {
    gallery: override.gallery ?? [product.image],
    storyImage: override.storyImage ?? product.image,
    previewImage: override.previewImage ?? override.gallery?.[0] ?? product.image,
    longDescription: override.longDescription ?? [
      product.description + ".",
      "Handcrafted to order in our boutique studio and finished with a keepsake gift box — personalised with your photo, name or message so it becomes theirs alone.",
    ],
    features: override.features ?? [
      "100% handcrafted & fully personalisable",
      "Premium materials with a boutique finish",
      "Arrives in a keepsake gift box",
      "Made with love in India",
    ],
    specs: override.specs ?? [
      { label: "Personalization", value: "Upload your photo, name or message at checkout" },
      { label: "Materials", value: "Hand-finished premium materials" },
      { label: "Packaging", value: "Keepsake gift box, ready to gift" },
      { label: "Care", value: "Wipe gently with a soft dry cloth. Avoid water and sprays." },
    ],
    care: override.care ?? [
      "Every custom piece is handmade to order at our boutique studio. Standard dispatch occurs within 24 to 48 hours of design confirmation.",
      "Metro Deliveries: 2 to 4 business days. Rest of India: 4 to 6 business days.",
      "Damage Protection Guarantee: If transit damage occurs, we reissue a new keepsake free of charge.",
    ],
    offers: override.offers ?? DEFAULT_OFFERS,
    ledColors: override.ledColors,
    reviewSummary: override.reviewSummary ?? {
      rating: product.rating ?? 4.8,
      total: product.reviewCount ?? 240,
      breakdown: DEFAULT_BREAKDOWN,
    },
    reviews: override.reviews ?? GENERIC_REVIEWS,
  };
}

/** The tabs on the PDP (labels + order match the design). */
export const productTabs = [
  { id: "story", label: "Story & Craft" },
  { id: "specs", label: "Specifications" },
  { id: "care", label: "Care & Delivery" },
] as const;

export type ProductTabId = (typeof productTabs)[number]["id"];

/** Four trust badges under the CTA buttons. */
export const productTrustBadges = [
  { icon: "verified_user", label: "100% Safe", sub: "UPI & Cards" },
  { icon: "support_agent", label: "7-Day Care", sub: "WhatsApp Help" },
  { icon: "handshake", label: "Handcrafted", sub: "In India" },
  { icon: "featured_seasonal_and_gifts", label: "Gift Ready", sub: "Included Box" },
];
