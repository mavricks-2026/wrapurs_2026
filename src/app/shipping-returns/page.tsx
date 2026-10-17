import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <PagePlaceholder
      eyebrow="Policies"
      title="Shipping & Returns"
      highlight="Returns"
      icon="local_shipping"
      description="Delivery timelines, India shipping zones, and our personalized-item returns policy are documented in Milestone 8."
      milestone="Milestone 8"
      breadcrumbs={[{ label: "Shipping & Returns" }]}
      ctaHref="/shop"
      ctaLabel="Continue shopping"
    />
  );
}
