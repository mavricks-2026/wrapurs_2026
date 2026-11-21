import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/guard";
import { getSiteSettings, updateSiteSettings, type SiteSettings } from "@/services/settings.service";

export const runtime = "nodejs";

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function POST(request: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = (body ?? {}) as Partial<SiteSettings>;
  const updated = await updateSiteSettings(input);

  // Invalidate cache for storefront pages so changes appear immediately
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return NextResponse.json({ ok: true, settings: updated });
}
