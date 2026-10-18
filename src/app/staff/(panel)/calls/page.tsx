"use client";

/**
 * My Calls & Meetings — the signed-in staff member's schedule (activities
 * on their assigned leads): upcoming and past tabs with complete, cancel
 * and outcome logging.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, CheckCheck, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activityTypeIcon,
  apiFetch,
  EmptyState,
  formatDateTime,
  ACTIVITY_STATUS_LABELS,
  statusBadgeClass,
} from "@/components/admin/shared";
import {
  useStaffErrorHandler,
  type StaffActivity,
} from "@/components/staff/shared";
import { cn } from "@/lib/utils";

type ActivitiesResponse = { activities: StaffActivity[] };

function CallsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function StaffCallsPage() {
  const [activities, setActivities] = useState<StaffActivity[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleError = useStaffErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ActivitiesResponse>(
        "/api/staff/activities?filter=all"
      );
      setActivities(data.activities);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      handleError(error, "Could not load your schedule.");
    } finally {
      setRetrying(false);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateActivity(
    activity: StaffActivity,
    data: { status?: string; outcome?: string }
  ) {
    setPendingId(activity.id);
    try {
      await apiFetch(`/api/staff/activities/${activity.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (data.status === "completed") toast.success("Marked as completed");
      else if (data.status === "cancelled") toast.success("Cancelled");
      await load();
    } catch (error) {
      handleError(error, "Could not update the activity.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    await load();
  }

  if (activities === null && !failed) {
    return <CallsSkeleton />;
  }

  if (failed || activities === null) {
    return (
      <Card className="items-center gap-3 p-8 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-600">
            Could not load your schedule. Check your connection and try again.
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

  const now = Date.now();
  const upcoming = activities
    .filter(
      (activity) =>
        activity.status === "scheduled" &&
        new Date(activity.scheduledAt).getTime() >= now
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  const past = activities
    .filter((activity) => !upcoming.includes(activity))
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-900">
          My Calls &amp; Meetings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your schedule across your assigned leads — complete calls and log
          outcomes as you go.
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            <span className="ml-1.5 rounded-full bg-teal-100 px-1.5 text-xs font-semibold text-teal-700">
              {upcoming.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 text-xs font-semibold text-zinc-600">
              {past.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <ActivityItems
            items={upcoming}
            emptyIcon={CalendarClock}
            emptyTitle="Nothing upcoming."
            emptyDescription="Schedule calls from the My Leads page — open a lead and switch to the Calls & meetings tab."
            pendingId={pendingId}
            onActivity={updateActivity}
          />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <ActivityItems
            items={past}
            emptyIcon={CheckCheck}
            emptyTitle="No past activities yet."
            emptyDescription="Completed and cancelled calls will appear here."
            pendingId={pendingId}
            onActivity={updateActivity}
            isPast
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityItems({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  pendingId,
  onActivity,
  isPast = false,
}: {
  items: StaffActivity[];
  emptyIcon: typeof CalendarClock;
  emptyTitle: string;
  emptyDescription: string;
  pendingId: string | null;
  onActivity: (
    activity: StaffActivity,
    data: { status?: string; outcome?: string }
  ) => Promise<void>;
  isPast?: boolean;
}) {
  if (items.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-3">
      {items.map((activity) => {
        const Icon = activityTypeIcon(activity.type);
        const scheduled = new Date(activity.scheduledAt);
        const overdue =
          activity.status === "scheduled" && scheduled.getTime() < Date.now();
        const busy = pendingId === activity.id;
        return (
          <div
            key={activity.id}
            className={cn(
              "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center",
              overdue
                ? "border-amber-200 bg-amber-50"
                : "border-zinc-200 bg-white"
            )}
          >
            {/* Date block */}
            <div
              className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2"
              aria-hidden="true"
            >
              <span className="font-display text-xl font-bold leading-none text-zinc-900">
                {Number.isNaN(scheduled.getTime()) ? "—" : scheduled.getDate()}
              </span>
              <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500">
                {Number.isNaN(scheduled.getTime())
                  ? ""
                  : scheduled.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {activity.title}
                </p>
                <span
                  className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[0.65rem] font-medium",
                    statusBadgeClass(activity.status)
                  )}
                >
                  {ACTIVITY_STATUS_LABELS[activity.status]}
                </span>
                {overdue ? (
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-700">
                    Overdue
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {activity.lead
                  ? [activity.lead.name, activity.lead.company]
                      .filter(Boolean)
                      .join(" · ")
                  : "—"}{" "}
                · {formatDateTime(activity.scheduledAt)}
              </p>
              {activity.outcome ? (
                <p className="mt-1 text-xs text-zinc-600">
                  Outcome: {activity.outcome}
                </p>
              ) : null}
            </div>

            {/* Actions */}
            {activity.status === "scheduled" ? (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    const outcome = window.prompt(
                      "Outcome / summary (optional):"
                    );
                    if (outcome === null) return;
                    void onActivity(activity, {
                      status: "completed",
                      outcome: outcome.trim() || undefined,
                    });
                  }}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCheck className="size-4" aria-hidden="true" />
                  )}
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void onActivity(activity, { status: "cancelled" })}
                  className="border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
                >
                  <X className="size-4" aria-hidden="true" />
                  Cancel
                </Button>
              </div>
            ) : (
              <span className="shrink-0 text-xs text-zinc-400">
                {isPast ? "Past" : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
