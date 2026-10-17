"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cartContent } from "@/config/cart";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";
import { formatPrice } from "@/lib/utils";

export type CartSummaryData = {
  lineCount: number;
  mrpTotal: number;
  discountTotal: number;
  deliveryFee: number;
  freeDelivery: boolean;
  couponCode: string | null;
  couponAmount: number;
  total: number;
  savings: number;
};

/**
 * CartSummary — the sticky order summary: coupon, price breakdown, savings
 * banner, checkout CTA and the secure-payment footer.
 */
export function CartSummary({
  data,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  data: CartSummaryData;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}) {
  const [code, setCode] = useState("");
  const { summary } = cartContent;

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[24px] font-bold text-plum">{summary.title}</h2>
        <span className="rounded-full bg-section px-2.5 py-0.5 font-body text-[12px] font-semibold text-brand-dark">
          {data.lineCount} Keepsakes
        </span>
      </div>

      {/* Coupon */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="flex-1 rounded-[14px] border border-line bg-surface px-3 py-2 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            onClick={() => onApplyCoupon(code)}
            className="rounded-full bg-brand px-4 py-2 font-mono uppercase tracking-[0.12em] text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Apply
          </button>
        </div>

        <AnimatePresence initial={false}>
          {data.couponCode ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: animationConfig.duration.fast }}
              className="flex items-center justify-between rounded-full bg-section px-3 py-1.5 font-body text-[13px] font-semibold text-brand-dark"
            >
              <span className="flex items-center gap-1.5">
                <Icon name="sell" filled className="text-[16px]" />
                {data.couponCode} applied (−{formatPrice(data.couponAmount)})
              </span>
              <button
                type="button"
                onClick={onRemoveCoupon}
                aria-label="Remove coupon"
                className="flex items-center justify-center p-0.5 text-brand-dark transition-colors hover:text-plum"
              >
                <Icon name="close" className="text-[15px]" />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-2.5 border-t border-line pt-3 font-body text-[14px] text-plum-muted">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-plum">
            {summary.priceLabel} ({data.lineCount} items)
          </span>
          <span>{formatPrice(data.mrpTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{summary.discountLabel}</span>
          <span className="font-bold text-brand">−{formatPrice(data.discountTotal)}</span>
        </div>
        {data.couponCode ? (
          <div className="flex items-center justify-between">
            <span>Coupon ({data.couponCode})</span>
            <span className="font-bold text-brand">−{formatPrice(data.couponAmount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span>{summary.deliveryLabel}</span>
          <span className="flex items-center gap-1.5">
            {data.freeDelivery ? (
              <span className="text-plum-muted line-through">{formatPrice(data.deliveryFee)}</span>
            ) : null}
            <span className="font-bold text-brand">
              {data.freeDelivery ? summary.freeLabel : formatPrice(data.deliveryFee)}
            </span>
          </span>
        </div>

        <div className="my-1 h-px bg-line" />

        <div className="flex items-baseline justify-between pt-1">
          <span className="font-body text-[16px] font-bold text-plum">{summary.totalLabel}</span>
          <span className="font-body text-[26px] font-bold text-brand-dark">
            {formatPrice(data.total)}
          </span>
        </div>

        <div className="rounded-full bg-section px-3 py-2 text-center font-body text-[13px] font-semibold text-brand-dark">
          {summary.savingsPrefix} {formatPrice(data.savings)} {summary.savingsSuffix}
        </div>
      </div>

      <Link
        href="/checkout"
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white shadow-glow transition-all hover:bg-brand-dark"
      >
        {summary.checkoutCta}
        <Icon
          name="arrow_forward"
          className="text-[20px] transition-transform group-hover:translate-x-1"
        />
      </Link>

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-center gap-2 font-body text-[12px] text-plum-muted">
          <Icon name="verified_user" className="text-[18px] text-brand" />
          {summary.secureLabel}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {summary.payments.map((pay) => (
            <span
              key={pay}
              className="rounded bg-surface px-2 py-0.5 font-body text-[11px] font-bold text-plum-muted"
            >
              {pay}
            </span>
          ))}
        </div>
        <p className="pt-1 text-center font-body text-[12px] leading-tight text-plum-muted/80">
          {summary.footerNote}
        </p>
      </div>
    </div>
  );
}
