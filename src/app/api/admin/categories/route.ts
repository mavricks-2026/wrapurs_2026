import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin/guard";
import { getAllCategoryRows } from "@/services/category.service";
import { createCategory, parseCategoryInput } from "@/services/category-admin.service";

/** GET /api/admin/categories — list all categories (admin only). */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const categories = await getAllCategoryRows();
  return NextResponse.json({ categories });
}

/** POST /api/admin/categories — create a category (admin only). */
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

  const parsed = parseCategoryInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, detail: parsed.detail },
      { status: parsed.status },
    );
  }

  const result = await createCategory(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ category: result.data }, { status: 201 });
}
