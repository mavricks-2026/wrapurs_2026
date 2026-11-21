import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { MotionProvider } from "@/components/motion";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getSiteSettings } from "@/services/settings.service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/features/cart";

// Editorial type system — see src/config/theme.ts for how the utilities map to these.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "personalized gifts",
    "custom photo lamp",
    "engraved gifts India",
    "handcrafted keepsakes",
    "photo frame gift",
    "WrapUrs",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#B96CB4",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const { theme, announcement } = settings;

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <style
          id="wrapurs-dynamic-theme"
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-brand: ${theme.brandColor};
                --color-brand-dark: ${theme.brandDarkColor};
                --color-surface: ${theme.surfaceBg};
                --color-section: ${theme.sectionBg};
              }
              .bg-brand { background-color: ${theme.brandColor} !important; }
              .text-brand { color: ${theme.brandColor} !important; }
              .border-brand { border-color: ${theme.brandColor} !important; }
              .ring-brand { --tw-ring-color: ${theme.brandColor} !important; }
              .bg-surface { background-color: ${theme.surfaceBg} !important; }
              .bg-section { background-color: ${theme.sectionBg} !important; }
            `,
          }}
        />
      </head>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <AuthProvider>
          <MotionProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[14px] focus:bg-brand focus:px-4 focus:py-2 focus:font-mono uppercase tracking-[0.12em] focus:text-white"
            >
              Skip to content
            </a>
            <SiteHeader announcement={announcement} />
            <main id="main">{children}</main>
            <SiteFooter />
            <WhatsAppButton />
            <CartDrawer />
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
