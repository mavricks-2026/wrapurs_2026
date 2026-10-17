"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";
import { formatPrice } from "@/lib/utils";

/**
 * StickyAddBar — the persistent purchase bar that slides up once the main
 * purchase panel has scrolled out of view (as in the design).
 */
export function StickyAddBar({
  title,
  image,
  price,
  compareAt,
  added,
  onEdit,
  onAdd,
  onBuy,
}: {
  title: string;
  image: string;
  price: number;
  compareAt: number;
  added: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onBuy: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.35, ease: animationConfig.ease.out }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-[0_-8px_30px_rgba(43,26,41,0.10)] backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-site items-center gap-3 px-5 py-3 sm:px-6">
            <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-[12px] border border-line bg-surface sm:block">
              <Image src={image} alt="" fill sizes="48px" className="object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-body text-[14px] font-bold text-plum">{title}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-body text-[18px] font-bold leading-none text-brand-dark">
                  {formatPrice(price)}
                </span>
                {compareAt > price ? (
                  <span className="font-body text-[12px] leading-none text-plum-muted line-through">
                    {formatPrice(compareAt)}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="hidden items-center gap-1 rounded-[12px] border border-line px-3 py-2 font-body text-[13px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand md:inline-flex"
            >
              <Icon name="edit" className="text-[16px]" />
              Edit Photo &amp; Name
            </button>

            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[12px] font-medium text-brand transition-colors hover:bg-section"
            >
              <Icon name={added ? "check" : "shopping_bag"} className="text-[16px]" />
              {added ? "Added" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={onBuy}
              className="hidden items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[12px] font-medium text-white transition-colors hover:bg-brand-dark sm:inline-flex"
            >
              <Icon name="bolt" className="text-[16px]" />
              Buy Now
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
