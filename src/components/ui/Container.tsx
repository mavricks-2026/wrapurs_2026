import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Container — centres content to the design's 1240px max width. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("mx-auto w-full max-w-site px-5 sm:px-6", className)}>{children}</Tag>;
}
