import { Prisma, type OrderStatus, type PaymentMethod, type PaymentProvider } from "@prisma/client";
import { getPaymentMethod, type PaymentMethodId, type PaymentProviderId } from "@/config/payments";
import { prisma } from "@/lib/prisma";
import { priceRawLines, type OrderAmounts } from "@/services/pricing.service";

/**
 * order.service.ts — validated, server-side order creation and persistence.
 *
 * The client may only send product slugs, quantities, an address, an email and
 * a payment method. Prices, totals and the paid flag are computed/assigned here
 * and are never accepted from the browser. Order + OrderItem rows are written
 * in one atomic nested create.
 */

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; detail?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_NUMBER_ATTEMPTS = 6;

const METHOD_ENUM: Record<PaymentMethodId, PaymentMethod> = {
  upi: "UPI",
  card: "CARD",
  netbanking: "NETBANKING",
  cod: "COD",
};

const PROVIDER_ENUM: Record<PaymentProviderId, PaymentProvider> = {
  razorpay: "RAZORPAY",
  cod: "COD",
};

const METHOD_ID: Record<PaymentMethod, PaymentMethodId> = {
  UPI: "upi",
  CARD: "card",
  NETBANKING: "netbanking",
  COD: "cod",
};

const PROVIDER_ID: Record<PaymentProvider, PaymentProviderId> = {
  RAZORPAY: "razorpay",
  COD: "cod",
};

export type OrderAddressInput = {
  name: string;
  mobile: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  type: "HOME" | "WORK";
};

export type CreateOrderLine = {
  slug: string;
  qty: number;
  variant?: string;
  personalization?: Record<string, string> | null;
};

export type CreateOrderInput = {
  email: string;
  address: OrderAddressInput;
  method: PaymentMethodId;
  lines: CreateOrderLine[];
};

export type CreatedOrder = {
  id: string;
  orderNumber: string;
  email: string;
  status: OrderStatus;
  paid: boolean;
  amounts: OrderAmounts;
  currency: string;
  createdAt: string;
  itemCount: number;
};

/** The minimal view of a stored order needed to start/verify a payment. */
export type OrderPaymentContext = {
  id: string;
  orderNumber: string;
  email: string;
  paid: boolean;
  /** Server-computed total in the order's currency (the ONLY trusted amount). */
  amount: number;
  currency: string;
  methodId: PaymentMethodId;
  providerId: PaymentProviderId;
  razorpayOrderId: string | null;
};

function validation(detail: string): Result<never> {
  return { ok: false, status: 400, error: "validation", detail };
}

/** Trim + cap an optional string field, returning null when empty. */
function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/** Validate the untrusted request body into a CreateOrderInput. */
export function parseCreateOrderInput(raw: unknown): Result<CreateOrderInput> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, status: 400, error: "invalid_body" };
  }
  const body = raw as Record<string, unknown>;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email))
    return validation("A valid email address is required.");

  const methodId = typeof body.method === "string" ? body.method.trim().toLowerCase() : "";
  const method = getPaymentMethod(methodId);
  if (!method) return validation("Choose a valid payment method.");

  const rawAddress = body.address;
  if (typeof rawAddress !== "object" || rawAddress === null || Array.isArray(rawAddress))
    return validation("A delivery address is required.");
  const a = rawAddress as Record<string, unknown>;

  const name = clean(a.name, 120);
  if (!name) return validation("Please provide the recipient name.");
  const mobile = clean(a.mobile, 20);
  if (!mobile) return validation("Please provide a contact number.");
  const line1 = clean(a.line1, 200);
  if (!line1) return validation("Please provide the street address.");
  const city = clean(a.city, 80);
  if (!city) return validation("Please provide the city.");
  const state = clean(a.state, 80);
  if (!state) return validation("Please provide the state.");
  const pincode = clean(a.pincode, 12);
  if (!pincode) return validation("Please provide the pincode.");
  const type: "HOME" | "WORK" = clean(a.type, 8)?.toUpperCase() === "WORK" ? "WORK" : "HOME";

  const rawLines = Array.isArray(body.lines) ? body.lines : [];
  if (rawLines.length === 0) return validation("Your cart is empty.");
  const lines: CreateOrderLine[] = [];
  for (const entry of rawLines) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry))
      return validation("One of the items in your cart is invalid.");
    const l = entry as Record<string, unknown>;
    const slug = typeof l.slug === "string" ? l.slug.trim() : "";
    if (!slug) return validation("One of the items in your cart is invalid.");
    const personalization =
      l.personalization && typeof l.personalization === "object" && !Array.isArray(l.personalization)
        ? (l.personalization as Record<string, string>)
        : null;
    lines.push({
      slug,
      qty: typeof l.qty === "number" ? l.qty : Number(l.qty),
      variant: typeof l.variant === "string" ? l.variant : undefined,
      personalization,
    });
  }

  return {
    ok: true,
    data: {
      email,
      address: {
        name,
        mobile,
        line1,
        line2: clean(a.line2, 200),
        city,
        state,
        pincode,
        type,
      },
      method: method.id,
      lines,
    },
  };
}

function newOrderNumber(): string {
  return `WU-${100000 + Math.floor(Math.random() * 900000)}`;
}

function mapError(e: unknown): Result<never> {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2003") return { ok: false, status: 400, error: "invalid_reference" };
    if (e.code === "P2025") return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: false, status: 500, error: "database_error" };
}

/**
 * Persist a new unpaid order. Prices are recomputed from the catalogue; the
 * Order and its OrderItems are written in a single atomic nested create.
 */
export async function createOrder(input: CreateOrderInput): Promise<Result<CreatedOrder>> {
  const priced = await priceRawLines(input.lines, input.method);
  if (!priced.ok) {
    // A required database read failed → retryable server error; never fall back
    // to a different product or an incorrect price.
    if (priced.kind === "unavailable")
      return { ok: false, status: 503, error: "pricing_unavailable", detail: priced.detail };
    return validation(priced.detail);
  }

  const method = getPaymentMethod(input.method);
  if (!method) return validation("Choose a valid payment method.");

  // Best-effort link to a catalogue product row (nullable until the storefront
  // itself is DB-backed). Matched on slug, never on a client-supplied id.
  const slugs = priced.data.lines.map((line) => line.slug);
  const dbProducts = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const productIdBySlug = new Map(dbProducts.map((p) => [p.slug, p.id]));

  const addressJson = input.address as unknown as Prisma.InputJsonValue;
  const amountsJson = priced.data.amounts as unknown as Prisma.InputJsonValue;

  for (let attempt = 0; attempt < ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: newOrderNumber(),
          email: input.email,
          status: "PLACED",
          address: addressJson,
          paymentProvider: PROVIDER_ENUM[method.provider],
          paymentMethod: METHOD_ENUM[method.id],
          paid: false,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          paymentReference: null,
          amounts: amountsJson,
          currency: priced.data.currency,
          items: {
            create: priced.data.lines.map((line) => ({
              productId: productIdBySlug.get(line.slug) ?? null,
              slug: line.slug,
              title: line.title,
              image: line.image,
              unitPriceInr: line.unitPriceInr,
              compareAtInr: line.compareAtInr,
              qty: line.qty,
              personalization: (line.personalization ?? undefined) as
                | Prisma.InputJsonValue
                | undefined,
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          email: true,
          status: true,
          paid: true,
          currency: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      });

      return {
        ok: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          email: order.email,
          status: order.status,
          paid: order.paid,
          amounts: priced.data.amounts,
          currency: order.currency,
          createdAt: order.createdAt.toISOString(),
          itemCount: order._count.items,
        },
      };
    } catch (e) {
      // A rare order-number collision: retry with a fresh number.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      return mapError(e) as Result<CreatedOrder>;
    }
  }

  return { ok: false, status: 500, error: "order_number_exhausted" };
}

/**
 * Load the server-owned payment context for an order id. The amount returned
 * here is the ONLY amount a gateway may ever be asked to charge — the client
 * value is never read.
 */
export async function getOrderPaymentContext(id: string): Promise<Result<OrderPaymentContext>> {
  if (typeof id !== "string" || !id.trim()) return validation("An order id is required.");

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        paid: true,
        currency: true,
        paymentMethod: true,
        paymentProvider: true,
        razorpayOrderId: true,
        amounts: true,
      },
    });
    if (!order) return { ok: false, status: 404, error: "not_found" };

    const amounts = order.amounts as { total?: unknown } | null;
    const total = amounts && typeof amounts.total === "number" ? amounts.total : NaN;
    if (!Number.isFinite(total) || total <= 0)
      return { ok: false, status: 409, error: "invalid_amount" };

    return {
      ok: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
        paid: order.paid,
        amount: total,
        currency: order.currency,
        methodId: METHOD_ID[order.paymentMethod],
        providerId: PROVIDER_ID[order.paymentProvider],
        razorpayOrderId: order.razorpayOrderId,
      },
    };
  } catch (e) {
    return mapError(e) as Result<OrderPaymentContext>;
  }
}

/** Attach a freshly-created gateway order id to a stored order. */
export async function attachGatewayOrderId(orderId: string, gatewayOrderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { razorpayOrderId: gatewayOrderId },
  });
}

/**
 * Mark a Razorpay payment as captured. Only ever called after a valid,
 * server-side signature check against the STORED gateway order id.
 *
 * `storedRazorpayOrderId` must come from our own database row (never from the
 * client) so a verify request cannot be pointed at a different gateway order.
 */
export async function markOrderPaid(input: {
  orderId: string;
  paymentId: string;
  signature: string;
  storedRazorpayOrderId: string;
}): Promise<Result<{ orderId: string; paid: boolean }>> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: { id: true, paid: true, razorpayOrderId: true, paymentProvider: true },
    });
    if (!order) return { ok: false, status: 404, error: "not_found" };

    // COD (and any non-Razorpay provider) must never be marked paid here.
    if (order.paymentProvider !== "RAZORPAY")
      return { ok: false, status: 409, error: "not_razorpay_order" };

    // Idempotent: an already-paid order stays paid and is not rewritten.
    if (order.paid) return { ok: true, data: { orderId: order.id, paid: true } };

    // Refuse if the stored gateway order id does not match what we verified.
    if (!order.razorpayOrderId || order.razorpayOrderId !== input.storedRazorpayOrderId)
      return { ok: false, status: 409, error: "gateway_order_mismatch" };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paid: true,
        status: "PROCESSING",
        razorpayPaymentId: input.paymentId,
        paymentReference: input.signature,
      },
    });

    return { ok: true, data: { orderId: order.id, paid: true } };
  } catch (e) {
    return mapError(e) as Result<{ orderId: string; paid: boolean }>;
  }
}
