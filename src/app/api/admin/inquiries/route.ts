import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INQUIRY_STATUSES = ["new", "read", "replied", "converted", "archived"];

/** GET /api/admin/inquiries?status=&q= — list website inquiries (newest first). */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const where =
    status && status !== "all" && INQUIRY_STATUSES.includes(status)
      ? { status }
      : {};

  // Small dataset (admin tool) → DB status filter + in-memory text search.
  const rows = await db.projectInquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const inquiries = query
    ? rows.filter((row) =>
        [
          row.fullName,
          row.email,
          row.company ?? "",
          row.service,
          row.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : rows;

  return NextResponse.json({ ok: true, inquiries });
}
