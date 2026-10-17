"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  checkoutContent,
  savedAddresses as defaultAddresses,
  type AddressType,
  type SavedAddress,
} from "@/config/checkout";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion";
import { animationConfig } from "@/config/motion";
import { cn } from "@/lib/utils";

type Draft = {
  fullName: string;
  mobile: string;
  pincode: string;
  city: string;
  line1: string;
  line2: string;
};

const EMPTY_DRAFT: Draft = {
  fullName: "",
  mobile: "",
  pincode: "",
  city: "",
  line1: "",
  line2: "",
};

/**
 * AddressSection — the saved-address radio list plus the collapsible
 * "Add a New Address" form. New addresses are held locally (the account's real
 * address book arrives in M7) and lifted to the parent on selection.
 */
export function AddressSection({
  selected,
  onSelect,
  addresses: controlledAddresses,
  onAdd,
}: {
  selected: SavedAddress | null;
  onSelect: (address: SavedAddress) => void;
  addresses?: SavedAddress[];
  onAdd?: (address: SavedAddress) => void;
}) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(controlledAddresses ?? defaultAddresses);
  useEffect(() => {
    if (controlledAddresses) setAddresses(controlledAddresses);
  }, [controlledAddresses]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [type, setType] = useState<AddressType>("HOME");
  const [error, setError] = useState("");

  function saveAddress() {
    if (!draft.fullName || !draft.mobile || !draft.pincode || !draft.city || !draft.line1) {
      setError("Please fill every required field (marked *).");
      return;
    }
    const address: SavedAddress = {
      id: `addr-${Date.now()}`,
      name: draft.fullName,
      mobile: draft.mobile,
      line1: draft.line1,
      line2: draft.line2 || undefined,
      city: draft.city,
      state: "Karnataka",
      pincode: draft.pincode,
      type,
    };
    setAddresses((list) => [...list, address]);
    onAdd?.(address);
    onSelect(address);
    setShowForm(false);
    setDraft(EMPTY_DRAFT);
    setError("");
  }

  return (
    <Reveal>
      <article className="rounded-[24px] border-2 border-brand bg-white p-5 shadow-soft md:p-7">
        <header className="flex items-center justify-between gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
              2
            </span>
            <h2 className="font-display text-[24px] leading-none text-plum">
              {checkoutContent.address.title}{" "}
              <span className="text-brand">{checkoutContent.address.titleHighlight}</span>
            </h2>
          </div>
          <span className="rounded-full border border-line bg-section px-2.5 py-1 font-body text-[11px] font-semibold text-brand-dark">
            {checkoutContent.address.step}
          </span>
        </header>

        <div className="mt-5 flex flex-col gap-4">
          {addresses.map((address) => {
            const isSelected = selected?.id === address.id;
            const fullLine = [address.line1, address.line2, address.city, address.state]
              .filter(Boolean)
              .join(", ");
            return (
              <label
                key={address.id}
                className={cn(
                  "relative block cursor-pointer rounded-[18px] border p-5 transition-all",
                  isSelected
                    ? "border-2 border-brand bg-section/60"
                    : "border-line bg-white hover:border-brand/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="address"
                    checked={isSelected}
                    onChange={() => onSelect(address)}
                    className="mt-1 h-5 w-5 accent-brand"
                  />
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-body text-[15px] font-bold text-plum">
                        {address.name}
                      </span>
                      <span className="inline-block rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-white">
                        {address.type}
                      </span>
                      <span className="font-body text-[12px] font-semibold text-plum-muted">
                        {address.mobile}
                      </span>
                    </div>
                    <p className="font-body text-[13px] leading-relaxed text-plum">
                      {fullLine} – {address.pincode}
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isSelected ? (
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
                      <div className="mt-4 border-t border-line pt-3 pl-8">
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[13px] font-bold text-white shadow-soft">
                          <Icon name="check_circle" className="text-[16px]" />
                          {checkoutContent.address.useAddress}
                        </span>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </label>
            );
          })}

          {/* Add a new address */}
          <div className="rounded-[18px] border border-line bg-white p-5">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              aria-expanded={showForm}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-section text-[16px] font-bold leading-none text-brand">
                  +
                </span>
                <span className="font-body text-[14px] font-semibold text-plum">
                  {checkoutContent.address.addNew}
                </span>
              </span>
              <Icon
                name="expand_more"
                className={cn(
                  "text-[22px] text-plum-muted transition-transform duration-200",
                  showForm && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {showForm ? (
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
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
                    {checkoutContent.addressFields.map((field) => (
                      <div key={field.name} className={field.span === 2 ? "sm:col-span-2" : ""}>
                        <label
                          htmlFor={`addr-${field.name}`}
                          className="mb-1 block font-body text-[12px] font-bold text-plum"
                        >
                          {field.label}
                          {field.required ? " *" : ""}
                        </label>
                        <input
                          id={`addr-${field.name}`}
                          value={draft[field.name as keyof Draft]}
                          inputMode={
                            "inputMode" in field && field.inputMode === "numeric"
                              ? "numeric"
                              : undefined
                          }
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [field.name]: e.target.value }))
                          }
                          className="w-full rounded-[14px] border border-line bg-white px-3.5 py-2.5 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    ))}

                    <div className="sm:col-span-2">
                      <span className="mb-2 block font-body text-[12px] font-bold text-plum">
                        {checkoutContent.address.typeLabel}
                      </span>
                      <div className="flex gap-3">
                        {(["HOME", "WORK"] as AddressType[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setType(option)}
                            className={cn(
                              "rounded-full px-4 py-1.5 font-body text-[12px] font-bold transition-colors",
                              type === option
                                ? "bg-brand text-white"
                                : "border border-line bg-section text-plum-muted hover:border-brand",
                            )}
                          >
                            {option === "HOME"
                              ? checkoutContent.address.typeHome
                              : checkoutContent.address.typeWork}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error ? (
                      <p className="font-body text-[12px] font-semibold text-brand-dark sm:col-span-2">
                        {error}
                      </p>
                    ) : null}

                    <div className="flex gap-3 pt-2 sm:col-span-2">
                      <button
                        type="button"
                        onClick={saveAddress}
                        className="rounded-full bg-brand px-6 py-2.5 font-mono uppercase tracking-[0.12em] text-[14px] font-bold text-white transition-colors hover:bg-brand-dark"
                      >
                        {checkoutContent.address.save}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setError("");
                        }}
                        className="rounded-full border border-line px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[12px] font-bold text-plum-muted transition-colors hover:bg-section"
                      >
                        {checkoutContent.address.cancel}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
