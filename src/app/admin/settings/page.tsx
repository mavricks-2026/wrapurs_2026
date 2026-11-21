import type { Metadata } from "next";
import { getSiteSettings } from "@/services/settings.service";
import { SettingsManager } from "./SettingsManager";

export const metadata: Metadata = { title: "Admin · Main Screen & Theme" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-[32px] text-plum">Main Screen & Theme Customizer</h1>
      <p className="mt-1 text-[15px] text-plum-muted">
        Configure the storefront hero headline, brand color palette, announcement banner, and contact channels.
      </p>

      <div className="mt-8">
        <SettingsManager initialSettings={settings} />
      </div>
    </div>
  );
}
