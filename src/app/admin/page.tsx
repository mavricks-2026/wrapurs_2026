import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Admin" };

/** Admin dashboard sections — live ones link to their management screen. */
const sections = [
  { name: "Main Screen & Theme", description: "Customize homepage hero text, hero image, brand colors, and announcement banner", status: "Live", href: "/admin/settings" },
  { name: "Products", description: "Create, publish, edit pricing, stock, badges and categories", status: "In database", href: "/admin/products" },
  { name: "Categories", description: "Manage categories, icons, slugs and display sort order", status: "In database", href: "/admin/categories" },
  { name: "Orders", description: "Track, update and fulfil customer orders and payments", status: "In database", href: "/admin/orders" },
  { name: "Customers", description: "Customer accounts, addresses and order history", status: "Coming soon", href: null },
  { name: "Coupons & Offers", description: "Discount codes and seasonal campaigns", status: "Coming soon", href: null },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] text-plum">Admin Dashboard</h1>
          <p className="mt-1 text-[15px] text-plum-muted">
            Signed in as {name} · role ADMIN. Manage your storefront products, categories, orders, and appearance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/settings"
            className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white shadow-soft hover:bg-brand-dark"
          >
            🎨 Main Screen & Theme
          </Link>
          <Link
            href="/admin/products"
            className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-bold text-plum hover:border-brand hover:text-brand"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-bold text-plum hover:border-brand hover:text-brand"
          >
            + Add Category
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const card = (
            <div
              className={`rounded-[20px] border border-line bg-white p-5 shadow-soft transition-colors ${
                section.href ? "hover:border-brand" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[21px] text-plum">{section.name}</h2>
                <span
                  className={
                    section.status === "Coming soon"
                      ? "rounded-full bg-section px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-plum-muted"
                      : "rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand"
                  }
                >
                  {section.status}
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-plum-muted">{section.description}</p>
            </div>
          );
          return section.href ? (
            <Link key={section.name} href={section.href}>
              {card}
            </Link>
          ) : (
            <div key={section.name}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
