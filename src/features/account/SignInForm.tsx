"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { authContent } from "@/config/auth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => void signIn("google", { callbackUrl })}
      className="flex w-full items-center justify-center gap-3 rounded-[14px] border border-line bg-white px-4 py-3 font-body text-[14px] font-semibold text-plum transition-all hover:border-brand hover:bg-section"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
        />
      </svg>
      {authContent.signIn.google}
    </button>
  );
}

export function SignInForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setError(authContent.errors.required);
      return;
    }
    setPending(true);
    setError("");
    const result = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });
    if (!result || result.error) {
      setPending(false);
      setError(authContent.errors.invalid);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-8">
      {googleEnabled ? (
        <div className="flex flex-col gap-5">
          <GoogleButton callbackUrl={callbackUrl} />
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-plum-muted">
              {authContent.signIn.divider}
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className={cn("flex flex-col gap-4", googleEnabled && "mt-6")}>
        <div>
          <label
            htmlFor="signin-email"
            className="mb-1.5 block font-body text-[12px] font-bold text-plum"
          >
            {authContent.signIn.emailLabel}
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={authContent.signIn.emailPlaceholder}
            className="w-full rounded-[14px] border border-line bg-white px-3.5 py-3 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="signin-password" className="font-body text-[12px] font-bold text-plum">
              {authContent.signIn.passwordLabel}
            </label>
            <span className="font-body text-[12px] font-semibold text-brand">
              {authContent.signIn.forgot}
            </span>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={authContent.signIn.passwordPlaceholder}
              className="w-full rounded-[14px] border border-line bg-white px-3.5 py-3 pr-11 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-[12px] bg-feedback-errorBg px-3.5 py-2.5 font-body text-[13px] font-semibold text-feedback-error">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending ? authContent.signIn.submitting : authContent.signIn.submit}
          {!pending ? <Icon name="arrow_forward" className="text-[20px]" /> : null}
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-2 text-center">
        <p className="font-body text-[13.5px] text-plum-muted">
          {authContent.signIn.noAccount}{" "}
          <Link href="/register" className="font-bold text-brand hover:text-brand-dark">
            {authContent.signIn.registerLink}
          </Link>
        </p>
        <Link
          href="/shop"
          className="font-body text-[13px] font-semibold text-plum-muted hover:text-brand"
        >
          {authContent.signIn.guest} →
        </Link>
      </div>
    </div>
  );
}
