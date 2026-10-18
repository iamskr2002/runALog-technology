"use client";

/**
 * LeadDialog — create or edit a lead (name, contact details, pipeline
 * status, deal value and internal notes).
 */

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
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
  apiFetch,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  useAdminErrorHandler,
  type AdminLead,
  type AdminStaff,
  type LeadStatus,
} from "@/components/admin/shared";

type LeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null → create mode; set → edit mode. */
  lead: AdminLead | null;
  onSaved: () => void;
};

export function LeadDialog({ open, onOpenChange, lead, onSaved }: LeadDialogProps) {
  const isEdit = lead !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedToId, setAssignedToId] = useState<string>("unassigned");
  const [staffOptions, setStaffOptions] = useState<AdminStaff[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useAdminErrorHandler();

  useEffect(() => {
    if (!open) return;
    setName(lead?.name ?? "");
    setEmail(lead?.email ?? "");
    setPhone(lead?.phone ?? "");
    setCompany(lead?.company ?? "");
    setStatus(lead?.status ?? "new");
    setValue(lead?.value !== null && lead?.value !== undefined ? String(lead.value) : "");
    setNotes(lead?.notes ?? "");
    setAssignedToId(lead?.assignedTo?.id ?? "unassigned");
    setError(null);
    // Load active team members for the assignment picker.
    apiFetch<{ staff: AdminStaff[] }>("/api/admin/staff")
      .then((data) =>
        setStaffOptions(data.staff.filter((member) => member.active))
      )
      .catch(() => setStaffOptions([]));
  }, [open, lead]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name for the lead.");
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    let parsedValue: number | null = null;
    const trimmedValue = value.trim();
    if (trimmedValue) {
      parsedValue = Number(trimmedValue.replace(/[^0-9.\-]/g, ""));
      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        setError("Please enter a valid deal value (0 or more).");
        return;
      }
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail || null,
      phone: phone.trim() || null,
      company: company.trim() || null,
      status,
      value: parsedValue,
      notes: notes.trim() || null,
      assignedToId: assignedToId === "unassigned" ? null : assignedToId,
    };

    setPending(true);
    setError(null);
    try {
      if (isEdit && lead) {
        await apiFetch(`/api/admin/leads/${lead.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Lead updated");
      } else {
        await apiFetch("/api/admin/leads", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Lead added");
      }
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      handleError(caught, "Could not save the lead.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "Add lead"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the lead's details, pipeline stage and value."
              : "Add a lead you met, imported elsewhere, or want to track."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
              maxLength={120}
              autoFocus
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 010 0199"
                maxLength={40}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-company">Company</Label>
            <Input
              id="lead-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Acme Corp"
              maxLength={150}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lead-status">Status</Label>
              <Select
                value={status}
                onValueChange={(next) => setStatus(next as LeadStatus)}
              >
                <SelectTrigger id="lead-status" className="w-full">
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
              <Label htmlFor="lead-value">Deal value (USD)</Label>
              <Input
                id="lead-value"
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
            <Label htmlFor="lead-assignee">Assigned to</Label>
            <Select
              value={assignedToId}
              onValueChange={setAssignedToId}
            >
              <SelectTrigger id="lead-assignee" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  Unassigned (admin pool)
                </SelectItem>
                {staffOptions.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                    {member.role === "admin" ? " — admin" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              Assigned staff members see and manage this lead from their own
              dashboard.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-notes">Notes</Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Context, pain points, next steps…"
              rows={3}
              maxLength={5000}
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
              disabled={pending}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Users className="size-4" aria-hidden="true" />
              )}
              {isEdit ? "Save changes" : "Add lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
