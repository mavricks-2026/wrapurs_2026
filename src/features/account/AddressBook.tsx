"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { accountContent } from "@/config/auth";
import { checkoutContent, type AddressType, type SavedAddress } from "@/config/checkout";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";
import { resolveAddresses, useAccountStore } from "@/features/account/useAccountStore";

type Draft = {
  fullName: string;
  mobile: string;
  pincode: string;
  city: string;
  line1: string;
  line2: string;
};

const EMPTY_DRAFT: Draft = { fullName: "", mobile: "", pincode: "", city: "", line1: "", line2: "" };

const fieldClass =
  "w-full rounded-[14px] border border-line bg-white px-3.5 py-2.5 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "mb-1 block font-body text-[12px] font-bold text-plum";

/** AddressBook — the account's saved addresses with add / edit / remove / set-default. */
export function AddressBook() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const mounted = useMounted();

  const addresses = useAccountStore((s) => resolveAddresses(s, email));
  const addAddress = useAccountStore((s) => s.addAddress);
  const updateAddress = useAccountStore((s) => s.updateAddress);
  const removeAddress = useAccountStore((s) => s.removeAddress);
  const setDefaultAddress = useAccountStore((s) => s.setDefaultAddress);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [type, setType] = useState<AddressType>("HOME");
  const [error, setError] = useState("");

  // Prefill mobile from the session profile the first time the form opens.
  useEffect(() => {
    if ((showForm || editingId) && !draft.mobile) {
      setDraft((d) => ({ ...d, mobile: d.mobile || (session?.user?.phone ?? "") }));
    }
  }, [showForm, editingId, draft.mobile, session?.user?.phone]);

  function resetForm() {
    setDraft(EMPTY_DRAFT);
    setType("HOME");
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function startEdit(address: SavedAddress) {
    setEditingId(address.id);
    setShowForm(true);
    setType(address.type);
    setDraft({
      fullName: address.name,
      mobile: address.mobile,
      pincode: address.pincode,
      city: address.city,
      line1: address.line1,
      line2: address.line2 ?? "",
    });
    setError("");
  }

  function save() {
    if (!draft.fullName || !draft.mobile || !draft.pincode || !draft.city || !draft.line1) {
      setError("Please fill every required field (marked *).");
      return;
    }
    if (editingId) {
      updateAddress(email, editingId, {
        name: draft.fullName,
        mobile: draft.mobile,
        line1: draft.line1,
        line2: draft.line2 || undefined,
        city: draft.city,
        pincode: draft.pincode,
        type,
      });
    } else {
      addAddress(email, {
        id: `addr-${Date.now()}`,
        name: draft.fullName,
        mobile: draft.mobile,
        line1: draft.line1,
        line2: draft.line2 || undefined,
        city: draft.city,
        state: "Karnataka",
        pincode: draft.pincode,
        type,
      });
    }
    resetForm();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <AnimatedText
            as="h1"
            text={accountContent.addresses.title}
            highlight={accountContent.addresses.highlight}
            onView={false}
            className="font-display text-[30px] leading-tight text-plum sm:text-[36px]"
          />
          <Reveal delay={0.12}>
            <p className="mt-2 font-body text-[14.5px] text-plum-muted">
              {accountContent.addresses.subtitle}
            </p>
          </Reveal>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[14px] font-bold text-white transition-colors hover:bg-brand-dark"
          >
            <Icon name="add" className="text-[20px]" />
            {accountContent.addresses.addNew}
          </button>
        ) : null}
      </header>

      {/* Form */}
      {showForm ? (
        <Reveal>
          <section className="rounded-[24px] border-2 border-brand bg-white p-6 shadow-soft sm:p-7">
            <h2 className="font-display text-[22px] text-plum">
              {editingId ? accountContent.addresses.formTitleEdit : accountContent.addresses.formTitleAdd}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {checkoutContent.addressFields.map((field) => (
                <div key={field.name} className={field.span === 2 ? "sm:col-span-2" : ""}>
                  <label htmlFor={`book-${field.name}`} className={labelClass}>
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                  <input
                    id={`book-${field.name}`}
                    name={field.name}
                    value={draft[field.name as keyof Draft]}
                    inputMode={
                      "inputMode" in field && field.inputMode === "numeric" ? "numeric" : undefined
                    }
                    onChange={(e) => setDraft((d) => ({ ...d, [field.name]: e.target.value }))}
                    className={fieldClass}
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
                <p className="font-body text-[12px] font-semibold text-feedback-error sm:col-span-2">
                  {error}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={save}
                  className="rounded-full bg-brand px-6 py-2.5 font-mono uppercase tracking-[0.12em] text-[14px] font-bold text-white transition-colors hover:bg-brand-dark"
                >
                  {accountContent.addresses.save}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-line px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[12px] font-bold text-plum-muted transition-colors hover:bg-section"
                >
                  {accountContent.addresses.cancel}
                </button>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* List */}
      {!mounted ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-[22px] bg-white shadow-soft" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Reveal>
          <div className="rounded-[24px] border border-dashed border-line bg-white px-6 py-16 text-center shadow-soft">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-section text-brand">
              <Icon name="location_on" className="text-[32px]" />
            </span>
            <p className="mt-4 font-body text-[15px] text-plum-muted">
              {accountContent.addresses.empty}
            </p>
          </div>
        </Reveal>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address, index) => {
            const fullLine = [address.line1, address.line2, address.city, address.state]
              .filter(Boolean)
              .join(", ");
            const isDefault = index === 0;
            return (
              <StaggerItem key={address.id}>
                <article className="flex h-full flex-col rounded-[22px] border border-line bg-white p-5 shadow-soft">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-body text-[15px] font-bold text-plum">
                      {address.name}
                    </span>
                    <span className="inline-block rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {address.type}
                    </span>
                    {isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-section px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-brand-dark">
                        <Icon name="star" className="text-[12px]" />
                        {accountContent.addresses.default}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-body text-[13px] leading-relaxed text-plum">
                    {fullLine} – {address.pincode}
                  </p>
                  <p className="mt-1 font-body text-[12.5px] text-plum-muted">{address.mobile}</p>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => startEdit(address)}
                      className="inline-flex items-center gap-1 font-body text-[13px] font-bold text-brand hover:text-brand-dark"
                    >
                      <Icon name="edit" className="text-[16px]" />
                      {accountContent.addresses.edit}
                    </button>
                    {!isDefault ? (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(email, address.id)}
                        className="inline-flex items-center gap-1 font-body text-[13px] font-semibold text-plum-muted hover:text-brand"
                      >
                        <Icon name="star" className="text-[16px]" />
                        {accountContent.addresses.setDefault}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeAddress(email, address.id)}
                      className="ml-auto inline-flex items-center gap-1 font-body text-[13px] font-semibold text-plum-muted hover:text-feedback-error"
                    >
                      <Icon name="delete" className="text-[16px]" />
                      {accountContent.addresses.remove}
                    </button>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </div>
  );
}
