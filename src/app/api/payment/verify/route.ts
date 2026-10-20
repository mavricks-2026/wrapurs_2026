/**
 * POST /api/payment/verify
 *
 * Verifies a completed Razorpay payment for a PERSISTED order.
 *
 * Trust model:
 *  • The browser sends our internal `orderId` plus Razorpay's `order_id`,
 *    `payment_id` and `signature`.
 *  • The gateway order id we verify against is the one STORED on the order
 *    (`razorpayOrderId`) — the client value must match it, so a verify request
 *    cannot be aimed at a different gateway order.
 *  • The order is only marked paid after a valid server-side HMAC signature
 *    check. COD orders are never verifiable (settled offline) and are rejected.
 *  • Mock verification is only honoured outside production; a production order
 *    can therefore never be marked paid by a mock order id.
 */

import { NextResponse } from "next/server";
import { getOrderPaymentContext, markOrderPaid } from "@/services/order.service";
import { getPaymentGateway } from "@/services/payment";

export const runtime = "nodejs";

type Body = {
  orderId?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  signature?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, verified: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const razorpayOrderId =
    typeof body.razorpayOrderId === "string" ? body.razorpayOrderId.trim() : "";
  const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";
  const signature = typeof body.signature === "string" ? body.signature : "";

  if (!orderId || !razorpayOrderId || !paymentId) {
    return NextResponse.json(
      { ok: false, verified: false, error: "Missing orderId, razorpayOrderId or paymentId." },
      { status: 400 },
    );
  }

  const context = await getOrderPaymentContext(orderId);
  if (!context.ok) {
    return NextResponse.json(
      { ok: false, verified: false, error: context.error },
      { status: context.status },
    );
  }
  const order = context.data;

  if (order.providerId !== "razorpay") {
    return NextResponse.json(
      { ok: false, verified: false, error: "This order is not an online payment order." },
      { status: 400 },
    );
  }

  // The gateway order we verify must be the one we stored when creating it.
  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json(
      { ok: false, verified: false, error: "gateway_order_mismatch" },
      { status: 409 },
    );
  }

  // Never accept a mock verification for a real order in production.
  const isMockOrder = razorpayOrderId.startsWith("order_mock_");
  if (isMockOrder && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, verified: false, error: "Mock payments are not accepted in production." },
      { status: 403 },
    );
  }

  try {
    const gateway = getPaymentGateway("razorpay");
    if (!gateway.verify) {
      return NextResponse.json(
        { ok: false, verified: false, error: "Razorpay has no verification step." },
        { status: 400 },
      );
    }

    const result = gateway.verify({ orderId: razorpayOrderId, paymentId, signature });
    if (!result.verified) {
      return NextResponse.json(
        { ok: false, verified: false, error: result.reason ?? "Signature mismatch." },
        { status: 400 },
      );
    }

    // Signature valid → flip the STORED order to paid (idempotent).
    const marked = await markOrderPaid({
      orderId: order.id,
      paymentId,
      signature,
      storedRazorpayOrderId: order.razorpayOrderId,
    });
    if (!marked.ok) {
      return NextResponse.json(
        { ok: false, verified: false, error: marked.error },
        { status: marked.status },
      );
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paid: marked.data.paid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ ok: false, verified: false, error: message }, { status: 502 });
  }
}
