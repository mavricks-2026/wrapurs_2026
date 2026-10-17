"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/config/catalog";
import type { ProductDetail } from "@/config/product-details";
import { productTrustBadges } from "@/config/product-details";
import { AnimatedText, Reveal } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { StarRating } from "@/components/common/StarRating";
import { useCartStore } from "@/features/cart/useCartStore";
import { useWishlistStore } from "@/features/wishlist/useWishlistStore";
import { useMounted } from "@/hooks/useMounted";
import { discountPercent, formatPrice } from "@/lib/utils";
import { ProductGallery } from "./ProductGallery";
import { PersonalizeCard } from "./PersonalizeCard";
import { PreviewModal } from "./PreviewModal";
import { StickyAddBar } from "./StickyAddBar";

const OFFER_ICONS = ["percent", "local_shipping", "redeem"];

/** Formats "today + 5 days" as e.g. "Wednesday, 15 Oct". */
function deliveryEstimate() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(d);
}

/**
 * ProductDetailView — the top of the PDP: sticky gallery on the left, purchase
 * + personalization panel on the right, with the simulated-carving preview
 * modal and the sticky add bar.
 */
export function ProductDetailView({
  product,
  detail,
}: {
  product: Product;
  detail: ProductDetail;
}) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const mounted = useMounted();
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [photoName, setPhotoName] = useState("");
  const [name, setName] = useState("");
  const [ledColor, setLedColor] = useState(detail.ledColors?.[0]?.name ?? "");
  const [notes, setNotes] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [date, setDate] = useState("");
  const [added, setAdded] = useState(false);

  // Compute the delivery date on the client only (avoids SSG staleness + hydration mismatch)
  useEffect(() => setDate(deliveryEstimate()), []);

  const { rating, total } = detail.reviewSummary;
  const discount = discountPercent(product.price, product.compareAt);

  function handleAdd() {
    add({
      id: `${product.id}::${name}::${ledColor}`,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      compareAt: product.compareAt,
      image: detail.gallery[0],
      qty,
      variant: ledColor || undefined,
      personalization: {
        ...(photoName ? { photo: photoName } : {}),
        ...(name ? { name } : {}),
        ...(ledColor ? { led: ledColor } : {}),
        ...(notes ? { notes } : {}),
      },
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function handleBuyNow() {
    handleAdd();
    router.push("/checkout");
  }

  function scrollToPersonalize() {
    document.getElementById("personalize")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={detail.gallery}
            title={product.title}
            badge={product.badge}
            active={activeImage}
            onSelect={setActiveImage}
            liked={mounted && inWishlist}
            onToggleLike={() => toggleWishlist(product)}
          />
        </div>

        {/* Purchase panel */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <AnimatedText
                as="h1"
                text={product.title}
                onView={false}
                className="font-display text-[34px] leading-tight text-plum sm:text-[40px]"
              />
              {product.badge ? (
                <span className="rounded-full bg-brand px-3 py-1 font-mono uppercase tracking-[0.12em] text-[12px] font-bold text-white shadow-soft">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <Reveal delay={0.08}>
              <p className="mt-1.5 font-body text-[15px] text-plum-muted">
                {product.description}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <StarRating rating={rating} allowHalf />
                <span className="font-body text-[14px] font-bold text-plum">
                  {rating.toFixed(1)}
                </span>
                <span className="font-body text-[14px] text-line">·</span>
                <span className="font-body text-[14px] text-plum-muted underline underline-offset-2">
                  {total.toLocaleString("en-IN")} verified ratings
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-section px-3 py-1 font-body text-[12px] font-semibold text-brand-dark">
                  <Icon name="auto_fix_high" className="text-[14px]" />
                  Customizable Keepsake
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-[34px] font-bold leading-none text-brand-dark">
                {formatPrice(product.price)}
              </span>
              {product.compareAt > product.price ? (
                <span className="font-body text-[16px] leading-none text-plum-muted line-through">
                  {formatPrice(product.compareAt)}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-full bg-section px-2.5 py-1 font-body text-[12px] font-bold text-brand">
                  {discount}% OFF
                </span>
              ) : null}
              <span className="font-body text-[12px] text-plum-muted">
                Inclusive of all taxes
              </span>
            </div>
          </Reveal>

          {/* Offers */}
          <Reveal delay={0.2}>
            <div className="rounded-[18px] border border-line bg-section p-4">
              <p className="mb-2 flex items-center gap-1.5 font-body text-[13px] font-bold text-brand-dark">
                <Icon name="redeem" filled className="text-[16px]" />
                Boutique Offers &amp; Savings
              </p>
              <ul className="flex flex-col gap-1.5">
                {detail.offers.map((offer, i) => (
                  <li
                    key={offer}
                    className="flex items-start gap-2 font-body text-[13px] text-plum"
                  >
                    <Icon
                      name={OFFER_ICONS[i % OFFER_ICONS.length]}
                      className="mt-0.5 text-[15px] text-brand"
                    />
                    <span>{offer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Personalize */}
          <Reveal delay={0.24}>
            <div id="personalize" className="scroll-mt-28">
              <PersonalizeCard
                photoName={photoName}
                onPhotoSelect={setPhotoName}
                name={name}
                onNameChange={setName}
                ledColors={detail.ledColors}
                ledColor={ledColor}
                onLedColorChange={setLedColor}
                notes={notes}
                onNotesChange={setNotes}
                onPreview={() => setPreviewing(true)}
              />
            </div>
          </Reveal>

          {/* Quantity + delivery */}
          <Reveal delay={0.28}>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[13px] font-bold text-plum">Quantity</span>
                <div className="inline-flex items-center rounded-[12px] border border-line bg-white shadow-soft">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-l-[12px] text-plum transition-colors hover:text-brand"
                  >
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <span className="w-10 text-center font-body text-[15px] font-bold text-plum">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-r-[12px] text-plum transition-colors hover:text-brand"
                  >
                    <Icon name="add" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                <label htmlFor="pincode" className="font-body text-[13px] font-bold text-plum">
                  Estimated Delivery Date
                </label>
                <div className="flex gap-2">
                  <input
                    id="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setDeliveryChecked(false);
                    }}
                    placeholder="Enter Pincode"
                    className="w-full rounded-[12px] border border-line bg-white px-4 py-3 font-body text-[15px] text-plum shadow-soft outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setDeliveryChecked(true)}
                    className="shrink-0 rounded-[12px] border border-brand px-4 py-3 font-body text-[14px] font-semibold text-brand transition-colors hover:bg-section"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>

            {deliveryChecked ? (
              <p className="mt-2.5 flex items-center gap-1.5 font-body text-[13px] text-plum">
                <Icon name="local_shipping" className="text-[16px] text-brand" />
                Delivery expected by {date || "3–5 business days"} · Cash on Delivery available
              </p>
            ) : null}
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.32}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand bg-white px-6 py-3.5 font-mono uppercase tracking-[0.12em] text-[13px] font-medium text-brand transition-colors hover:bg-section"
              >
                <Icon name={added ? "check" : "shopping_bag"} className="text-[19px]" />
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-brand-dark"
              >
                <Icon name="flash_on" className="text-[19px]" />
                Buy It Now
              </button>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={0.36}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {productTrustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1 rounded-[16px] border border-line bg-white p-3 text-center shadow-soft"
                >
                  <Icon name={badge.icon} className="text-[22px] text-brand" />
                  <span className="font-body text-[12px] font-bold text-plum">{badge.label}</span>
                  <span className="font-body text-[11px] text-plum-muted">{badge.sub}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <PreviewModal
        open={previewing}
        onClose={() => setPreviewing(false)}
        image={detail.previewImage}
        name={name}
      />

      <StickyAddBar
        title={product.title}
        image={detail.gallery[0]}
        price={product.price}
        compareAt={product.compareAt}
        added={added}
        onEdit={scrollToPersonalize}
        onAdd={handleAdd}
        onBuy={handleBuyNow}
      />
    </>
  );
}
