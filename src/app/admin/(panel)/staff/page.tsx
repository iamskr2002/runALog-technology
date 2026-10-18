"use client";

/**
 * Staff — manage team member accounts for the /staff panel: create
 * accounts, set roles, reset passwords, deactivate or remove members, and
 * see how many assigned leads and activities each member has.
 */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  UserRound,
  Users,
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
import { Card } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  apiFetch,
  EmptyState,
  formatDateTime,
  formatRelative,
  useAdminErrorHandler,
  type AdminStaff,
} from "@/components/admin/shared";
import { cn } from "@/lib/utils";

type StaffResponse = { staff: AdminStaff[] };

function StaffSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminStaff[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<AdminStaff | null>(null);
  const [deleteMember, setDeleteMember] = useState<AdminStaff | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<StaffResponse>("/api/admin/staff");
      setStaff(data.staff);
    } catch (error) {
      handleError(error, "Could not load staff accounts.");
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function deleteStaffById(member: AdminStaff) {
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/staff/${member.id}`, { method: "DELETE" });
      toast.success(
        `${member.name} removed — their leads are back in the unassigned pool`
      );
      await load();
      setDeleteMember(null);
    } catch (error) {
      handleError(error, "Could not remove the staff member.");
    } finally {
      setDeleting(false);
    }
  }

  if (staff === null) {
    return <StaffSkeleton />;
  }

  const activeCount = staff.filter((member) => member.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Staff
            <span className="ml-2 text-base font-normal text-zinc-400">
              {activeCount} active
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Team members sign in at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700">
              /staff
            </code>{" "}
            with their email and password — each sees only their assigned
            leads.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add staff
        </Button>
      </div>

      {/* Table */}
      <Card className="gap-0 py-0">
        <div className="p-0">
          {staff.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={UserCog}
                title="No staff accounts yet."
                description="Create the first team member account — they will be able to sign in at /staff and work their assigned leads."
                action={
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add staff
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned leads</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Last sign-in</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="max-w-56 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700"
                            aria-hidden="true"
                          >
                            {member.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase() || "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900">
                              {member.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-normal",
                            member.role === "admin"
                              ? "border-teal-200 bg-teal-50 text-teal-700"
                              : "border-zinc-200 bg-zinc-100 text-zinc-600"
                          )}
                        >
                          {member.role === "admin" ? (
                            <ShieldCheck className="size-3" aria-hidden="true" />
                          ) : (
                            <UserRound className="size-3" aria-hidden="true" />
                          )}
                          {member.role === "admin" ? "Admin" : "Staff"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {member.leadCount ?? 0}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {member.activityCount ?? 0}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-500">
                        {member.lastLoginAt
                          ? formatRelative(member.lastLoginAt)
                          : "Never"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-normal",
                            member.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          )}
                        >
                          {member.active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-zinc-500"
                          onClick={() => setEditMember(member)}
                          aria-label={`Edit ${member.name}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteMember(member)}
                          aria-label={`Remove ${member.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Create / edit dialog */}
      <StaffDialog
        open={createOpen || editMember !== null}
        member={editMember}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditMember(null);
          }
        }}
        onSaved={() => void load()}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteMember !== null}
        onOpenChange={(open) => !open && setDeleteMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-zinc-900">
                {deleteMember?.name}
              </span>{" "}
              will immediately lose access to the staff panel. Their{" "}
              {deleteMember?.leadCount ?? 0} assigned lead(s) will move back to
              the unassigned pool and their scheduled activities will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (deleteMember) void deleteStaffById(deleteMember);
              }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Create / edit dialog ────────────────────────────────────────────── */

function StaffDialog({
  open,
  member,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  member: AdminStaff | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const isEdit = member !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [active, setActive] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useAdminErrorHandler();

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setPassword("");
    setRole(member?.role ?? "staff");
    setActive(member?.active ?? true);
    setError(null);
  }, [open, member]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      setError("Please enter a name.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isEdit && password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (isEdit && password && password.length < 8) {
      setError("The new password must be at least 8 characters.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      if (isEdit && member) {
        await apiFetch(`/api/admin/staff/${member.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: trimmedName,
            role,
            active,
            ...(password ? { password } : {}),
          }),
        });
        toast.success(
          password ? "Staff member updated — password reset" : "Staff member updated"
        );
      } else {
        await apiFetch("/api/admin/staff", {
          method: "POST",
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
            role,
          }),
        });
        toast.success("Staff account created — share the credentials securely");
      }
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      handleError(caught, "Could not save the staff account.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit staff member" : "Add staff member"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the account, change the role, or reset the password."
              : "Create an account the team member can use to sign in at /staff."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Morgan"
              maxLength={120}
              autoFocus={!isEdit}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@runalog.com"
              maxLength={200}
              disabled={isEdit}
            />
            {isEdit ? (
              <p className="text-xs text-zinc-500">
                The email is the sign-in ID and cannot be changed — create a
                new account instead.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-password">
              {isEdit ? "New password (optional)" : "Password"}{" "}
              {!isEdit ? <span className="text-red-500">*</span> : null}
            </Label>
            <Input
              id="staff-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "Min. 8 characters"}
              maxLength={200}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "staff")}
              >
                <SelectTrigger id="staff-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff — assigned leads only</SelectItem>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="staff-active">Account</Label>
                <div className="flex h-9 items-center gap-2">
                  <Switch
                    id="staff-active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <span className="text-sm text-zinc-600">
                    {active ? "Active — can sign in" : "Disabled — sign-in blocked"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {!isEdit ? (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
              <p className="flex items-center gap-1.5 font-medium">
                <KeyRound className="size-3.5" aria-hidden="true" />
                After creating the account
              </p>
              <p className="mt-1 leading-relaxed">
                Share the email and password with the team member securely.
                They sign in at <strong>/staff</strong> and only ever see the
                leads you assign to them.
              </p>
            </div>
          ) : null}

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
              {isEdit ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
