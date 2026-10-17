"use client";

import { useSession } from "next-auth/react";
import { useOrderStore } from "@/features/orders/useOrderStore";
import { useMounted } from "@/hooks/useMounted";

/**
 * useAccountOrders — the signed-in user's orders.
 *
 * Orders are matched on the email captured at checkout; until the Prisma layer
 * lands (M10) simply swap this selector for a server query. `ready` is false
 * while the session/localStorage hydrate so callers can show a skeleton.
 */
export function useAccountOrders() {
  const { data: session, status } = useSession();
  const orders = useOrderStore((s) => s.orders);
  const mounted = useMounted();

  const email = session?.user?.email?.toLowerCase();
  const ready = mounted && status !== "loading" && Boolean(email);
  const mine = ready && email ? orders.filter((o) => o.email.toLowerCase() === email) : [];

  return { orders: mine, allOrders: orders, ready, email };
}
