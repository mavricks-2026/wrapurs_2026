"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  /** Unique line id (product + variant + personalization hash) */
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  /** Original / MRP price — used for the "Discount" row on the cart summary */
  compareAt?: number;
  image: string;
  qty: number;
  variant?: string;
  /** Custom personalization (photo url, engraved name, note…) */
  personalization?: Record<string, string>;
};

type CartState = {
  lines: CartLine[];
  /** saved-for-later bucket */
  saved: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSaved: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      saved: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (line) =>
        set((state) => {
          const qty = line.qty ?? 1;
          const existing = state.lines.find((l) => l.id === line.id);
          const lines = existing
            ? state.lines.map((l) => (l.id === line.id ? { ...l, qty: l.qty + qty } : l))
            : [...state.lines, { ...line, qty }];
          return { lines, isOpen: true };
        }),
      remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)),
        })),
      saveForLater: (id) =>
        set((state) => {
          const line = state.lines.find((l) => l.id === id);
          if (!line) return state;
          return {
            lines: state.lines.filter((l) => l.id !== id),
            saved: [...state.saved, line],
          };
        }),
      moveToCart: (id) =>
        set((state) => {
          const line = state.saved.find((l) => l.id === id);
          if (!line) return state;
          const existing = state.lines.find((l) => l.id === id);
          const lines = existing
            ? state.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + line.qty } : l))
            : [...state.lines, line];
          return {
            saved: state.saved.filter((l) => l.id !== id),
            lines,
          };
        }),
      removeSaved: (id) => set((state) => ({ saved: state.saved.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "wrapurs-cart", partialize: (state) => ({ lines: state.lines, saved: state.saved }) },
  ),
);

/** Total quantity across all cart lines. */
export const selectCartCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
/** Number of distinct cart lines. */
export const selectLineCount = (s: CartState) => s.lines.length;
/** Subtotal (what the customer pays for items) in rupees. */
export const selectSubtotal = (s: CartState) => s.lines.reduce((n, l) => n + l.qty * l.price, 0);
/** Total MRP (compareAt) across the cart — the "Price" row on the summary. */
export const selectMrpTotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.qty * (l.compareAt ?? l.price), 0);
/** Total discount (MRP − selling price) across the cart. */
export const selectDiscountTotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.qty * Math.max(0, (l.compareAt ?? l.price) - l.price), 0);
