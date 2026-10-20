import type { Metadata } from "next";
import { getAllCategoryRows } from "@/services/category.service";
import { listProductsAdmin, PRODUCT_STATUSES } from "@/services/product-admin.service";
import { ProductsManager } from "./ProductsManager";

export const metadata: Metadata = { title: "Admin · Products" };

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

function pageHref(params: { q: string; status: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/products${qs ? `?${qs}` : ""}`;
}

/** Admin products screen — server-rendered list with search, status filter, pagination. */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = PRODUCT_STATUSES.includes(sp.status as never) ? (sp.status as string) : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ items, total, totalPages }, categories] = await Promise.all([
    listProductsAdmin({ q, status, page }),
    getAllCategoryRows(),
  ]);

  const filter = { q, status, page };

  return (
    <div>
      <h1 className="font-display text-[32px] text-plum">Products</h1>
      <p className="mt-1 text-[15px] text-plum-muted">
        {total} product{total === 1 ? "" : "s"} in the database. ACTIVE products appear on the
        storefront alongside the built-in catalogue.
      </p>

      <form method="get" action="/admin/products" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="Title or slug"
            className="w-56 rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-[12.5px] font-bold text-plum-muted">
          Status
          <select
            name="status"
            defaultValue={status}
            className="rounded-[12px] border border-line bg-white px-3 py-2 text-[14px] text-plum outline-none focus:border-brand"
          >
            <option value="">All statuses</option>
            {PRODUCT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full border border-line bg-white px-5 py-2 text-[13.5px] font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
        >
          Filter
        </button>
        {q || status ? (
          <a
            href="/admin/products"
            className="px-1 text-[13px] font-semibold text-plum-muted underline hover:text-brand"
          >
            Clear
          </a>
        ) : null}
      </form>

      <div className="mt-6">
        <ProductsManager initialProducts={items} categories={categories} />
      </div>

      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center gap-3 text-[13.5px] font-semibold">
          {page > 1 ? (
            <a href={pageHref({ ...filter, page: page - 1 })} className="text-brand hover:underline">
              ← Previous
            </a>
          ) : null}
          <span className="text-plum-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a href={pageHref({ ...filter, page: page + 1 })} className="text-brand hover:underline">
              Next →
            </a>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
