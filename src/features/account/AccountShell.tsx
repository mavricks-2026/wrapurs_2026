"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { accountContent, accountNav } from "@/config/auth";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { resolveProfile, useAccountStore } from "@/features/account/useAccountStore";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "W").concat(parts[1]?.[0] ?? "").toUpperCase();
}

/**
 * AccountShell — the account area frame: profile card + sidebar nav (desktop)
 * or scrollable tabs (mobile), wrapping every `/account/*` page.
 */
export function AccountShell({
  email,
  name,
  children,
}: {
  email: string;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const profile = useAccountStore((s) => resolveProfile(s, email));
  const displayName = profile.name?.trim() || name;
  const phone = profile.phone;

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  return (
    <div className="bg-surface pb-16 pt-8 sm:pt-10">
      <div className="mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {/* Profile card */}
            <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3.5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand font-display text-[22px] text-white shadow-glow">
                  {initialsOf(displayName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-body text-[16px] font-bold text-plum">
                    {displayName}
                  </p>
                  <p className="truncate font-body text-[12.5px] text-plum-muted">{email}</p>
                  {phone ? (
                    <p className="truncate font-body text-[12.5px] text-plum-muted">{phone}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Nav — tabs on mobile, list on desktop */}
            <nav
              aria-label="Account"
              className="mt-4 flex gap-2 overflow-x-auto rounded-[20px] border border-line bg-white p-2 shadow-soft lg:flex-col lg:overflow-visible"
            >
              {accountNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-[14px] px-4 py-3 font-body text-[14px] font-semibold transition-colors",
                      active
                        ? "bg-brand text-white shadow-soft"
                        : "text-plum-muted hover:bg-section hover:text-brand-dark",
                    )}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="mt-4 hidden w-full items-center justify-center gap-2 rounded-[14px] border border-line bg-white px-4 py-3 font-body text-[14px] font-semibold text-plum-muted transition-colors hover:border-brand hover:text-brand lg:flex"
            >
              <Icon name="logout" className="text-[20px]" />
              {accountContent.signOut}
            </button>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
