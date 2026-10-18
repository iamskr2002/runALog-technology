"use client";

/**
 * My Leads — the signed-in staff member's assigned leads (admins see all).
 * Pipeline chips with counts, search, a detail dialog for progress +
 * scheduling, and a quick "add lead" form (auto-assigned to the creator).
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Loader2, Plus, RefreshCw, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddLeadDialog } from "@/components/staff/add-lead-dialog";
import { StaffLeadDetailDialog } from "@/components/staff/lead-detail-dialog";
import {
  apiFetch,
  EmptyState,
  formatDateTime,
  formatMoney,
  formatRelative,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  statusBadgeClass,
  type LeadStatus,
} from "@/components/admin/shared";
import {
  useStaffErrorHandler,
  type StaffLead,
} from "@/components/staff/shared";
import { cn } from "@/lib/utils";

type LeadsResponse = { leads: StaffLead[] };

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
  const [leads, setLeads] = useState<StaffLead[] | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<"all" | LeadStatus>("all");
  const [search, setSearch] = useState("");
  const [detailLead, setDetailLead] = useState<StaffLead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleError = useStaffErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<LeadsResponse>("/api/staff/leads");
      setLeads(data.leads);
      setFailed(false);
    } catch (error) {
      setFailed(true);
      handleError(error, "Could not load your leads.");
    } finally {
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

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const lead of leads ?? []) {
      byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;
    }
    return byStatus;
  }, [leads]);

  const filtered = useMemo(() => {
    let list = leads ?? [];
    if (pipelineFilter !== "all") {
      list = list.filter((lead) => lead.status === pipelineFilter);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((lead) =>
        [lead.name, lead.email ?? "", lead.company ?? "", lead.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    return list;
  }, [leads, pipelineFilter, search]);

  if (failed || leads === null) {
    return (
      <Card className="items-center gap-3 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-600">
            Could not load your leads. Check your connection and try again.
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
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            My Leads
            <span className="ml-2 text-base font-normal text-zinc-400">
              {leads.length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Leads assigned to you — update their status, log notes and book
            calls.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add lead
        </Button>
      </div>

      {/* Pipeline chips + search */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
        <div className="relative w-full lg:w-64">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads…"
            aria-label="Search leads"
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="gap-0 py-0">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title={
                  search || pipelineFilter !== "all"
                    ? "No leads match your filters."
                    : "No leads assigned to you yet."
                }
                description={
                  search || pipelineFilter !== "all"
                    ? "Try another pipeline stage or clear the search."
                    : "The owner assigns leads from the admin panel — or add a lead yourself with the button above."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Lead</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Next call</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((lead) => (
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
                        <button
                          type="button"
                          onClick={() => setDetailLead(lead)}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80",
                            statusBadgeClass(lead.status)
                          )}
                          aria-label={`Open ${lead.name} — currently ${LEAD_STATUS_LABELS[lead.status]}`}
                        >
                          {LEAD_STATUS_LABELS[lead.status]}
                        </button>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-teal-200 bg-white px-2 text-xs text-teal-700 hover:bg-teal-50"
                          onClick={() => setDetailLead(lead)}
                        >
                          <CalendarClock className="size-3.5" aria-hidden="true" />
                          Open
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

      {/* Detail dialog (progress + schedule) */}
      <StaffLeadDetailDialog
        lead={detailLead}
        onOpenChange={(open) => !open && setDetailLead(null)}
        onChanged={() => void load()}
      />

      {/* Create dialog */}
      <AddLeadDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void load()}
      />
    </div>
  );
}

export default function StaffLeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsInner />
    </Suspense>
  );
}
