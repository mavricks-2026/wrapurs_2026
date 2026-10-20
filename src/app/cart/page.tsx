import type { Metadata } from "next";
import { cartSuggestSlugs, emptyCartTrendingSlugs } from "@/config/cart";
import { getMergedProductsBySlugs } from "@/services/product.service";
import { CartView } from "@/features/cart";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description:
    "Review your personalized keepsakes, adjust quantities, save items for later and apply your coupon before checkout.",
};

/**
 * Cart page. The interactive view lives in `CartView` (a client component);
 * this server component just supplies the suggestion rails.
 */
export default async function CartPage() {
  const suggested = await getMergedProductsBySlugs(cartSuggestSlugs);
  const trending = await getMergedProductsBySlugs(emptyCartTrendingSlugs);

  return <CartView suggested={suggested} trending={trending} />;
}
