import type { Metadata } from "next";
import { OrderConfirmationView } from "@/features/checkout";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your WrapUrs order is placed — review the delivery timeline and package details.",
};

/**
 * Order confirmation page (/order/[id]). Reads the just-placed order from the
 * persisted order store (client-side until the Prisma data layer lands).
 */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderConfirmationView id={id} />;
}
