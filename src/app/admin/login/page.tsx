import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/admin-session";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Admin — RunA Log Technologies" },
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const authenticated = await verifySessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  );
  if (authenticated) {
    redirect("/admin");
  }
  return <AdminLoginForm />;
}
