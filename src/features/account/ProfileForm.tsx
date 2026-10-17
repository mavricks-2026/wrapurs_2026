"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { accountContent } from "@/config/auth";
import { AnimatedText, Reveal } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { resolveProfile, useAccountStore } from "@/features/account/useAccountStore";
import { useMounted } from "@/hooks/useMounted";

/** ProfileForm — editable name / phone with the sign-in email locked. */
export function ProfileForm() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const mounted = useMounted();

  const profile = useAccountStore((s) => resolveProfile(s, email));
  const setProfile = useAccountStore((s) => s.setProfile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync the fields once the session + persisted profile have hydrated.
  useEffect(() => {
    if (!mounted) return;
    setName((current) => current || profile.name || session?.user?.name || "");
    setPhone((current) => current || profile.phone || session?.user?.phone || "");
  }, [mounted, profile.name, profile.phone, session?.user?.name, session?.user?.phone]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setProfile(email, { name: name.trim(), phone: phone.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  const fieldClass =
    "w-full rounded-[14px] border border-line bg-white px-3.5 py-3 font-body text-[14px] text-plum outline-none transition-all placeholder:text-plum-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/20";
  const labelClass = "mb-1.5 block font-body text-[12px] font-bold text-plum";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AnimatedText
          as="h1"
          text={accountContent.profile.title}
          highlight={accountContent.profile.highlight}
          onView={false}
          className="font-display text-[30px] leading-tight text-plum sm:text-[36px]"
        />
        <Reveal delay={0.12}>
          <p className="mt-2 font-body text-[14.5px] text-plum-muted">
            {accountContent.profile.subtitle}
          </p>
        </Reveal>
      </header>

      <Reveal>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-7"
        >
          <div>
            <label htmlFor="profile-name" className={labelClass}>
              {accountContent.profile.nameLabel}
            </label>
            <input
              id="profile-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className={labelClass}>
              {accountContent.profile.emailLabel}
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
              className={`${fieldClass} cursor-not-allowed bg-surface text-plum-muted`}
            />
            <p className="mt-1.5 font-body text-[12px] text-plum-muted">
              {accountContent.profile.emailNote}
            </p>
          </div>

          <div>
            <label htmlFor="profile-phone" className={labelClass}>
              {accountContent.profile.phoneLabel}
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="mt-1 flex items-center gap-4">
            <Button type="submit" size="lg">
              <Icon name="save" className="text-[20px]" />
              {accountContent.profile.save}
            </Button>
            {saved ? (
              <span className="inline-flex items-center gap-1.5 font-body text-[13px] font-semibold text-feedback-success">
                <Icon name="check_circle" className="text-[18px]" />
                {accountContent.profile.saved}
              </span>
            ) : null}
          </div>
        </form>
      </Reveal>
    </div>
  );
}
