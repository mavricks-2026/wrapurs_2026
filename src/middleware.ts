import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * middleware.ts — guards `/account/*`.
 *
 * Uses the edge-safe config only (JWT decode + `authorized` callback). When the
 * callback returns `false`, Auth.js redirects to `pages.signIn` (`/login`) with
 * a `callbackUrl` so the user lands back where they were headed.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/account/:path*"],
};
