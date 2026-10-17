/**
 * catalog.ts — the single product catalogue for the whole storefront.
 *
 * Home reads the `featured` items (in `homeOrder`), the Shop page paginates the
 * full list, and Collections/Search filter by `tags`.
 *
 * When the backend lands this array is replaced by a Prisma query in
 * `src/services/product.service.ts` — no UI changes are required because every
 * page consumes the selectors below, never the raw array.
 */

export type Product = {
  id: string;
  /** URL slug */
  slug: string;
  title: string;
  description: string;
  /** Selling price in rupees */
  price: number;
  /** Original / MRP price, shown struck-through */
  compareAt: number;
  image: string;
  /** Ribbon badge, e.g. "Bestseller" */
  badge?: string;
  rating?: number;
  reviewCount?: number;
  /** Filter tags used by the shop / collections / search */
  tags: string[];
};

export type CatalogProduct = Product & {
  featured?: boolean;
  homeOrder?: number;
};

export type FilterChip = { label: string; tag: string; icon: string };

/* ──────────────────────────────────────────────────────────────────────────
   CATALOGUE  (20 shop products + 5 home keepsakes)
   ────────────────────────────────────────────────────────────────────────── */
export const catalog: CatalogProduct[] = [
  {
    id: "p01",
    slug: "name-bracelet",
    title: "Name Bracelet",
    description: "Braided rose gold band with custom laser name",
    price: 199,
    compareAt: 399,
    image: "/images/products/name-bracelet.jpg",
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 184,
    tags: ["everyday", "offers", "love"],
    featured: true,
    homeOrder: 3,
  },
  {
    id: "p02",
    slug: "eye-photo-bracelet",
    title: "Eye Photo Bracelet",
    description: "Micro-engraved projection lens bracelet",
    price: 249,
    compareAt: 499,
    image: "/images/products/eye-photo-bracelet.jpg",
    badge: "New",
    rating: 4.8,
    reviewCount: 92,
    tags: ["mini", "everyday", "offers"],
  },
  {
    id: "p03",
    slug: "helmet-name-keychain",
    title: "Helmet Name Keychain",
    description: "Acrylic custom biker name keychain",
    price: 299,
    compareAt: 499,
    image: "/images/products/helmet-name-keychain.jpg",
    tags: ["mini", "everyday"],
  },
  {
    id: "p04",
    slug: "mini-mens-hamper",
    title: "Mini Men's Hamper",
    description: "Curated leather wallet, pen & perfume keepsake",
    price: 999,
    compareAt: 1499,
    image: "/images/products/mini-mens-hamper.jpg",
    badge: "Bestseller",
    rating: 5,
    reviewCount: 210,
    tags: ["hampers", "bestseller"],
  },
  {
    id: "p05",
    slug: "heart-photo-lamp",
    title: "Heart Photo Lamp",
    description: "Warm glowing LED acrylic memory night lamp",
    price: 599,
    compareAt: 1000,
    image: "/images/products/heart-photo-lamp.jpg",
    rating: 4.9,
    reviewCount: 340,
    tags: ["glowing", "trending", "bestseller", "love"],
    featured: true,
    homeOrder: 1,
  },
  {
    id: "p06",
    slug: "couple-eye-frame",
    title: "Couple Eye Frame",
    description: "Minimalist macro crop eye art in pine frame",
    price: 199,
    compareAt: 349,
    image: "/images/products/couple-eye-frame.jpg",
    rating: 4.7,
    reviewCount: 68,
    tags: ["frames", "everyday", "love"],
    featured: true,
    homeOrder: 2,
  },
  {
    id: "p07",
    slug: "rotating-crystal-lamp",
    title: "Rotating Crystal Lamp",
    description: "360-degree rotating music base photo crystal",
    price: 899,
    compareAt: 1499,
    image: "/images/products/rotating-crystal-lamp.jpg",
    badge: "Trending",
    rating: 4.9,
    reviewCount: 145,
    tags: ["glowing", "trending"],
  },
  {
    id: "p08",
    slug: "custom-spotify-plaque",
    title: "Custom Spotify Plaque",
    description: "Acrylic scannable code with favorite photo",
    price: 349,
    compareAt: 699,
    image: "/images/products/custom-spotify-plaque.jpg",
    rating: 4.8,
    reviewCount: 512,
    tags: ["frames", "trending", "everyday", "offers"],
  },
  {
    id: "p09",
    slug: "hexagon-explosion-box",
    title: "Hexagon Explosion Box",
    description: "Handcrafted multi-layer pop-out photo box",
    price: 799,
    compareAt: 1299,
    image: "/images/products/hexagon-explosion-box.jpg",
    rating: 4.9,
    reviewCount: 178,
    tags: ["album", "birthday", "love"],
  },
  {
    id: "p10",
    slug: "wish-pearl-necklace-kit",
    title: "Wish Pearl Necklace Kit",
    description: "Real oyster harvesting gift box with pendant",
    price: 499,
    compareAt: 899,
    image: "/images/products/wish-pearl-necklace-kit.jpg",
    rating: 4.8,
    reviewCount: 95,
    tags: ["everyday", "birthday", "love"],
  },
  {
    id: "p11",
    slug: "polaroid-glow-string-kit",
    title: "Polaroid Glow String Kit",
    description: "20 fairy lights clips with retro matte prints",
    price: 349,
    compareAt: 549,
    image: "/images/products/polaroid-glow-string-kit.jpg",
    badge: "Trending",
    rating: 4.9,
    reviewCount: 280,
    tags: ["glowing", "trending"],
  },
  {
    id: "p12",
    slug: "custom-star-map-frame",
    title: "Custom Star Map Frame",
    description: "Exact celestial constellation on your special night",
    price: 649,
    compareAt: 1199,
    image: "/images/products/custom-star-map-frame.jpg",
    rating: 4.9,
    reviewCount: 76,
    tags: ["frames", "birthday", "offers", "love"],
  },
  {
    id: "p13",
    slug: "wooden-engraved-watch",
    title: "Wooden Engraved Watch",
    description: "Sandalwood backplate laser engraved with custom note",
    price: 1299,
    compareAt: 2199,
    image: "/images/products/wooden-engraved-watch.jpg",
    rating: 4.8,
    reviewCount: 160,
    tags: ["everyday", "bestseller"],
  },
  {
    id: "p14",
    slug: "personalized-leather-wallet",
    title: "Personalized Leather Wallet",
    description: "Embossed name charm & premium bi-fold finish",
    price: 549,
    compareAt: 899,
    image: "/images/products/personalized-leather-wallet.jpg",
    rating: 4.7,
    reviewCount: 118,
    tags: ["everyday", "hampers"],
  },
  {
    id: "p15",
    slug: "ceramic-couple-mug-set",
    title: "Ceramic Couple Mug Set",
    description: "Dual heart-handle custom illustration mugs",
    price: 449,
    compareAt: 799,
    image: "/images/products/ceramic-couple-mug-set.jpg",
    tags: ["everyday", "birthday", "love"],
  },
  {
    id: "p16",
    slug: "accordion-memory-book",
    title: "Accordion Memory Book",
    description: "Folding pocket photo album with ribbon tie",
    price: 399,
    compareAt: 699,
    image: "/images/products/accordion-memory-book.jpg",
    rating: 4.6,
    reviewCount: 42,
    tags: ["album", "birthday"],
  },
  {
    id: "p17",
    slug: "miniature-wooden-easel",
    title: "Miniature Wooden Easel",
    description: "Desktop pine easel with custom canvas mini print",
    price: 249,
    compareAt: 399,
    image: "/images/products/miniature-wooden-easel.jpg",
    rating: 4.8,
    reviewCount: 189,
    tags: ["frames", "mini"],
  },
  {
    id: "p18",
    slug: "car-hanging-photo-charm",
    title: "Car Hanging Photo Charm",
    description: "Rearview mirror double-sided acrylic medallion",
    price: 199,
    compareAt: 349,
    image: "/images/products/car-hanging-photo-charm.jpg",
    rating: 5,
    reviewCount: 89,
    tags: ["mini", "everyday"],
  },
  {
    id: "p19",
    slug: "luxury-chocolate-rose-hamper",
    title: "Luxury Chocolate & Rose Hamper",
    description: "Velvet keepsake box with artisan confections",
    price: 1499,
    compareAt: 2299,
    image: "/images/products/luxury-chocolate-rose-hamper.jpg",
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 134,
    tags: ["hampers", "bestseller", "love"],
  },
  {
    id: "p20",
    slug: "vintage-wax-seal-kit",
    title: "Vintage Wax Seal Letter Kit",
    description: "Custom initial stamp with brass melting spoon",
    price: 399,
    compareAt: 599,
    image: "/images/products/vintage-wax-seal-kit.jpg",
    tags: ["greetings", "everyday"],
  },
  /* ── Home keepsakes (also listed in the shop) ── */
  {
    id: "p21",
    slug: "mini-gift-hamper",
    title: "Mini Gift Hamper",
    description: "Ribboned keepsake box curated for your special someone",
    price: 1299,
    compareAt: 1999,
    image: "/images/products/mini-gift-hamper.jpg",
    rating: 4.9,
    reviewCount: 51,
    tags: ["hampers", "birthday"],
    featured: true,
    homeOrder: 4,
  },
  {
    id: "p22",
    slug: "wish-pearl-necklace-box",
    title: "Wish Pearl Necklace Box",
    description: "Pearl pendant presented in a personalised keepsake box",
    price: 849,
    compareAt: 1400,
    image: "/images/products/wish-pearl-necklace.jpg",
    rating: 4.9,
    reviewCount: 63,
    tags: ["everyday", "birthday", "love"],
    featured: true,
    homeOrder: 5,
  },
  {
    id: "p23",
    slug: "photo-album",
    title: "Photo Album",
    description: "Archival linen album for your sweetest memories",
    price: 699,
    compareAt: 1150,
    image: "/images/products/photo-album.jpg",
    rating: 4.9,
    reviewCount: 40,
    tags: ["album", "greetings"],
    featured: true,
    homeOrder: 6,
  },
  {
    id: "p24",
    slug: "mini-photo-frame",
    title: "Mini Photo Frame",
    description: "A pocket-sized frame for a moment worth keeping close",
    price: 399,
    compareAt: 699,
    image: "/images/products/mini-photo-frame.jpg",
    rating: 4.9,
    reviewCount: 58,
    tags: ["frames", "mini"],
    featured: true,
    homeOrder: 7,
  },
  {
    id: "p25",
    slug: "name-keychain",
    title: "Name Keychain",
    description: "Engraved name keychain — a tiny everyday treasure",
    price: 299,
    compareAt: 499,
    image: "/images/products/name-keychain.jpg",
    rating: 4.9,
    reviewCount: 87,
    tags: ["mini", "everyday"],
    featured: true,
    homeOrder: 8,
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   SELECTORS — pages consume these, never the raw array
   ────────────────────────────────────────────────────────────────────────── */

/** Home page "Trending Now" — the featured keepsakes in design order. */
export const featuredProducts: Product[] = catalog
  .filter((p) => p.featured)
  .sort((a, b) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99));

export function getProductBySlug(slug: string) {
  return catalog.find((p) => p.slug === slug);
}

/** Fetch several products by slug, preserving the order of the input list. */
export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs
    .map((slug) => catalog.find((p) => p.slug === slug))
    .filter((p): p is CatalogProduct => Boolean(p));
}

export function getProductsByTag(tag: string): Product[] {
  if (!tag || tag === "all") return catalog;
  return catalog.filter((p) => p.tags.includes(tag));
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return catalog.filter((p) =>
    [p.title, p.description, ...p.tags].some((field) => field.toLowerCase().includes(q)),
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SHOP PAGE CONTENT
   ────────────────────────────────────────────────────────────────────────── */
export const shopHero = {
  title: "All Products",
  highlight: "Products",
  subtitle:
    "Discover our handcrafted collection designed to turn precious moments into lasting, heartwarming memories.",
  stats: [
    { icon: "auto_awesome", label: "100% Handcrafted" },
    { icon: "redeem", label: "Custom Engraved" },
  ],
  image: "/images/shop/hero.jpg",
  imageBadge: "Crafted in Mumbai",
};

export const shopFilters: FilterChip[] = [
  { label: "All Products", tag: "all", icon: "apps" },
  { label: "Trending", tag: "trending", icon: "local_fire_department" },
  { label: "Top Selling", tag: "bestseller", icon: "star" },
  { label: "Offers", tag: "offers", icon: "percent" },
  { label: "Gift Hamper Box", tag: "hampers", icon: "featured_seasonal_and_gifts" },
  { label: "Mini Gifts", tag: "mini", icon: "loyalty" },
  { label: "Birthday & Anniversary", tag: "birthday", icon: "cake" },
  { label: "Frames & Wall Decor", tag: "frames", icon: "photo_frame" },
  { label: "Glowing Gifts", tag: "glowing", icon: "light" },
  { label: "Album", tag: "album", icon: "photo_library" },
  { label: "Everyday Gifts", tag: "everyday", icon: "favorite" },
  { label: "Greetings", tag: "greetings", icon: "mail" },
];

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Biggest Discount", value: "discount" },
] as const;

export const shopSupportCta = {
  title: "Can't find what you need?",
  subtitle:
    "Looking for something uniquely tailored? Our personal gift designer is here to help you craft it.",
  cta: "Chat with Us on WhatsApp",
};

/* ──────────────────────────────────────────────────────────────────────────
   COLLECTIONS — the category tiles on the Home page map to these
   ────────────────────────────────────────────────────────────────────────── */
export const collections: Record<
  string,
  { title: string; tag: string; description: string; icon: string }
> = {
  hampers: {
    title: "Hampers",
    tag: "hampers",
    description: "Ribboned luxury boxes curated for every celebration.",
    icon: "featured_seasonal_and_gifts",
  },
  birthday: {
    title: "Birthday",
    tag: "birthday",
    description: "Pop-out boxes, star maps and keepsakes for their big day.",
    icon: "cake",
  },
  love: {
    title: "Love",
    tag: "love",
    description: "Heart lamps, couple frames and little tokens of affection.",
    icon: "local_florist",
  },
  greetings: {
    title: "Greetings",
    tag: "greetings",
    description: "Wax-seal kits, albums and notes worth keeping forever.",
    icon: "mail",
  },
  "gift-cards": {
    title: "Gift Cards",
    tag: "all",
    description: "Let them choose their own handcrafted keepsake.",
    icon: "card_giftcard",
  },
};
