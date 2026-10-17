import type { DefaultSession } from "next-auth";

/**
 * Auth.js v5 type augmentation — adds the fields we put on the JWT/session
 * (internal user id + optional phone) so `session.user.id` / `session.user.phone`
 * are fully typed across the app.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string;
    } & DefaultSession["user"];
  }

  interface User {
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string;
  }
}
