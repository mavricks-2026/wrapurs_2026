import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, shopFilters, shopHero } from "@/config/catalog";
import { getCategoryBySlug } from "@/services/category.service";
import { getMergedProducts } from "@/services/product.service";
import { ProductBrowser, ShopHero, SupportCta } from "@/features/shop";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";

/**
 * Demo collections are pre-rendered at build time from the config file.
 * Database categories (the client's real catalogue) render on demand.
 */
export const dynamicParams = true;

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

  const configCollection = collections[slug];
  if (configCollection) {
    return {
      title: `${configCollection.title} Gifts`,
      description: configCollection.description,
    };
  }

  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Collection" };
  return { title: `${category.title} Gifts`, description: category.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  /* ── Demo collections (config) — behaviour unchanged, plus DB products ── */
  const configCollection = collections[slug];
  if (configCollection) {
    const all = await getMergedProducts();
    const products =
      !configCollection.tag || configCollection.tag === "all"
        ? all
        : all.filter((product) => product.tags.includes(configCollection.tag));
    return (
      <>
        <div className="pt-6">
          <Container>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: configCollection.title },
              ]}
            />
          </Container>
        </div>

        <ShopHero
          title={configCollection.title}
          highlight={configCollection.title}
          subtitle={configCollection.description}
          image={shopHero.image}
          imageBadge={shopHero.imageBadge}
        />

        <ProductBrowser
          products={products}
          filters={shopFilters}
          initialTag={configCollection.tag}
          emptyMessage={`No ${configCollection.title.toLowerCase()} keepsakes are live yet — check back soon.`}
        />

        <SupportCta />
      </>
    );
  }

  /* ── Real categories (database) — products tagged with the category slug ─ */
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const all = await getMergedProducts();
  const products = all.filter((product) => product.tags.includes(slug));

  return (
    <>
      <div className="pt-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: category.title },
            ]}
          />
        </Container>
      </div>

      <ShopHero
        title={category.title}
        highlight={category.title}
        subtitle={category.description}
        image={shopHero.image}
        imageBadge={shopHero.imageBadge}
      />

      <ProductBrowser
        products={products}
        filters={shopFilters}
        emptyMessage={`No ${category.title.toLowerCase()} keepsakes are live yet — check back soon.`}
      />

      <SupportCta />
    </>
  );
}
