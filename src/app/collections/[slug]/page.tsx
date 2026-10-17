import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getProductsByTag, shopFilters, shopHero } from "@/config/catalog";
import { ProductBrowser, ShopHero, SupportCta } from "@/features/shop";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";

/** Pre-render every collection tile from the Home page. */
export function generateStaticParams() {
  return Object.keys(collections).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections[slug];
  if (!collection) return { title: "Collection" };
  return { title: `${collection.title} Gifts`, description: collection.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = collections[slug];
  if (!collection) notFound();

  const products = getProductsByTag(collection.tag);

  return (
    <>
      <div className="pt-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: collection.title },
            ]}
          />
        </Container>
      </div>

      <ShopHero
        title={collection.title}
        highlight={collection.title}
        subtitle={collection.description}
        image={shopHero.image}
        imageBadge={shopHero.imageBadge}
      />

      <ProductBrowser
        products={products}
        filters={shopFilters}
        initialTag={collection.tag}
        emptyMessage={`No ${collection.title.toLowerCase()} keepsakes are live yet — check back soon.`}
      />

      <SupportCta />
    </>
  );
}
