import { Prisma, type OrderStatus, type PaymentMethod, type PaymentProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * order-admin.service.ts — validated, admin-side access to orders.
 *
 * Every caller must have already verified the ADMIN role (services/admin/guard.ts).
 * This module is READ-mostly: the only mutation is the order STATUS, and it is
 * strictly limited to an allow-list of transitions. A caller can never change
 * `paid`, amounts/totals, payment references or gateway identifiers through it —
 * those fields are not even read from the request body.
 */

export const ORDER_STATUSES = [
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

/**
 * Allowed forward/side transitions. A status may only move along one of these
 * edges; anything else (including no-ops and backward moves) is rejected.
 * Terminal states (DELIVERED, CANCELLED) have no outgoing edges.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; detail?: string };

export type OrderListRow = {
  id: string;
  orderNumber: string;
  email: string;
  status: OrderStatus;
  paid: boolean;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  currency: string;
  total: number;
  itemCount: number;
  createdAt: string;
};

export type OrderDetail = OrderListRow & {
  address: unknown;
  amounts: unknown;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentReference: string | null;
  updatedAt: string;
  items: {
    id: string;
    slug: string;
    title: string;
    image: string;
    unitPriceInr: number;
    compareAtInr: number | null;
    qty: number;
    personalization: unknown;
  }[];
};

const PAGE_SIZE = 20;

const LIST_SELECT = {
  id: true,
  orderNumber: true,
  email: true,
  status: true,
  paid: true,
  paymentMethod: true,
  paymentProvider: true,
  currency: true,
  amounts: true,
  createdAt: true,
  _count: { select: { items: true } },
} as const;

type OrderListRecord = Prisma.OrderGetPayload<{ select: typeof LIST_SELECT }>;

/** Pull the stored `total` out of the JSON amounts blob (never recomputed here). */
function totalFromAmounts(amounts: unknown): number {
  if (amounts && typeof amounts === "object" && "total" in amounts) {
    const total = (amounts as { total?: unknown }).total;
    if (typeof total === "number" && Number.isFinite(total)) return total;
  }
  return 0;
}

function toListRow(row: OrderListRecord): OrderListRow {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    email: row.email,
    status: row.status,
    paid: row.paid,
    paymentMethod: row.paymentMethod,
    paymentProvider: row.paymentProvider,
    currency: row.currency,
    total: totalFromAmounts(row.amounts),
    itemCount: row._count.items,
    createdAt: row.createdAt.toISOString(),
  };
}

function validation(detail: string): Result<never> {
  return { ok: false, status: 400, error: "validation", detail };
}

function mapError(e: unknown): Result<never> {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: false, status: 500, error: "database_error" };
}

/** Search by order number or email, filter by status, paginate. */
export async function listOrdersAdmin(options: {
  q?: string;
  status?: string;
  page?: number;
}): Promise<{ items: OrderListRow[]; total: number; page: number; totalPages: number }> {
  const q = (options.q ?? "").trim().slice(0, 100);
  const status = ORDER_STATUSES.includes(options.status as OrderStatus)
    ? (options.status as OrderStatus)
    : undefined;
  const page = Math.max(1, options.page ?? 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: LIST_SELECT,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: rows.map(toListRow),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

function toDetail(row: Prisma.OrderGetPayload<{ include: { items: true } }>): OrderDetail {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    email: row.email,
    status: row.status,
    paid: row.paid,
    paymentMethod: row.paymentMethod,
    paymentProvider: row.paymentProvider,
    currency: row.currency,
    total: totalFromAmounts(row.amounts),
    itemCount: row.items.length,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    address: row.address,
    amounts: row.amounts,
    razorpayOrderId: row.razorpayOrderId,
    razorpayPaymentId: row.razorpayPaymentId,
    paymentReference: row.paymentReference,
    items: row.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      image: item.image,
      unitPriceInr: item.unitPriceInr,
      compareAtInr: item.compareAtInr,
      qty: item.qty,
      personalization: item.personalization,
    })),
  };
}

/** Full order detail (including items) for the admin detail screen. */
export async function getOrderAdmin(id: string): Promise<Result<OrderDetail>> {
  if (!id.trim()) return { ok: false, status: 400, error: "invalid_body" };
  try {
    const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!row) return { ok: false, status: 404, error: "not_found" };
    return { ok: true, data: toDetail(row) };
  } catch (e) {
    return mapError(e) as Result<OrderDetail>;
  }
}

/**
 * Parse a status-update body. ONLY a `status` field is accepted; every other
 * key (paid, amounts, references, gateway ids…) is ignored outright.
 */
export function parseStatusUpdate(raw: unknown): Result<OrderStatus> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, status: 400, error: "invalid_body" };
  }
  const rawStatus = (raw as Record<string, unknown>).status;
  const status = typeof rawStatus === "string" ? rawStatus.trim().toUpperCase() : "";
  if (!ORDER_STATUSES.includes(status as OrderStatus))
    return validation("Status must be one of PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED.");
  return { ok: true, data: status as OrderStatus };
}

/**
 * Update ONLY the order status, and only along an allowed transition. Payment
 * fields are not part of the write payload at all.
 */
export async function updateOrderStatus(
  id: string,
  next: OrderStatus,
): Promise<Result<{ id: string; status: OrderStatus }>> {
  if (!id.trim()) return { ok: false, status: 400, error: "invalid_body" };
  try {
    const current = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!current) return { ok: false, status: 404, error: "not_found" };

    if (current.status === next)
      return validation(`This order is already ${next}.`);
    if (!ORDER_STATUS_TRANSITIONS[current.status].includes(next))
      return {
        ok: false,
        status: 409,
        error: "invalid_transition",
        detail: `An order that is ${current.status} cannot be moved to ${next}.`,
      };

    const updated = await prisma.order.update({
      where: { id },
      data: { status: next },
      select: { id: true, status: true },
    });
    return { ok: true, data: updated };
  } catch (e) {
    return mapError(e) as Result<{ id: string; status: OrderStatus }>;
  }
}
