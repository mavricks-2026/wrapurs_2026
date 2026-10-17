/**
 * payment/index.ts — the gateway registry.
 *
 * Routes and services resolve a provider by id here, never by importing a
 * concrete gateway directly. Add a new provider by implementing
 * `PaymentGateway` and registering it in `paymentGateways`.
 */

import type { PaymentProviderId } from "@/config/payments";
import { razorpayGateway } from "./razorpay";
import { codGateway } from "./cod";
import type { PaymentGateway } from "./types";

const registry: Record<PaymentProviderId, PaymentGateway> = {
  razorpay: razorpayGateway,
  cod: codGateway,
};

export function getPaymentGateway(id: PaymentProviderId): PaymentGateway {
  const gateway = registry[id];
  if (!gateway) throw new Error(`Unknown payment provider: ${id}`);
  return gateway;
}

export function listPaymentGateways(): PaymentGateway[] {
  return Object.values(registry);
}

export type {
  PaymentGateway,
  CreatePaymentInput,
  CreatePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
  PaymentMode,
} from "./types";
