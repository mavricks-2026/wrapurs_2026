import { Prisma, type ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { catalog } from "@/config/catalog";

/**
 * product-admin.service.ts — validated, admin-side access to the Product
 * table (plus its ProductCategory links and ProductImage rows). Every caller
 * must have already verified the ADMIN role (services/admin/guard.ts).
 *
 * Images are stored as path/URL strings on ProductImage, matching the
 * project's existing approach (static files under /public referenced by
 * path, or absolute https URLs). No upload service is involved.
 * Errors map to safe codes; raw database errors never reach the client.
 */

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export type ProductImageInput = { url: string; alt: string | null; isPrimary: boolean };

export type ProductInput = {
  title: string;
  slug: string;
  description: string;
  priceInr: number;
  compareAtInr: number | null;
  status: ProductStatus;
  categoryIds: string[];
  images: ProductImageInput[];
  /** Free-form filter tags used by shop / collections / search. */
  tags: string[];
  /** Whether the product is eligible for the Home "Trending" rail. */
  isFeatured: boolean;
  /** Order within the Home rail (lower first); null = unset. */
  homeOrder: number | null;
  /** Optional ribbon badge, e.g. "Bestseller". */
  badge: string | null;
};

export type ProductAdminRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceInr: number;
  compareAtInr: number | null;
  status: ProductStatus;
  tags: string[];
  isFeatured: boolean;
  homeOrder: number | null;
  badge: string | null;
  updatedAt: string;
  categories: { id: string; name: string; slug: string }[];
  images: { id: string; url: string; alt: string | null; isPrimary: boolean }[];
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; detail?: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IMAGES = 12;
const PAGE_SIZE = 20;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;
/** Tags are simple filter tokens, e.g. "trending", "birthday", "everyday". */
const TAG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slugs owned by the static storefront catalogue. These are reserved: a
 * database product may not use one (the storefront resolves static slugs
 * first, so a colliding database row would be unreachable and unpurchasable).
 */
const RESERVED_SLUGS = new Set(catalog.map((product) => product.slug));

const SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  priceInr: true,
  compareAtInr: true,
  status: true,
  tags: true,
  isFeatured: true,
  homeOrder: true,
  badge: true,
  updatedAt: true,
  categories: {
    select: { category: { select: { id: true, name: true, slug: true } } },
  },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, alt: true, isPrimary: true },
  },
};

type ProductWithRelations = Prisma.ProductGetPayload<{ select: typeof SELECT }>;

function toAdminRow(row: ProductWithRelations): ProductAdminRow {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    priceInr: row.priceInr,
    compareAtInr: row.compareAtInr,
    status: row.status,
    tags: row.tags,
    isFeatured: row.isFeatured,
    homeOrder: row.homeOrder,
    badge: row.badge,
    updatedAt: row.updatedAt.toISOString(),
    categories: row.categories.map((link) => link.category),
    images: row.images,
  };
}

/** Lowercase, hyphenate and strip characters that are not valid in a slug. */
export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validation(detail: string): Result<never> {
  return { ok: false, status: 400, error: "validation", detail };
}

/** Validate the full product payload (create and edit share one shape). */
export async function parseProductInput(raw: unknown): Promise<Result<ProductInput>> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, status: 400, error: "invalid_body" };
  }
  const body = raw as Record<string, unknown>;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return validation("Title is required.");
  if (title.length > 200) return validation("Title must be 200 characters or fewer.");

  const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : "");
  if (!slug) return validation("Slug is required.");
  if (!SLUG_RE.test(slug) || slug.length > 200)
    return validation("Slug may only contain lowercase letters, numbers and single hyphens.");
  if (RESERVED_SLUGS.has(slug))
    return validation("That slug is reserved by an existing built-in product. Please choose another.");

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) return validation("Description is required.");
  if (description.length > 2000) return validation("Description must be 2000 characters or fewer.");

  const priceInr =
    typeof body.priceInr === "number" ? body.priceInr : Number(body.priceInr);
  if (!Number.isInteger(priceInr) || priceInr < 1 || priceInr > 10_000_000)
    return validation("Price must be a whole number of rupees (1 – 10,000,000).");

  let compareAtInr: number | null = null;
  if (body.compareAtInr !== undefined && body.compareAtInr !== null && body.compareAtInr !== "") {
    const parsed =
      typeof body.compareAtInr === "number" ? body.compareAtInr : Number(body.compareAtInr);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10_000_000)
      return validation("Compare-at price must be a whole number (0 – 10,000,000).");
    compareAtInr = parsed;
  }

  const rawStatus = typeof body.status === "string" ? body.status : "";
  if (!PRODUCT_STATUSES.includes(rawStatus as (typeof PRODUCT_STATUSES)[number]))
    return validation("Status must be DRAFT, ACTIVE or ARCHIVED.");
  const status = rawStatus as ProductStatus;

  const rawCategoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  const categoryIds = [...new Set(rawCategoryIds.filter((id): id is string => typeof id === "string"))];
  if (categoryIds.length > 20) return validation("A product can be in at most 20 categories.");
  if (categoryIds.length > 0) {
    const found = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (found.length !== categoryIds.length)
      return validation("One or more selected categories do not exist.");
  }

  const rawImages = Array.isArray(body.images) ? body.images : [];
  if (rawImages.length > MAX_IMAGES)
    return validation(`A product can have at most ${MAX_IMAGES} images.`);
  const images: ProductImageInput[] = [];
  for (const entry of rawImages) {
    if (typeof entry !== "object" || entry === null) return validation("Invalid image entry.");
    const img = entry as Record<string, unknown>;
    const url = typeof img.url === "string" ? img.url.trim() : "";
    if (!url || url.length > 500) return validation("Each image needs a path or URL (max 500 characters).");
    if (!url.startsWith("/") && !url.startsWith("https://"))
      return validation('Image paths must start with "/" (files in /public) or "https://".');
    const alt = typeof img.alt === "string" && img.alt.trim() ? img.alt.trim().slice(0, 200) : null;
    images.push({ url, alt, isPrimary: Boolean(img.isPrimary) });
  }
  if (images.length === 0)
    return validation("At least one product image is required.");
  if (!images.some((img) => img.isPrimary)) {
    images[0].isPrimary = true;
  }

  // ── Metadata: tags ─────────────────────────────────────────────────────
  const rawTags = Array.isArray(body.tags) ? body.tags : [];
  if (rawTags.length > MAX_TAGS)
    return validation(`A product can have at most ${MAX_TAGS} tags.`);
  const tags: string[] = [];
  for (const entry of rawTags) {
    if (typeof entry !== "string") return validation("Each tag must be text.");
    const tag = normalizeSlug(entry);
    if (!tag) continue; // drop empty/whitespace-only entries silently
    if (tag.length > MAX_TAG_LENGTH)
      return validation(`Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`);
    if (!TAG_RE.test(tag))
      return validation("Tags may only contain lowercase letters, numbers and single hyphens.");
    tags.push(tag);
  }
  const dedupedTags = [...new Set(tags)];

  // ── Metadata: featured / home order / badge ────────────────────────────
  if (typeof body.isFeatured !== "boolean")
    return validation("Featured must be true or false.");
  const isFeatured = body.isFeatured;

  let homeOrder: number | null = null;
  if (body.homeOrder !== undefined && body.homeOrder !== null && body.homeOrder !== "") {
    const parsed = typeof body.homeOrder === "number" ? body.homeOrder : Number(body.homeOrder);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 999)
      return validation("Home order must be a whole number (0 – 999).");
    homeOrder = parsed;
  }

  let badge: string | null = null;
  if (body.badge !== undefined && body.badge !== null && body.badge !== "") {
    if (typeof body.badge !== "string") return validation("Badge must be text.");
    const trimmed = body.badge.trim();
    if (trimmed.length > 40) return validation("Badge must be 40 characters or fewer.");
    badge = trimmed || null;
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      description,
      priceInr,
      compareAtInr,
      status,
      categoryIds,
      images,
      tags: dedupedTags,
      isFeatured,
      homeOrder,
      badge,
    },
  };
}

/** Revalidate the storefront pages that read products (harmless while catalog.ts is live). */
function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/search");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/product/[slug]", "page");
}

function mapError(e: unknown): Result<never> {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002")
      return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };
    if (e.code === "P2025") return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: false, status: 500, error: "database_error" };
}

export async function listProductsAdmin(options: {
  q?: string;
  status?: string;
  page?: number;
}): Promise<{
  items: ProductAdminRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const q = (options.q ?? "").trim();
  const status =
    options.status && PRODUCT_STATUSES.includes(options.status as ProductStatus)
      ? (options.status as ProductStatus)
      : undefined;
  const page = Math.max(1, options.page ?? 1);

  const where: Prisma.ProductWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map(toAdminRow),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function createProduct(
  input: ProductInput,
): Promise<Result<ProductAdminRow>> {
  try {
    const existing = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (existing)
      return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };

    const created = await prisma.product.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description,
        priceInr: input.priceInr,
        compareAtInr: input.compareAtInr,
        status: input.status,
        tags: input.tags,
        isFeatured: input.isFeatured,
        homeOrder: input.homeOrder,
        badge: input.badge,
        categories: {
          create: input.categoryIds.map((categoryId) => ({ categoryId })),
        },
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary,
            sortOrder: index,
          })),
        },
      },
      select: SELECT,
    });
    revalidateProductPages();
    return { ok: true, data: toAdminRow(created) };
  } catch (e) {
    return mapError(e) as Result<ProductAdminRow>;
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Result<ProductAdminRow>> {
  try {
    const current = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!current) return { ok: false, status: 404, error: "not_found" };
    if (input.slug !== current.slug) {
      const taken = await prisma.product.findUnique({ where: { slug: input.slug } });
      if (taken)
        return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          priceInr: input.priceInr,
          compareAtInr: input.compareAtInr,
          status: input.status,
          tags: input.tags,
          isFeatured: input.isFeatured,
          homeOrder: input.homeOrder,
          badge: input.badge,
        },
      });
      await tx.productCategory.deleteMany({ where: { productId: id } });
      if (input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
        });
      }
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length > 0) {
        await tx.productImage.createMany({
          data: input.images.map((image, index) => ({
            productId: id,
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary,
            sortOrder: index,
          })),
        });
      }
      return tx.product.findUnique({ where: { id }, select: SELECT });
    });

    if (!updated) return { ok: false, status: 404, error: "not_found" };
    revalidateProductPages();
    return { ok: true, data: toAdminRow(updated) };
  } catch (e) {
    return mapError(e) as Result<ProductAdminRow>;
  }
}

export async function deleteProduct(id: string): Promise<Result<{ id: string }>> {
  try {
    const current = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!current) return { ok: false, status: 404, error: "not_found" };
    await prisma.product.delete({ where: { id } });
    revalidateProductPages();
    return { ok: true, data: { id } };
  } catch (e) {
    return mapError(e) as Result<{ id: string }>;
  }
}
