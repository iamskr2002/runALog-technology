import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/inquiries/:id/convert
 * Turn a website inquiry into a tracked lead (one-to-one; idempotent guard).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;

  const inquiry = await db.projectInquiry.findUnique({
    where: { id },
    include: { lead: true },
  });

  if (!inquiry) {
    return NextResponse.json(
      { ok: false, message: "Inquiry not found." },
      { status: 404 }
    );
  }
  if (inquiry.lead) {
    return NextResponse.json(
      { ok: false, message: "This inquiry was already converted to a lead." },
      { status: 409 }
    );
  }

  const meta = [
    `Service: ${inquiry.service}`,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    inquiry.timeline ? `Timeline: ${inquiry.timeline}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const lead = await db.lead.create({
    data: {
      name: inquiry.fullName,
      email: inquiry.email,
      company: inquiry.company,
      source: "website",
      status: "new",
      notes: `[Website inquiry — ${meta}]\n\n${inquiry.description}`,
      inquiryId: inquiry.id,
    },
  });

  await db.projectInquiry.update({
    where: { id: inquiry.id },
    data: { status: "converted" },
  });

  return NextResponse.json({ ok: true, lead });
}
