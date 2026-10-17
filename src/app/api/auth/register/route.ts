import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/services/auth/user-store";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register — creates a demo account in the in-memory store so
 * the Credentials provider can then sign it in. Replace with a Prisma insert
 * (and an email-verification token) in M10.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { name, email, password, phone } = (body ?? {}) as Record<string, unknown>;
  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const passwordStr = typeof password === "string" ? password : "";
  const phoneStr = typeof phone === "string" ? phone.trim() : undefined;

  if (!nameStr || !emailStr || !passwordStr) {
    return NextResponse.json({ error: "required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(emailStr)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (passwordStr.length < 8) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }
  if (findUserByEmail(emailStr)) {
    return NextResponse.json({ error: "exists" }, { status: 409 });
  }

  const user = createUser({ name: nameStr, email: emailStr, password: passwordStr, phone: phoneStr });
  return NextResponse.json({ ok: true, user }, { status: 201 });
}
