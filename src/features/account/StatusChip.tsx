import type { OrderStatus } from "@/features/orders/useOrderStore";
import { cn } from "@/lib/utils";

/** Visual tone for each order status. */
const TONES: Record<OrderStatus, string> = {
  placed: "bg-brand/10 text-brand-dark",
  processing: "bg-[#FFF3D6] text-[#9A6A00]",
  shipped: "bg-[#E4EEFF] text-[#2757A8]",
  delivered: "bg-[#E3F6EA] text-[#1B7A45]",
  cancelled: "bg-feedback-errorBg text-feedback-error",
};

const LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** StatusChip — small coloured pill used across the dashboard, orders + tracking. */
export function StatusChip({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider",
        TONES[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
