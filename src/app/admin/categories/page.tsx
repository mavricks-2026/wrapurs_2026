import type { Metadata } from "next";
import { getAllCategoryRows } from "@/services/category.service";
import { CategoriesManager } from "./CategoriesManager";

export const metadata: Metadata = { title: "Admin · Categories" };

/** Admin categories screen — server-rendered list + client CRUD manager. */
export default async function AdminCategoriesPage() {
  const categories = await getAllCategoryRows();

  return (
    <div>
      <h1 className="font-display text-[32px] text-plum">Categories</h1>
      <p className="mt-1 text-[15px] text-plum-muted">
        The {categories.length} catalogue categories stored in the database. The storefront
        reads these on the Home page and at /collections/[slug] — changes here appear after
        a refresh.
      </p>

      <div className="mt-8">
        <CategoriesManager initialCategories={categories} />
      </div>
    </div>
  );
}
