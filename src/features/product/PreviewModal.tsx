"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";

/**
 * PreviewModal — "Simulated Carving Preview": shows the chosen artwork with the
 * customer's text overlaid, so they can approve the layout before we carve it.
 */
export function PreviewModal({
  open,
  onClose,
  image,
  name,
}: {
  open: boolean;
  onClose: () => void;
  image: string;
  name: string;
}) {
  // Lock scroll + close on Escape while the modal is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: animationConfig.duration.fast }}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-plum/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Simulated carving preview"
            className="relative z-10 w-full max-w-md rounded-[24px] border border-line bg-white p-4 shadow-cardHover"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: animationConfig.ease.out }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-body text-[16px] font-bold text-plum">
                Simulated Carving Preview
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-plum-muted transition-colors hover:bg-section hover:text-brand"
              >
                <Icon name="close" className="text-[22px]" />
              </button>
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-surface">
              <Image
                src={image}
                alt="Simulated carving preview"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum/75 to-transparent p-4 text-center">
                <p className="font-display text-[22px] leading-tight text-white">
                  {name || "Your Text Appears Here"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-center font-body text-[12px] text-plum-muted">
              *Actual product features fine optical laser diffusion on 5mm cast acrylic.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-full bg-brand py-3 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Looks Great, Continue
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
