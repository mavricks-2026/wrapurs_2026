/**
 * payment/cod.ts — Cash on Delivery gateway.
 *
 * COD is settled offline by the courier, so there is nothing to verify. We
 * still create a gateway "order" so the rest of the flow (order records, order
 * ids, amounts) is identical across providers.
 */

import { randomUUID } from "node:crypto";
import type { CreatePaymentInput, CreatePaymentResult, PaymentGateway } from "./types";

async function createOrder(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  return {
    provider: "cod",
    mode: "offline",
    orderId: `cod_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    amount: input.amount,
    currency: input.currency,
    // COD handling fee (₹) — informational; already included in `amount` by the caller.
    codFee: input.notes?.codFee ? Number(input.notes.codFee) : undefined,
  };
}

export const codGateway: PaymentGateway = {
  id: "cod",
  label: "Cash on Delivery",
  createOrder,
};
