"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider — exposes the Auth.js session to client components
 * (`useSession()`), which the header menu and account pages rely on.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
