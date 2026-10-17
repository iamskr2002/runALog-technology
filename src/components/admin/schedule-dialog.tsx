"use client";

/**
 * ScheduleDialog — create a call / meeting / email / follow-up activity for
 * a lead. Shared by the Leads page (preselected lead) and the Calls page
 * (lead picker). The datetime-local value is converted to an ISO string
 * with the browser's local timezone offset before posting.
 */

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Loader2,
  type LucideIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTIVITY_TYPES,
  ACTIVITY_TYPE_ICONS,
  ACTIVITY_TYPE_LABELS,
  apiFetch,
  localInputToIso,
  useAdminErrorHandler,
  type ActivityType,
} from "@/components/admin/shared";

export type ScheduleDialogLead = { id: string; name: string; company: string | null };

type ScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Leads available for picking (already loaded by the calling page). */
  leads: ScheduleDialogLead[];
  /** Preselect this lead when the dialog opens (e.g. row action). */
  defaultLeadId?: string | null;
  /** Called after an activity was created successfully. */
  onCreated?: () => void;
};

export function ScheduleDialog({
  open,
  onOpenChange,
  leads,
  defaultLeadId = null,
  onCreated,
}: ScheduleDialogProps) {
  const [leadId, setLeadId] = useState<string>("");
  const [type, setType] = useState<ActivityType>("call");
  const [title, setTitle] = useState("Intro call");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useAdminErrorHandler();

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setLeadId(defaultLeadId ?? "");
    setType("call");
    setTitle("Intro call");
    setScheduledAt("");
    setNotes("");
    setError(null);
  }, [open, defaultLeadId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!leadId) {
      setError("Please choose a lead.");
      return;
    }
    const scheduledIso = localInputToIso(scheduledAt);
    if (!scheduledIso) {
      setError("Please pick a date and time.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch("/api/admin/activities", {
        method: "POST",
        body: JSON.stringify({
          leadId,
          type,
          title: title.trim() || "Intro call",
          scheduledAt: scheduledIso,
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      });
      toast.success("Call scheduled");
      onCreated?.();
      onOpenChange(false);
    } catch (caught) {
      handleError(caught, "Could not schedule the call.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a call or meeting</DialogTitle>
          <DialogDescription>
            Book time with a lead — it shows up on the dashboard and the Calls
            &amp; Meetings page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-lead">Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger
                id="schedule-lead"
                className="w-full"
                aria-invalid={error && !leadId ? true : undefined}
              >
                <SelectValue
                  placeholder={leads.length ? "Choose a lead" : "No leads yet"}
                />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` — ${lead.company}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as ActivityType)}
              >
                <SelectTrigger id="schedule-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((activityType) => {
                    const Icon: LucideIcon = ACTIVITY_TYPE_ICONS[activityType];
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
            <div className="space-y-2">
              <Label htmlFor="schedule-title">Title</Label>
              <Input
                id="schedule-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Intro call"
                maxLength={120}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-when">Date &amp; time</Label>
            <Input
              id="schedule-when"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              aria-invalid={error && !scheduledAt ? true : undefined}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-notes">Notes (optional)</Label>
            <Textarea
              id="schedule-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Agenda, numbers to discuss…"
              rows={3}
              maxLength={2000}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || leads.length === 0}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <CalendarClock className="size-4" aria-hidden="true" />
              )}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
