import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyCredentials } from "@/services/auth/user-store";

/**
 * auth.ts — the Node-side Auth.js instance.
 *
 * Adds the Credentials (email + password) provider on top of the edge-safe
 * config. Export `handlers` for the route, and `auth`/`signIn`/`signOut` for
 * server components & actions.
 */
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
        return { id: user.id, name: user.name, email: user.email, phone: user.phone };
      },
    }),
  ],
});
