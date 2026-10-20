import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ORDER_STATUS_TRANSITIONS,
  getOrderAdmin,
  type OrderDetail,
} from "@/services/order-admin.service";
import { formatPrice } from "@/lib/utils";
import { OrderStatusPanel } from "./OrderStatusPanel";

export const metadata: Metadata = { title: "Admin · Order" };

type AddressShape = {
  name?: string;
  mobile?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  type?: string;
};

type AmountsShape = {
  mrp?: number;
  discount?: number;
  coupon?: number;
  couponCode?: string | null;
  delivery?: number;
  codFee?: number;
  total?: number;
};

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

function money(value: number | undefined, currency: string) {
  if (typeof value !== "number") return "—";
  return currency === "INR" ? formatPrice(value) : `${currency} ${value}`;
}

/** Admin order detail — read-only order/payment data + a status-only update panel. */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrderAdmin(id);
  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <div className="rounded-[20px] border border-line bg-white p-6 text-plum-muted shadow-soft">
        This order could not be loaded right now. Please try again.
      </div>
    );
  }

  const order: OrderDetail = result.data;
  const address = (order.address ?? {}) as AddressShape;
  const amounts = (order.amounts ?? {}) as AmountsShape;
  const currency = order.currency;
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];

  const addressLines = [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pincode,
  ].filter(Boolean) as string[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-[13px] font-semibold text-brand hover:underline">
            ← Back to orders
          </Link>
          <h1 className="mt-1 font-mono text-[26px] font-bold text-plum">{order.orderNumber}</h1>
          <p className="text-[13.5px] text-plum-muted">
            Placed {formatDate(order.createdAt)} · Last updated {formatDate(order.updatedAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wide ${
            STATUS_STYLES[order.status] ?? "bg-section text-plum-muted"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Left: items + amounts */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-[20px] border border-line bg-white p-5 shadow-soft">
            <h2 className="font-display text-[19px] text-plum">Items</h2>
            <div className="mt-3 divide-y divide-line/60">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold text-plum">{item.title}</p>
                    <p className="font-mono text-[12px] text-plum-muted">
                      {item.slug} · Qty {item.qty}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-plum">
                    {money(item.unitPriceInr * item.qty, currency)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-line bg-white p-5 shadow-soft">
            <h2 className="font-display text-[19px] text-plum">Payment breakdown</h2>
            <dl className="mt-3 space-y-1.5 text-[14px]">
              <Row label="Total MRP" value={money(amounts.mrp, currency)} />
              <Row label="Product discount" value={`− ${money(amounts.discount, currency)}`} />
              <Row
                label={`Coupon${amounts.couponCode ? ` (${amounts.couponCode})` : ""}`}
                value={`− ${money(amounts.coupon, currency)}`}
              />
              <Row label="Delivery" value={money(amounts.delivery, currency)} />
              <Row label="COD fee" value={money(amounts.codFee, currency)} />
              <div className="flex items-center justify-between border-t border-line pt-2 font-extrabold text-plum">
                <span>Total</span>
                <span>{money(amounts.total, currency)}</span>
              </div>
            </dl>
          </section>
        </div>

        {/* Right: customer, payment + status control */}
        <div className="flex flex-col gap-5">
          <section className="rounded-[20px] border border-line bg-white p-5 shadow-soft">
            <h2 className="font-display text-[19px] text-plum">Customer</h2>
            <p className="mt-2 text-[14px] text-plum">{order.email}</p>
            <div className="mt-3 text-[13.5px] leading-relaxed text-plum-muted">
              {address.name ? <p className="font-semibold text-plum">{address.name}</p> : null}
              {address.mobile ? <p>{address.mobile}</p> : null}
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {address.type ? (
                <p className="mt-1 text-[12px] uppercase tracking-wide">{address.type}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[20px] border border-line bg-white p-5 shadow-soft">
            <h2 className="font-display text-[19px] text-plum">Payment</h2>
            <dl className="mt-2 space-y-1.5 text-[13.5px]">
              <Row label="Method" value={`${order.paymentMethod} (${order.paymentProvider})`} />
              <Row label="Paid" value={order.paid ? "Yes" : "No"} />
              <Row
                label="Gateway order"
                value={
                  <span className="font-mono text-[12px] text-plum-muted">
                    {order.razorpayOrderId ?? "—"}
                  </span>
                }
              />
              <Row
                label="Payment id"
                value={
                  <span className="font-mono text-[12px] text-plum-muted">
                    {order.razorpayPaymentId ?? "—"}
                  </span>
                }
              />
            </dl>
            <p className="mt-3 text-[12px] text-plum-muted">
              Payment fields and totals are read-only. They can only be changed by the payment
              flow, never from this screen.
            </p>
          </section>

          <OrderStatusPanel
            orderId={order.id}
            currentStatus={order.status}
            allowedTransitions={allowedTransitions}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-plum-muted">{label}</dt>
      <dd className="text-right font-semibold text-plum">{value}</dd>
    </div>
  );
}
