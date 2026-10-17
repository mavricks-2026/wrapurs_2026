"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/config/catalog";
import { cartContent } from "@/config/cart";
import {
  selectDiscountTotal,
  selectLineCount,
  selectMrpTotal,
  selectSubtotal,
  useCartStore,
} from "./useCartStore";
import { CartLineItem } from "./CartLineItem";
import { CartSummary, type CartSummaryData } from "./CartSummary";
import { CheckoutStepper } from "./CheckoutStepper";
import { EmptyCart } from "./EmptyCart";
import { GiftNoteCard } from "./GiftNoteCard";
import { PairAndSurprise } from "./PairAndSurprise";
import { SavedForLater } from "./SavedForLater";
import { AnimatedText, Reveal } from "@/components/motion";
import { Container } from "@/components/ui/Container";
import { useMounted } from "@/hooks/useMounted";
import { animationConfig } from "@/config/motion";

/**
 * CartView — the client orchestrator for the /cart page. Reads the persisted
 * cart, computes every money value once, and renders either the full cart
 * (lines + gift note + summary + suggestions) or the empty-cart state.
 */
export function CartView({ suggested, trending }: { suggested: Product[]; trending: Product[] }) {
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const saved = useCartStore((s) => s.saved);
  const lineCount = useCartStore(selectLineCount);
  const mrpTotal = useCartStore(selectMrpTotal);
  const discountTotal = useCartStore(selectDiscountTotal);
  const subtotal = useCartStore(selectSubtotal);

  const [couponCode, setCouponCode] = useState<string | null>(cartContent.coupon.code);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  // Avoid a hydration mismatch: the persisted store fills in after mount.
  if (!mounted) return <CartSkeleton />;

  if (!lines.length) return <EmptyCart trending={trending} />;

  const freeDelivery = subtotal >= cartContent.freeDeliveryThreshold;
  const couponAmount = couponCode ? cartContent.coupon.amount : 0;
  const total = Math.max(0, subtotal - couponAmount) + (freeDelivery ? 0 : cartContent.deliveryFee);
  const savings = discountTotal + couponAmount;

  const summary: CartSummaryData = {
    lineCount,
    mrpTotal,
    discountTotal,
    deliveryFee: cartContent.deliveryFee,
    freeDelivery,
    couponCode,
    couponAmount,
    total,
    savings,
  };

  function applyCoupon(code: string) {
    if (code.trim().toUpperCase() === cartContent.coupon.code) {
      setCouponCode(cartContent.coupon.code);
    }
  }

  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-8 py-8">
        {/* Heading + progress */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <AnimatedText
            as="h1"
            text={`${cartContent.title} (${lineCount} ${lineCount === 1 ? "item" : "items"})`}
            highlight={cartContent.titleHighlight}
            onView={false}
            className="text-center font-display text-[34px] leading-tight text-plum sm:text-[40px]"
          />
          <CheckoutStepper current={1} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Lines + gift note */}
          <div className="flex flex-col gap-5 lg:col-span-8">
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={line.id} line={line} />
                ))}
              </AnimatePresence>
            </div>

            <SavedForLater />

            <GiftNoteCard
              isGift={isGift}
              onToggle={setIsGift}
              message={giftMessage}
              onMessageChange={setGiftMessage}
            />
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <Reveal from="left">
              <CartSummary
                data={summary}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={() => setCouponCode(null)}
              />
            </Reveal>
          </aside>
        </div>

        <PairAndSurprise products={suggested} />
      </Container>
    </div>
  );
}

/** Loading skeleton shown for the first client paint (persisted cart unknown). */
function CartSkeleton() {
  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-8 py-8">
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="h-10 w-56 animate-pulse rounded-full bg-line/60" />
          <div className="h-7 w-72 animate-pulse rounded-full bg-line/50" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                className="h-40 rounded-[20px] border border-line bg-white/70"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="h-80 rounded-[24px] border border-line bg-white/70"
            />
          </div>
        </div>
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: animationConfig.duration.base }}
          className="sr-only"
        >
          Loading your cart…
        </motion.span>
      </Container>
    </div>
  );
}
