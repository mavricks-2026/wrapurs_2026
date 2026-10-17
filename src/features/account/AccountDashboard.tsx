"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { accountContent } from "@/config/auth";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, longDateLabel } from "@/lib/utils";
import { selectWishlistCount, useWishlistStore } from "@/features/wishlist/useWishlistStore";
import { resolveAddresses, resolveProfile, useAccountStore } from "@/features/account/useAccountStore";
import { useAccountOrders } from "@/features/account/useAccountOrders";
import { StatusChip } from "@/features/account/StatusChip";

/** AccountDashboard — greeting, quick stats, recent orders and shortcuts. */
export function AccountDashboard() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const profile = useAccountStore((s) => resolveProfile(s, email));
  const addresses = useAccountStore((s) => resolveAddresses(s, email));
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const { orders, ready } = useAccountOrders();

  const displayName = profile.name?.trim() || session?.user?.name || "there";
  const firstName = displayName.split(/\s+/)[0];

  const stats = [
    { key: "orders", icon: "receipt_long", value: orders.length, label: accountContent.dashboard.stats.orders },
    { key: "wishlist", icon: "favorite", value: wishlistCount, label: accountContent.dashboard.stats.wishlist },
    { key: "addresses", icon: "location_on", value: addresses.length, label: accountContent.dashboard.stats.addresses },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-section" />
        <div className="relative">
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-brand">
            {accountContent.eyebrow}
          </p>
          <AnimatedText
            as="h1"
            text={`${accountContent.greeting}, ${firstName}`}
            highlight={firstName}
            onView={false}
            className="mt-2 font-display text-[30px] leading-tight text-plum sm:text-[36px]"
          />
          <Reveal delay={0.15}>
            <p className="mt-1.5 font-body text-[14.5px] text-plum-muted">
              {accountContent.greetingSuffix} — here&apos;s everything in one place.
            </p>
          </Reveal>
        </div>
      </header>

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StaggerItem key={stat.key}>
            <div className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-5 shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-section text-brand">
                <Icon name={stat.icon} className="text-[24px]" />
              </span>
              <div>
                <p className="font-display text-[26px] leading-none text-plum">
                  {stat.key === "orders" && !ready ? "—" : stat.value}
                </p>
                <p className="mt-1 font-body text-[13px] font-semibold text-plum-muted">
                  {stat.label}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal>
        <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[24px] text-plum">
              {accountContent.dashboard.recentOrders}
            </h2>
            {orders.length > 0 ? (
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 font-body text-[13px] font-bold text-brand hover:text-brand-dark"
              >
                {accountContent.dashboard.viewAll}
                <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            ) : null}
          </div>

          {!ready ? (
            <div className="mt-5 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-[16px] bg-section" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-[18px] border border-dashed border-line bg-surface px-6 py-10 text-center">
              <Icon name="redeem" className="text-[34px] text-brand" />
              <p className="mt-2 font-body text-[14px] text-plum-muted">
                {accountContent.dashboard.noOrders}
              </p>
              <ButtonLink href="/shop" size="sm" className="mt-4">
                {accountContent.dashboard.noOrdersCta}
                <Icon name="arrow_forward" className="text-[18px]" />
              </ButtonLink>
            </div>
          ) : (
            <ul className="mt-5 flex flex-col gap-3">
              {orders.slice(0, 3).map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-line bg-surface px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="font-body text-[14px] font-bold text-plum">
                      #{order.id}
                      <span className="ml-2 font-normal text-plum-muted">
                        {longDateLabel(order.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 font-body text-[12.5px] text-plum-muted">
                      {order.items.length}{" "}
                      {order.items.length === 1
                        ? accountContent.orders.itemSuffix
                        : accountContent.orders.itemsSuffix}{" "}
                      • {formatPrice(order.amounts.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusChip status={order.status} />
                    <ButtonLink href={`/account/orders/${order.id}`} size="sm" variant="outline">
                      {accountContent.orders.viewDetails}
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-7">
          <h2 className="font-display text-[24px] text-plum">
            {accountContent.dashboard.quickTitle}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { href: "/shop", icon: "storefront", label: "Continue shopping" },
              { href: "/wishlist", icon: "favorite", label: "View wishlist" },
              { href: "/account/addresses", icon: "location_on", label: "Manage addresses" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-[16px] border border-line bg-surface px-4 py-3.5 font-body text-[14px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand-dark"
              >
                <Icon name={link.icon} className="text-[20px] text-brand" />
                {link.label}
                <Icon name="chevron_right" className="ml-auto text-[18px] text-plum-muted" />
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
