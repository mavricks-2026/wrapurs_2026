"use client";

import { motion } from "framer-motion";
import { checkoutContent } from "@/config/checkout";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { useMounted } from "@/hooks/useMounted";
import { deliveryDate, formatPrice, longDateLabel } from "@/lib/utils";
import { useOrderStore, type Order } from "@/features/orders";

/**
 * OrderConfirmationView — the "Order Confirmation" screen. Reads the order
 * placed a moment ago from the persisted order store and renders the thank-you
 * card, delivery timeline, package details and the paid/delivering summary.
 */
export function OrderConfirmationView({ id }: { id: string }) {
  const mounted = useMounted();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));

  if (!mounted) return <ConfirmationSkeleton />;
  if (!order) return <OrderNotFound />;

  return <Confirmation order={order} />;
}

function Confirmation({ order }: { order: Order }) {
  const { confirmation } = checkoutContent;
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const expected = longDateLabel(deliveryDate(5, order.createdAt));
  const destination = [order.address.city, order.address.state]
    .filter(Boolean)
    .join(", ")
    .concat(order.address.pincode ? ` – ${order.address.pincode}` : "");

  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col items-center gap-6 py-10">
        <Reveal from="none">
          <span className="inline-block rounded-full border border-line bg-section px-4 py-1 font-mono text-[12px] font-bold uppercase tracking-wider text-brand-dark">
            {confirmation.eyebrow}
          </span>
        </Reveal>

        <Reveal>
          <article className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[24px] border border-line bg-white p-8 text-center shadow-card md:p-12">
            {/* Gradient top rule */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-section via-brand to-section" />

            {/* Pulsing tick */}
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="flex h-20 w-20 animate-pulse-soft items-center justify-center rounded-full bg-section">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-soft">
                  <Icon name="check" className="text-[30px]" />
                </div>
              </div>
            </div>

            <AnimatedText
              as="h1"
              text={`${confirmation.thanksPrefix} ${order.address.name.split(" ")[0]}! ${confirmation.placedTitle} ${confirmation.placedHighlight}`}
              highlight={confirmation.placedHighlight}
              onView={false}
              className="mb-2 font-display text-[30px] leading-tight text-plum md:text-[38px]"
            />

            <p className="mb-6 font-body text-[14px] text-plum-muted">
              <span className="font-extrabold text-plum">{confirmation.orderIdLabel}: </span>
              <span className="font-bold text-plum">#{order.id}</span>
              <span className="mx-1.5">•</span>
              {confirmation.emailPrefix}{" "}
              <span className="font-semibold text-plum">{order.email}</span>
            </p>

            {/* Delivery timeline */}
            <div className="mx-auto mb-8 max-w-lg rounded-[18px] border border-line bg-section/70 p-4 font-body text-[14px]">
              <span className="mb-0.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-brand-dark">
                {confirmation.timelineTitle}
              </span>
              <span className="font-bold text-plum">
                {confirmation.timelinePrefix} {expected}
              </span>
            </div>

            {/* Package details */}
            <div className="mx-auto mb-8 max-w-lg space-y-3 rounded-[18px] border border-line bg-surface p-5 text-left">
              <h4 className="font-mono text-[12px] font-extrabold uppercase tracking-wider text-plum-muted">
                {confirmation.packageTitle} ({itemCount} {itemCount === 1 ? "Item" : "Items"})
              </h4>
              <StaggerGroup className="space-y-2 border-b border-line pb-3 font-body text-[13px] text-plum">
                {order.items.map((item) => (
                  <StaggerItem key={item.id} className="flex items-center justify-between gap-3">
                    <span>
                      {item.qty}× {item.title}
                      {item.variant ? (
                        <span className="text-plum-muted"> ({item.variant})</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-bold text-brand-dark">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerGroup>
              <div className="flex items-center justify-between gap-3 pt-1 font-body text-[12px]">
                <span className="text-plum-muted">
                  {confirmation.deliveringTo}: <span className="font-semibold text-plum">{destination}</span>
                </span>
                <span className="font-extrabold text-brand-dark">
                  {order.payment.paid
                    ? `${confirmation.paidVia} ${order.payment.label} (${formatPrice(order.payment.amount)})`
                    : `${order.payment.label} · ${confirmation.codDue} (${formatPrice(order.payment.amount)})`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/account" size="lg" className="w-full flex-1 sm:w-auto">
                {confirmation.track}
                <Icon name="arrow_forward" className="text-[18px]" />
              </ButtonLink>
              <ButtonLink href="/shop" variant="light" size="lg" className="w-full flex-1 sm:w-auto">
                {confirmation.continueShopping}
              </ButtonLink>
            </div>
          </article>
        </Reveal>

        {/* Payment chips row */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-body text-[12px] font-bold text-plum-muted">
          {site.payments.map((pay) => (
            <span key={pay} className="rounded-md border border-line bg-section px-2.5 py-1">
              {pay}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}

function OrderNotFound() {
  const { confirmation } = checkoutContent;
  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col items-center gap-5 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
          <Icon name="receipt_long" className="text-[32px]" />
        </span>
        <h1 className="font-display text-[32px] text-plum">{confirmation.emptyTitle}</h1>
        <p className="max-w-lg font-body text-[15px] leading-relaxed text-plum-muted">
          {confirmation.emptyDescription}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Continue Shopping
          </ButtonLink>
          <ButtonLink href="/cart" variant="light" size="lg">
            Back to cart
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col items-center gap-6 py-10">
        <div className="h-7 w-40 animate-pulse rounded-full bg-line/50" />
        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="h-[520px] w-full max-w-[760px] rounded-[24px] border border-line bg-white/70"
        />
      </Container>
    </div>
  );
}
