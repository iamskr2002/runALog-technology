"use client";

/**
 * Calls & Meetings — upcoming and past activities with mark-completed,
 * reschedule, cancel and delete actions. Supports ?create=1 (dashboard
 * quick action).
 */

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarClock,
  CheckCheck,
  Loader2,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
import {
  activityTypeIcon,
  apiFetch,
  dateToLocalInput,
  EmptyState,
  formatDateTime,
  formatDate,
  localInputToIso,
  statusBadgeClass,
  useAdminErrorHandler,
  type AdminActivity,
} from "@/components/admin/shared";

type ActivitiesResponse = { activities: AdminActivity[] };
type LeadsResponse = { leads: { id: string; name: string; company: string | null }[] };

type ScheduleLead = { id: string; name: string; company: string | null };

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

function ActivityCard({
  activity,
  isUpcoming,
  onComplete,
  onReschedule,
  onCancel,
  onDelete,
}: {
  activity: AdminActivity;
  isUpcoming: boolean;
  onComplete: (activity: AdminActivity) => void;
  onReschedule: (activity: AdminActivity) => void;
  onCancel: (activity: AdminActivity) => void;
  onDelete: (activity: AdminActivity) => void;
}) {
  const Icon = activityTypeIcon(activity.type);
  const scheduled = new Date(activity.scheduledAt);
  const dayNumber = Number.isNaN(scheduled.getTime())
    ? "—"
    : scheduled.getDate();
  const month = Number.isNaN(scheduled.getTime())
    ? ""
    : scheduled.toLocaleDateString("en-US", { month: "short" });
  const overdue =
    activity.status === "scheduled" &&
    scheduled.getTime() < Date.now();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center">
      {/* Date block */}
      <div
        className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border px-2 py-2 ${
          overdue ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-zinc-50"
        }`}
        aria-hidden="true"
      >
        <span className="font-display text-xl font-bold leading-none text-zinc-900">
          {dayNumber}
        </span>
        <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500">
          {month}
        </span>
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
          <p className="font-medium text-zinc-900">{activity.title}</p>
          <Badge className={statusBadgeClass(activity.status)}>
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </Badge>
          {overdue && !isUpcoming ? (
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              Overdue
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-zinc-500">
          {activity.lead
            ? [activity.lead.name, activity.lead.company].filter(Boolean).join(" · ")
            : "—"}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {formatDateTime(activity.scheduledAt)}
        </p>
        {activity.outcome ? (
          <p className="mt-1.5 line-clamp-2 rounded-md bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-500">
            Outcome: {activity.outcome}
          </p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        {activity.status === "scheduled" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplete(activity)}
              className="border-zinc-200 text-teal-700 hover:bg-teal-50 hover:text-teal-700"
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              Complete
            </Button>
            {isUpcoming ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(activity)}
                className="border-zinc-200"
              >
                <CalendarClock className="size-4" aria-hidden="true" />
                Reschedule
              </Button>
            ) : null}
            {isUpcoming ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(activity)}
                className="border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </Button>
            ) : null}
          </>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-zinc-400 hover:text-red-600"
          aria-label={`Delete ${activity.title}`}
          onClick={() => onDelete(activity)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function CallsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<AdminActivity[] | null>(null);
  const [scheduleLeads, setScheduleLeads] = useState<ScheduleLead[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completing, setCompleting] = useState<AdminActivity | null>(null);
  const [outcome, setOutcome] = useState("");
  const [completingPending, setCompletingPending] = useState(false);
  const [rescheduling, setRescheduling] = useState<AdminActivity | null>(null);
  const [newDateTime, setNewDateTime] = useState("");
  const [reschedulingPending, setReschedulingPending] = useState(false);
  const [cancelling, setCancelling] = useState<AdminActivity | null>(null);
  const [cancellingPending, setCancellingPending] = useState(false);
  const [deleting, setDeleting] = useState<AdminActivity | null>(null);
  const [deletingPending, setDeletingPending] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const [activitiesData, leadsData] = await Promise.all([
        apiFetch<ActivitiesResponse>("/api/admin/activities?scope=all"),
        apiFetch<LeadsResponse>("/api/admin/leads"),
      ]);
      setActivities(activitiesData.activities);
      setScheduleLeads(
        leadsData.leads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
        }))
      );
    } catch (error) {
      handleError(error, "Could not load calls & meetings.");
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  // Support the ?create=1 quick action from the dashboard.
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setScheduleOpen(true);
      router.replace("/admin/calls", { scroll: false });
    }
  }, [searchParams, router]);

  const { upcoming, past } = useMemo(() => {
    const list = activities ?? [];
    const now = Date.now();
    const upcomingActivities = list
      .filter(
        (activity) =>
          activity.status === "scheduled" &&
          new Date(activity.scheduledAt).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    const pastActivities = list
      .filter(
        (activity) =>
          activity.status !== "scheduled" ||
          new Date(activity.scheduledAt).getTime() < now
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
    return { upcoming: upcomingActivities, past: pastActivities };
  }, [activities]);

  async function patchActivity(
    activity: AdminActivity,
    payload: Record<string, unknown>,
    successMessage: string
  ) {
    await apiFetch(`/api/admin/activities/${activity.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    toast.success(successMessage);
    await load();
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!completing || completingPending) return;
    setCompletingPending(true);
    try {
      await patchActivity(
        completing,
        { status: "completed", outcome: outcome.trim() || null },
        "Call marked as completed"
      );
      setCompleting(null);
      setOutcome("");
    } catch (error) {
      handleError(error, "Could not mark the call as completed.");
    } finally {
      setCompletingPending(false);
    }
  }

  async function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rescheduling || reschedulingPending) return;
    const iso = localInputToIso(newDateTime);
    if (!iso) {
      toast.error("Please pick a new date and time.");
      return;
    }
    setReschedulingPending(true);
    try {
      await patchActivity(rescheduling, { scheduledAt: iso }, "Call rescheduled");
      setRescheduling(null);
    } catch (error) {
      handleError(error, "Could not reschedule the call.");
    } finally {
      setReschedulingPending(false);
    }
  }

  async function handleCancelConfirmed() {
    if (!cancelling || cancellingPending) return;
    setCancellingPending(true);
    try {
      await patchActivity(cancelling, { status: "cancelled" }, "Call cancelled");
      setCancelling(null);
    } catch (error) {
      handleError(error, "Could not cancel the call.");
    } finally {
      setCancellingPending(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleting || deletingPending) return;
    setDeletingPending(true);
    try {
      await apiFetch(`/api/admin/activities/${deleting.id}`, { method: "DELETE" });
      toast.success("Call deleted");
      await load();
      setDeleting(null);
    } catch (error) {
      handleError(error, "Could not delete the call.");
    } finally {
      setDeletingPending(false);
    }
  }

  if (activities === null) {
    return <CallsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Calls &amp; meetings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Everything you have booked with leads — past and upcoming.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setScheduleOpen(true)}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Schedule call
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-zinc-100">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Phone}
              title="No upcoming calls."
              description="Schedule one from a lead or the button above."
              action={
                <Button
                  size="sm"
                  onClick={() => setScheduleOpen(true)}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Schedule call
                </Button>
              }
            />
          ) : (
            upcoming.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isUpcoming
                onComplete={setCompleting}
                onReschedule={(target) => {
                  setRescheduling(target);
                  setNewDateTime(dateToLocalInput(target.scheduledAt));
                }}
                onCancel={setCancelling}
                onDelete={setDeleting}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No past calls yet."
              description="Completed, cancelled and overdue activities will appear here."
            />
          ) : (
            past.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isUpcoming={false}
                onComplete={setCompleting}
                onReschedule={(target) => {
                  setRescheduling(target);
                  setNewDateTime(dateToLocalInput(target.scheduledAt));
                }}
                onCancel={setCancelling}
                onDelete={setDeleting}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule dialog */}
      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        leads={scheduleLeads}
        onCreated={() => void load()}
      />

      {/* Mark completed dialog */}
      <Dialog
        open={completing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleting(null);
            setOutcome("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as completed</DialogTitle>
            <DialogDescription>
              {completing
                ? `${completing.title} — ${formatDateTime(completing.scheduledAt)}`
                : "Record how the call went."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-outcome">Outcome (optional)</Label>
              <Textarea
                id="activity-outcome"
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
                placeholder="What was discussed, agreed next steps…"
                rows={3}
                maxLength={2000}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleting(null)}
                disabled={completingPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={completingPending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {completingPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCheck className="size-4" aria-hidden="true" />
                )}
                Mark completed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog
        open={rescheduling !== null}
        onOpenChange={(open) => !open && setRescheduling(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule</DialogTitle>
            <DialogDescription>
              {rescheduling
                ? `${rescheduling.title} — currently ${formatDateTime(
                    rescheduling.scheduledAt
                  )}`
                : "Pick a new date and time."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity-when">New date &amp; time</Label>
              <Input
                id="activity-when"
                type="datetime-local"
                value={newDateTime}
                onChange={(event) => setNewDateTime(event.target.value)}
                required
                autoFocus
              />
              {rescheduling ? (
                <p className="text-xs text-zinc-400">
                  Originally {formatDate(rescheduling.scheduledAt)}.
                </p>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRescheduling(null)}
                disabled={reschedulingPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reschedulingPending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {reschedulingPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarClock className="size-4" aria-hidden="true" />
                )}
                Reschedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this call?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelling
                ? `"${cancelling.title}" on ${formatDateTime(
                    cancelling.scheduledAt
                  )} will be marked as cancelled.`
                : "The activity will be marked as cancelled."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingPending}>
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleCancelConfirmed();
              }}
              disabled={cancellingPending}
              className="bg-zinc-700 text-white hover:bg-zinc-800"
            >
              {cancellingPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CalendarClock className="size-4" aria-hidden="true" />
              )}
              Cancel call
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this activity?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `"${deleting.title}" (${formatDateTime(
                    deleting.scheduledAt
                  )}) will be permanently removed. This cannot be undone.`
                : "The activity will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteConfirmed();
              }}
              disabled={deletingPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deletingPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminCallsPage() {
  return (
    <Suspense fallback={<CallsSkeleton />}>
      <CallsInner />
    </Suspense>
  );
}
