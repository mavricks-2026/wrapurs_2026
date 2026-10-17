import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = { title: "Offers" };

export default function OffersPage() {
  return (
    <PagePlaceholder
      eyebrow="Deals & Coupons"
      title="Current Offers"
      highlight="Offers"
      icon="percent"
      description="Seasonal offers, coupon codes and bundle deals are delivered in Milestone 8."
      milestone="Milestone 8"
      breadcrumbs={[{ label: "Offers" }]}
      ctaHref="/shop"
      ctaLabel="Shop the sale"
    />
  );
}
