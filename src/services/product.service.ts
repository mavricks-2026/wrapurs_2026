import { prisma } from "@/lib/prisma";
import { catalog, featuredProducts, type CatalogProduct, type Product } from "@/config/catalog";

/**
 * product.service.ts — read-only access to the Product table for the storefront.
 *
 * Every function projects a Prisma Product row into the exact `Product` shape the
 * storefront already consumes from `src/config/catalog.ts`, so pages can merge
 * database products with the static catalogue without any UI changes.
 *
 * Rules:
 *  - Only `status: "ACTIVE"` products are ever returned to the public.
 *  - The primary image (isPrimary, else lowest sortOrder) becomes `image`.
 *  - `compareAt` falls back to `price` when `compareAtInr` is null.
 *  - Category slugs are appended to `tags` so collection pages can filter
 *    database products by their category slug.
 *  - Every function fails soft: an unreachable database yields empty results
 *    instead of crashing the page, matching `category.service.ts`.
 */

const SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  priceInr: true,
  compareAtInr: true,
  badge: true,
  rating: true,
  reviewCount: true,
  tags: true,
  isFeatured: true,
  homeOrder: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { url: true, isPrimary: true },
  },
  categories: {
    select: { category: { select: { slug: true } } },
  },
} satisfies import("@prisma/client").Prisma.ProductSelect;

type ProductRow = import("@prisma/client").Prisma.ProductGetPayload<{ select: typeof SELECT }>;

function toProduct(row: ProductRow): CatalogProduct | null {
  const primary = row.images.find((image) => image.isPrimary) ?? row.images[0];
  const image = primary?.url?.trim();
  // Defensive: a product with no usable image is skipped rather than rendered
  // (next/image throws on an empty src, which would crash the page).
  if (!image) return null;

  const categorySlugs = row.categories.map((entry) => entry.category.slug);
  const tags = Array.from(new Set([...row.tags, ...categorySlugs]));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.priceInr,
    compareAt: row.compareAtInr ?? row.priceInr,
    image,
    badge: row.badge ?? undefined,
    rating: row.rating || undefined,
    reviewCount: row.reviewCount || undefined,
    tags,
    featured: row.isFeatured,
    homeOrder: row.homeOrder ?? undefined,
  };
}

/** Every ACTIVE product, newest first. Empty on DB failure. */
export async function getStorefrontProducts(): Promise<CatalogProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: SELECT,
    });
    return rows
      .map(toProduct)
      .filter((product): product is CatalogProduct => product !== null);
  } catch {
    return [];
  }
}

/** A single ACTIVE product by slug, or null when absent. Empty on DB failure. */
export async function getStorefrontProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const row = await prisma.product.findFirst({
      where: { slug, status: "ACTIVE" },
      select: SELECT,
    });
    return row ? toProduct(row) : null;
  } catch {
    return null;
  }
}

/**
 * Merge the static catalogue with database products, de-duplicated by slug.
 * The static catalogue is kept first (preserving existing order and behaviour);
 * database products whose slug already exists are ignored, and new ones are
 * appended. Safe to call with an empty DB list.
 */
export function mergeProducts(staticProducts: Product[], dbProducts: Product[]): Product[] {
  const seen = new Set(staticProducts.map((product) => product.slug));
  const extras = dbProducts.filter((product) => !seen.has(product.slug));
  return extras.length ? [...staticProducts, ...extras] : staticProducts;
}

/** The full public catalogue: static products + ACTIVE database products. */
export async function getMergedProducts(): Promise<Product[]> {
  return mergeProducts(catalog, await getStorefrontProducts());
}

/**
 * The Home "Trending Now" rail: the static featured keepsakes first (in their
 * existing design order), then ACTIVE database products marked featured,
 * ordered by homeOrder. Static products are never reordered or displaced, and
 * a database product whose slug collides with a static one is skipped, so the
 * rail never shows duplicates. Falls back to the static list on DB failure.
 */
export async function getTrendingProducts(): Promise<Product[]> {
  const dbProducts = await getStorefrontProducts();
  const seen = new Set(featuredProducts.map((product) => product.slug));
  const dbFeatured = dbProducts
    .filter((product) => product.featured && !seen.has(product.slug))
    .sort((a, b) => {
      const ao = a.homeOrder ?? 99;
      const bo = b.homeOrder ?? 99;
      return ao - bo;
    });
  return dbFeatured.length ? [...featuredProducts, ...dbFeatured] : featuredProducts;
}

/** One product by slug, preferring the static catalogue, else the database. */
export async function getMergedProductBySlug(slug: string): Promise<Product | null> {
  return catalog.find((product) => product.slug === slug) ?? (await getStorefrontProductBySlug(slug));
}

/**
 * Fetch several products by slug (static catalogue first, then database),
 * preserving the order of the input list. Missing slugs are skipped.
 */
export async function getMergedProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const merged = await getMergedProducts();
  return slugs
    .map((slug) => merged.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
}

/**
 * Fail-closed single-product resolver for TRUSTED server pricing.
 *
 * Unlike the storefront reads (which fail soft to empty), this distinguishes
 * three outcomes so a caller can never charge a wrong price:
 *  - `found`   — an ACTIVE product (static catalogue first, then database).
 *  - `missing` — no such ACTIVE product exists (genuine "no longer available").
 *  - `error`   — the database was required and the read failed (reject order).
 *
 * Static slugs resolve without any database access, exactly matching the
 * storefront's static-first order. DRAFT/ARCHIVED/imageless DB rows are treated
 * as `missing` (never purchasable); a static product is always usable.
 */
export type ResolvedProduct =
  | { status: "found"; product: Product }
  | { status: "missing" }
  | { status: "error" };

export async function resolveProductForPricing(slug: string): Promise<ResolvedProduct> {
  const staticMatch = catalog.find((product) => product.slug === slug);
  if (staticMatch) return { status: "found", product: staticMatch };

  try {
    const row = await prisma.product.findFirst({
      where: { slug, status: "ACTIVE" },
      select: SELECT,
    });
    if (!row) return { status: "missing" };
    const product = toProduct(row);
    // No usable image → not a valid public product (treated as missing).
    return product ? { status: "found", product } : { status: "missing" };
  } catch {
    return { status: "error" };
  }
}
