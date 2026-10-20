import { auth } from "@/auth";

/**
 * Shared server-side ADMIN check for admin API route handlers.
 * Middleware and the admin layout already gate pages; every mutating API
 * route must call this too — the UI is never trusted for security.
 */
export async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}
