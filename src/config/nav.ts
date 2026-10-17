/** Navigation — header, footer and account menus. Edit here, nowhere else. */

export type NavLink = { label: string; href: string; icon?: string };

/** Primary header navigation */
export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

/** Header utility actions (right side) */
export const headerActions: NavLink[] = [
  { label: "Wishlist", href: "/wishlist", icon: "favorite" },
  { label: "Cart", href: "/cart", icon: "shopping_bag" },
  { label: "Account", href: "/account", icon: "person" },
];

/** Footer column groups */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/** Checkout progress steps (shared by cart / checkout pages) */
export const checkoutSteps = [
  { label: "Cart", href: "/cart" },
  { label: "Address", href: "/checkout" },
  { label: "Payment", href: "/checkout/payment" },
] as const;
