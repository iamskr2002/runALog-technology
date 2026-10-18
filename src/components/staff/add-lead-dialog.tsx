"use client";

/**
 * AddLeadDialog — quick lead creation from the staff panel. Leads created
 * here are automatically assigned to the signed-in staff member.
 */

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  apiFetch,
} from "@/components/admin/shared";
import { useStaffErrorHandler } from "@/components/staff/shared";

type AddLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddLeadDialog({
  open,
  onOpenChange,
  onCreated,
}: AddLeadDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useStaffErrorHandler();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name for the lead.");
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

    setPending(true);
    setError(null);
    try {
      await apiFetch("/api/staff/leads", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: email.trim() || null,
          phone: phone.trim() || null,
          company: company.trim() || null,
          value: parsedValue,
          notes: notes.trim() || null,
        }),
      });
      onCreated();
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
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>
            Leads you add are assigned to you and appear on your dashboard
            immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff-add-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="staff-add-name"
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
              <Label htmlFor="staff-add-email">Email</Label>
              <Input
                id="staff-add-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-add-phone">Phone</Label>
              <Input
                id="staff-add-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 010 0199"
                maxLength={40}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-add-company">Company</Label>
              <Input
                id="staff-add-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Acme Corp"
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-add-value">Deal value (USD)</Label>
              <Input
                id="staff-add-value"
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
            <Label htmlFor="staff-add-notes">Notes</Label>
            <Textarea
              id="staff-add-notes"
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
                <Plus className="size-4" aria-hidden="true" />
              )}
              Add lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
