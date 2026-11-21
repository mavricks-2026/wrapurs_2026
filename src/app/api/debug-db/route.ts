import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL || "";
    const hasDbUrl = Boolean(rawUrl);
    const dbHost = hasDbUrl ? rawUrl.split("@")[1]?.split("/")[0] : null;

    const settings = await prisma.setting.findMany();
    return NextResponse.json({
      ok: true,
      hasDbUrl,
      dbHost,
      settingsCount: settings.length,
      settings,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        hasDbUrl: Boolean(process.env.DATABASE_URL),
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
