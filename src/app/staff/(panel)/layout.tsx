import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  STAFF_COOKIE_NAME,
  verifyStaffCookie,
} from "@/lib/staff-session";
import { StaffShell } from "@/components/staff/staff-shell";
import type { StaffProfile } from "@/components/staff/shared";

/**
 * Auth guard for every /staff panel page: verifies the signed session
 * cookie server-side, confirms the account still exists and is active,
 * then redirects to the login screen when invalid.
 */
export default async function StaffPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const session = await verifyStaffCookie(
    cookieStore.get(STAFF_COOKIE_NAME)?.value
  );

  const staff = session
    ? await db.staff.findUnique({
        where: { id: session.staffId },
        select: { id: true, name: true, email: true, role: true, active: true },
      })
    : null;

  if (!session || !staff || !staff.active) {
    redirect("/staff/login");
  }

  const profile: StaffProfile = {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role === "admin" ? "admin" : "staff",
  };

  return <StaffShell profile={profile}>{children}</StaffShell>;
}
