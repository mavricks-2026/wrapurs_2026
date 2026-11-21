import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

/**
 * `/admin/*` layout — the admin shell and the server-side ADMIN gate.
 *
 * Access control happens twice, both server-side:
 *   1. middleware.ts (`authorized` callback) redirects non-admins to /login;
 *   2. this layout re-checks the session role — defence in depth, so no
 *      admin route can render even if the middleware matcher is ever missed.
 *
 * The role in the JWT is only ever assigned in `auth.ts` after a successful
 * credentials login (ADMIN_EMAILS allowlist; the public demo account can
 * never be elevated). Nothing here trusts the URL or any client-side state.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  const name = session.user.name ?? "Admin";
  const email = session.user.email ?? "";

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-section text-plum">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-display text-[22px] font-semibold text-plum">
              WrapUrs <span className="text-brand">Admin</span>
            </span>
            <nav className="flex items-center gap-1 text-[13.5px] font-semibold">
              <Link href="/admin" className="rounded-full px-3 py-1.5 text-brand hover:bg-section">
                Dashboard
              </Link>
              <Link
                href="/admin/categories"
                className="rounded-full px-3 py-1.5 text-plum-muted hover:bg-section hover:text-brand"
              >
                Categories
              </Link>
              <Link
                href="/admin/products"
                className="rounded-full px-3 py-1.5 text-plum-muted hover:bg-section hover:text-brand"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-full px-3 py-1.5 text-plum-muted hover:bg-section hover:text-brand"
              >
                Orders
              </Link>
              <Link
                href="/admin/settings"
                className="rounded-full px-3 py-1.5 text-plum-muted hover:bg-section hover:text-brand"
              >
                Main Screen & Theme
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="hidden text-plum-muted sm:inline">
              {name} · {email}
            </span>
            <Link href="/" className="font-semibold text-plum-muted hover:text-brand">
              Back to store
            </Link>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-full border border-line bg-section px-4 py-1.5 font-semibold text-plum transition-colors hover:border-brand hover:text-brand"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
