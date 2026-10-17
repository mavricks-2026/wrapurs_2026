"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "./useCartStore";
import { cartContent } from "@/config/cart";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";
import { formatPrice } from "@/lib/utils";

/**
 * SavedForLater — the "Saved for later" bucket: one compact row per saved line
 * with Move to Cart / Remove.
 */
export function SavedForLater() {
  const saved = useCartStore((s) => s.saved);
  const moveToCart = useCartStore((s) => s.moveToCart);
  const removeSaved = useCartStore((s) => s.removeSaved);

  if (!saved.length) return null;

  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-line bg-section p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-[20px] text-plum">
          <Icon name="bookmark" filled className="text-[22px] text-brand" />
          {cartContent.saved.title} ({saved.length})
        </h3>
        <span className="font-body text-[12px] font-semibold text-plum-muted">
          {cartContent.saved.inStock}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {saved.map((line) => (
            <motion.div
              key={line.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{
                duration: animationConfig.duration.fast,
                ease: animationConfig.ease.out,
              }}
              className="flex flex-col items-start justify-between gap-3 overflow-hidden rounded-[16px] bg-white p-3 sm:flex-row sm:items-center"
            >
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-line bg-surface">
                  <Image
                    src={line.image}
                    alt={line.title}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-body text-[15px] font-bold text-plum">{line.title}</h4>
                  <p className="font-body text-[13px] font-bold text-brand-dark">
                    {formatPrice(line.price)}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                <button
                  type="button"
                  onClick={() => moveToCart(line.id)}
                  className="rounded-full bg-brand px-4 py-1.5 font-mono uppercase tracking-[0.12em] text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {cartContent.saved.moveToCart}
                </button>
                <button
                  type="button"
                  onClick={() => removeSaved(line.id)}
                  className="font-body text-[12px] font-semibold text-plum-muted transition-colors hover:text-brand-dark"
                >
                  {cartContent.saved.remove}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
