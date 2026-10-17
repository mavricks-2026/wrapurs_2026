"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PaymentMethod, PaymentMethodId } from "@/config/payments";
import { paymentsContent } from "@/config/payments";
import { demoAccount } from "@/config/checkout";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion";
import { animationConfig } from "@/config/motion";
import { cn, formatPrice } from "@/lib/utils";

/**
 * PaymentSection — "4. Select Payment". Renders every enabled gateway method
 * (UPI / Card / Net Banking via Razorpay, plus Cash on Delivery), the inline
 * UPI VPA verification, the demo-mode notice and the pay button.
 */
export function PaymentSection({
  methods,
  selected,
  onSelect,
  upiId,
  onUpiIdChange,
  upiVerified,
  onVerifyUpi,
  total,
  placing,
  error,
  demoPayments,
  onPay,
}: {
  methods: PaymentMethod[];
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  upiId: string;
  onUpiIdChange: (value: string) => void;
  upiVerified: boolean;
  onVerifyUpi: () => void;
  total: number;
  placing: boolean;
  error: string | null;
  demoPayments: boolean;
  onPay: () => void;
}) {
  const selectedMethod = methods.find((m) => m.id === selected);
  const isCod = selectedMethod?.provider === "cod";
  const isRazorpay = selectedMethod?.provider === "razorpay";

  const payLabel = isCod
    ? paymentsContent.codCtaTemplate.replace("{amount}", formatPrice(total))
    : paymentsContent.payCtaTemplate.replace("{amount}", formatPrice(total));

  return (
    <Reveal>
      <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft md:p-6">
        <header className="flex items-center gap-3 border-b border-line pb-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
            4
          </span>
          <h2 className="font-display text-[26px] leading-none text-plum">
            {paymentsContent.title}{" "}
            <span className="text-brand">{paymentsContent.titleHighlight}</span>
          </h2>
        </header>

        <div className="mt-5 flex flex-col gap-4">
          {methods.map((method) => {
            const isActive = method.id === selected;
            return (
              <div
                key={method.id}
                className={cn(
                  "rounded-[18px] border transition-colors",
                  isActive ? "border-2 border-brand bg-section/50" : "border-line bg-white",
                )}
              >
                <label className="flex cursor-pointer items-center justify-between gap-3 p-5">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={isActive}
                      onChange={() => onSelect(method.id)}
                      className="h-5 w-5 accent-brand"
                    />
                    <span className="flex items-center gap-2.5 font-body text-[15px] font-bold text-plum">
                      <Icon name={method.icon} filled={isActive} className="text-[20px] text-brand" />
                      {method.label}
                    </span>
                  </span>
                  {method.tag ? (
                    <span className="rounded-md border border-line bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand">
                      {method.tag}
                    </span>
                  ) : null}
                </label>

                <AnimatePresence initial={false}>
                  {isActive ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: animationConfig.duration.fast,
                        ease: animationConfig.ease.out,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3 px-5 pb-5 pl-16">
                        {method.upi ? (
                          <>
                            <p className="font-body text-[12px] text-plum-muted">
                              {method.upi.prompt}
                            </p>
                            <div className="flex max-w-md gap-2">
                              <input
                                id="checkout-upi"
                                name="upi"
                                type="text"
                                value={upiId}
                                onChange={(e) => onUpiIdChange(e.target.value)}
                                placeholder={method.upi.placeholder}
                                aria-label="UPI ID or VPA"
                                className="flex-1 rounded-[14px] border border-line bg-white px-3.5 py-2 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                              />
                              <button
                                type="button"
                                onClick={onVerifyUpi}
                                className="rounded-full bg-brand px-4 py-2 font-mono uppercase tracking-[0.12em] text-[12px] font-bold text-white transition-colors hover:bg-brand-dark"
                              >
                                {method.upi.verifyLabel}
                              </button>
                            </div>
                            {upiVerified ? (
                              <p className="flex items-center gap-1.5 font-body text-[12px] font-semibold text-brand-dark">
                                <Icon name="check_circle" filled className="text-[16px]" />
                                {method.upi.verifiedTemplate.replace("{name}", demoAccount.name)}
                              </p>
                            ) : null}
                          </>
                        ) : null}

                        {method.banks ? (
                          <div className="hidden gap-1.5 font-body text-[11px] font-bold text-plum-muted sm:flex">
                            {method.banks.map((bank) => (
                              <span key={bank} className="rounded bg-section px-2 py-0.5">
                                {bank}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {method.description && !method.upi ? (
                          <p className="font-body text-[12px] font-medium text-plum-muted">
                            {method.description}
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border-t border-line pt-5">
          {demoPayments && isRazorpay ? (
            <p className="mb-3 flex items-start gap-2 font-body text-[12px] text-plum-muted">
              <Icon name="info" className="mt-0.5 shrink-0 text-[16px] text-brand" />
              {paymentsContent.mockNotice}
            </p>
          ) : null}

          {error ? (
            <p className="mb-3 flex items-center gap-2 rounded-[12px] bg-feedback-errorBg px-3 py-2 font-body text-[13px] font-semibold text-feedback-error">
              <Icon name="error" filled className="text-[18px]" />
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onPay}
            disabled={placing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 font-mono uppercase tracking-[0.12em] text-[17px] font-bold text-white shadow-glow transition-all hover:bg-brand-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? (
              <>
                <Icon name="progress_activity" className="animate-spin text-[20px]" />
                {paymentsContent.processingLabel}
              </>
            ) : (
              <>
                <Icon name="lock" filled className="text-[20px]" />
                {payLabel}
              </>
            )}
          </button>

          <p className="mt-3 text-center font-body text-[12px] text-plum-muted">
            {paymentsContent.terms}
          </p>
        </div>
      </article>

      <div className="py-2 text-center font-body text-[12px] text-plum-muted">
        {paymentsContent.helpTitle}{" "}
        <a
          href={site.contact.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand hover:underline"
        >
          {paymentsContent.helpLink} →
        </a>
      </div>
    </Reveal>
  );
}
