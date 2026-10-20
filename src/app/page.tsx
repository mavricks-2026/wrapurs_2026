import { WaveDivider } from "@/components/ui/WaveDivider";
import { getAllCategories } from "@/services/category.service";
import { getTrendingProducts } from "@/services/product.service";
import {
  CategoryGrid,
  Hero,
  HowItWorks,
  Newsletter,
  Testimonials,
  TrendingProducts,
} from "@/features/home/sections";

/** The "view everything" tile that always points at the Shop page. */
const allGiftsTile = { name: "All Gifts", icon: "shopping_bag", href: "/shop" };

export default async function HomePage() {
  const [dbCategories, trending] = await Promise.all([
    getAllCategories(),
    getTrendingProducts(),
  ]);

  const categoryTiles = dbCategories.map((category) => ({
    name: category.title,
    icon: category.icon,
    href: `/collections/${category.slug}`,
  }));

  return (
    <>
      <Hero />
      <WaveDivider />
      {/* Falls back to the demo tiles inside CategoryGrid when the DB list is empty. */}
      <CategoryGrid
        categories={categoryTiles.length > 0 ? [...categoryTiles, allGiftsTile] : undefined}
      />
      <WaveDivider flip />
      <TrendingProducts products={trending} />
      <WaveDivider />
      <HowItWorks />
      <WaveDivider flip />
      <Testimonials />
      <Newsletter />
    </>
  );
}
