import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin/guard";
import { listOrdersAdmin } from "@/services/order-admin.service";

/** GET /api/admin/orders?q=&status=&page= — paginated order list (admin only). */
export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.slice(0, 100) ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1;

  const result = await listOrdersAdmin({ q, status, page });
  return NextResponse.json(result);
}
