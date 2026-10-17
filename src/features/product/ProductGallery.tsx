"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * ProductGallery — thumbnail rail + main image with hover zoom, wishlist and
 * share controls. Purely presentational; state is owned by `ProductDetailView`.
 */
export function ProductGallery({
  images,
  title,
  badge,
  active,
  onSelect,
  liked,
  onToggleLike,
}: {
  images: string[];
  title: string;
  badge?: string;
  active: number;
  onSelect: (index: number) => void;
  liked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col gap-3 sm:flex-row lg:sticky lg:top-24"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Thumbnail rail */}
      <div className="order-2 flex shrink-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`View image ${i + 1} of ${images.length}`}
            aria-current={i === active}
            className={cn(
              "h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-surface shadow-soft transition-all duration-200",
              i === active ? "border-2 border-brand" : "border border-line hover:border-brand",
            )}
          >
            <Image src={src} alt="" width={64} height={64} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="group relative order-1 flex-1 overflow-hidden rounded-[24px] border border-line bg-white p-3 shadow-soft sm:order-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-surface">
          <Image
            src={images[active]}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority
          />

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={onToggleLike}
              aria-pressed={liked}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand shadow-soft backdrop-blur transition-transform duration-200 hover:scale-110"
            >
              <motion.span
                className="inline-flex"
                animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon name="favorite" filled={liked} className="text-[20px]" />
              </motion.span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              aria-label="Share this product"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-plum-muted shadow-soft backdrop-blur transition-transform duration-200 hover:scale-110 hover:text-brand"
            >
              <Icon name="share" className="text-[20px]" />
            </motion.button>
          </div>

          {badge ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand px-3 py-0.5 font-mono uppercase tracking-[0.12em] text-[12px] font-bold text-white shadow-soft">
              {badge}
            </span>
          ) : null}

          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-body text-[12px] font-semibold text-plum-muted shadow-soft backdrop-blur">
            <Icon name="zoom_in" className="text-[16px] text-brand" />
            Roll over to zoom
          </span>
        </div>
      </div>
    </motion.div>
  );
}
