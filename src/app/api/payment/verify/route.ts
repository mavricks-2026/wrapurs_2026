/**
 * POST /api/payment/verify
 *
 * Verifies a completed Razorpay payment's signature (HMAC-SHA256 of
 * `order_id|payment_id` using the key secret). A gateway without a `verify`
 * step (e.g. COD) is settled offline, so this route rejects it.
 */

import { NextResponse } from "next/server";
import { getPaymentGateway } from "@/services/payment";
import type { PaymentProviderId } from "@/config/payments";

export const runtime = "nodejs";

type Body = {
  provider?: PaymentProviderId;
  orderId?: string;
  paymentId?: string;
  signature?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, verified: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { provider = "razorpay", orderId, paymentId, signature } = body;
  if (!orderId || !paymentId) {
    return NextResponse.json(
      { ok: false, verified: false, error: "Missing orderId or paymentId." },
      { status: 400 },
    );
  }

  try {
    const gateway = getPaymentGateway(provider);
    if (!gateway.verify) {
      return NextResponse.json(
        { ok: false, verified: false, error: `${gateway.label} has no online verification step.` },
        { status: 400 },
      );
    }

    const result = gateway.verify({ orderId, paymentId, signature: signature ?? "" });
    return NextResponse.json({ ok: result.verified, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ ok: false, verified: false, error: message }, { status: 502 });
  }
}
