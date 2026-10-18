"use client";

/**
 * Leads — the sales pipeline. Pipeline chips with counts, a filterable
 * table, create/edit dialogs, CSV/XLSX import, scheduling and conversion
 * to clients. Supports ?create=1 (dashboard quick action).
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  CalendarPlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Upload,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportDialog } from "@/components/admin/import-dialog";
import { LeadDialog } from "@/components/admin/lead-dialog";
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
import {
  apiFetch,
  formatDateTime,
  formatMoney,
  formatRelative,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  statusBadgeClass,
  useAdminErrorHandler,
  type AdminLead,
  type LeadStatus,
} from "@/components/admin/shared";
import { cn } from "@/lib/utils";

type LeadsResponse = { leads: AdminLead[] };

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  website: { label: "Website", className: "border-teal-200 bg-teal-50 text-teal-700" },
  import: { label: "Import", className: "border-zinc-200 bg-zinc-100 text-zinc-600" },
  manual: { label: "Manual", className: "" },
};

function LeadsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function LeadsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<AdminLead[] | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<"all" | LeadStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<AdminLead | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [scheduleLead, setScheduleLead] = useState<AdminLead | null>(null);
  const [convertLead, setConvertLead] = useState<AdminLead | null>(null);
  const [converting, setConverting] = useState(false);
  const [deleteLead, setDeleteLead] = useState<AdminLead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<LeadsResponse>("/api/admin/leads");
      setLeads(data.leads);
    } catch (error) {
      handleError(error, "Could not load leads.");
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  // Support the ?create=1 quick action from the dashboard.
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
      router.replace("/admin/leads", { scroll: false });
    }
  }, [searchParams, router]);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const lead of leads ?? []) {
      byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
    }
    return byStatus;
  }, [leads]);

  const filtered = useMemo(() => {
    const list = leads ?? [];
    return pipelineFilter === "all"
      ? list
      : list.filter((lead) => lead.status === pipelineFilter);
  }, [leads, pipelineFilter]);

  async function updateStatus(lead: AdminLead, status: LeadStatus) {
    if (status === lead.status) return;
    const previous = leads;
    setLeads(
      (current) =>
        current?.map((item) => (item.id === lead.id ? { ...item, status } : item)) ??
        current
    );
    try {
      await apiFetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
    } catch (error) {
      setLeads(previous); // roll back the optimistic change
      handleError(error, "Could not update the status.");
    }
  }

  async function convertToClient(lead: AdminLead) {
    setConverting(true);
    try {
      await apiFetch(`/api/admin/leads/${lead.id}/convert`, { method: "POST" });
      toast.success("Client created — manage it in Clients");
      await load();
    } catch (error) {
      handleError(error, "Could not convert the lead.");
    } finally {
      setConverting(false);
      setConvertLead(null);
    }
  }

  async function deleteLeadById(lead: AdminLead) {
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/leads/${lead.id}`, { method: "DELETE" });
      toast.success("Lead deleted");
      await load();
      setDeleteLead(null);
    } catch (error) {
      handleError(error, "Could not delete the lead.");
    } finally {
      setDeleting(false);
    }
  }

  const scheduleLeads = useMemo(
    () =>
      (leads ?? []).map((lead) => ({
        id: lead.id,
        name: lead.name,
        company: lead.company,
      })),
    [leads]
  );

  if (leads === null) {
    return <LeadsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Leads
            <span className="ml-2 text-base font-normal text-zinc-400">
              {leads.length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track prospects through your pipeline — from first contact to won.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="border-zinc-200 bg-white hover:bg-zinc-100"
          >
            <Upload className="size-4" aria-hidden="true" />
            Import CSV/XLSX
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add lead
          </Button>
        </div>
      </div>

      {/* Pipeline chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter leads by status">
        <button
          type="button"
          onClick={() => setPipelineFilter("all")}
          aria-pressed={pipelineFilter === "all"}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            pipelineFilter === "all"
              ? "bg-teal-600 text-white"
              : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
          )}
        >
          All <span className="opacity-70">{leads.length}</span>
        </button>
        {LEAD_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setPipelineFilter(status)}
            aria-pressed={pipelineFilter === status}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              pipelineFilter === status
                ? "bg-teal-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
            )}
          >
            {LEAD_STATUS_LABELS[status]}{" "}
            <span className="opacity-70">{counts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="gap-0 py-0">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Users className="size-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                {pipelineFilter === "all"
                  ? "No leads yet."
                  : `No ${LEAD_STATUS_LABELS[pipelineFilter].toLowerCase()} leads.`}
              </p>
              <p className="max-w-sm text-sm text-zinc-500">
                {pipelineFilter === "all"
                  ? "Add a lead, import a spreadsheet, or convert a website inquiry."
                  : "Try another pipeline stage or clear the filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Lead</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Next activity</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => {
                    const source = SOURCE_BADGES[lead.source] ?? SOURCE_BADGES.manual;
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="max-w-48 whitespace-nowrap">
                          <p className="truncate font-medium text-zinc-900">
                            {lead.name}
                          </p>
                          {lead.email ? (
                            <p className="truncate text-xs text-zinc-500">
                              {lead.email}
                            </p>
                          ) : null}
                          {lead.phone ? (
                            <p className="truncate text-xs text-zinc-400">
                              {lead.phone}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                          {lead.company ?? "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-normal",
                              source.className || "text-zinc-600"
                            )}
                          >
                            {source.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {lead.assignedTo ? (
                            <span className="inline-flex items-center gap-1.5 text-zinc-700">
                              <span className="flex size-6 items-center justify-center rounded-full bg-teal-50 text-[0.65rem] font-semibold text-teal-700" aria-hidden="true">
                                {lead.assignedTo.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              {lead.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Select
                            value={lead.status}
                            onValueChange={(value) =>
                              void updateStatus(lead, value as LeadStatus)
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-36"
                              aria-label={`Status for ${lead.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {LEAD_STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                          {formatMoney(lead.value)}
                        </TableCell>
                        <TableCell className="max-w-44 whitespace-nowrap">
                          {lead.nextActivity ? (
                            <>
                              <p className="truncate text-sm text-zinc-700">
                                {lead.nextActivity.title}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                {formatDateTime(lead.nextActivity.scheduledAt)}
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-zinc-500">
                          {formatRelative(lead.updatedAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-zinc-500"
                                aria-label={`Actions for ${lead.name}`}
                              >
                                <MoreHorizontal className="size-4" aria-hidden="true" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem onSelect={() => setEditLead(lead)}>
                                <Pencil className="size-4" aria-hidden="true" />
                                Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setScheduleLead(lead)}
                              >
                                <CalendarPlus className="size-4" aria-hidden="true" />
                                Schedule call
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setConvertLead(lead)}
                                disabled={lead.client !== null}
                              >
                                <Briefcase className="size-4" aria-hidden="true" />
                                {lead.client ? "Converted to client" : "Convert to client"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleteLead(lead)}
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Create / edit dialog */}
      <LeadDialog
        open={createOpen || editLead !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditLead(null);
          }
        }}
        lead={editLead}
        onSaved={() => void load()}
      />

      {/* Import dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => void load()}
      />

      {/* Schedule dialog */}
      <ScheduleDialog
        open={scheduleLead !== null}
        onOpenChange={(open) => !open && setScheduleLead(null)}
        leads={scheduleLeads}
        defaultLeadId={scheduleLead?.id ?? null}
        onCreated={() => void load()}
      />

      {/* Convert confirmation */}
      <AlertDialog
        open={convertLead !== null}
        onOpenChange={(open) => !open && setConvertLead(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to client?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks <span className="font-medium text-zinc-900">
                {convertLead?.name}
              </span>{" "}
              as won and creates a client record that you can manage on the
              Clients page. The lead stays in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={converting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (convertLead) void convertToClient(convertLead);
              }}
              disabled={converting}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {converting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <TrendingUp className="size-4" aria-hidden="true" />
              )}
              Convert to client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteLead !== null}
        onOpenChange={(open) => !open && setDeleteLead(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-medium text-zinc-900">
                {deleteLead?.name}
              </span>{" "}
              and all of their scheduled activities. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (deleteLead) void deleteLeadById(deleteLead);
              }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
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

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsInner />
    </Suspense>
  );
}
