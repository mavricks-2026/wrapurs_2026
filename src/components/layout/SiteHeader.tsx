"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mainNav } from "@/config/nav";
import { site } from "@/config/site";
import { selectCartCount, useCartStore } from "@/features/cart/useCartStore";
import { selectWishlistCount, useWishlistStore } from "@/features/wishlist/useWishlistStore";
import { useMounted } from "@/hooks/useMounted";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { animationConfig } from "@/config/motion";
import { AccountMenu } from "@/features/account";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mounted = useMounted();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white shadow-soft">
      <div className="mx-auto flex h-20 max-w-site items-center justify-between px-5 sm:px-6">
        {/* Logo — white lockup inside a brand badge */}
        <Link href="/" className="group flex items-center" aria-label={`${site.name} home`}>
          <span className="flex items-center gap-2.5 rounded-full bg-brand py-2 pl-2 pr-4 shadow-soft transition-all duration-300 group-hover:bg-brand-dark group-hover:shadow-card">
            <Image
              src="/images/logo/mark-white.png"
              alt=""
              width={507}
              height={506}
              className="h-8 w-auto object-contain"
              priority
            />
            <Image
              src="/images/logo/wordmark-white.png"
              alt={site.name}
              width={897}
              height={247}
              className="h-4 w-auto object-contain sm:h-5"
              priority
            />
          </span>
        </Link>

        {/* Search (desktop) */}
        <form
          onSubmit={submitSearch}
          className="mx-6 hidden w-full max-w-md lg:block"
          role="search"
        >
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 flex items-center text-brand">
              <Icon name="search" className="text-[20px]" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keepsakes, names, occasions…"
              aria-label="Search products"
              className="w-full rounded-[14px] border border-line bg-white py-2.5 pl-11 pr-4 font-body text-[15px] text-plum placeholder-plum-muted transition-all duration-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 lg:gap-7">
          {/* Primary nav (desktop) */}
          <nav className="hidden items-center gap-6 lg:flex">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-1 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-200",
                  isActive(link.href)
                    ? "text-brand after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-full after:bg-brand after:content-['']"
                    : "text-plum-muted hover:text-brand",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden h-6 w-px bg-line lg:block" />

          {/* Utility actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/wishlist"
              aria-label={`Wishlist${mounted && wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-plum transition-colors duration-200 hover:bg-section hover:text-brand"
            >
              <Icon name="favorite" className="text-[22px]" />
              {mounted && wishlistCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => useCartStore.getState().open()}
              aria-label={`Cart${mounted ? `, ${cartCount} items` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-plum transition-colors duration-200 hover:bg-section hover:text-brand"
            >
              <Icon name="shopping_bag" className="text-[22px]" />
              {mounted && cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-none text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>

            <AccountMenu />

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-plum transition-colors duration-200 hover:bg-section hover:text-brand lg:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} className="text-[24px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: animationConfig.duration.fast, ease: animationConfig.ease.out }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <div className="mx-auto max-w-site space-y-1 px-5 py-4 sm:px-6">
              <form onSubmit={submitSearch} role="search" className="mb-3 lg:hidden">
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 flex items-center text-brand">
                    <Icon name="search" className="text-[20px]" />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search keepsakes…"
                    aria-label="Search products"
                    className="w-full rounded-[14px] border border-line bg-white py-2.5 pl-11 pr-4 font-body text-[15px] text-plum placeholder-plum-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </form>
              {mainNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded-[14px] px-4 py-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors",
                    isActive(link.href)
                      ? "bg-section text-brand"
                      : "text-plum-muted hover:bg-section hover:text-brand",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
