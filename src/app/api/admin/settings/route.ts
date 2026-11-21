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
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const input = (body ?? {}) as Partial<SiteSettings>;
    const updated = await updateSiteSettings(input);

    // Safely attempt cache revalidation
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/admin/settings");
    } catch (revalErr) {
      console.warn("Revalidation note:", revalErr);
    }

    return NextResponse.json({ ok: true, settings: updated });
  } catch (err) {
    console.error("Failed to update settings:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
