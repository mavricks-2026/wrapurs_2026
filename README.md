# WrapUrs — Handcrafted Personalized Gifts Storefront

A production-ready ecommerce storefront built from the Stitch design **“WrapUrs Personalized Gift Storefront”**. Mobile-first, animated, and architected so copy, colours, fonts and animations are all editable from config files.

> **Status:** Milestones 0–7 complete — scaffold, animation system, site shell, Home, Shop + Collections + Search, PDP, Cart + Empty Cart + Wishlist, **Checkout + Razorpay/COD + Order Confirmation**, and **Auth + Account** (email/password + Google-ready, session-aware header, My Orders with tracking, Saved Addresses, Profile). Remaining: About + Legal (M8), CMS/Admin (M9), DB + Emails (M10), Hardening/QA (M11).

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 3 (tokens generated from `src/config/theme.ts`) |
| Animation | Framer Motion (`motion`) behind a reusable, config-driven system |
| State | Zustand (cart/wishlist/UI) |
| Icons | Google Material Symbols (the same set used in the design) |
| Fonts | Cormorant Garamond (display) + Jost (body) + IBM Plex Mono (labels/eyebrows) via `next/font` |
| Hosting | Vercel *(planned: Neon Postgres + Prisma + Auth.js + Razorpay)* |

---

## Getting started

```bash
# 1. install deps
npm install

# 2. run the dev server
npm run dev          # http://localhost:3000

# 3. other scripts
npm run build        # production build
npm run start        # run the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier
```

Copy `.env.example` → `.env.local` when you start wiring up the backend (DB, auth, Razorpay, Cloudinary, Resend).

---

## Folder guide

```
src/
├─ app/                     # routes (App Router)
│  ├─ layout.tsx            # <html>, fonts, header, footer, motion provider
│  ├─ template.tsx          # page-transition wrapper for every route
│  ├─ page.tsx              # HOME
│  ├─ checkout/page.tsx     # CHECKOUT (address + payment gateway)
│  ├─ order/[id]/page.tsx   # ORDER CONFIRMATION
│  ├─ api/payment/          # create/ + verify/ route handlers (Razorpay & COD)
│  ├─ globals.css           # base styles + icon/skeleton utilities
│  └─ not-found.tsx         # animated 404
├─ components/
│  ├─ ui/                   # primitives: Button, Container, Icon, SectionHeading, WaveDivider
│  ├─ motion/               # AnimatedText, Reveal, StaggerGroup, PageTransition, MotionProvider
│  ├─ layout/               # SiteHeader, SiteFooter, WhatsAppButton, Breadcrumbs
│  └─ common/               # ProductCard, StarRating, …
├─ features/                # feature-scoped code
│  ├─ home/sections/        # Hero, CategoryGrid, TrendingProducts, HowItWorks, Testimonials, Newsletter
│  ├─ shop/                 # ShopHero, ProductBrowser, ShopProductCard, FilterBar, Pagination, SearchBar, SupportCta
│  ├─ product/              # ProductDetailView, ProductGallery, PersonalizeCard, PreviewModal, StickyAddBar, ProductTabs, FrequentlyBought, ReviewsSection, AlsoViewed
│  ├─ cart/                 # useCartStore + CartView, CartLineItem, SavedForLater, GiftNoteCard, CartSummary, PairAndSurprise, EmptyCart, CartDrawer, CheckoutStepper
│  ├─ checkout/             # CheckoutView, AccountCard, AddressSection, OrderItemsCard, PaymentSection, PriceAside, OrderConfirmationView
│  ├─ orders/               # useOrderStore (persisted order history)
│  └─ wishlist/             # useWishlistStore + WishlistView
├─ services/payment/        # gateway registry: razorpay.ts, cod.ts, types.ts, index.ts
├─ config/                  # ⭐ single source of truth — see below
├─ hooks/                   # useMounted, …
└─ lib/                     # utils (cn, formatPrice…) + razorpay-client.ts (browser loader)
public/images/              # design assets (logo, hero, products, testimonials)
```

### The `config/` folder — everything editable lives here

| File | Controls |
| --- | --- |
| `config/theme.ts` | **All colours, fonts, radii, shadows, layout width** |
| `config/catalog.ts` | **The product catalogue** + shop hero/filters/sort options + collections map |
| `config/product-details.ts` | Long description, features, specs, care copy, offers, LED colours & reviews for each product page (+ generic fallback) |
| `config/cart.ts` | All Cart / Empty-Cart copy, coupon, gift note, delivery fee + suggestion rails |
| `config/checkout.ts` | Checkout + Order-Confirmation copy, the demo address book & address-form fields |
| `config/payments.ts` | **Payment methods** (UPI / Card / Net Banking / COD), which gateway fulfils each, fees & section copy |
| `config/content.ts` | All page copy (hero, categories, how-it-works, testimonials, footer) |
| `config/nav.ts` | Header nav, footer columns, checkout steps |
| `config/site.ts` | Brand name, SEO defaults, contact details, currency, feature flags |
| `config/motion.ts` | **All animation timings, easing, distance, stagger** |

**No component hardcodes text, colour, or animation values.**

---

## How to…

### …edit the theme (colours / fonts / radii)
Open `src/config/theme.ts` and change a value. `tailwind.config.ts` imports it, so utilities update everywhere.

```ts
export const colors = { brand: "#B96CB4", /* … */ };
```
→ then use `bg-brand`, `text-plum-muted`, `border-line`, `shadow-card`, etc.

**Type scale (editorial front style).** Three families are loaded in `src/app/layout.tsx` and exposed as Tailwind utilities from `src/config/theme.ts`:

| Utility | Family | Use for |
| --- | --- | --- |
| `font-display` | Cormorant Garamond | all headings / titles |
| `font-body` | Jost | body copy, inputs, descriptions |
| `font-mono` | IBM Plex Mono | eyebrows, labels, badges, buttons |

To change a face, edit the `fonts` map in `src/config/theme.ts` (and the import/`next/font` call in `src/app/layout.tsx`); every page follows automatically.

### …swap the logo
The header/footer/auth pages use the **white** lockups `public/images/logo/mark-white.png` + `wordmark-white.png`, shown inside a brand-coloured pill in the header (and directly on the dark footer). The brand-coloured versions of the same artwork are `mark.png` / `wordmark.png`, and the full stacked lockup is `lockup.png` (white: `lockup-white.png`); `logo-source-transparent.png` is the background-removed master. The previous artwork is archived outside the web root at `.archive/logo/`. To replace the logo, drop a transparent PNG at the same paths — the white variants are generated from a single light-background source by background→alpha extraction (compute each pixel's distance from the background colour, map it to alpha, then write an all-white copy for the pill/footer). Keep the `width`/`height` props in `SiteHeader.tsx` / `SiteFooter.tsx` / `login` / `register` in sync with the real pixel dimensions of the files.

### …add or edit a page
1. Create the route file, e.g. `src/app/offers/page.tsx`.
2. Export `metadata` for SEO.
3. Compose it from `components/` + `motion/` primitives.
4. Add the link to `src/config/nav.ts` if it belongs in the header/footer.

Example:
```tsx
import { AnimatedText, Reveal } from "@/components/motion";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Offers" };

export default function OffersPage() {
  return (
    <Container className="py-16">
      <AnimatedText as="h1" text="Current Offers" highlight="Offers"
        className="font-display text-[42px] text-plum" />
      <Reveal delay={0.2}><p className="font-body text-plum-muted">…</p></Reveal>
    </Container>
  );
}
```

### …add a product
Add an entry to the `catalog` array in `src/config/catalog.ts` and drop the image in `public/images/products/`:

```ts
{
  id: "p26",
  slug: "engraved-compass",
  title: "Engraved Compass",
  description: "Brass pocket compass with a custom inner engraving",
  price: 749,
  compareAt: 1299,
  image: "/images/products/engraved-compass.jpg",
  badge: "New",              // optional ribbon
  rating: 4.8,               // optional
  reviewCount: 41,           // optional
  tags: ["mini", "everyday"],// drives Shop filters, Collections and Search
}
```

- Set `featured: true` + `homeOrder` to also surface it on the Home page.
- Every page reads the selectors (`featuredProducts`, `getProductsByTag`, `searchProducts`, `getProductBySlug`) — **never** the raw array — so swapping this for a Prisma query in `src/services/product.service.ts` needs no UI changes.

### …add a shop filter or a collection
- **Filter chip:** append to `shopFilters` in `config/catalog.ts` (`{ label, tag, icon }`) and make sure products carry that `tag`. Filtering, sorting and pagination are handled by `<ProductBrowser />`.
- **Collection page:** add an entry to the `collections` map (slug → `{ title, tag, description, icon }`). The route `src/app/collections/[slug]` and the Home category tiles pick it up automatically.

### …customise a product page (PDP)
Every product gets a complete PDP automatically (gallery = its image, generic specs/care/reviews). To give one product bespoke, design-faithful content, add an override to `productDetails` in `src/config/product-details.ts` (keyed by slug) — see the `heart-photo-lamp` entry:

```ts
"engraved-compass": {
  gallery: ["/images/pdp/compass/1.jpg", "/images/pdp/compass/2.jpg"],
  storyImage: "/images/pdp/compass/story.jpg",
  previewImage: "/images/pdp/compass/preview.jpg",
  longDescription: ["…", "…"],
  features: ["Solid brass body", "…"],
  specs: [{ label: "Diameter", value: "52 mm" }],
  care: ["…"],
  offers: ["…"],           // omit to inherit the shared default offers
  ledColors: […],           // omit entirely for non-lighting products
  reviewSummary: { rating: 4.8, total: 96, breakdown: […] },
  reviews: [{ title, body, name, location, daysAgo, rating, image? }],
}
```

`getProductDetail(product)` merges your override with the generic template, so you only specify what differs. The page route (`src/app/product/[slug]/page.tsx`) pre-renders all products via `generateStaticParams`.

### …edit cart / empty-cart copy, coupon or delivery fee
Everything on the `/cart` page and its empty state lives in `src/config/cart.ts`: headings, the `WRAP10` coupon (amount), the delivery fee + free-delivery threshold, gift-note copy, the empty-state copy/badges/categories, and the slug lists for the "Pair & Surprise" and "Trending Keepsakes" rails. The cart itself is stored by `src/features/cart/useCartStore.ts` (persisted to `localStorage` under `wrapurs-cart`).

### …save an item to the wishlist
Wishlist state lives in `src/features/wishlist/useWishlistStore.ts` (persisted under `wrapurs-wishlist`). Any component can call it:

```tsx
const toggle = useWishlistStore((s) => s.toggle);
<button onClick={() => toggle(product)} aria-pressed={…}>…</button>
```

The heart-pop micro-interaction on the Home, Shop and PDP cards, the header badge and the `/wishlist` page all read from this one store — so wiring a new heart is a single `toggle(product)` call.

### …edit checkout / order-confirmation copy or the address book
Everything on `/checkout` and `/order/[id]` lives in `src/config/checkout.ts`: the secure badge, section headings, the "Step 2 of 3" labels, the address-form fields, the price-details labels, the summary/footer notes, and the demo address book (`savedAddresses`). The confirmation-page footer links (`confirmationFooterLinks`) are here too.

### …change payment methods, fees or the gateways
Payment methods are declared in `src/config/payments.ts` and each one points at a **provider** (`razorpay` or `cod`):

```ts
{ id: "cod", provider: "cod", label: "Cash on Delivery (COD)",
  description: "₹49 nominal fee", icon: "payments", fee: 49 }
```

- **Tweak copy / fee:** edit the entry (the COD `fee` is added to the total automatically).
- **Hide a gateway:** the `NEXT_PUBLIC_ENABLE_COD` / `NEXT_PUBLIC_ENABLE_RAZORPAY` flags in `.env` feed `getEnabledPaymentMethods()`.
- **Add a whole new gateway (e.g. Stripe):**
  1. Implement the `PaymentGateway` interface in `src/services/payment/stripe.ts` (`createOrder` + optional `verify`).
  2. Register it in the `registry` in `src/services/payment/index.ts`.
  3. Add one entry to `paymentMethods` in `config/payments.ts` with `provider: "stripe"`.

  The API routes (`/api/payment/create`, `/api/payment/verify`) and the UI need no changes — they talk only to the registry.

**How the flow works:** the client computes the payable total and POSTs to `/api/payment/create`. The route resolves the provider from `config/payments.ts` and returns `{ orderId, mode, keyId? }`. `mode` is `live` (real Razorpay keys) → the browser opens Razorpay Checkout and the signature is verified server-side via `/api/payment/verify`; `mock` (no keys) → the payment is simulated so the flow works locally; `offline` → Cash on Delivery. Orders then land in `src/features/orders/useOrderStore.ts` (persisted under `wrapurs-orders`).

> **Live payments:** add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` to `.env.local`. Without them the checkout automatically runs in **demo mode** (clearly labelled in the UI) so you can test the whole funnel. When the Prisma layer lands (M10) the create-order route must **recompute the amount server-side** instead of trusting the client.

### …sign in, register or manage your account
- **Credentials (email + password):** `/login` and `/register`. The demo account is seeded automatically (`priya.sharma@example.com` / `wrapurs123`). Registration creates a demo user in-memory (swapped for Prisma in M10).
- **Google OAuth:** enabled when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are present. Without them the "Continue with Google" button is hidden.
- **Session-aware header:** shows a circular avatar dropdown (Dashboard, My Orders, Addresses, Profile, Sign out) when signed in; falls back to a person icon linking to `/login` when signed out.
- **Account area (`/account`):** guarded by `middleware.ts` — unauthenticated visitors redirect to `/login?callbackUrl=/account`. The sidebar provides Dashboard, My Orders, Addresses, and Profile.
- **My Orders:** reads `useOrderStore` (localStorage, persisted as `wrapurs-orders`) and filters by the signed-in email. Each order has a full tracking page (`/account/orders/[id]`) with the 4-step timeline (Placed → Processing → Shipped → Delivered).
- **Saved Addresses:** per-user address book persisted in `useAccountStore` (`wrapurs-account`). The demo user is seeded with the two design addresses; newly added addresses become the user's stored list. Checkout pre-selects the default and lets signed-in users add/edit addresses in-place.
- **Profile:** name and phone editable (email is locked). Changes persist per email. The order store, checkout and confirmation use the session email when signed in.

> **Auth notes:** Auth.js v5 runs with the JWT session strategy (no DB adapter). The Credentials provider hashes passwords with `node:crypto.scryptSync` and lives in the in-memory user store (`src/services/auth/user-store.ts`). In production set `AUTH_SECRET` (and `NEXTAUTH_SECRET`) to a long random string. The middleware runs in Edge and protects only `/account/*`. This scaffolding is safe to swap to a Prisma adapter + user table in M10.

### …swap the icons
Icons use Material Symbols ligatures: `<Icon name="favorite" filled />`. Any name from [fonts.google.com/icons](https://fonts.google.com/icons) works.

### …swap in real product images
Replace files in `public/images/…` (keep the filenames), or point `config/content.ts` at remote URLs — `next.config.mjs` already allows `res.cloudinary.com` and `lh3.googleusercontent.com`.

---

## Accessibility & performance notes

- Semantic landmarks (`header`, `main`, `nav`, `footer`), a **skip-to-content** link, and `aria-label`s on icon-only controls.
- All motion honours `prefers-reduced-motion`; only `transform`/`opacity` animate (GPU, 60fps).
- `next/font` self-hosts the text fonts (no layout shift); images use `next/image` with `sizes` for responsive, optimised delivery.
- SEO: metadata, OpenGraph/Twitter, and `themeColor` are configured in `app/layout.tsx`.

---

## Roadmap (planned milestones)

| M | Deliverable | Status |
| --- | --- | --- |
| M0 | Scaffold, tokens, tooling, README | ✅ Done |
| M1 | Animation system + layout shell | ✅ Done |
| M2 | **Home page** (all sections, animated) | ✅ Done |
| M3 | Shop + Collections + Search (filters, sort, pagination) | ✅ Done |
| M4 | Product Details (gallery, personalization, preview modal, bundles, reviews) | ✅ Done |
| M5 | Cart + Empty state + Wishlist | ✅ Done |
| M7 | Auth + Account (orders, addresses, tracking) | ✅ Done |
| M8 | About + Legal (About, Privacy, Terms, Shipping/Returns, FAQ) | ⏳ Next |
| M8 | About + legal/contact/offers + error states | ⏳ |
| M9 | Admin panel (products, orders, inventory, coupons, banners) | ⏳ |
| M10 | Prisma schema + seed, SEO/perf/a11y pass, tests | ⏳ |

### Future improvements
- Wishlist + reviews backed by the DB (store hooks already exist for the UI).
- Postgres full-text search → Meilisearch/Algolia when the catalogue grows.
- Abandoned-cart emails + WhatsApp order updates (Resend / WhatsApp Business API).
- GST invoice generation, pincode serviceability, and multi-currency scaffolding.
- Playwright E2E for the purchase funnel; Vitest for services/utils.

---

## Notes on the design source

Tokens, the Material Symbols icon set, the arch-shaped image treatment (`rounded-t-[140px]`), the SVG wave section dividers, and the pink shadow system were extracted directly from the Stitch export so the build matches the design. The Product Details page reproduces the design's gallery + personalization panel, "Boutique Offers & Savings" box, tabbed Story & Craft / Specifications / Care & Delivery content, Frequently Bought Together bundle, review summary with distribution bars, and the simulated-carving preview modal. The Cart page reproduces the design's line items (personalization summary + Edit, quantity stepper, save-for-later/remove, delivery estimate), the `WRAP10` coupon, gift-note card and order summary; the **Empty Cart** screen reproduces its hero, bespoke-category tiles and "Trending Keepsakes" rail. The **Checkout** screen reproduces the design's secure-checkout banner, 3-step progress (Cart → Address → Payment), saved-address radio list + "Add a New Address" form, "Order Summary" item list, the payment methods (UPI with inline VPA verification, Card, Net Banking bank chips, Cash on Delivery) and the sticky "Price Details" panel; the **Order Confirmation** state is implemented as its own route (`/order/[id]`) with the gradient-capped thank-you card, delivery timeline, package details and the paid/delivering summary. Product/category/testimonial imagery is the design's own artwork, stored locally in `public/images/` as placeholders to be replaced with real photography.

> **Front style (later change):** the typographic system + button/eyebrow treatment were restyled to an editorial look inspired by a reference site (`maison-rouge`): Cormorant Garamond display headings, Jost body, IBM Plex Mono eyebrows/labels/pill buttons with letter-spacing. The WrapUrs **palette** (brand pink/purple, plum text, section tints) is unchanged. The logo is a white lockup (circular emblem + "WrapUrs" wordmark) on a brand-coloured pill, extracted from a light-background source image.

> **Design deviations (intentional):** the Checkout screen's fine print says "Step 2 of 4" while its own stepper shows 3 steps — we standardised on **3 steps** (Cart → Address → Payment). The design's confirmation card is shown inline as a "state preview"; we moved it to a dedicated `/order/[id]` route so it is reachable and shareable. The site keeps one global header/footer (the design's per-page mini-headers are not reproduced). Item thumbnails on the checkout summary use the real product image rather than the design's emoji placeholders.
