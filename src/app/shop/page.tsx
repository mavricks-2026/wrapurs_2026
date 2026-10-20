import type { Metadata } from "next";
import { shopFilters, shopHero } from "@/config/catalog";
import { getMergedProducts } from "@/services/product.service";
import { ProductBrowser, ShopHero, SupportCta } from "@/features/shop";

export const metadata: Metadata = {
  title: "Shop All Gifts",
  description:
    "Browse every handcrafted personalized gift — glowing photo lamps, engraved jewellery, memory frames and curated hampers. Filter by occasion, price and rating.",
};

export default async function ShopPage() {
  const products = await getMergedProducts();

  return (
    <>
      <ShopHero
        title={shopHero.title}
        highlight={shopHero.highlight}
        subtitle={shopHero.subtitle}
        stats={shopHero.stats}
        image={shopHero.image}
        imageBadge={shopHero.imageBadge}
      />

      <ProductBrowser products={products} filters={shopFilters} />

      <SupportCta />
    </>
  );
}
