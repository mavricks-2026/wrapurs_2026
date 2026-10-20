/**
 * prisma/seed.js — CATEGORY FOUNDATION ONLY (proposed, not yet executed).
 *
 * VERIFIED DATA SOURCE: the client's confirmed catalogue (14 categories, in the
 * order supplied). These replace the five old demo categories (hampers,
 * birthday, love, greetings, gift-cards) that previously lived here.
 *
 * SCOPE GUARD:
 *   - Categories only. This script contains NO products, prices, stock, SKUs,
 *     images, descriptions, icons or variants (none are client-final yet).
 *   - Idempotent: `upsert` keyed on the unique `Category.slug`, so re-running
 *     never creates duplicates and converges name/sortOrder.
 *   - Touches ONLY the "Category" table.
 *   - Pre-write guard: refuses to touch the database unless there are exactly
 *     14 entries with unique slugs and unique sortOrder values.
 *
 * USAGE (after approval):  node prisma/seed.js
 *   Reads DATABASE_URL through Prisma at runtime; the value is never printed.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/** sortOrder = client-supplied catalogue order (10, 20, … 140). */
const CATEGORIES = [
  { slug: "signature-booklet", name: "Signature Booklet", sortOrder: 10 },
  { slug: "customized-magazine", name: "Customized Magazine", sortOrder: 20 },
  { slug: "bouquet", name: "Bouquet", sortOrder: 30 },
  { slug: "album", name: "Album", sortOrder: 40 },
  { slug: "caricature", name: "Caricature", sortOrder: 50 },
  { slug: "3d-miniature", name: "3D Miniature", sortOrder: 60 },
  { slug: "mdf-cutter", name: "MDF Cutter", sortOrder: 70 },
  { slug: "customized-mug", name: "Customized Mug", sortOrder: 80 },
  { slug: "customized-key-chains", name: "Customized Key Chains", sortOrder: 90 },
  { slug: "customized-bottle", name: "Customized Bottle", sortOrder: 100 },
  { slug: "customized-wallet", name: "Customized Wallet", sortOrder: 110 },
  { slug: "heart-box-inside-pics", name: "Heart Box Inside Pics", sortOrder: 120 },
  { slug: "chocolate-box", name: "Chocolate Box", sortOrder: 130 },
  { slug: "wall-of-polaroids", name: "Wall Of Polaroids", sortOrder: 140 },
];

async function main() {
  const slugs = CATEGORIES.map((c) => c.slug);
  const sortOrders = CATEGORIES.map((c) => c.sortOrder);

  if (CATEGORIES.length !== 14) {
    throw new Error(
      `Seed guard: expected exactly 14 categories, found ${CATEGORIES.length}.`,
    );
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Seed guard: duplicate category slugs detected.");
  }
  if (new Set(sortOrders).size !== sortOrders.length) {
    throw new Error("Seed guard: duplicate sortOrder values detected.");
  }

  for (const category of CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    });
    console.log(`category upserted: ${result.slug}`);
  }

  const total = await prisma.category.count();
  console.log(`total categories in database: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
