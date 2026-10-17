"use client";

import { useMemo, useState } from "react";
import type { FilterChip, Product } from "@/config/catalog";
import { sortOptions } from "@/config/catalog";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { discountPercent } from "@/lib/utils";
import { FilterBar } from "./FilterBar";
import { Pagination } from "./Pagination";
import { ShopProductCard } from "./ShopProductCard";

export type SortValue = (typeof sortOptions)[number]["value"];

/**
 * ProductBrowser — client-side filtering, sorting and pagination for the
 * catalogue. Every grid change remounts the StaggerGroup (via `key`) so the
 * cards re-animate on each filter / sort / page change.
 */
export function ProductBrowser({
  products,
  filters,
  initialTag = "all",
  pageSize = 20,
  emptyMessage = "No keepsakes matched your filters yet.",
  showFilters = true,
}: {
  products: Product[];
  filters?: FilterChip[];
  initialTag?: string;
  pageSize?: number;
  emptyMessage?: string;
  showFilters?: boolean;
}) {
  const [tag, setTag] = useState(initialTag);
  const [sort, setSort] = useState<SortValue>("featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const base = !tag || tag === "all" ? products : products.filter((p) => p.tags.includes(tag));
    const list = [...base];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "discount":
        list.sort(
          (a, b) => discountPercent(b.price, b.compareAt) - discountPercent(a.price, a.compareAt),
        );
        break;
      default:
        break;
    }
    return list;
  }, [products, tag, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const from = filtered.length ? start + 1 : 0;
  const to = Math.min(start + pageSize, filtered.length);

  function changeTag(next: string) {
    setTag(next);
    setPage(1);
  }

  function changeSort(next: SortValue) {
    setSort(next);
    setPage(1);
  }

  return (
    <section className="py-8 sm:py-10">
      <Container>
        {showFilters && filters ? (
          <Reveal>
            <FilterBar filters={filters} active={tag} onChange={changeTag} />
          </Reveal>
        ) : null}

        <Reveal
          delay={0.1}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-body text-[14px] text-plum-muted">
            Showing{" "}
            <span className="font-semibold text-plum">
              {from} to {to}
            </span>{" "}
            of <span className="font-semibold text-plum">{filtered.length}</span> keepsakes
          </p>

          <div className="flex items-center gap-2">
            {tag !== "all" ? (
              <button
                type="button"
                onClick={() => changeTag("all")}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3.5 py-2 font-body text-[13px] font-semibold text-plum-muted transition-colors hover:border-brand hover:text-brand"
              >
                Clear All Filters
                <Icon name="close" className="text-[14px]" />
              </button>
            ) : null}

            <label className="inline-flex items-center gap-2">
              <span className="sr-only">Sort products by</span>
              <span className="relative inline-flex items-center">
                <select
                  value={sort}
                  onChange={(e) => changeSort(e.target.value as SortValue)}
                  className="appearance-none rounded-full border border-line bg-white py-2 pl-3.5 pr-9 font-body text-[13px] font-semibold text-plum outline-none transition-colors focus:border-brand"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  className="pointer-events-none absolute right-2.5 text-[18px] text-plum-muted"
                />
              </span>
            </label>
          </div>
        </Reveal>

        {visible.length ? (
          <StaggerGroup
            key={`${tag}-${sort}-${safePage}`}
            className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {visible.map((product) => (
              <StaggerItem key={product.id} className="h-full">
                <ShopProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <div className="mt-8 rounded-[24px] border border-dashed border-line bg-surface px-6 py-16 text-center">
            <Icon name="search_off" className="text-[40px] text-brand/60" />
            <p className="mt-3 font-body text-[16px] text-plum-muted">{emptyMessage}</p>
          </div>
        )}

        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </Container>
    </section>
  );
}
