import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/stats — dashboard overview numbers, recent inquiries and upcoming schedule. */
export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();

  const now = new Date();

  const [
    totalInquiries,
    newInquiries,
    convertedInquiries,
    totalLeads,
    leadGroups,
    wonLeads,
    pipelineAggregate,
    totalClients,
    activeClients,
    upcomingActivityCount,
    recentInquiries,
    upcomingActivities,
    unassignedLeads,
    staffRows,
  ] = await Promise.all([
    db.projectInquiry.count(),
    db.projectInquiry.count({ where: { status: "new" } }),
    db.projectInquiry.count({ where: { status: "converted" } }),
    db.lead.count(),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.count({ where: { status: "won" } }),
    db.lead.aggregate({
      _sum: { value: true },
      where: {
        status: { in: ["new", "contacted", "qualified", "proposal", "negotiation"] },
      },
    }),
    db.client.count(),
    db.client.count({ where: { status: { in: ["onboarding", "active"] } } }),
    db.activity.count({ where: { status: "scheduled", scheduledAt: { gte: now } } }),
    db.projectInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.activity.findMany({
      where: { status: "scheduled", scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: { lead: { select: { id: true, name: true, company: true } } },
    }),
    db.lead.count({ where: { assignedToId: null } }),
    db.staff.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        _count: { select: { assignedLeads: true, activities: true } },
      },
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const group of leadGroups) {
    byStatus[group.status] = group._count._all;
  }

  return NextResponse.json({
    ok: true,
    stats: {
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        converted: convertedInquiries,
      },
      leads: {
        total: totalLeads,
        byStatus,
        won: wonLeads,
        pipelineValue: pipelineAggregate._sum.value ?? 0,
      },
      clients: { total: totalClients, active: activeClients },
      activities: { upcoming: upcomingActivityCount },
      conversionRate:
        totalLeads === 0 ? 0 : Math.round((wonLeads / totalLeads) * 100),
      unassignedLeads,
      team: staffRows.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        active: member.active,
        leadCount: member._count.assignedLeads,
        activityCount: member._count.activities,
      })),
      recentInquiries,
      upcomingActivities,
    },
  });
}
