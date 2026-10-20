"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";

/**
 * OrderStatusPanel — the ONLY mutation on the admin order screen.
 *
 * It posts just `{ status }` to PATCH /api/admin/orders/[id]; the route
 * re-validates the ADMIN role and the transition server-side. Payment, totals
 * and gateway ids are never sent and cannot be changed here.
 *
 * `allowedTransitions` is passed from the server so the buttons reflect the
 * exact same allow-list the server enforces (the server remains authoritative).
 */

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "You are not authorized to update orders.",
  not_found: "That order no longer exists.",
  invalid_transition: "That status change is not allowed.",
  validation: "That status change is not valid.",
  database_error: "The database could not complete the request. Try again.",
  invalid_body: "The request was not understood.",
};

export function OrderStatusPanel({
  orderId,
  currentStatus,
  allowedTransitions,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  allowedTransitions: OrderStatus[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(status: OrderStatus) {
    setBusy(status);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          payload.detail ??
            ERROR_MESSAGES[payload.error as string] ??
            "Something went wrong. Try again.",
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-[20px] border border-line bg-white p-5 shadow-soft">
      <h2 className="font-display text-[19px] text-plum">Update status</h2>
      <p className="mt-1 text-[13px] text-plum-muted">
        Current status: <span className="font-semibold text-plum">{currentStatus}</span>
      </p>

      {allowedTransitions.length === 0 ? (
        <p className="mt-3 rounded-[12px] bg-section px-3 py-2 text-[13px] font-semibold text-plum-muted">
          {currentStatus} is a final state — no further status changes are possible.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {allowedTransitions.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy !== null}
              onClick={() => void update(status)}
              className="rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy === status ? "Updating…" : `Mark ${status}`}
            </button>
          ))}
        </div>
      )}

      {error ? <p className="mt-3 text-[13px] font-semibold text-red-600">{error}</p> : null}
    </section>
  );
}
