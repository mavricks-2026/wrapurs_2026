"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { accountContent, orderStages } from "@/config/auth";
import { checkoutContent } from "@/config/checkout";
import { AnimatedText, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPrice, longDateLabel, deliveryDate } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";
import { useOrderStore } from "@/features/orders/useOrderStore";
import { StatusChip } from "@/features/account/StatusChip";

/** OrderTracking — the full delivery timeline + order breakdown for one order. */
export function OrderTracking() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? decodeURIComponent(String(params.id)) : "";
  const mounted = useMounted();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-[24px] bg-white shadow-soft" />
        <div className="h-72 animate-pulse rounded-[24px] bg-white shadow-soft" />
      </div>
    );
  }

  if (!order) {
    return (
      <Reveal>
        <div className="flex flex-col items-center rounded-[24px] border border-dashed border-line bg-white px-6 py-16 text-center shadow-soft">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
            <Icon name="search_off" className="text-[32px]" />
          </span>
          <p className="mt-4 max-w-sm font-body text-[15px] text-plum-muted">
            {accountContent.tracking.notFound}
          </p>
          <ButtonLink href="/account/orders" size="lg" variant="outline" className="mt-6">
            <Icon name="arrow_back" className="text-[20px]" />
            {accountContent.tracking.back}
          </ButtonLink>
        </div>
      </Reveal>
    );
  }

  const currentIndex = orderStages.findIndex((s) => s.id === order.status);
  const isCancelled = order.status === "cancelled";
  const expected = longDateLabel(deliveryDate(5, order.createdAt));
  const addressLine = [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.state,
  ]
    .filter(Boolean)
    .join(", ");

  const priceRows = [
    { label: checkoutContent.priceDetails.totalMrp, value: formatPrice(order.amounts.mrp) },
    order.amounts.discount > 0
      ? { label: checkoutContent.priceDetails.productDiscount, value: `− ${formatPrice(order.amounts.discount)}`, accent: "success" }
      : null,
    order.amounts.coupon > 0
      ? { label: checkoutContent.priceDetails.couponLabel, value: `− ${formatPrice(order.amounts.coupon)}`, accent: "success" }
      : null,
    {
      label: checkoutContent.priceDetails.delivery,
      value: order.amounts.delivery > 0 ? formatPrice(order.amounts.delivery) : checkoutContent.priceDetails.freeLabel,
    },
    order.amounts.codFee > 0
      ? { label: checkoutContent.priceDetails.codFee, value: formatPrice(order.amounts.codFee) }
      : null,
  ].filter(Boolean) as { label: string; value: string; accent?: string }[];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account/orders"
        className="inline-flex w-fit items-center gap-1.5 font-body text-[13px] font-bold text-plum-muted transition-colors hover:text-brand"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        {accountContent.tracking.back}
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <AnimatedText
            as="h1"
            text={`${accountContent.tracking.title} #${order.id}`}
            highlight={`#${order.id}`}
            onView={false}
            className="font-display text-[28px] leading-tight text-plum sm:text-[34px]"
          />
          <Reveal delay={0.12}>
            <p className="mt-1.5 font-body text-[13.5px] text-plum-muted">
              {accountContent.orders.placedOn} {longDateLabel(order.createdAt)}
            </p>
          </Reveal>
        </div>
        <StatusChip status={order.status} className="text-[12px]" />
      </header>

      {/* Timeline */}
      <Reveal>
        <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-[22px] text-plum">
            <Icon name="local_shipping" className="text-[22px] text-brand" />
            {accountContent.tracking.timelineTitle}
          </h2>

          {isCancelled ? (
            <p className="mt-4 rounded-[16px] bg-feedback-errorBg px-4 py-3 font-body text-[13.5px] font-semibold text-feedback-error">
              This order was cancelled. Reach out to our concierge for help.
            </p>
          ) : (
            <>
              <p className="mt-2 font-body text-[13.5px] text-plum-muted">
                {checkoutContent.confirmation.timelinePrefix}{" "}
                <span className="font-bold text-brand-dark">{expected}</span>
              </p>

              <ol className="mt-6 flex flex-col gap-0">
                {orderStages.map((stage, index) => {
                  const done = index <= currentIndex;
                  const active = index === currentIndex;
                  return (
                    <li key={stage.id} className="relative flex gap-4 pb-7 last:pb-0">
                      {index < orderStages.length - 1 ? (
                        <span
                          aria-hidden
                          className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-[2px] ${
                            index < currentIndex ? "bg-brand" : "bg-line"
                          }`}
                        />
                      ) : null}
                      <span
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          done
                            ? "border-brand bg-brand text-white"
                            : "border-line bg-white text-plum-muted"
                        }`}
                      >
                        <Icon name={done ? "check" : stage.icon} className="text-[20px]" />
                      </span>
                      <div className="pt-1.5">
                        <p
                          className={`font-body text-[14.5px] font-bold ${
                            active ? "text-brand" : done ? "text-plum" : "text-plum-muted"
                          }`}
                        >
                          {stage.label}
                          {active ? (
                            <span className="ml-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
                              Current
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 font-body text-[12.5px] text-plum-muted">
                          {index === 0
                            ? longDateLabel(order.createdAt)
                            : done
                              ? stage.description
                              : "Pending"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <Reveal>
          <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-7">
            <h2 className="flex items-center gap-2 font-display text-[22px] text-plum">
              <Icon name="redeem" className="text-[22px] text-brand" />
              {accountContent.tracking.packageTitle}
            </h2>
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {order.items.map((item) => (
                <li
                  key={`${item.slug}-${item.variant ?? ""}`}
                  className="flex gap-4 py-4 first:pt-2"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border border-line bg-section"
                  >
                    <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-body text-[14.5px] font-bold text-plum hover:text-brand"
                      >
                        {item.title}
                      </Link>
                      <span className="font-body text-[14px] font-bold text-plum">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                    <p className="mt-0.5 font-body text-[12.5px] text-plum-muted">
                      Qty {item.qty}
                      {item.variant ? ` · ${item.variant}` : ""}
                    </p>
                    {item.personalization && Object.keys(item.personalization).length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(item.personalization).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded-full bg-section px-2.5 py-1 font-body text-[11.5px] font-semibold text-brand-dark"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Aside: address + payment + price */}
        <div className="flex flex-col gap-6">
          <Reveal>
            <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 font-display text-[20px] text-plum">
                <Icon name="location_on" className="text-[20px] text-brand" />
                {accountContent.tracking.deliveringTo}
              </h2>
              <p className="mt-3 font-body text-[14px] font-bold text-plum">
                {order.address.name}
              </p>
              <p className="mt-1 font-body text-[13px] leading-relaxed text-plum-muted">
                {addressLine} – {order.address.pincode}
              </p>
              <p className="mt-1 font-body text-[13px] text-plum-muted">{order.address.mobile}</p>
            </section>
          </Reveal>

          <Reveal>
            <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 font-display text-[20px] text-plum">
                <Icon name="payments" className="text-[20px] text-brand" />
                {accountContent.tracking.paymentTitle}
              </h2>
              <p className="mt-3 font-body text-[14px] font-semibold text-plum">
                {order.payment.label}
              </p>
              <p className="mt-1 font-body text-[13px] text-plum-muted">
                {order.payment.paid
                  ? `${checkoutContent.confirmation.paidVia} ${formatPrice(order.payment.amount)}`
                  : `${checkoutContent.confirmation.codDue} (${formatPrice(order.payment.amount)})`}
              </p>
              {order.payment.reference ? (
                <p className="mt-1 break-all font-body text-[12px] text-plum-muted">
                  Ref: {order.payment.reference}
                </p>
              ) : null}
            </section>
          </Reveal>

          <Reveal>
            <section className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
              <h2 className="font-display text-[20px] text-plum">
                {accountContent.tracking.summaryTitle}
              </h2>
              <dl className="mt-4 flex flex-col gap-2.5">
                {priceRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <dt className="font-body text-[13.5px] text-plum-muted">{row.label}</dt>
                    <dd
                      className={`font-body text-[13.5px] font-semibold ${
                        row.accent === "success" ? "text-feedback-success" : "text-plum"
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="font-body text-[14px] font-bold text-plum">
                  {checkoutContent.priceDetails.total}
                </span>
                <span className="font-body text-[22px] text-brand">
                  {formatPrice(order.amounts.total)}
                </span>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
