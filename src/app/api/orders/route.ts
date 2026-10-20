import { NextResponse } from "next/server";
import { createOrder, parseCreateOrderInput } from "@/services/order.service";

/**
 * POST /api/orders
 *
 * Creates an UNPAID order from the customer's cart. The client may only send
 * product slugs, quantities, an address, an email and a payment method — every
 * price and total is recomputed on the server (services/pricing.service.ts) and
 * the paid flag is always false here. Payment verification is a separate step;
 * this route never marks an order paid.
 */

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseCreateOrderInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, detail: parsed.detail },
      { status: parsed.status },
    );
  }

  const result = await createOrder(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }

  return NextResponse.json({ order: result.data }, { status: 201 });
}
