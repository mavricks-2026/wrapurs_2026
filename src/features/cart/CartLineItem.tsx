"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CartLine } from "./useCartStore";
import { useCartStore } from "./useCartStore";
import { cartContent } from "@/config/cart";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";
import { deliveryDateLabel, discountPercent, formatPrice } from "@/lib/utils";

/**
 * CartLineItem — one row of the cart: image, title, personalization summary,
 * price row, quantity stepper, save-for-later/remove and delivery estimate.
 */
export function CartLineItem({ line }: { line: CartLine }) {
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const saveForLater = useCartStore((s) => s.saveForLater);

  const p = line.personalization ?? {};
  const details: string[] = [];
  if (p.photo) details.push(`${cartContent.line.photoPrefix}: ${p.photo} uploaded ♥`);
  if (p.name)
    details.push(
      `${cartContent.line.engravingPrefix}: '${p.name}'${line.variant ? ` · ${line.variant}` : ""}`,
    );
  else if (line.variant) details.push(`${cartContent.line.engravingPrefix}: ${line.variant}`);
  if (p.notes) details.push(`${cartContent.line.notesPrefix}: ${p.notes}`);

  const discount = discountPercent(line.price, line.compareAt ?? 0);
  const delivery = deliveryDateLabel();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -32, height: 0, marginBottom: 0 }}
      transition={{ duration: animationConfig.duration.fast, ease: animationConfig.ease.out }}
      className="flex flex-col gap-4 overflow-hidden rounded-[20px] border border-line bg-white p-4 shadow-soft sm:flex-row"
    >
      <div className="h-36 w-full shrink-0 overflow-hidden rounded-[16px] border border-line bg-surface sm:w-36">
        <Link href={`/product/${line.slug}`} aria-label={line.title}>
          <Image
            src={line.image}
            alt={line.title}
            width={144}
            height={144}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className="inline-block w-fit rounded-full bg-brand px-2.5 py-0.5 font-mono uppercase tracking-[0.12em] text-[11px] font-bold text-white">
            {cartContent.line.badge}
          </span>
          <h2 className="font-display text-[22px] leading-tight text-plum">
            <Link href={`/product/${line.slug}`} className="transition-colors hover:text-brand">
              {line.title}
            </Link>
          </h2>

          {details.length ? (
            <div className="flex items-start justify-between gap-2 rounded-[14px] bg-section p-3">
              <div className="flex flex-col gap-0.5">
                {details.map((detail) => (
                  <p key={detail} className="font-body text-[13px] text-plum-muted">
                    {detail}
                  </p>
                ))}
              </div>
              <Link
                href={`/product/${line.slug}`}
                className="shrink-0 pt-0.5 font-body text-[12px] font-semibold text-brand underline underline-offset-2 transition-colors hover:text-brand-dark"
              >
                {cartContent.line.edit}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-body text-[22px] font-bold leading-none text-brand-dark">
              {formatPrice(line.price)}
            </span>
            {line.compareAt && line.compareAt > line.price ? (
              <span className="font-body text-[13px] leading-none text-plum-muted line-through">
                {formatPrice(line.compareAt)}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="rounded-full bg-section px-2 py-0.5 font-body text-[12px] font-bold text-brand-dark">
                {discount}% OFF
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-[14px] bg-section px-2 py-1">
              <button
                type="button"
                aria-label={`Decrease quantity of ${line.title}`}
                onClick={() => setQty(line.id, Math.max(1, line.qty - 1))}
                className="px-1 text-[18px] font-bold leading-none text-brand transition-colors hover:text-brand-dark"
              >
                −
              </button>
              <span className="min-w-[12px] text-center font-body text-[14px] font-bold text-plum">
                {line.qty}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${line.title}`}
                onClick={() => setQty(line.id, line.qty + 1)}
                className="px-1 text-[18px] font-bold leading-none text-brand transition-colors hover:text-brand-dark"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => saveForLater(line.id)}
                className="font-body text-[12px] font-semibold text-plum-muted transition-colors hover:text-brand-dark"
              >
                {cartContent.line.saveForLater}
              </button>
              <span className="text-line">•</span>
              <button
                type="button"
                onClick={() => remove(line.id)}
                className="font-body text-[12px] font-semibold text-plum-muted transition-colors hover:text-brand-dark"
              >
                {cartContent.line.remove}
              </button>
            </div>
          </div>
        </div>

        <p className="flex items-center gap-1.5 pt-1 font-body text-[13px] text-plum-muted">
          <Icon name="local_shipping" className="text-[18px] text-brand" />
          Delivery by {delivery} · {cartContent.deliveryNote}
        </p>
      </div>
    </motion.article>
  );
}
