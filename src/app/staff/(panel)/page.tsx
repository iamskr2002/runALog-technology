"use client";

/**
 * Staff dashboard — personal KPIs scoped to the signed-in member's
 * assigned leads: pipeline value, today's schedule, overdue follow-ups,
 * plus quick lists of my leads and upcoming calls (GET /api/staff/stats).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CheckCheck,
  Loader2,
  Phone,
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
  LEAD_STATUS_LABELS,
  statusBadgeClass,
} from "@/components/admin/shared";
import {
  useStaffErrorHandler,
  type StaffStats,
} from "@/components/staff/shared";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  icon: Icon,
  value,
  sub,
  alert,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        <Icon
          className={cn(
            "size-4 shrink-0",
            alert ? "text-amber-500" : "text-teal-600"
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2">
        <span className="font-display text-2xl font-bold text-zinc-900">
          {value}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
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

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleError = useStaffErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ stats: StaffStats }>("/api/staff/stats");
      setStats(data.stats);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      handleError(error, "Could not load your dashboard.");
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
            Could not load your dashboard. Check your connection and try again.
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

  const isPersonal = stats.role !== "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            {greeting()} — here is your day
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isPersonal
              ? "Everything below is scoped to the leads assigned to you."
              : "Admin view — all leads and activities across the team."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-200 bg-white hover:bg-zinc-100"
          >
            <Link href="/staff/leads">
              <Users className="size-4" aria-hidden="true" />
              Work my leads
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <Link href="/staff/calls">
              <CalendarClock className="size-4" aria-hidden="true" />
              My schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="My leads"
          icon={Users}
          value={String(stats.leads.total)}
          sub={`${stats.leads.won} won · ${stats.conversionRate}% conversion`}
        />
        <StatCard
          label="Pipeline value"
          icon={TrendingUp}
          value={formatMoney(stats.leads.pipelineValue)}
          sub="Open opportunities"
        />
        <StatCard
          label="Calls today"
          icon={Phone}
          value={String(stats.activities.today)}
          sub={`${stats.activities.upcoming} upcoming total`}
        />
        <StatCard
          label="Overdue"
          icon={AlarmClock}
          value={String(stats.activities.overdue)}
          sub={
            stats.activities.overdue > 0
              ? "Scheduled calls that passed their time"
              : "Nothing overdue — nice"
          }
          alert={stats.activities.overdue > 0}
        />
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's schedule */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-zinc-100 px-6 py-4">
            <CardTitle className="text-base">Today&apos;s schedule</CardTitle>
            <CardDescription>
              {stats.todayActivities.length > 0
                ? "Your calls and meetings booked for today."
                : "Nothing left on today's calendar."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 py-2">
            {stats.todayActivities.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No calls today — schedule one from the My Leads page.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.todayActivities.map((activity) => {
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
                        className="shrink-0 text-xs font-medium text-zinc-500"
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
              href="/staff/calls"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
            >
              View full schedule
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>

        {/* My recent leads */}
        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-zinc-100 px-6 py-4">
            <CardTitle className="text-base">Recently updated leads</CardTitle>
            <CardDescription>
              Pick up where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 py-2">
            {stats.myLeads.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No leads assigned to you yet — the owner assigns leads from the
                admin Leads page.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.myLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {lead.name}
                        {lead.company ? (
                          <span className="font-normal text-zinc-400">
                            {" "}
                            · {lead.company}
                          </span>
                        ) : null}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 text-[0.65rem] font-medium",
                            statusBadgeClass(lead.status)
                          )}
                        >
                          {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                        </span>
                        {lead.nextActivity ? (
                          <span className="truncate text-xs text-zinc-500">
                            {lead.nextActivity.title} ·{" "}
                            {formatRelative(lead.nextActivity.scheduledAt)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <time
                      dateTime={lead.updatedAt}
                      className="shrink-0 pt-0.5 text-xs text-zinc-400"
                    >
                      {formatRelative(lead.updatedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <div className="border-t border-zinc-100 px-6 py-3">
            <Link
              href="/staff/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition-colors hover:text-teal-600"
            >
              Go to my leads
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </div>

      {/* This week summary */}
      <div className="flex flex-col gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-600">
            <CheckCheck className="size-4" aria-hidden="true" />
          </span>
          <p className="text-sm text-teal-900">
            <span className="font-semibold">
              {stats.activities.completedThisWeek}
            </span>{" "}
            calls &amp; follow-ups completed in the last 7 days.
          </p>
        </div>
        <p className="text-xs text-teal-700">
          {stats.activities.overdue > 0
            ? "Clear the overdue items first — leads move faster with timely follow-ups."
            : "Keep the streak going — timely follow-ups win deals."}
        </p>
      </div>
    </div>
  );
}
