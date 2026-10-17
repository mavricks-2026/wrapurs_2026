import Link from "next/link";
import Image from "next/image";
import { authContent } from "@/config/auth";
import { SignUpForm } from "@/features/account";
import { AnimatedText, Reveal } from "@/components/motion";

/** /register — new account (demo-only until the Prisma user model lands). */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl ?? "/account";

  return (
    <div className="bg-surface pb-16 pt-8 sm:pt-10">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <Reveal>
            <Link href="/" className="group mb-5 inline-flex items-center">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-brand py-2 pl-2 pr-5 shadow-soft transition-all duration-300 group-hover:bg-brand-dark">
                <Image
                  src="/images/logo/mark-white.png"
                  alt=""
                  width={507}
                  height={506}
                  className="h-10 w-auto object-contain"
                  priority
                />
                <Image
                  src="/images/logo/wordmark-white.png"
                  alt="WrapUrs"
                  width={897}
                  height={247}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </span>
            </Link>
          </Reveal>
          <AnimatedText
            as="h1"
            text={`${authContent.signUp.title} ${authContent.signUp.titleHighlight}`}
            highlight={authContent.signUp.titleHighlight}
            onView={false}
            className="font-display text-[32px] leading-tight text-plum sm:text-[38px]"
          />
          <Reveal delay={0.12}>
            <p className="mt-2 font-body text-[14.5px] text-plum-muted">
              {authContent.signUp.subtitle}
            </p>
          </Reveal>
        </div>

        <SignUpForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}