"use client";

/**
 * Admin dashboard — aggregated stats, quick actions, recent inquiries and
 * the upcoming schedule, all sourced from GET /api/admin/stats.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  Inbox,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activityTypeIcon,
  apiFetch,
  formatDateTime,
  formatMoney,
  formatRelative,
  serviceLabel,
  useAdminErrorHandler,
  type AdminStats,
} from "@/components/admin/shared";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  icon: Icon,
  value,
  sub,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  sub: string;
  badge?: string | null;
}) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        <Icon className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-zinc-900">
          {value}
        </span>
        {badge ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ stats: AdminStats }>("/api/admin/stats");
      setStats(data.stats);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      handleError(error, "Could not load dashboard stats.");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRetry() {
    setRetrying(true);
    await load();
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (failed || !stats) {
    return (
      <Card className="items-center gap-3 p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-600">
            Could not load the dashboard. Check your connection and try again.
          </p>
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {retrying ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of website inquiries and your sales pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-200 bg-white hover:bg-zinc-100"
          >
            <Link href="/admin/leads?create=1">
              <Users className="size-4" aria-hidden="true" />
              Add lead
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <Link href="/admin/calls?create=1">
              <CalendarClock className="size-4" aria-hidden="true" />
              Schedule call
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Inquiries"
          icon={Inbox}
          value={String(stats.inquiries.total)}
          badge={stats.inquiries.new > 0 ? `${stats.inquiries.new} new` : null}
          sub={`${stats.inquiries.converted} converted`}
        />
        <StatCard
          label="Leads"
          icon={Users}
          value={String(stats.leads.total)}
          badge={
            stats.unassignedLeads > 0
              ? `${stats.unassignedLeads} unassigned`
              : null
          }
          sub={`Pipeline ${formatMoney(stats.leads.pipelineValue)}`}
        />
        <StatCard
          label="Upcoming calls"
          icon={CalendarClock}
          value={String(stats.activities.upcoming)}
          sub="Scheduled from today on"
        />
        <StatCard
          label="Active clients"
          icon={Briefcase}
          value={String(stats.clients.active)}
          sub={`${stats.clients.total} total clients`}
        />
        <StatCard
          label="Conversion rate"
          icon={TrendingUp}
          value={`${stats.conversionRate}%`}
          sub={`${stats.leads.won} leads won`}
        />
      </div>

      {/* Team workload */}
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-zinc-100 px-6 py-4">
          <CardTitle className="text-base">Team workload</CardTitle>
          <CardDescription>
            Who is working which leads — assign new leads from the Leads page.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 py-2">
          {stats.team.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No staff accounts yet — create them on the Staff page.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {stats.team.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700"
                    aria-hidden="true"
                  >
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-zinc-900">
                      {member.name}
                      <span
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 text-[0.65rem] font-medium",
                          member.active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-600"
                        )}
                      >
                        {member.active ? "Active" : "Disabled"}
                      </span>
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {member.role === "admin" ? "Admin" : "Staff"} ·{" "}
                      {member.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-sm font-bold text-zinc-900">
                      {member.leadCount}
                    </p>
                    <p className="text-[0.65rem] uppercase tracking-wide text-zinc-400">
                      leads
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <div className="border-t border-zinc-100 px-6 py-3">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
          >
            Manage staff accounts
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Card>

      {/* Recent activity grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent inquiries */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-zinc-100 px-6 py-4">
            <CardTitle className="text-base">Recent inquiries</CardTitle>
            <CardDescription>
              Latest submissions from the website contact form.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 py-2">
            {stats.recentInquiries.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No inquiries yet — submissions from the website contact form
                will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.recentInquiries.map((inquiry) => (
                  <li
                    key={inquiry.id}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                        {inquiry.status === "new" ? (
                          <span
                            className="size-2 shrink-0 rounded-full bg-teal-500"
                            aria-label="New inquiry"
                          />
                        ) : null}
                        <span className="truncate">{inquiry.fullName}</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {inquiry.company
                          ? `${inquiry.company} · ${serviceLabel(inquiry.service)}`
                          : serviceLabel(inquiry.service)}
                      </p>
                    </div>
                    <time
                      dateTime={inquiry.createdAt}
                      className="shrink-0 pt-0.5 text-xs text-zinc-400"
                    >
                      {formatRelative(inquiry.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <div className="border-t border-zinc-100 px-6 py-3">
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
            >
              View all inquiries
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>

        {/* Upcoming schedule */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-zinc-100 px-6 py-4">
            <CardTitle className="text-base">Upcoming schedule</CardTitle>
            <CardDescription>
              Your next calls, meetings and follow-ups.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 py-2">
            {stats.upcomingActivities.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                Nothing scheduled — book a call from the Leads page or the
                “Schedule call” button above.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.upcomingActivities.map((activity) => {
                  const Icon = activityTypeIcon(activity.type);
                  return (
                    <li
                      key={activity.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {activity.title}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {activity.lead
                            ? [activity.lead.name, activity.lead.company]
                                .filter(Boolean)
                                .join(" · ")
                            : "—"}
                        </p>
                      </div>
                      <time
                        dateTime={activity.scheduledAt}
                        className="shrink-0 text-xs text-zinc-400"
                      >
                        {formatDateTime(activity.scheduledAt)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
          <div className="border-t border-zinc-100 px-6 py-3">
            <Link
              href="/admin/calls"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
            >
              View all calls &amp; meetings
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
