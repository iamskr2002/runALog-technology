import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/leads/:id/convert
 * Mark a lead as won and create a client record from it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!lead) {
    return NextResponse.json(
      { ok: false, message: "Lead not found." },
      { status: 404 }
    );
  }
  if (lead.client) {
    return NextResponse.json(
      { ok: false, message: "This lead has already been converted to a client." },
      { status: 409 }
    );
  }

  const client = await db.client.create({
    data: {
      leadId: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: "onboarding",
      value: lead.value,
      notes: lead.notes,
    },
  });

  await db.lead.update({ where: { id: lead.id }, data: { status: "won" } });

  return NextResponse.json({ ok: true, client });
}
