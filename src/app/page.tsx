import { WaveDivider } from "@/components/ui/WaveDivider";
import { getAllCategories } from "@/services/category.service";
import { getTrendingProducts } from "@/services/product.service";
import { getSiteSettings } from "@/services/settings.service";
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
  const [dbCategories, trending, siteSettings] = await Promise.all([
    getAllCategories(),
    getTrendingProducts(),
    getSiteSettings(),
  ]);

  const categoryTiles = dbCategories.map((category) => ({
    name: category.title,
    icon: category.icon,
    href: `/collections/${category.slug}`,
  }));

  return (
    <>
      <Hero settings={siteSettings.hero} />
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
