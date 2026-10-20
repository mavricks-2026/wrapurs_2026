import type { DefaultSession } from "next-auth";

/**
 * Auth.js v5 type augmentation — adds the fields we put on the JWT/session
 * (internal user id, optional phone, and the role used to gate /admin) so
 * they are fully typed across the app.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string;
      /** "CUSTOMER" (default) or "ADMIN" — set only after a successful login. */
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    phone?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string;
    role?: string;
  }
}
