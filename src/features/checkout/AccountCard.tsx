"use client";

import { checkoutContent } from "@/config/checkout";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion";

/**
 * AccountCard — the collapsed "1. LOGIN / ACCOUNT" row at the top of the form.
 * Shows the signed-in account (or the demo account for guests).
 */
export function AccountCard({
  signedIn,
  name,
  email,
  mobile,
}: {
  signedIn: boolean;
  name: string;
  email: string;
  mobile: string;
}) {
  return (
    <Reveal>
      <article className="flex items-center justify-between rounded-[24px] border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
            1
          </span>
          <div className="flex flex-col">
            <h2 className="font-mono text-[13px] font-bold uppercase tracking-wider text-plum">
              {checkoutContent.account.step}
            </h2>
            <p className="font-body text-[14px] text-plum-muted">
              <span className="font-semibold text-plum">{name}</span>
              <span className="mx-1.5">•</span>
              {signedIn ? email : mobile}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 rounded-[12px] px-3 py-1.5 font-body text-[14px] font-bold text-brand transition-colors hover:bg-section"
          onClick={() => (window.location.href = signedIn ? "/account" : "/login")}
        >
          <Icon name="person" className="text-[16px]" />
          {signedIn ? "Manage" : checkoutContent.account.change}
        </button>
      </article>
    </Reveal>
  );
}
