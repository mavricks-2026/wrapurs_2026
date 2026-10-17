import type { Metadata } from "next";
import { searchProducts } from "@/config/catalog";
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
  const query = (q ?? "").trim();
  const results = query ? searchProducts(query) : [];

  return (
    <>
      <ShopHero
        title={query ? `Results for “${query}”` : "Search Keepsakes"}
        highlight={query ? "Results" : "Keepsakes"}
        subtitle={
          query
            ? `${results.length} ${results.length === 1 ? "keepsake" : "keepsakes"} matched your search.`
            : "Looking for the perfect personalized gift? Search by product, occasion or style."
        }
      >
        <SearchBar initialQuery={query} />
      </ShopHero>

      {query ? (
        <ProductBrowser
          products={results}
          showFilters={false}
          emptyMessage={`No keepsakes matched “${query}”. Try “lamp”, “frame”, “hamper” or “bracelet”.`}
        />
      ) : null}

      <SupportCta />
    </>
  );
}
