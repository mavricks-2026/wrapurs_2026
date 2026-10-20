import type { Metadata } from "next";
import { emptyCartTrendingSlugs } from "@/config/cart";
import { getMergedProductsBySlugs } from "@/services/product.service";
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
export default async function WishlistPage() {
  const suggested = await getMergedProductsBySlugs(emptyCartTrendingSlugs);

  return <WishlistView suggested={suggested} />;
}
