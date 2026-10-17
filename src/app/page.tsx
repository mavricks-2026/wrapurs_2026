import { WaveDivider } from "@/components/ui/WaveDivider";
import {
  CategoryGrid,
  Hero,
  HowItWorks,
  Newsletter,
  Testimonials,
  TrendingProducts,
} from "@/features/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WaveDivider />
      <CategoryGrid />
      <WaveDivider flip />
      <TrendingProducts />
      <WaveDivider />
      <HowItWorks />
      <WaveDivider flip />
      <Testimonials />
      <Newsletter />
    </>
  );
}
