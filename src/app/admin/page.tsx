import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Admin" };

/** Admin dashboard sections — live ones link to their management screen. */
const sections = [
  { name: "Categories", description: "The 14 client categories, live in the database", status: "In database", href: "/admin/categories" },
  { name: "Products", description: "Create and publish products, images and pricing", status: "In database", href: "/admin/products" },
  { name: "Orders", description: "Track, update and fulfil customer orders", status: "In database", href: "/admin/orders" },
  { name: "Customers", description: "Customer accounts, addresses and order history", status: "Coming soon", href: null },
  { name: "Coupons & Offers", description: "Discount codes and seasonal campaigns", status: "Coming soon", href: null },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";

  return (
    <div>
      <h1 className="font-display text-[32px] text-plum">Dashboard</h1>
      <p className="mt-1 text-[15px] text-plum-muted">
        Signed in as {name} · role ADMIN. This is the admin foundation — management
        screens are added in the next steps.
      </p>

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
