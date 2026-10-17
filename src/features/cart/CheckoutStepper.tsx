"use client";

import { Fragment } from "react";
import { checkoutSteps } from "@/config/nav";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * CheckoutStepper — the Cart → Address → Payment progress indicator.
 * `markCurrentDone` renders a tick for the active step (as on the cart page);
 * otherwise the step number is shown (as on the empty-cart page).
 */
export function CheckoutStepper({
  current = 1,
  markCurrentDone = true,
}: {
  current?: number;
  markCurrentDone?: boolean;
}) {
  return (
    <nav
      aria-label="Checkout progress"
      className="flex w-full max-w-lg items-center justify-center gap-2 pt-1 sm:gap-4"
    >
      {checkoutSteps.map((step, i) => {
        const index = i + 1;
        const isCurrent = index === current;
        const showTick = index < current || (isCurrent && markCurrentDone);
        return (
          <Fragment key={step.label}>
            {i > 0 ? (
              <span
                className={cn(
                  "h-0 w-8 border-t-2 border-dashed sm:w-16",
                  isCurrent || index < current ? "border-brand/40" : "border-brand/20",
                )}
              />
            ) : null}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full font-body text-[13px] font-bold",
                  isCurrent ? "bg-brand text-white shadow-soft" : "bg-section text-plum-muted",
                )}
              >
                {showTick ? <Icon name="check" className="text-[15px]" /> : index}
              </span>
              <span
                className={cn(
                  "font-body text-[13px]",
                  isCurrent ? "font-bold text-brand" : "font-semibold text-plum-muted",
                )}
              >
                {step.label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </nav>
  );
}
