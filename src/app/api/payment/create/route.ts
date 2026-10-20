/**
 * POST /api/payment/create
 *
 * Creates a gateway order for a PERSISTED order (created via POST /api/orders).
 * The browser sends only our internal `orderId`; the payable amount, currency
 * and method are read from the stored order — a client-supplied amount is never
 * trusted or even read. Returns everything the browser needs to continue: the
 * gateway order id, the public key (live mode) and the mode
 * (`live` | `mock` | `offline`).
 */

import { NextResponse } from "next/server";
import {
  attachGatewayOrderId,
  getOrderPaymentContext,
} from "@/services/order.service";
import { getPaymentGateway } from "@/services/payment";

export const runtime = "nodejs";

type Body = {
  orderId?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "An order id is required." }, { status: 400 });
  }

  const context = await getOrderPaymentContext(orderId);
  if (!context.ok) {
    return NextResponse.json(
      { ok: false, error: context.error },
      { status: context.status },
    );
  }
  const order = context.data;

  if (order.paid) {
    return NextResponse.json({ ok: false, error: "This order is already paid." }, { status: 409 });
  }

  try {
    const gateway = getPaymentGateway(order.providerId);
    const result = await gateway.createOrder({
      // Amount and currency come from the stored order — never the client body.
      amount: order.amount,
      currency: order.currency,
      method: order.methodId,
      receipt: order.orderNumber,
      email: order.email,
    });

    // COD is settled offline; only online gateways get a stored gateway order id.
    if (result.mode === "live" || result.mode === "mock") {
      await attachGatewayOrderId(order.id, result.orderId);
    }

    return NextResponse.json({
      ok: true,
      method: order.methodId,
      wrapursOrderId: order.id,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be started.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
