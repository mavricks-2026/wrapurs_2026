import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/services/admin/guard";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12MB

export async function POST(request: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const blob = file as File;

  if (blob.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "file_too_large", message: "File exceeds 12MB limit." }, { status: 400 });
  }

  const mimeType = blob.type.toLowerCase() || "image/jpeg";
  if (!ALLOWED_MIME_TYPES.has(mimeType) && !mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "invalid_type", message: "Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed." }, { status: 400 });
  }

  const originalName = blob.name || "upload.jpg";
  const rawExt = path.extname(originalName).toLowerCase();
  const extension = rawExt ? rawExt : mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg";

  const safeBase = path
    .basename(originalName, rawExt)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 35);

  const filename = `${Date.now()}-${safeBase || "upload"}${extension}`;
  const buffer = Buffer.from(await blob.arrayBuffer());

  let saved = false;

  // 1. Persist to Neon PostgreSQL database (reliable in Vercel & cloud serverless)
  try {
    await prisma.uploadedFile.upsert({
      where: { filename },
      update: { data: buffer, mimeType, size: blob.size },
      create: { filename, mimeType, data: buffer, size: blob.size },
    });
    saved = true;
  } catch (dbErr) {
    console.warn("Database image save warning:", dbErr);
  }

  // 2. Also save to local public/uploads if filesystem is writable (local development)
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
    saved = true;
  } catch {
    // Expected on Vercel's read-only serverless environment
  }

  if (!saved) {
    return NextResponse.json(
      { error: "save_failed", message: "Failed to persist image. Please verify DATABASE_URL is configured." },
      { status: 500 }
    );
  }

  const publicUrl = `/uploads/${filename}`;
  return NextResponse.json({
    ok: true,
    url: publicUrl,
    filename,
    size: blob.size,
  });
}
