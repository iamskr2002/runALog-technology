import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STAFF_COOKIE_NAME,
  verifyStaffCookie,
} from "@/lib/staff-session";
import { StaffLoginForm } from "@/components/staff/login-form";

export const metadata: Metadata = {
  title: { absolute: "Sign in — Staff — RunA Log Technologies" },
  robots: { index: false, follow: false },
};

export default async function StaffLoginPage() {
  const cookieStore = await cookies();
  const session = await verifyStaffCookie(
    cookieStore.get(STAFF_COOKIE_NAME)?.value
  );
  if (session) {
    redirect("/staff");
  }
  return <StaffLoginForm />;
}
