import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PagePlaceholder
      eyebrow="Policies"
      title="Privacy Policy"
      highlight="Privacy"
      icon="shield"
      description="How we handle your data — especially the photos and names you upload for personalization — is documented in Milestone 8."
      milestone="Milestone 8"
      breadcrumbs={[{ label: "Privacy Policy" }]}
      ctaHref="/"
      ctaLabel="Back to Home"
    />
  );
}
