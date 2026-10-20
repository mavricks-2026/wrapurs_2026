import { NextResponse } from "next/server";
import { requireAdmin } from "@/services/admin/guard";
import { deleteCategory, parseCategoryInput, updateCategory } from "@/services/category-admin.service";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/categories/[id] — update a category (admin only). */
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

  const parsed = parseCategoryInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, detail: parsed.detail },
      { status: parsed.status },
    );
  }

  const result = await updateCategory(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ category: result.data });
}

/** DELETE /api/admin/categories/[id] — delete a category (admin only). */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const result = await deleteCategory(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, detail: result.detail },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}
