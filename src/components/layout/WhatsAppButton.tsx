import Link from "next/link";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

/** Floating WhatsApp concierge button (bottom-right, as in the design). */
export function WhatsAppButton() {
  return (
    <a
      href={site.contact.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-glow transition-all duration-300 hover:scale-105 hover:bg-brand-dark"
    >
      <WhatsAppIcon className="h-[30px] w-[30px]" />
    </a>
  );
}

/** Small helper used by breadcrumbs / page headers. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-body text-[14px] text-plum-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span className="text-plum">{item.label}</span>
            )}
            {i < items.length - 1 ? (
              <Icon name="chevron_right" className="text-[16px] text-line" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
