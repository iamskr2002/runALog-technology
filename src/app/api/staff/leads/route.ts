import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, staffUnauthorizedResponse } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  company: z.string().trim().max(150).nullable().optional(),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]).optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** GET /api/staff/leads?status=&q= — leads assigned to the signed-in staff member (admins see all). */
export async function GET(request: Request) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  // Role scoping: staff → only their assigned leads; admin → everything.
  const scope =
    session.role === "admin" ? {} : { assignedToId: session.staffId };
  const where =
    status && status !== "all" && LEAD_STATUSES.includes(status)
      ? { ...scope, status }
      : scope;

  const now = new Date();

  const rows = await db.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      activities: {
        where: { status: "scheduled", scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
      client: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  const leads = rows.map((lead) => ({
    ...lead,
    nextActivity: lead.activities[0] ?? null,
    activities: undefined,
  }));

  const filtered = query
    ? leads.filter((lead) =>
        [
          lead.name,
          lead.email ?? "",
          lead.phone ?? "",
          lead.company ?? "",
          lead.notes ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : leads;

  return NextResponse.json({ ok: true, leads: filtered });
}

/** POST /api/staff/leads — staff members can add leads; new leads auto-assign to them. */
export async function POST(request: Request) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please provide at least a name." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const lead = await db.lead.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      source: "manual",
      status: data.status ?? "new",
      value: data.value ?? null,
      notes: data.notes ?? null,
      // Own every lead you create — it appears on your dashboard instantly.
      assignedToId: session.staffId,
    },
  });

  return NextResponse.json({ ok: true, lead });
}
