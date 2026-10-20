import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin/guard";
import { getOrderAdmin, parseStatusUpdate, updateOrderStatus } from "@/services/order-admin.service";

type Params = { params: Promise<{ id: string }> };

/** GET /api/admin/orders/[id] — full order detail (admin only). */
export async function GET(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const result = await getOrderAdmin(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ order: result.data });
}

/**
 * PATCH /api/admin/orders/[id] — update ONLY the order status (admin only).
 * The body may contain nothing but `status`; payment fields, totals and
 * gateway identifiers are never read and can never be changed here.
 */
export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = parseStatusUpdate(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, detail: parsed.detail },
      { status: parsed.status },
    );
  }

  const result = await updateOrderStatus(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ order: result.data });
}
