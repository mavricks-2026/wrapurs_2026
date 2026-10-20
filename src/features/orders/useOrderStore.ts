"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentMethodId } from "@/config/payments";

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  qty: number;
  variant?: string;
  personalization?: Record<string, string>;
};

export type OrderAddress = {
  name: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
};

export type OrderPayment = {
  method: PaymentMethodId;
  label: string;
  provider: string;
  /** true once money is captured (UPI/Card/NetBanking); false for COD */
  paid: boolean;
  amount: number;
  reference?: string;
};

export type OrderAmounts = {
  mrp: number;
  discount: number;
  coupon: number;
  couponCode?: string;
  delivery: number;
  codFee: number;
  total: number;
};

export type Order = {
  id: string;
  createdAt: string;
  email: string;
  status: OrderStatus;
  items: OrderItem[];
  address: OrderAddress;
  payment: OrderPayment;
  amounts: OrderAmounts;
};

export type PlaceOrderInput = Omit<Order, "id" | "createdAt" | "status"> & {
  /** Persisted server order id — used verbatim when provided. */
  id?: string;
  status?: OrderStatus;
};

type OrderState = {
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  getOrder: (id: string) => Order | undefined;
  updateStatus: (id: string, status: OrderStatus) => void;
  clear: () => void;
};

/** Generate a human-order id like `WU-102458`, avoiding collisions. */
function newOrderId(existing: string[]): string {
  for (let i = 0; i < 25; i += 1) {
    const candidate = `WU-${100000 + Math.floor(Math.random() * 900000)}`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `WU-${Date.now().toString().slice(-6)}`;
}

/**
 * useOrderStore — persisted order history.
 *
 * Orders live in localStorage until the Prisma data layer lands (M10); the
 * confirmation page, and later the account "My Orders" page, both read here.
 */
export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      placeOrder: (input) => {
        const order: Order = {
          ...input,
          id: input.id ?? newOrderId(get().orders.map((o) => o.id)),
          createdAt: new Date().toISOString(),
          status: input.status ?? "placed",
        };
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
        }));
        return order;
      },
      getOrder: (id) => get().orders.find((o) => o.id === id),
      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      clear: () => set({ orders: [] }),
    }),
    { name: "wrapurs-orders" },
  ),
);

export const selectOrderCount = (s: OrderState) => s.orders.length;
