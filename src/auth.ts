import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyCredentials, type UserRole } from "@/services/auth/user-store";
import { adminCredentials, demoCredentials } from "@/config/auth";

/**
 * auth.ts — the Node-side Auth.js instance.
 *
 * Adds the Credentials (email + password) provider on top of the edge-safe
 * config. Export `handlers` for the route, and `auth`/`signIn`/`signOut` for
 * server components & actions.
 */

/**
 * ADMIN promotion via the ADMIN_EMAILS env var (comma-separated emails).
 *
 * - Elevation happens ONLY inside `authorize`, i.e. after the account has
 *   successfully authenticated through the credentials flow — a matching
 *   email alone never creates or grants anything.
 * - The publicly known demo account can NEVER be elevated, even if its email
 *   is listed in ADMIN_EMAILS by mistake.
 */
function resolveAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function resolveRole(email: string, baseRole: UserRole): UserRole {
  if (baseRole === "ADMIN") return "ADMIN";
  const normalized = email.trim().toLowerCase();
  if (normalized === demoCredentials.email.toLowerCase()) return "CUSTOMER";
  if (normalized === adminCredentials.email.toLowerCase()) return "ADMIN";
  return resolveAdminEmails().has(normalized) ? "ADMIN" : "CUSTOMER";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const user = verifyCredentials(email, password);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: resolveRole(user.email, user.role),
        };
      },
    }),
  ],
});
