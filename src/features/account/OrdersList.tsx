"use client";

import Image from "next/image";
import Link from "next/link";
import { accountContent } from "@/config/auth";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, longDateLabel } from "@/lib/utils";
import { useAccountOrders } from "@/features/account/useAccountOrders";
import { StatusChip } from "@/features/account/StatusChip";

/** OrdersList — every order for the signed-in account. */
export function OrdersList() {
  const { orders, ready } = useAccountOrders();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AnimatedText
          as="h1"
          text={accountContent.orders.title}
          highlight={accountContent.orders.highlight}
          onView={false}
          className="font-display text-[30px] leading-tight text-plum sm:text-[36px]"
        />
        <Reveal delay={0.12}>
          <p className="mt-2 font-body text-[14.5px] text-plum-muted">
            {accountContent.orders.subtitle}
          </p>
        </Reveal>
      </header>

      {!ready ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[22px] bg-white shadow-soft" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Reveal>
          <div className="flex flex-col items-center rounded-[24px] border border-dashed border-line bg-white px-6 py-16 text-center shadow-soft">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
              <Icon name="receipt_long" className="text-[32px]" />
            </span>
            <p className="mt-4 max-w-sm font-body text-[15px] text-plum-muted">
              {accountContent.orders.empty}
            </p>
            <ButtonLink href="/shop" size="lg" className="mt-6">
              {accountContent.orders.emptyCta}
              <Icon name="arrow_forward" className="text-[20px]" />
            </ButtonLink>
          </div>
        </Reveal>
      ) : (
        <StaggerGroup className="flex flex-col gap-4">
          {orders.map((order) => (
            <StaggerItem key={order.id}>
              <article className="rounded-[22px] border border-line bg-white p-5 shadow-soft transition-shadow hover:shadow-card sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="font-body text-[15px] font-bold text-plum">
                      {accountContent.orders.orderLabel} #{order.id}
                    </p>
                    <p className="mt-0.5 font-body text-[12.5px] text-plum-muted">
                      {accountContent.orders.placedOn} {longDateLabel(order.createdAt)}
                    </p>
                  </div>
                  <StatusChip status={order.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <ul className="flex items-center gap-3">
                    {order.items.slice(0, 4).map((item) => (
                      <li
                        key={`${order.id}-${item.slug}-${item.variant ?? ""}`}
                        className="relative h-14 w-14 overflow-hidden rounded-[14px] border border-line bg-section"
                        title={item.title}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </li>
                    ))}
                    {order.items.length > 4 ? (
                      <li className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-line bg-surface font-body text-[12px] font-bold text-plum-muted">
                        +{order.items.length - 4}
                      </li>
                    ) : null}
                  </ul>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="font-body text-[22px] leading-none text-plum">
                        {formatPrice(order.amounts.total)}
                      </p>
                      <p className="font-body text-[12px] text-plum-muted">
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? accountContent.orders.itemSuffix
                          : accountContent.orders.itemsSuffix}
                      </p>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[13.5px] font-bold text-white transition-colors hover:bg-brand-dark"
                    >
                      {accountContent.orders.viewDetails}
                      <Icon name="arrow_forward" className="text-[18px]" />
                    </Link>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
