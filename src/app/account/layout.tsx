import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountShell } from "@/features/account";

/**
 * `/account/*` layout — server-side session guard with the account shell.
 * Middleware already redirects unauthenticated traffic to `/login`; this is an
 * extra layer of defence and provides the visual sidebar/tabs for all account
 * sub-routes.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const email = session.user.email ?? "";
  const name = session.user.name ?? "WrapUrs Customer";

  return <AccountShell email={email} name={name}>{children}</AccountShell>;
}
