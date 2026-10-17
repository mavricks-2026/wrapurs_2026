"use client";

import { shopSupportCta } from "@/config/catalog";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Reveal } from "@/components/motion";

/** SupportCta — "Can't find what you need?" banner with a WhatsApp CTA. */
export function SupportCta() {
  return (
    <section className="pb-16 pt-4">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-[24px] bg-section px-6 py-8 text-center sm:flex-row sm:px-10 sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-soft">
                <Icon name="support_agent" className="text-[28px]" />
              </span>
              <div>
                <h2 className="font-display text-[24px] leading-tight text-plum">
                  {shopSupportCta.title}
                </h2>
                <p className="mt-1 max-w-xl font-body text-[14px] leading-relaxed text-plum-muted">
                  {shopSupportCta.subtitle}
                </p>
              </div>
            </div>

            <a
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-3 font-mono uppercase tracking-[0.12em] text-[14px] font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              {shopSupportCta.cta}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
