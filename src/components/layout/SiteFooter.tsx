import Image from "next/image";
import Link from "next/link";
import { footer } from "@/config/content";
import { footerNav } from "@/config/nav";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-brand-dark bg-brand-dark text-surface">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-surface/20 pb-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5 lg:pr-8">
            <div className="mb-4 flex items-center gap-2.5">
              <Image
                src="/images/logo/mark-white.png"
                alt=""
                width={507}
                height={506}
                className="h-9 w-auto object-contain"
              />
              <Image
                src="/images/logo/wordmark-white.png"
                alt={site.name}
                width={897}
                height={247}
                className="h-5 w-auto object-contain"
              />
            </div>
            <p className="mb-5 max-w-sm font-body text-[15px] leading-relaxed text-surface/90">
              {footer.blurb}
            </p>
            <div className="space-y-2 font-body text-[14px] text-surface/85">
              <div className="flex items-center gap-2.5">
                <Icon name="mail" className="text-[18px] text-section" />
                <a href={`mailto:${site.contact.email}`} className="transition-colors hover:text-white">
                  {site.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="h-[18px] w-[18px] text-section" />
                <a
                  href={site.contact.whatsappLink}
                  className="transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Concierge: {site.contact.whatsapp}
                </a>
              </div>
            </div>
          </div>

          {/* Footer nav columns */}
          {footerNav.map((group, idx) => (
            <div key={group.title} className={idx === 1 ? "lg:col-span-3" : "lg:col-span-2"}>
              <h4 className="mb-4 font-display text-[22px] tracking-wide text-white">
                {group.title}
              </h4>
              <ul className="space-y-2.5 font-body text-[15px]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-surface/80 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social + payments */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 font-display text-[22px] tracking-wide text-white">
              {footer.socialTitle}
            </h4>
            <div className="mb-6 flex items-center gap-3">
              {site.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <Icon name={s.icon} className="text-[20px]" />
                </a>
              ))}
            </div>
            <h5 className="mb-2 text-[13px] font-semibold text-white/90">{footer.paymentsTitle}</h5>
            <div className="flex flex-wrap items-center gap-2">
              {site.payments.map((p) => (
                <span
                  key={p}
                  className="rounded-[6px] bg-white/15 px-2 py-1 text-[11px] font-bold tracking-wider text-white"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 font-body text-[14px] text-surface/75 sm:flex-row">
          <span>{footer.copyright}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-surface/85">
            <Icon name="verified_user" className="text-[16px]" />
            {footer.badge}
          </span>
        </div>
      </Container>
    </footer>
  );
}
