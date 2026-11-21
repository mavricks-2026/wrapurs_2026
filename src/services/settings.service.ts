import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { hero } from "@/config/content";
import { colors } from "@/config/theme";
import { site } from "@/config/site";

export type SiteSettings = {
  theme: {
    brandColor: string;
    brandDarkColor: string;
    surfaceBg: string;
    sectionBg: string;
  };
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    imageUrl: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    hours: string;
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  theme: {
    brandColor: colors.brand,
    brandDarkColor: colors.brandDark,
    surfaceBg: colors.surfaceBg,
    sectionBg: colors.sectionBg,
  },
  hero: {
    title: hero.title,
    highlight: hero.highlight,
    subtitle: hero.subtitle,
    primaryCtaLabel: hero.primaryCta.label,
    primaryCtaHref: hero.primaryCta.href,
    secondaryCtaLabel: hero.secondaryCta.label,
    secondaryCtaHref: hero.secondaryCta.href,
    imageUrl: hero.image,
  },
  announcement: {
    enabled: true,
    text: "✨ Handcrafted Personalized Gifts · Free Delivery Across India on Orders Above ₹499",
    link: "/shop",
  },
  contact: {
    whatsapp: site.contact.whatsapp,
    email: site.contact.email,
    hours: site.contact.hours,
  },
};

// In-memory fallback cache so settings work seamlessly even during DB cold-starts or connection blips
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

/**
 * Reads site appearance, hero, announcement and contact settings from the DB.
 * Falls back safely to default config if database is empty or unavailable.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    if (!rows || rows.length === 0) {
      return memorySettings;
    }
    const map = new Map(rows.map((r) => [r.key, r.value as unknown]));

    const theme = (map.get("theme") as Partial<SiteSettings["theme"]>) ?? {};
    const heroContent = (map.get("hero") as Partial<SiteSettings["hero"]>) ?? {};
    const announcement = (map.get("announcement") as Partial<SiteSettings["announcement"]>) ?? {};
    const contact = (map.get("contact") as Partial<SiteSettings["contact"]>) ?? {};

    memorySettings = {
      theme: { ...DEFAULT_SETTINGS.theme, ...memorySettings.theme, ...theme },
      hero: { ...DEFAULT_SETTINGS.hero, ...memorySettings.hero, ...heroContent },
      announcement: { ...DEFAULT_SETTINGS.announcement, ...memorySettings.announcement, ...announcement },
      contact: { ...DEFAULT_SETTINGS.contact, ...memorySettings.contact, ...contact },
    };

    return memorySettings;
  } catch (err) {
    console.warn("Failed to fetch settings from Prisma, using cached/default configuration:", err);
    return memorySettings;
  }
}

/**
 * Updates site appearance, hero, announcement and contact settings.
 */
export async function updateSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  // Update memory cache immediately
  if (input.theme) memorySettings.theme = { ...memorySettings.theme, ...input.theme };
  if (input.hero) memorySettings.hero = { ...memorySettings.hero, ...input.hero };
  if (input.announcement) memorySettings.announcement = { ...memorySettings.announcement, ...input.announcement };
  if (input.contact) memorySettings.contact = { ...memorySettings.contact, ...input.contact };

  // Persist to Prisma concurrently
  try {
    const promises: Promise<unknown>[] = [];

    if (input.theme) {
      const val = input.theme as unknown as Prisma.InputJsonValue;
      promises.push(
        prisma.setting.upsert({
          where: { key: "theme" },
          update: { value: val },
          create: { key: "theme", value: val },
        })
      );
    }

    if (input.hero) {
      const val = input.hero as unknown as Prisma.InputJsonValue;
      promises.push(
        prisma.setting.upsert({
          where: { key: "hero" },
          update: { value: val },
          create: { key: "hero", value: val },
        })
      );
    }

    if (input.announcement) {
      const val = input.announcement as unknown as Prisma.InputJsonValue;
      promises.push(
        prisma.setting.upsert({
          where: { key: "announcement" },
          update: { value: val },
          create: { key: "announcement", value: val },
        })
      );
    }

    if (input.contact) {
      const val = input.contact as unknown as Prisma.InputJsonValue;
      promises.push(
        prisma.setting.upsert({
          where: { key: "contact" },
          update: { value: val },
          create: { key: "contact", value: val },
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (err) {
    console.warn("Could not persist settings to database (using in-memory):", err);
  }

  return memorySettings;
}
