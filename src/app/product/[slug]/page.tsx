import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalog, collections, getProductBySlug } from "@/config/catalog";
import { getProductDetail } from "@/config/product-details";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";
import {
  AlsoViewed,
  FrequentlyBought,
  ProductDetailView,
  ProductTabs,
  ReviewsSection,
} from "@/features/product";

/** Pre-render every product page at build time. */
export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const detail = getProductDetail(product);

  // Build a related pool: products sharing a tag first, then the rest.
  const sameTag = catalog.filter(
    (p) => p.slug !== product.slug && p.tags.some((tag) => product.tags.includes(tag)),
  );
  const others = catalog.filter((p) => p.slug !== product.slug && !sameTag.includes(p));
  const pool = [...sameTag, ...others];
  const bundle = pool.slice(0, 2);
  const alsoViewed = pool.slice(2, 6);

  // Breadcrumb collection — the first collection this product belongs to.
  const collectionEntry = Object.entries(collections).find(
    ([key, value]) => key !== "gift-cards" && product.tags.includes(value.tag),
  );
  const collectionHref = collectionEntry ? `/collections/${collectionEntry[0]}` : "/shop";
  const collectionLabel = collectionEntry ? collectionEntry[1].title : "Shop";

  return (
    <Container className="pb-20 pt-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: collectionLabel, href: collectionHref },
          { label: product.title },
        ]}
      />

      <ProductDetailView product={product} detail={detail} />

      <ProductTabs detail={detail} image={detail.storyImage} />

      <FrequentlyBought product={product} related={bundle} />

      <ReviewsSection detail={detail} />

      <AlsoViewed related={alsoViewed} collectionHref={collectionHref} />
    </Container>
  );
}
