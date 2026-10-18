import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  company: z.string().trim().max(150).nullable().optional(),
  service: z.string().trim().max(120).nullable().optional(),
  status: z
    .enum(["onboarding", "active", "paused", "completed", "churned"])
    .optional(),
  value: z.number().min(0).max(1_000_000_000).nullable().optional(),
  startDate: z.string().min(10).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

/** GET /api/admin/clients — list clients with their originating lead (if any). */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { lead: { select: { id: true, name: true, company: true } } },
  });

  return NextResponse.json({ ok: true, clients });
}

/** POST /api/admin/clients — add a client manually. */
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please provide at least a name." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const startDate = data.startDate ? new Date(data.startDate) : undefined;

  const client = await db.client.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      service: data.service ?? null,
      status: data.status ?? "onboarding",
      value: data.value ?? null,
      startDate:
        startDate && !Number.isNaN(startDate.getTime()) ? startDate : undefined,
      notes: data.notes ?? null,
    },
  });

  return NextResponse.json({ ok: true, client });
}
