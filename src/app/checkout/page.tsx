import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description:
    "Complete your WrapUrs order — choose a delivery address and pay securely with UPI, card, net banking or Cash on Delivery.",
};

/**
 * Checkout page. The interactive view lives in `CheckoutView` (a client
 * component). This server component only resolves whether real Razorpay keys
 * are configured so the UI can surface a demo-mode notice when they are not.
 */
export default function CheckoutPage() {
  const demoPayments = !(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  return <CheckoutView demoPayments={demoPayments} />;
}
