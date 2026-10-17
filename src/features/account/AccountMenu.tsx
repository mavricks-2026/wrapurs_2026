"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { accountContent, accountNav } from "@/config/auth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { animationConfig } from "@/config/motion";
import { resolveProfile, useAccountStore } from "@/features/account/useAccountStore";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "W").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function AccountMenu() {
  const { data: session, status } = useSession();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const email = session?.user?.email ?? "";
  const profile = useAccountStore((s) => resolveProfile(s, email));
  const displayName = profile.name?.trim() || session?.user?.name || "WrapUrs Guest";

  // Close on outside click + ESC
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (status === "loading") {
    return (
      <span
        aria-hidden
        className="h-10 w-10 animate-pulse rounded-full bg-section"
      />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in to your account"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-plum transition-colors duration-200 hover:bg-section hover:text-brand"
      >
        <Icon name="person" className="text-[22px]" />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Account, ${displayName}`}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-[14px] text-white shadow-glow transition-transform duration-200 hover:scale-105"
      >
        {initialsOf(displayName)}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{
              duration: animationConfig.duration.fast,
              ease: animationConfig.ease.out,
            }}
            className="absolute right-0 mt-3 w-72 overflow-hidden rounded-[20px] border border-line bg-white shadow-card"
          >
            <div className="flex flex-col gap-1 border-b border-line px-5 py-4">
              <p className="truncate font-body text-[15px] font-bold text-plum">
                {displayName}
              </p>
              <p className="truncate font-body text-[12.5px] text-plum-muted">
                {email}
              </p>
            </div>

            <nav className="flex flex-col p-2">
              {accountNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 font-body text-[14px] font-semibold text-plum transition-colors hover:bg-section hover:text-brand-dark",
                  )}
                >
                  <Icon name={item.icon} className="text-[20px] text-brand" />
                  {item.label}
                  <Icon name="chevron_right" className="ml-auto text-[18px] text-plum-muted" />
                </Link>
              ))}
            </nav>

            <div className="border-t border-line p-2">
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 font-body text-[14px] font-semibold text-plum-muted transition-colors hover:bg-section hover:text-feedback-error"
              >
                <Icon name="logout" className="text-[20px]" />
                {accountContent.signOut}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
