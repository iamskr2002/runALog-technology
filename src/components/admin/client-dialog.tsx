"use client";

/**
 * ClientDialog — create or edit a client (contact details, service,
 * status, value, start date and internal notes).
 */

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Briefcase, Loader2 } from "lucide-react";
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
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
  useAdminErrorHandler,
  type AdminClient,
  type ClientStatus,
} from "@/components/admin/shared";
import { serviceOptions } from "@/lib/site-config";

const NO_SERVICE = "__none__";

type ClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null → create mode; set → edit mode. */
  client: AdminClient | null;
  onSaved: () => void;
};

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSaved,
}: ClientDialogProps) {
  const isEdit = client !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState<string>(NO_SERVICE);
  const [status, setStatus] = useState<ClientStatus>("onboarding");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useAdminErrorHandler();

  useEffect(() => {
    if (!open) return;
    setName(client?.name ?? "");
    setEmail(client?.email ?? "");
    setPhone(client?.phone ?? "");
    setCompany(client?.company ?? "");
    setService(client?.service ?? NO_SERVICE);
    setStatus(client?.status ?? "onboarding");
    setValue(
      client?.value !== null && client?.value !== undefined
        ? String(client.value)
        : ""
    );
    setStartDate(
      client?.startDate ? client.startDate.slice(0, 10) : ""
    );
    setNotes(client?.notes ?? "");
    setError(null);
  }, [open, client]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name for the client.");
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
        setError("Please enter a valid value (0 or more).");
        return;
      }
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail || null,
      phone: phone.trim() || null,
      company: company.trim() || null,
      service: service === NO_SERVICE ? null : service,
      status,
      value: parsedValue,
      startDate: startDate || undefined,
      notes: notes.trim() || null,
    };

    setPending(true);
    setError(null);
    try {
      if (isEdit && client) {
        await apiFetch(`/api/admin/clients/${client.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Client updated");
      } else {
        await apiFetch("/api/admin/clients", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Client added");
      }
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      handleError(caught, "Could not save the client.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "Add client"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the client's details, engagement status and value."
              : "Add a client you are onboarding or already work with."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="client-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe or Acme Corp"
              maxLength={120}
              autoFocus
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 010 0199"
                maxLength={40}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-company">Company</Label>
            <Input
              id="client-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Acme Corp"
              maxLength={150}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-service">Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger id="client-service" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SERVICE}>Not set</SelectItem>
                  {serviceOptions.map((option) => (
                    <SelectItem key={option.slug} value={option.slug}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-status">Status</Label>
              <Select
                value={status}
                onValueChange={(next) => setStatus(next as ClientStatus)}
              >
                <SelectTrigger id="client-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((clientStatus) => (
                    <SelectItem key={clientStatus} value={clientStatus}>
                      {CLIENT_STATUS_LABELS[clientStatus]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-value">Value (USD)</Label>
              <Input
                id="client-value"
                type="number"
                min={0}
                step="any"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-start">Start date</Label>
              <Input
                id="client-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-notes">Notes</Label>
            <Textarea
              id="client-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Scope, renewal dates, key contacts…"
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
                <Briefcase className="size-4" aria-hidden="true" />
              )}
              {isEdit ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
