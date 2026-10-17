/**
 * POST /api/payment/create
 *
 * Creates a gateway order for the chosen payment method. Returns everything the
 * browser needs: the gateway order id, the public key (live mode) and the mode
 * (`live` | `mock` | `offline`) so the client knows how to proceed.
 *
 * NOTE: with no database yet, the client computes the payable total and sends
 * it here. When Prisma lands (M10) this route must recompute the amount from
 * the server-side cart/order and ignore the client value.
 */

import { NextResponse } from "next/server";
import { getPaymentMethod } from "@/config/payments";
import { getPaymentGateway } from "@/services/payment";

export const runtime = "nodejs";

type Body = {
  method?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  email?: string;
  notes?: Record<string, string>;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const method = getPaymentMethod(body.method ?? "");
  if (!method) {
    return NextResponse.json({ ok: false, error: "Unknown payment method." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount." }, { status: 400 });
  }

  try {
    const gateway = getPaymentGateway(method.provider);
    const result = await gateway.createOrder({
      amount,
      currency: body.currency ?? "INR",
      method: method.id,
      receipt: body.receipt,
      email: body.email,
      notes: { ...body.notes, ...(method.fee ? { codFee: String(method.fee) } : {}) },
    });

    return NextResponse.json({ ok: true, method: method.id, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be started.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
