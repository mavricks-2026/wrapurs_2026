import type { Metadata } from "next";
import { getMergedProducts } from "@/services/product.service";
import { ProductBrowser, SearchBar, ShopHero, SupportCta } from "@/features/shop";

export const metadata: Metadata = {
  title: "Search",
  description: "Search handcrafted personalized gifts by product, occasion or style.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const displayQuery = (q ?? "").trim();
  const needle = displayQuery.toLowerCase();
  const all = needle ? await getMergedProducts() : [];
  const results = needle
    ? all.filter((product) =>
        [product.title, product.description, ...product.tags].some((field) =>
          field.toLowerCase().includes(needle),
        ),
      )
    : [];

  return (
    <>
      <ShopHero
        title={needle ? `Results for “${displayQuery}”` : "Search Keepsakes"}
        highlight={needle ? "Results" : "Keepsakes"}
        subtitle={
          needle
            ? `${results.length} ${results.length === 1 ? "keepsake" : "keepsakes"} matched your search.`
            : "Looking for the perfect personalized gift? Search by product, occasion or style."
        }
      >
        <SearchBar initialQuery={displayQuery} />
      </ShopHero>

      {needle ? (
        <ProductBrowser
          products={results}
          showFilters={false}
          emptyMessage={`No keepsakes matched “${displayQuery}”. Try “lamp”, “frame”, “hamper” or “bracelet”.`}
        />
      ) : null}

      <SupportCta />
    </>
  );
}
