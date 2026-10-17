"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { authContent } from "@/config/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function SignUpForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError(authContent.errors.required);
      return;
    }
    if (password.length < 8) {
      setError(authContent.errors.weak);
      return;
    }
    if (password !== confirm) {
      setError(authContent.errors.mismatch);
      return;
    }

    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        setError(
          data.error === "exists"
            ? authContent.errors.exists
            : data.error === "weak_password"
              ? authContent.errors.weak
              : data.error === "invalid_email"
                ? authContent.errors.invalidEmail
                : authContent.errors.network,
        );
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        setPending(false);
        router.push("/login");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setPending(false);
      setError(authContent.errors.network);
    }
  }

  const field =
    "w-full rounded-[14px] border border-line bg-white px-3.5 py-3 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20";
  const label = "mb-1.5 block font-body text-[12px] font-bold text-plum";

  return (
    <div className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="signup-name" className={label}>
            {authContent.signUp.nameLabel}
          </label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={authContent.signUp.namePlaceholder}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="signup-phone" className={label}>
            {authContent.signUp.phoneLabel}
          </label>
          <input
            id="signup-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={authContent.signUp.phonePlaceholder}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="signup-email" className={label}>
            {authContent.signUp.emailLabel}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={authContent.signUp.emailPlaceholder}
            className={field}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-password" className={label}>
              {authContent.signUp.passwordLabel}
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={authContent.signUp.passwordPlaceholder}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm" className={label}>
              {authContent.signUp.confirmLabel}
            </label>
            <input
              id="signup-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={authContent.signUp.confirmPlaceholder}
              className={field}
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-[12px] bg-feedback-errorBg px-3.5 py-2.5 font-body text-[13px] font-semibold text-feedback-error">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending ? authContent.signUp.submitting : authContent.signUp.submit}
          {!pending ? <Icon name="person_add" className="text-[20px]" /> : null}
        </Button>

        <p className="font-body text-[12px] leading-relaxed text-plum-muted">
          {authContent.signUp.terms}
        </p>
      </form>

      <div className="mt-5 text-center font-body text-[13.5px] text-plum-muted">
        {authContent.signUp.hasAccount}{" "}
        <Link href="/login" className="font-bold text-brand hover:text-brand-dark">
          {authContent.signUp.signInLink}
        </Link>
      </div>
    </div>
  );
}
