import { cartContent } from "@/config/cart";
import { getPaymentMethod, type PaymentMethodId } from "@/config/payments";
import { resolveProductForPricing } from "@/services/product.service";
import { site } from "@/config/site";

/**
 * pricing.service.ts — the ONE trusted, server-side price calculator.
 *
 * The browser sends only product slugs and quantities; every price, discount,
 * coupon and total is recomputed here from the server-owned catalogue and the
 * shared pricing configuration. A tampered client therefore cannot change what
 * is charged.
 *
 * Products resolve static-catalogue-first, then ACTIVE database rows — exactly
 * matching the storefront's slug resolution. DRAFT, ARCHIVED, missing or
 * invalid products are rejected. If the database is required and the read
 * fails, pricing fails CLOSED (`error: "unavailable"`): the order is refused
 * rather than charged an incorrect or fallback price.
 */

const MAX_LINES = 50;
const MAX_QTY_PER_LINE = 99;
const MAX_TOTAL_QTY = 200;

export type RawLine = {
  slug: string;
  qty: number;
  variant?: string;
  personalization?: Record<string, string> | null;
};

export type PricedLine = {
  slug: string;
  title: string;
  image: string;
  unitPriceInr: number;
  compareAtInr: number | null;
  qty: number;
  variant: string | null;
  personalization: Record<string, string> | null;
};

export type OrderAmounts = {
  mrp: number;
  discount: number;
  coupon: number;
  couponCode: string | null;
  delivery: number;
  codFee: number;
  total: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  amounts: OrderAmounts;
  currency: string;
};

export type PriceResult =
  | { ok: true; data: PricedOrder }
  | { ok: false; kind: "invalid"; detail: string }
  | { ok: false; kind: "unavailable"; detail: string };

/** Keep only short, non-empty string values from an untrusted personalization blob. */
function normalizeStringMap(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string")
    .map(([k, v]) => [k.slice(0, 40), (v as string).trim().slice(0, 500)] as const)
    .filter(([, v]) => v.length > 0)
    .slice(0, 20);
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/**
 * Recompute a fully-priced order from raw (untrusted) lines and a method id.
 * Products resolve static-first, then ACTIVE database rows. Unknown, DRAFT,
 * ARCHIVED or imageless products are rejected; a required-but-failed database
 * read fails closed rather than charging a fallback price.
 */
export async function priceRawLines(
  rawLines: RawLine[],
  methodId: PaymentMethodId,
): Promise<PriceResult> {
  if (!Array.isArray(rawLines) || rawLines.length === 0)
    return { ok: false, kind: "invalid", detail: "Your cart is empty." };
  if (rawLines.length > MAX_LINES)
    return { ok: false, kind: "invalid", detail: `An order can contain at most ${MAX_LINES} products.` };

  const lines: PricedLine[] = [];
  let totalQty = 0;

  for (const raw of rawLines) {
    const slug = typeof raw?.slug === "string" ? raw.slug.trim() : "";
    const resolved = slug ? await resolveProductForPricing(slug) : { status: "missing" as const };
    if (resolved.status === "error")
      return {
        ok: false,
        kind: "unavailable",
        detail: "We couldn't verify pricing right now. Please try again in a moment.",
      };
    if (resolved.status === "missing")
      return { ok: false, kind: "invalid", detail: `"${slug || "Unknown product"}" is no longer available.` };
    const product = resolved.product;

    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE)
      return {
        ok: false,
        kind: "invalid",
        detail: `Quantity for "${product.title}" must be a whole number (1–${MAX_QTY_PER_LINE}).`,
      };

    totalQty += qty;
    if (totalQty > MAX_TOTAL_QTY)
      return { ok: false, kind: "invalid", detail: "This order contains too many items." };

    const variant =
      typeof raw.variant === "string" && raw.variant.trim()
        ? raw.variant.trim().slice(0, 120)
        : null;

    lines.push({
      slug: product.slug,
      title: product.title,
      image: product.image,
      unitPriceInr: product.price,
      compareAtInr: typeof product.compareAt === "number" ? product.compareAt : null,
      qty,
      variant,
      personalization: normalizeStringMap(raw.personalization),
    });
  }

  const method = getPaymentMethod(methodId);
  const codFee = method?.fee ?? 0;

  const subtotal = lines.reduce((n, l) => n + l.qty * l.unitPriceInr, 0);
  const mrp = lines.reduce((n, l) => n + l.qty * (l.compareAtInr ?? l.unitPriceInr), 0);
  const discount = lines.reduce(
    (n, l) => n + l.qty * Math.max(0, (l.compareAtInr ?? l.unitPriceInr) - l.unitPriceInr),
    0,
  );
  const coupon = cartContent.coupon.amount;
  const delivery = subtotal >= cartContent.freeDeliveryThreshold ? 0 : cartContent.deliveryFee;
  const total = Math.max(0, subtotal - coupon) + delivery + codFee;

  return {
    ok: true,
    data: {
      lines,
      amounts: {
        mrp,
        discount,
        coupon,
        couponCode: cartContent.coupon.code,
        delivery,
        codFee,
        total,
      },
      currency: site.currency.code,
    },
  };
}
