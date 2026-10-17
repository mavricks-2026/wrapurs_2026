import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PagePlaceholder
      eyebrow="Policies"
      title="Terms of Service"
      highlight="Service"
      icon="gavel"
      description="Order terms, cancellations and the personalized-goods policy are documented in Milestone 8."
      milestone="Milestone 8"
      breadcrumbs={[{ label: "Terms of Service" }]}
      ctaHref="/"
      ctaLabel="Back to Home"
    />
  );
}
