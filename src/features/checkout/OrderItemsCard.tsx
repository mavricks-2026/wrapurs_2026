"use client";

import Image from "next/image";
import { checkoutContent } from "@/config/checkout";
import type { CartLine } from "@/features/cart/useCartStore";
import { Reveal } from "@/components/motion";
import { deliveryDateLabel, formatPrice } from "@/lib/utils";

/** Turn a line's personalization map into a human " • "-joined summary. */
export function personalizationSummary(
  personalization?: Record<string, string>,
  variant?: string,
): string {
  const p = personalization ?? {};
  const parts: string[] = [];
  if (p.photo) parts.push(`Photo: ${p.photo}`);
  if (p.name) parts.push(`Name: ${p.name}`);
  if (p.charm) parts.push(`Charm: '${p.charm}'`);
  if (p.led) parts.push(`LED: ${p.led}`);
  if (p.notes) parts.push(p.notes);
  if (!parts.length && variant) parts.push(variant);
  return parts.join(" • ");
}

/**
 * OrderItemsCard — the "3. Order Summary" list shown on the checkout page:
 * every cart line with its personalization, quantity, price and MRP.
 */
export function OrderItemsCard({ lines, total }: { lines: CartLine[]; total: number }) {
  const { orderSummary } = checkoutContent;
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtitle = (count === 1 ? orderSummary.subtitleSingle : orderSummary.subtitleTemplate)
    .replace("{count}", String(count))
    .replace("{date}", deliveryDateLabel());

  return (
    <Reveal>
      <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft md:p-6">
        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
              3
            </span>
            <div className="flex flex-col">
              <h2 className="font-display text-[26px] leading-none text-plum">
                {orderSummary.title} <span className="text-brand">{orderSummary.titleHighlight}</span>
              </h2>
              <p className="mt-1 font-body text-[12px] text-plum-muted">{subtitle}</p>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap pt-1 font-body text-[13px] font-bold text-brand-dark">
            {orderSummary.totalLabel}: {formatPrice(total)}
          </span>
        </header>

        <div className="mt-1 divide-y divide-line/60">
          {lines.map((line) => {
            const summary = personalizationSummary(line.personalization, line.variant);
            return (
              <div key={line.id} className="flex items-start justify-between gap-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] border border-line bg-section">
                    <Image
                      src={line.image}
                      alt={line.title}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-body text-[14px] font-bold text-plum">
                      {line.title}
                      {line.variant ? (
                        <span className="font-medium text-plum-muted"> ({line.variant})</span>
                      ) : null}
                    </h4>
                    {summary ? (
                      <p className="font-body text-[12px] text-plum-muted">{summary}</p>
                    ) : null}
                    <span className="mt-1 w-fit rounded-md bg-section px-2 py-0.5 font-body text-[11px] font-bold text-brand">
                      Qty: {line.qty}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block font-body text-[14px] font-extrabold text-brand-dark">
                    {formatPrice(line.price)}
                  </span>
                  {line.compareAt && line.compareAt > line.price ? (
                    <span className="block font-body text-[12px] text-plum-muted line-through">
                      {formatPrice(line.compareAt)}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </Reveal>
  );
}
