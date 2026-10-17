"use client";

import { PageTransition } from "@/components/motion";

/** Applies the shared page-transition animation to every route. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
