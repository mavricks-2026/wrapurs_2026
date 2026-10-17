"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/config/catalog";

/**
 * useWishlistStore — persisted wishlist.
 *
 * Any component can `toggle(product)` to save/remove a keepsake; the heart-pop
 * micro-interaction, the header badge and the /wishlist page all read from here.
 */
export type WishlistItem = Product;

type WishlistState = {
  items: WishlistItem[];
  toggle: (product: WishlistItem) => void;
  add: (product: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === product.id);
          return {
            items: exists
              ? state.items.filter((i) => i.id !== product.id)
              : [...state.items, product],
          };
        }),
      add: (product) =>
        set((state) =>
          state.items.some((i) => i.id === product.id)
            ? state
            : { items: [...state.items, product] },
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "wrapurs-wishlist" },
  ),
);

/** Number of saved keepsakes. */
export const selectWishlistCount = (s: WishlistState) => s.items.length;

/** Subscribe to whether a single product is saved. */
export function useIsWishlisted(id: string) {
  return useWishlistStore((s) => s.items.some((i) => i.id === id));
}
