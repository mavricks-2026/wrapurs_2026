"use client";

import { checkoutContent } from "@/config/checkout";
import { Icon } from "@/components/ui/Icon";
import { deliveryDateLabel, formatPrice } from "@/lib/utils";

export type PriceAsideData = {
  lineCount: number;
  mrpTotal: number;
  discountTotal: number;
  couponCode: string | null;
  couponAmount: number;
  deliveryFee: number;
  freeDelivery: boolean;
  codFee: number;
  total: number;
  savings: number;
};

/**
 * PriceAside — the sticky "Price Details" panel: full breakdown, total,
 * savings banner and the secure-payment / delivery notes.
 */
export function PriceAside({ data }: { data: PriceAsideData }) {
  const { priceDetails } = checkoutContent;

  return (
    <div className="flex flex-col rounded-[24px] border border-line bg-white p-5 shadow-card md:p-6">
      <h3 className="border-b border-line pb-4 font-display text-[24px] leading-none text-plum">
        {priceDetails.title} <span className="text-brand">{priceDetails.titleHighlight}</span>
        <span className="ml-2 align-middle font-body text-[12px] font-semibold text-plum-muted">
          ({data.lineCount} {priceDetails.itemsSuffix})
        </span>
      </h3>

      <div className="flex flex-col gap-2.5 pt-4 font-body text-[14px] text-plum-muted">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-plum">{priceDetails.totalMrp}</span>
          <span>{formatPrice(data.mrpTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{priceDetails.productDiscount}</span>
          <span className="font-bold text-brand">−{formatPrice(data.discountTotal)}</span>
        </div>
        {data.couponCode ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {priceDetails.couponLabel}
              <span className="rounded bg-section px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
                {data.couponCode}
              </span>
            </span>
            <span className="font-bold text-brand">−{formatPrice(data.couponAmount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span>{priceDetails.delivery}</span>
          <span className="flex items-center gap-1.5">
            {data.freeDelivery ? (
              <span className="text-[12px] text-plum-muted line-through">
                {formatPrice(data.deliveryFee)}
              </span>
            ) : null}
            <span className="font-bold text-brand">
              {data.freeDelivery ? priceDetails.freeLabel : formatPrice(data.deliveryFee)}
            </span>
          </span>
        </div>
        {data.codFee > 0 ? (
          <div className="flex items-center justify-between">
            <span>{priceDetails.codFee}</span>
            <span className="font-bold text-brand">{formatPrice(data.codFee)}</span>
          </div>
        ) : null}
      </div>

      <div className="my-2 h-px bg-line" />

      <div className="flex items-baseline justify-between py-3">
        <span className="font-body text-[16px] font-bold text-plum">{priceDetails.total}</span>
        <span className="font-body text-[28px] font-bold text-brand-dark">
          {formatPrice(data.total)}
        </span>
      </div>

      <div className="mt-1 rounded-[12px] border border-line bg-section px-3 py-2.5 text-center font-body text-[12px] font-extrabold text-brand-dark">
        ✨ {priceDetails.savingsTemplate.replace("{amount}", formatPrice(data.savings))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-5 font-body text-[12px] text-plum-muted">
        <div className="flex items-start gap-2.5">
          <Icon name="verified_user" className="mt-0.5 shrink-0 text-[18px] text-brand" />
          <span>{priceDetails.noteSecure}</span>
        </div>
        <div className="flex items-start gap-2.5">
          <Icon name="local_shipping" className="mt-0.5 shrink-0 text-[18px] text-brand" />
          <span>
            <span className="font-bold text-plum">{priceDetails.noteDeliveryPrefix} </span>
            {deliveryDateLabel()} {priceDetails.noteDeliverySuffix}
          </span>
        </div>
      </div>
    </div>
  );
}
