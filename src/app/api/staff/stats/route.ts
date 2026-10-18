import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, staffUnauthorizedResponse } from "@/lib/staff-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staff/stats — personal dashboard KPIs for the signed-in staff
 * member (scoped to their assigned leads; admins get the global numbers).
 */
export async function GET(request: Request) {
  const session = await requireStaff(request);
  if (!session) return staffUnauthorizedResponse();

  const scope =
    session.role === "admin" ? {} : { assignedToId: session.staffId };

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    totalLeads,
    leadGroups,
    wonLeads,
    pipelineAggregate,
    upcomingCount,
    todayCount,
    overdueCount,
    completedThisWeek,
    myLeads,
    todayActivities,
    upcomingActivities,
  ] = await Promise.all([
    db.lead.count({ where: scope }),
    db.lead.groupBy({ by: ["status"], _count: { _all: true }, where: scope }),
    db.lead.count({ where: { ...scope, status: "won" } }),
    db.lead.aggregate({
      _sum: { value: true },
      where: {
        ...scope,
        status: {
          in: ["new", "contacted", "qualified", "proposal", "negotiation"],
        },
      },
    }),
    db.activity.count({
      where: {
        lead: scope,
        status: "scheduled",
        scheduledAt: { gte: now },
      },
    }),
    db.activity.count({
      where: {
        lead: scope,
        status: "scheduled",
        scheduledAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
    db.activity.count({
      where: {
        lead: scope,
        status: "scheduled",
        scheduledAt: { lt: now },
      },
    }),
    db.activity.count({
      where: {
        lead: scope,
        status: "completed",
        updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.lead.findMany({
      where: scope,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 6,
      include: {
        activities: {
          where: { status: "scheduled", scheduledAt: { gte: now } },
          orderBy: { scheduledAt: "asc" },
          take: 1,
        },
      },
    }),
    db.activity.findMany({
      where: {
        lead: scope,
        status: "scheduled",
        scheduledAt: { gte: startOfToday, lt: endOfToday },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: {
        lead: { select: { id: true, name: true, company: true, status: true } },
      },
    }),
    db.activity.findMany({
      where: { lead: scope, status: "scheduled", scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: {
        lead: { select: { id: true, name: true, company: true, status: true } },
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
      role: session.role,
      leads: {
        total: totalLeads,
        byStatus,
        won: wonLeads,
        pipelineValue: pipelineAggregate._sum.value ?? 0,
      },
      activities: {
        upcoming: upcomingCount,
        today: todayCount,
        overdue: overdueCount,
        completedThisWeek,
      },
      conversionRate:
        totalLeads === 0 ? 0 : Math.round((wonLeads / totalLeads) * 100),
      myLeads: myLeads.map((lead) => ({
        ...lead,
        nextActivity: lead.activities[0] ?? null,
        activities: undefined,
      })),
      todayActivities,
      upcomingActivities,
    },
  });
}
