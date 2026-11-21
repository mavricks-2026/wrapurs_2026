import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 1. Try reading from Neon PostgreSQL database (works seamlessly on Vercel)
  try {
    const file = await prisma.uploadedFile.findUnique({
      where: { filename },
    });
    if (file && file.data) {
      return new NextResponse(file.data, {
        status: 200,
        headers: {
          "Content-Type": file.mimeType || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.warn("DB file fetch error:", err);
  }

  // 2. Fallback to local disk (for static/local development files)
  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
