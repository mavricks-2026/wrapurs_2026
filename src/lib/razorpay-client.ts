/**
 * lib/razorpay-client.ts — browser-side Razorpay Checkout loader.
 *
 * The Checkout script is loaded on demand (never bundled) and only after the
 * server has created a real gateway order, so the key is used exactly once per
 * payment attempt.
 */

"use client";

import type { RazorpayOptions, RazorpaySuccess } from "@/types/razorpay";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Inject the Razorpay Checkout script once, resolving when it is ready. */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout and resolve with the payment result.
 * Rejects if the user dismisses the modal or the script cannot load.
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler" | "modal">,
): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(new Error("Razorpay Checkout is not available."));
      return;
    }

    const checkout = new window.Razorpay({
      ...options,
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("payment_cancelled")),
      },
    });

    checkout.on("payment.failed", (payload) => {
      const description =
        (payload as { error?: { description?: string } })?.error?.description ??
        "Payment failed. Please try again.";
      reject(new Error(description));
    });

    checkout.open();
  });
}
