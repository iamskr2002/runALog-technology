import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Auth guard for every /admin panel page: verifies the signed session
 * cookie server-side and redirects to the login screen when missing.
 */
export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const authenticated = await verifySessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );
  if (!authenticated) {
    redirect("/admin/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
