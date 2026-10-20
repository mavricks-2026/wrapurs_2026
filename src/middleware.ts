import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * middleware.ts — guards `/account/*` (logged-in users) and `/admin/*`
 * (logged-in users whose JWT role is ADMIN — see the `authorized` callback).
 *
 * Uses the edge-safe config only (JWT decode + `authorized` callback). When
 * the callback returns `false`, Auth.js redirects to `pages.signIn` (`/login`)
 * with a `callbackUrl` so the land back where they were headed. The admin
 * layout performs the same role check again server-side (defence in depth).
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
