import type { Metadata } from "next";
import { getProductsBySlugs } from "@/config/catalog";
import { emptyCartTrendingSlugs } from "@/config/cart";
import { WishlistView } from "@/features/wishlist";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Your saved personalized keepsakes — build a shortlist of handcrafted gifts for birthdays, anniversaries and more.",
};

/**
 * Wishlist page. Backed by the persisted wishlist store, which is the same
 * store the heart-pop micro-interaction on every product card writes to.
 */
export default function WishlistPage() {
  const suggested = getProductsBySlugs(emptyCartTrendingSlugs);

  return <WishlistView suggested={suggested} />;
}
