import { prisma } from "@/lib/prisma";

/**
 * category.service.ts — read-only access to the Category table.
 *
 * Every function fails soft: if the database is unreachable the storefront
 * falls back to empty results instead of crashing, and no error details
 * (or connection information) are ever thrown to the page or the visitor.
 */

export type CollectionTile = {
  slug: string;
  /** Display name, e.g. "Signature Booklet" */
  title: string;
  description: string;
  /** Material Symbols icon name */
  icon: string;
};

/** Shown when a category has no icon yet. */
const FALLBACK_ICON = "redeem";

/** Shown when a category has no description yet. */
const FALLBACK_DESCRIPTION =
  "Handcrafted, personalized keepsakes — product previews are coming soon.";

function toTile(row: {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}): CollectionTile {
  return {
    slug: row.slug,
    title: row.name,
    description: row.description || FALLBACK_DESCRIPTION,
    icon: row.icon || FALLBACK_ICON,
  };
}

/** All categories in catalogue order (sortOrder ascending). Empty on DB failure. */
export async function getAllCategories(): Promise<CollectionTile[]> {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, description: true, icon: true },
    });
    return rows.map(toTile);
  } catch {
    return [];
  }
}

export type CategoryAdminRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
};

/** Full rows (with id and nullables) for the admin screens. Empty on DB failure. */
export async function getAllCategoryRows(): Promise<CategoryAdminRow[]> {
  try {
    return await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        sortOrder: true,
      },
    });
  } catch {
    return [];
  }
}

/**
 * One category by its unique slug.
 * Returns null ONLY when no such category exists (a genuine 404).
 * A database read failure is logged (slug only, no details) and rethrown so
 * the route reports a retryable server error instead of a misleading 404.
 */
export async function getCategoryBySlug(slug: string): Promise<CollectionTile | null> {
  try {
    const row = await prisma.category.findUnique({
      where: { slug },
      select: { slug: true, name: true, description: true, icon: true },
    });
    return row ? toTile(row) : null;
  } catch (error) {
    console.error(`[category.service] database read failed for slug "${slug}"`);
    throw error;
  }
}
