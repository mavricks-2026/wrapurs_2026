import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "WrapUrs turns your photos, names and memories into handcrafted keepsakes. Learn how we craft each personalized gift with care.",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="Our Story"
      title="Handcrafted With Heart"
      highlight="Heart"
      icon="volunteer_activism"
      description="Our full brand story, values, the makers behind each keepsake and our FAQ arrive in Milestone 8 — matching the About Us design screen."
      milestone="Milestone 8"
      breadcrumbs={[{ label: "About" }]}
      ctaHref="/shop"
      ctaLabel="Explore the Shop"
    />
  );
}
