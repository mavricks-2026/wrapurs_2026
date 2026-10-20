import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * category-admin.service.ts — validated, admin-side WRITE access to the
 * Category table. Every caller must have already verified the ADMIN role
 * (see services/admin/guard.ts). Errors are mapped to safe codes/messages;
 * raw database errors are never returned to the client.
 */

export type CategoryInput = {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
};

export type CategoryRecord = CategoryInput & { id: string };

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; detail?: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ICON_RE = /^[a-z0-9_]+$/;

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

const SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  icon: true,
  sortOrder: true,
} as const;

/** Validate a full category payload (create and edit share one shape). */
export function parseCategoryInput(raw: unknown): Result<CategoryInput> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, status: 400, error: "invalid_body" };
  }
  const body = raw as Record<string, unknown>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, status: 400, error: "validation", detail: "Name is required." };
  if (name.length > 120)
    return { ok: false, status: 400, error: "validation", detail: "Name must be 120 characters or fewer." };

  const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : "");
  if (!slug)
    return { ok: false, status: 400, error: "validation", detail: "Slug is required." };
  if (!SLUG_RE.test(slug) || slug.length > 120)
    return {
      ok: false,
      status: 400,
      error: "validation",
      detail: "Slug may only contain lowercase letters, numbers and single hyphens.",
    };

  const descriptionRaw = typeof body.description === "string" ? body.description.trim() : "";
  if (descriptionRaw.length > 1000)
    return {
      ok: false,
      status: 400,
      error: "validation",
      detail: "Description must be 1000 characters or fewer.",
    };

  const iconRaw = typeof body.icon === "string" ? body.icon.trim() : "";
  if (iconRaw && (!ICON_RE.test(iconRaw) || iconRaw.length > 64))
    return {
      ok: false,
      status: 400,
      error: "validation",
      detail: "Icon must be a Material Symbols name (lowercase letters, numbers, underscores).",
    };

  const sortOrder =
    typeof body.sortOrder === "number"
      ? body.sortOrder
      : typeof body.sortOrder === "string" && body.sortOrder.trim() !== ""
        ? Number(body.sortOrder)
        : NaN;
  if (!Number.isInteger(sortOrder) || Math.abs(sortOrder) > 1_000_000)
    return {
      ok: false,
      status: 400,
      error: "validation",
      detail: "Sort order must be a whole number.",
    };

  return {
    ok: true,
    data: {
      name,
      slug,
      description: descriptionRaw || null,
      icon: iconRaw || null,
      sortOrder,
    },
  };
}

/** Revalidate the storefront pages that read categories. */
function revalidateCategoryPages() {
  revalidatePath("/");
  revalidatePath("/collections/[slug]", "page");
}

function mapError(e: unknown): Result<never> {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };
    if (e.code === "P2025") return { ok: false, status: 404, error: "not_found" };
  }
  return { ok: false, status: 500, error: "database_error" };
}

export async function createCategory(input: CategoryInput): Promise<Result<CategoryRecord>> {
  try {
    const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
    if (existing)
      return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };
    const created = await prisma.category.create({ data: input, select: SELECT });
    revalidateCategoryPages();
    return { ok: true, data: created };
  } catch (e) {
    return mapError(e) as Result<CategoryRecord>;
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Result<CategoryRecord>> {
  try {
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) return { ok: false, status: 404, error: "not_found" };
    if (input.slug !== current.slug) {
      const taken = await prisma.category.findUnique({ where: { slug: input.slug } });
      if (taken)
        return { ok: false, status: 409, error: "duplicate_slug", detail: "That slug is already in use." };
    }
    const updated = await prisma.category.update({ where: { id }, data: input, select: SELECT });
    revalidateCategoryPages();
    return { ok: true, data: updated };
  } catch (e) {
    return mapError(e) as Result<CategoryRecord>;
  }
}

export async function deleteCategory(id: string): Promise<Result<{ id: string }>> {
  try {
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) return { ok: false, status: 404, error: "not_found" };
    await prisma.category.delete({ where: { id } });
    revalidateCategoryPages();
    return { ok: true, data: { id } };
  } catch (e) {
    return mapError(e) as Result<{ id: string }>;
  }
}
