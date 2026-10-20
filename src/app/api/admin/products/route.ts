import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin/guard";
import {
  createProduct,
  listProductsAdmin,
  parseProductInput,
} from "@/services/product-admin.service";

/** GET /api/admin/products?q=&status=&page= — paginated product list (admin only). */
export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.slice(0, 100) ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1;

  const result = await listProductsAdmin({ q, status, page });
  return NextResponse.json(result);
}

/** POST /api/admin/products — create a product (admin only). */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = await parseProductInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, detail: parsed.detail },
      { status: parsed.status },
    );
  }

  const result = await createProduct(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ product: result.data }, { status: 201 });
}
