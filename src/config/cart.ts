/**
 * cart.ts — every string and constant used by the Cart, Cart drawer and Empty
 * Cart screens. Kept out of the components so copy can be edited in one place.
 */

export const cartContent = {
  /** Full cart page header */
  title: "My Cart",
  titleHighlight: "Cart",

  /** Coupon applied by default (design shows WRAP10) */
  coupon: { code: "WRAP10", amount: 100 },

  /** Delivery */
  deliveryFee: 99,
  freeDeliveryThreshold: 999,
  deliveryNote: "Free Shipping",

  /** Gift note card */
  gift: {
    title: "This is a gift",
    description: "We'll hide the price tag on delivery and include a handwritten ribbon card.",
    label: "Add your personalized message (max 200 characters)",
    placeholder: "Write a short note to be hand-written on the ribbon card…",
    maxLength: 200,
  },

  /** Order summary */
  summary: {
    title: "Order Summary",
    priceLabel: "Price", // → "Price (3 items)"
    discountLabel: "Discount",
    deliveryLabel: "Delivery Charges",
    freeLabel: "FREE",
    totalLabel: "Total Amount",
    /** "You will save ₹898 on this order 🎉" */
    savingsPrefix: "You will save",
    savingsSuffix: "on this order 🎉",
    checkoutCta: "Proceed to Checkout",
    secureLabel: "100% Safe & Secure Payments",
    payments: ["UPI / GPay", "Credit/Debit", "NetBanking", "COD Available"],
    footerNote: "Artisan handcrafted with love • Carefully wrapped for gifting",
  },

  /** Saved-for-later bucket */
  saved: {
    title: "Saved for later", // → "Saved for later (1)"
    inStock: "Available in stock",
    moveToCart: "Move to Cart",
    remove: "Remove",
  },

  /** Line-item controls */
  line: {
    badge: "Customizable",
    edit: "Edit",
    saveForLater: "Save for later",
    remove: "Remove",
    photoPrefix: "Photo",
    engravingPrefix: "Engraving",
    notesPrefix: "Layout note",
    uploadedSuffix: "uploaded",
  },

  /** "Pair & Surprise" suggestion rail under the cart */
  suggest: {
    eyebrow: "Pair & Surprise",
    title: "You may also",
    titleHighlight: "like",
    link: "Explore collection",
  },

  /** Empty-cart state */
  empty: {
    description:
      "Looks like you haven't added any personalized keepsakes yet. Discover handcrafted photo frames, engraved name bracelets, glowing memory lamps, and bespoke hampers crafted uniquely for you.",
    ctaPrimary: "Explore Collection",
    ctaWishlist: "View Wishlist",
    badges: [
      { icon: "verified", label: "100% Handcrafted" },
      { icon: "package_2", label: "Carefully Gift Boxed" },
      { icon: "lock", label: "Safe Express Delivery" },
    ],
    categoriesEyebrow: "Bespoke Categories",
    categoriesTitle: "Start with our beloved keepsakes",
    categoriesSubtitle: "Choose a handcrafted category to surprise someone special today.",
    trendingEyebrow: "Trending Keepsakes",
    trendingTitle: "Our community's most cherished personalized gifts",
    trendingLink: "View full catalog",
    trendingLinkMobile: "View all personalized keepsakes",
    toast: "Added to your keepsakes!",
  },
} as const;

/** The four bespoke category tiles shown on the empty-cart page. */
export const emptyCartCategories = [
  {
    icon: "light_mode",
    title: "Photo Lamps",
    subtitle: "Warm heart night-glow",
    href: "/collections/love",
  },
  { icon: "watch", title: "Custom Jewelry", subtitle: "Bracelets & pendants", href: "/shop" },
  {
    icon: "crop_original",
    title: "Memory Frames",
    subtitle: "Archival photo prints",
    href: "/shop",
  },
  {
    icon: "featured_seasonal_and_gifts",
    title: "Curated Hampers",
    subtitle: "Ribboned luxury boxes",
    href: "/collections/hampers",
  },
] as const;

/** Product slugs shown in the empty-cart "Trending Keepsakes" rail. */
export const emptyCartTrendingSlugs = [
  "heart-photo-lamp",
  "name-bracelet",
  "couple-eye-frame",
  "mini-mens-hamper",
];

/** Product slugs shown in the cart page "Pair & Surprise" rail. */
export const cartSuggestSlugs = [
  "hexagon-explosion-box",
  "rotating-crystal-lamp",
  "polaroid-glow-string-kit",
  "custom-star-map-frame",
];
