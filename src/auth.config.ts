import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * auth.config.ts — the edge-safe half of the Auth.js setup.
 *
 * Imported by `middleware.ts` (Edge runtime), so it must NOT touch Node APIs.
 * The Credentials provider (which hashes passwords with node:crypto) lives in
 * `auth.ts` and is spread on top of this config there.
 */

/** Google is only offered once real OAuth credentials are present. */
export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const authConfig = {
  // A dev fallback keeps `next build` green without a local .env; set AUTH_SECRET
  // to a long random string in production (see .env.example).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "wrapurs-dev-secret-change-me",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: googleEnabled ? [Google({ allowDangerousEmailAccountLinking: true })] : [],
  callbacks: {
    /**
     * Route guard used by middleware.
     * - /account/* requires a logged-in user (unchanged).
     * - /admin/* requires a logged-in user whose JWT role is ADMIN
     *   (role is only ever set in `auth.ts` after a successful login).
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "ADMIN";
      }
      if (nextUrl.pathname.startsWith("/account")) return isLoggedIn;
      return true;
    },
    /** Persist our extra fields onto the JWT. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role ?? "CUSTOMER";
      }
      return token;
    },
    /** Expose them on the client session. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? session.user.id;
        session.user.phone = token.phone as string | undefined;
        session.user.role = (token.role as string | undefined) ?? "CUSTOMER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
