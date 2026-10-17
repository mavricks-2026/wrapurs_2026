"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { selectCartCount, selectSubtotal, useCartStore } from "./useCartStore";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { animationConfig } from "@/config/motion";

/**
 * CartDrawer — the slide-in bag that opens whenever an item is added
 * (the cart store flips `isOpen`). Mounted once in the root layout.
 */
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectSubtotal);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationConfig.duration.fast }}
            onClick={close}
            className="absolute inset-0 bg-plum/40 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: animationConfig.duration.base, ease: animationConfig.ease.out }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-cardHover"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon name="shopping_bag" filled className="text-[24px] text-brand" />
                <h2 className="font-display text-[24px] text-plum">Your Bag ({count})</h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="flex h-9 w-9 items-center justify-center rounded-full text-plum-muted transition-colors hover:bg-section hover:text-brand"
              >
                <Icon name="close" className="text-[22px]" />
              </button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
                    <Icon name="shopping_bag" className="text-[32px]" />
                  </span>
                  <p className="font-display text-[22px] text-plum">Your bag is empty</p>
                  <p className="max-w-xs font-body text-[14px] text-plum-muted">
                    Add a handcrafted keepsake and it will appear here.
                  </p>
                  <Button variant="outline" size="sm" onClick={close}>
                    Keep shopping
                  </Button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <motion.div
                      key={line.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{
                        duration: animationConfig.duration.fast,
                        ease: animationConfig.ease.out,
                      }}
                      className="mb-4 flex gap-3 overflow-hidden last:mb-0"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border border-line bg-surface">
                        <Image
                          src={line.image}
                          alt={line.title}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${line.slug}`}
                              onClick={close}
                              className="font-body text-[14px] font-bold leading-tight text-plum transition-colors hover:text-brand"
                            >
                              {line.title}
                            </Link>
                            {line.variant ? (
                              <p className="font-body text-[12px] text-plum-muted">
                                {line.variant}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.id)}
                            aria-label={`Remove ${line.title}`}
                            className="text-plum-muted transition-colors hover:text-brand-dark"
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-2.5 rounded-[12px] bg-section px-2 py-0.5">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(line.id, Math.max(1, line.qty - 1))}
                              className="text-[16px] font-bold leading-none text-brand transition-colors hover:text-brand-dark"
                            >
                              −
                            </button>
                            <span className="min-w-[10px] text-center font-body text-[13px] font-bold text-plum">
                              {line.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setQty(line.id, line.qty + 1)}
                              className="text-[16px] font-bold leading-none text-brand transition-colors hover:text-brand-dark"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-body text-[14px] font-bold text-brand-dark">
                            {formatPrice(line.price * line.qty)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 ? (
              <div className="border-t border-line px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-body text-[15px] font-bold text-plum">Subtotal</span>
                  <span className="font-body text-[24px] font-bold text-brand-dark">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white shadow-glow transition-colors hover:bg-brand-dark"
                  >
                    Checkout
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-[14px] border border-line py-3 font-body text-[15px] font-semibold text-brand transition-colors hover:border-brand"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
