"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { categories as defaultCategories, categoriesSection } from "@/config/content";

export type CategoryTile = { name: string; icon: string; href: string };

/**
 * CategoryGrid — Home "Shop by Category" tiles.
 *
 * The Home page (a server component) passes the database categories here;
 * when no prop is supplied it falls back to the built-in demo list, so the
 * component keeps working standalone.
 */
export function CategoryGrid({ categories = defaultCategories }: { categories?: CategoryTile[] }) {
  return (
    <section className="bg-section py-14">
      <Container>
        <SectionHeading title={categoriesSection.title} highlight={categoriesSection.highlight} />

        <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((cat) => (
            <StaggerItem key={cat.name}>
              <Link
                href={cat.href}
                className="group flex flex-col items-center rounded-[24px] border border-line bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
              >
                <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-line bg-surface text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Icon name={cat.icon} className="text-[36px]" />
                </div>
                <h3 className="font-display text-[21px] text-plum transition-colors group-hover:text-brand">
                  {cat.name}
                </h3>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
