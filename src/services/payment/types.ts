/**
 * payment/types.ts — the contracts every payment gateway implements.
 * The UI and API routes talk only to these types, never to a provider SDK.
 */

import type { PaymentMethodId, PaymentProviderId } from "@/config/payments";

/** Razorpay operational mode: `live` = real keys configured, `mock` = simulated. */
export type PaymentMode = "live" | "mock" | "offline";

export type CreatePaymentInput = {
  /** Amount in rupees (major unit) */
  amount: number;
  currency: string;
  method: PaymentMethodId;
  /** Our own reference (e.g. cart fingerprint / receipt id) */
  receipt?: string;
  email?: string;
  notes?: Record<string, string>;
};

export type CreatePaymentResult = {
  provider: PaymentProviderId;
  mode: PaymentMode;
  /** Gateway order id (Razorpay `order_…`, or a generated id in mock/COD) */
  orderId: string;
  amount: number;
  currency: string;
  /** Public key the browser needs to open Razorpay Checkout (live mode only) */
  keyId?: string;
  /** COD only */
  codFee?: number;
};

export type VerifyPaymentInput = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export type VerifyPaymentResult = {
  verified: boolean;
  reason?: string;
};

export interface PaymentGateway {
  id: PaymentProviderId;
  /** Human label for logs / order records */
  label: string;
  /** Create a gateway order (or a mock order when keys are absent). */
  createOrder(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Verify a completed payment. Gateways that are settled offline omit this. */
  verify?(input: VerifyPaymentInput): VerifyPaymentResult;
}
