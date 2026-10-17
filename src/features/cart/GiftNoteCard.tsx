"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cartContent } from "@/config/cart";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";

/**
 * GiftNoteCard — the "This is a gift" toggle plus the 200-character
 * hand-written ribbon message. State is owned by `CartView`.
 */
export function GiftNoteCard({
  isGift,
  onToggle,
  message,
  onMessageChange,
}: {
  isGift: boolean;
  onToggle: (value: boolean) => void;
  message: string;
  onMessageChange: (value: string) => void;
}) {
  const { gift } = cartContent;

  return (
    <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4 shadow-soft">
      <label className="flex cursor-pointer select-none items-start gap-3">
        <input
          type="checkbox"
          checked={isGift}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-1 h-5 w-5 cursor-pointer rounded accent-brand"
        />
        <span className="flex flex-col">
          <span className="flex items-center gap-1.5 font-body text-[15px] font-bold text-plum">
            <Icon name="redeem" className="text-[20px] text-brand" />
            {gift.title}
          </span>
          <span className="font-body text-[13px] text-plum-muted">{gift.description}</span>
        </span>
      </label>

      <AnimatePresence initial={false}>
        {isGift ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: animationConfig.duration.fast, ease: animationConfig.ease.out }}
            className="flex flex-col gap-1.5 overflow-hidden pt-2"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="gift-message"
                className="font-body text-[13px] font-semibold text-plum"
              >
                {gift.label}
              </label>
              <span className="font-body text-[12px] text-plum-muted">
                {message.length}/{gift.maxLength}
              </span>
            </div>
            <textarea
              id="gift-message"
              value={message}
              maxLength={gift.maxLength}
              rows={3}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={gift.placeholder}
              className="w-full resize-none rounded-[14px] border border-line bg-white px-3.5 py-2.5 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
