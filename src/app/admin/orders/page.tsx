import type { Metadata } from "next";
import Link from "next/link";
import { ORDER_STATUSES, listOrdersAdmin } from "@/services/order-admin.service";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Orders" };

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

function pageHref(params: { q: string; status: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/orders${qs ? `?${qs}` : ""}`;
}

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Admin orders screen — server-rendered list with search, status filter, pagination. */
export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = ORDER_STATUSES.includes(sp.status as never) ? (sp.status as string) : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const { items, total, totalPages } = await listOrdersAdmin({ q, status, page });
  const filter = { q, status, page };

  return (
    <div>
      <h1 className="font-display text-[32px] text-plum">Orders</h1>
      <p className="mt-1 text-[15px] text-plum-muted">
        {total} order{total === 1 ? "" : "s"} in the database. Update fulfilment status from an
        order&apos;s detail page — payment and totals are read-only and can never be edited here.
      </p>

      <form method="get" action="/admin/orders" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Order number or email"
            className="w-64 rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Status
          <select
            name="status"
            defaultValue={status}
            className="rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full border border-line bg-white px-5 py-2 text-[13.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
        >
          Filter
        </button>
        {q || status ? (
          <Link
            href="/admin/orders"
            className="px-1 text-[13px] font-semibold text-plum-muted underline hover:text-brand"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mt-6 overflow-x-auto rounded-[20px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[860px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-section/60 text-[12px] uppercase tracking-wide text-plum-muted">
              <th className="px-4 py-3 font-bold">Order</th>
              <th className="px-4 py-3 font-bold">Customer</th>
              <th className="px-4 py-3 font-bold">Placed</th>
              <th className="px-4 py-3 font-bold">Items</th>
              <th className="px-4 py-3 font-bold">Total</th>
              <th className="px-4 py-3 font-bold">Payment</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-plum-muted">
                  No orders found.
                </td>
              </tr>
            ) : (
              items.map((order) => (
                <tr key={order.id} className="border-b border-line/60 last:border-b-0">
                  <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-plum">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-plum-muted">{order.email}</td>
                  <td className="px-4 py-3 text-plum-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-plum-muted">{order.itemCount}</td>
                  <td className="px-4 py-3 font-semibold text-plum">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3 text-plum-muted">
                    {order.paymentMethod}
                    <span
                      className={
                        order.paid
                          ? "ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-green-700"
                          : "ml-2 rounded-full bg-section px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-plum-muted"
                      }
                    >
                      {order.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        STATUS_STYLES[order.status] ?? "bg-section text-plum-muted"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-full border border-line px-3.5 py-1.5 text-[12.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center gap-3 text-[13.5px] font-semibold">
          {page > 1 ? (
            <Link href={pageHref({ ...filter, page: page - 1 })} className="text-brand hover:underline">
              ← Previous
            </Link>
          ) : null}
          <span className="text-plum-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref({ ...filter, page: page + 1 })} className="text-brand hover:underline">
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
