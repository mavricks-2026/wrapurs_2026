/**
 * payment/razorpay.ts — Razorpay gateway (UPI, Cards, Net Banking, Wallets).
 *
 * SERVER-ONLY: uses the secret key. Two modes:
 *  • live — `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` are set → real REST calls.
 *  • mock — no keys → deterministic mock orders so the flow works locally.
 *
 * Docs: https://razorpay.com/docs/api/orders/
 */

import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentGateway,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./types";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

/** Convert rupees → the smallest unit (paise) Razorpay expects. */
function toPaise(amount: number) {
  return Math.max(100, Math.round(amount * 100));
}

async function createOrder(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const { keyId, keySecret, configured } = credentials();

  // ── Mock mode ────────────────────────────────────────────────────────────
  if (!configured) {
    return {
      provider: "razorpay",
      mode: "mock",
      orderId: `order_mock_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
      amount: input.amount,
      currency: input.currency,
    };
  }

  // ── Live mode ────────────────────────────────────────────────────────────
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: toPaise(input.amount),
      currency: input.currency,
      receipt: input.receipt,
      notes: { method: input.method, ...input.notes },
    }),
    // Never cache a payment mutation.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return {
    provider: "razorpay",
    mode: "live",
    orderId: data.id,
    amount: data.amount / 100,
    currency: data.currency,
    keyId,
  };
}

function verify(input: VerifyPaymentInput): VerifyPaymentResult {
  const { keySecret, configured } = credentials();

  // In mock mode, accept the mock order ids so local QA can complete a flow.
  if (!configured) {
    return {
      verified: input.orderId.startsWith("order_mock_"),
      reason: input.orderId.startsWith("order_mock_")
        ? undefined
        : "Mock verification only accepts mock order ids.",
    };
  }

  const expected = createHmac("sha256", keySecret as string)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(input.signature ?? "", "utf8");
  const verified = a.length === b.length && timingSafeEqual(a, b);
  return { verified, reason: verified ? undefined : "Signature mismatch." };
}

export const razorpayGateway: PaymentGateway = {
  id: "razorpay",
  label: "Razorpay",
  createOrder,
  verify,
};
