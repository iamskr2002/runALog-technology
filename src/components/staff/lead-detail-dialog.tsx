"use client";

/**
 * StaffLeadDetailDialog — work a single assigned lead: update the pipeline
 * status / value / notes, review the activity timeline, schedule new
 * calls or meetings, and mark activities complete or cancelled.
 */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_ICONS,
  ACTIVITY_TYPE_LABELS,
  activityTypeIcon,
  apiFetch,
  formatDateTime,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  localInputToIso,
  statusBadgeClass,
  type ActivityType,
  type LeadStatus,
} from "@/components/admin/shared";
import {
  useStaffErrorHandler,
  type StaffActivity,
  type StaffLead,
} from "@/components/staff/shared";
import { cn } from "@/lib/utils";

type StaffLeadDetailDialogProps = {
  lead: StaffLead | null;
  onOpenChange: (open: boolean) => void;
  /** Called after any successful change so the page can reload. */
  onChanged: () => void;
};

export function StaffLeadDetailDialog({
  lead,
  onOpenChange,
  onChanged,
}: StaffLeadDetailDialogProps) {
  const open = lead !== null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {lead ? (
          /* Keyed by lead id so the form state resets by remounting. */
          <LeadDetailBody
            key={lead.id}
            lead={lead}
            onOpenChange={onOpenChange}
            onChanged={onChanged}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LeadDetailBody({
  lead,
  onOpenChange,
  onChanged,
}: {
  lead: StaffLead;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const handleError = useStaffErrorHandler();
  // Initialised from props; the parent keys this component by lead id so a
  // new lead remounts the form with fresh values.
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [value, setValue] = useState(
    lead.value !== null && lead.value !== undefined ? String(lead.value) : ""
  );
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    let parsedValue: number | null = null;
    const trimmedValue = value.trim();
    if (trimmedValue) {
      parsedValue = Number(trimmedValue.replace(/[^0-9.\-]/g, ""));
      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        toast.error("Please enter a valid deal value.");
        return;
      }
    }
    setSaving(true);
    try {
      await apiFetch(`/api/staff/leads/${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          value: parsedValue,
          notes: notes.trim() || null,
        }),
      });
      toast.success("Lead updated");
      onChanged();
      onOpenChange(false);
    } catch (error) {
      handleError(error, "Could not update the lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          {lead.name}
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              statusBadgeClass(lead.status)
            )}
          >
            {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
          </span>
        </DialogTitle>
        <DialogDescription>
          {[
            lead.company,
            lead.email,
            lead.phone,
          ]
            .filter(Boolean)
            .join(" · ") || "No contact details recorded yet."}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="progress">
        <TabsList className="w-full">
          <TabsTrigger value="progress" className="flex-1">
            Progress
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1">
            Calls &amp; meetings
          </TabsTrigger>
        </TabsList>

        {/* Progress tab */}
        <TabsContent value="progress">
          <form onSubmit={handleSave} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staff-lead-status">Pipeline status</Label>
                <Select
                  value={status}
                  onValueChange={(next) => setStatus(next as LeadStatus)}
                >
                  <SelectTrigger id="staff-lead-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((leadStatus) => (
                      <SelectItem key={leadStatus} value={leadStatus}>
                        {LEAD_STATUS_LABELS[leadStatus]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-lead-value">Deal value (USD)</Label>
                <Input
                  id="staff-lead-value"
                  type="number"
                  min={0}
                  step="any"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="12000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-lead-notes">Notes</Label>
              <Textarea
                id="staff-lead-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What was discussed, pain points, next steps…"
                rows={4}
                maxLength={5000}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                Save progress
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Schedule tab */}
        <TabsContent value="schedule">
          <ScheduleSection lead={lead} onChanged={onChanged} />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ── Schedule section (list + create) ─────────────────────────────────── */

function ScheduleSection({
  lead,
  onChanged,
}: {
  lead: StaffLead;
  onChanged: () => void;
}) {
  const handleError = useStaffErrorHandler();
  const [activities, setActivities] = useState<StaffActivity[] | null>(null);
  const [type, setType] = useState<ActivityType>("call");
  const [title, setTitle] = useState("Intro call");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ lead: { activities: StaffActivity[] } }>(
        `/api/staff/leads/${lead.id}`
      );
      setActivities(data.lead.activities);
    } catch (error) {
      handleError(error, "Could not load the activity timeline.");
    }
  }, [lead.id, handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const scheduledIso = localInputToIso(scheduledAt);
    if (!scheduledIso) {
      setError("Please pick a date and time.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch("/api/staff/activities", {
        method: "POST",
        body: JSON.stringify({
          leadId: lead.id,
          type,
          title: title.trim() || "Intro call",
          scheduledAt: scheduledIso,
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      });
      toast.success("Call scheduled");
      setTitle("Follow-up call");
      setScheduledAt("");
      setNotes("");
      await load();
      onChanged();
    } catch (caught) {
      handleError(caught, "Could not schedule the call.");
    } finally {
      setPending(false);
    }
  }

  async function updateActivity(
    activity: StaffActivity,
    data: { status?: string; outcome?: string }
  ) {
    try {
      await apiFetch(`/api/staff/activities/${activity.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (data.status === "completed") toast.success("Marked as completed");
      if (data.status === "cancelled") toast.success("Cancelled");
      await load();
      onChanged();
    } catch (error) {
      handleError(error, "Could not update the activity.");
    }
  }

  const now = Date.now();
  const upcoming = (activities ?? []).filter(
    (activity) =>
      activity.status === "scheduled" &&
      new Date(activity.scheduledAt).getTime() >= now
  );
  const past = (activities ?? [])
    .filter((activity) => !upcoming.includes(activity))
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

  return (
    <div className="space-y-5">
      {/* New schedule form */}
      <form onSubmit={handleSchedule} noValidate className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="staff-schedule-type">Type</Label>
            <Select
              value={type}
              onValueChange={(next) => setType(next as ActivityType)}
            >
              <SelectTrigger id="staff-schedule-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((activityType) => {
                  const Icon = ACTIVITY_TYPE_ICONS[activityType];
                  return (
                    <SelectItem key={activityType} value={activityType}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" aria-hidden="true" />
                        {ACTIVITY_TYPE_LABELS[activityType]}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-schedule-title">Title</Label>
            <Input
              id="staff-schedule-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Intro call"
              maxLength={120}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-schedule-when">Date &amp; time</Label>
          <Input
            id="staff-schedule-when"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-schedule-notes">Notes (optional)</Label>
          <Textarea
            id="staff-schedule-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Agenda, numbers to discuss…"
            rows={2}
            maxLength={2000}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-teal-600 text-white hover:bg-teal-700"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CalendarPlus className="size-4" aria-hidden="true" />
          )}
          Schedule
        </Button>
      </form>

      <Separator />

      {/* Upcoming */}
      <ActivityList
        heading="Upcoming"
        activities={upcoming}
        onActivity={(activity, data) => void updateActivity(activity, data)}
        emptyText="Nothing scheduled — book the next call above."
      />
      <ActivityList
        heading="Past"
        activities={past}
        onActivity={(activity, data) => void updateActivity(activity, data)}
        emptyText="No past activities yet."
        isPast
      />
    </div>
  );
}

function ActivityList({
  heading,
  activities,
  onActivity,
  emptyText,
  isPast = false,
}: {
  heading: string;
  activities: StaffActivity[];
  onActivity: (
    activity: StaffActivity,
    data: { status?: string; outcome?: string }
  ) => void;
  emptyText: string;
  isPast?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {heading}
      </p>
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => {
            const Icon = activityTypeIcon(activity.type);
            const overdue =
              activity.status === "scheduled" &&
              new Date(activity.scheduledAt).getTime() < Date.now();
            return (
              <li
                key={activity.id}
                className={cn(
                  "rounded-lg border p-3",
                  overdue
                    ? "border-amber-200 bg-amber-50"
                    : "border-zinc-200 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {ACTIVITY_TYPE_LABELS[activity.type]} ·{" "}
                        {formatDateTime(activity.scheduledAt)}
                        {overdue ? " · overdue" : ""}
                      </p>
                      {activity.outcome ? (
                        <p className="mt-1 text-xs text-zinc-600">
                          Outcome: {activity.outcome}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-1.5 py-0.5 text-[0.65rem] font-medium",
                      statusBadgeClass(activity.status)
                    )}
                  >
                    {ACTIVITY_STATUS_LABELS[activity.status]}
                  </span>
                </div>
                {activity.status === "scheduled" ? (
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 border-emerald-200 bg-white px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        const outcome = window.prompt(
                          "Outcome / summary (optional):"
                        );
                        if (outcome === null) return;
                        onActivity(activity, {
                          status: "completed",
                          outcome: outcome.trim() || undefined,
                        });
                      }}
                    >
                      <Check className="size-3" aria-hidden="true" />
                      Complete
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 border-zinc-200 bg-white px-2 text-xs text-zinc-600 hover:bg-zinc-100"
                      onClick={() =>
                        onActivity(activity, { status: "cancelled" })
                      }
                    >
                      <X className="size-3" aria-hidden="true" />
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {isPast && activities.length > 6 ? null : null}
    </div>
  );
}
