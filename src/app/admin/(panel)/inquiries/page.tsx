"use client";

/**
 * Website inquiries — search, filter by status, review the full submission,
 * convert inquiries into leads and manage their workflow status.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Inbox,
  Loader2,
  Search,
  Trash2,
  UserPlus,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
  ApiError,
  apiFetch,
  formatDate,
  formatRelative,
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  serviceLabel,
  statusBadgeClass,
  useAdminErrorHandler,
  type AdminInquiry,
  type InquiryStatus,
} from "@/components/admin/shared";

type InquiryListResponse = { inquiries: AdminInquiry[] };

function InquiriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 sm:w-44" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-zinc-900">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<AdminInquiry[] | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AdminInquiry | null>(null);
  const [converting, setConverting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminInquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<InquiryListResponse>("/api/admin/inquiries");
      setInquiries(data.inquiries);
    } catch (error) {
      // 401s redirect to the login screen via the shared handler.
      handleError(error, "Could not load inquiries.");
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = inquiries ?? [];
    if (statusFilter !== "all") {
      list = list.filter((inquiry) => inquiry.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((inquiry) =>
        [inquiry.fullName, inquiry.email, inquiry.company ?? "", inquiry.description]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [inquiries, statusFilter, query]);

  const hasFilters = statusFilter !== "all" || query.trim().length > 0;

  async function updateStatus(
    inquiry: AdminInquiry,
    status: InquiryStatus
  ) {
    if (status === inquiry.status) return;
    const previous = inquiries;
    setInquiries(
      (current) =>
        current?.map((item) =>
          item.id === inquiry.id ? { ...item, status } : item
        ) ?? current
    );
    try {
      await apiFetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
    } catch (error) {
      setInquiries(previous); // roll back the optimistic change
      handleError(error, "Could not update the status.");
    }
  }

  async function convertInquiry(inquiry: AdminInquiry) {
    setConverting(true);
    try {
      await apiFetch(`/api/admin/inquiries/${inquiry.id}/convert`, {
        method: "POST",
      });
      toast.success("Lead created — manage it in Leads");
      setInquiries(
        (current) =>
          current?.map((item) =>
            item.id === inquiry.id ? { ...item, status: "converted" } : item
          ) ?? current
      );
      setSelected(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("This inquiry was already converted to a lead.");
      } else {
        handleError(error, "Could not convert the inquiry.");
      }
    } finally {
      setConverting(false);
    }
  }

  async function deleteInquiry(inquiry: AdminInquiry) {
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "DELETE",
      });
      toast.success("Inquiry deleted");
      setInquiries(
        (current) => current?.filter((item) => item.id !== inquiry.id) ?? current
      );
      setPendingDelete(null);
      setSelected(null);
    } catch (error) {
      handleError(error, "Could not delete the inquiry.");
    } finally {
      setDeleting(false);
    }
  }

  if (inquiries === null) {
    return <InquiriesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-900">
          Website inquiries
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Messages sent through the contact form on the public site.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, company…"
            aria-label="Search inquiries"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-44"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {INQUIRY_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {INQUIRY_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-zinc-100 px-6 py-4">
          <CardTitle className="text-base">
            Inquiries
            <span className="ml-2 text-sm font-normal text-zinc-400">
              {filtered.length} of {inquiries.length}
            </span>
          </CardTitle>
          <CardDescription>
            Newest first. Open a row to read the full message.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Inbox className="size-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-zinc-900">
                {hasFilters
                  ? "No inquiries match your filters."
                  : "No inquiries yet."}
              </p>
              <p className="max-w-sm text-sm text-zinc-500">
                {hasFilters
                  ? "Try a different search term or status."
                  : "Submissions from the website contact form will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Contact</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="max-w-56 whitespace-nowrap">
                        <p className="flex items-center gap-2 font-medium text-zinc-900">
                          {inquiry.status === "new" ? (
                            <span
                              className="size-2 shrink-0 rounded-full bg-teal-500"
                              aria-label="New"
                            />
                          ) : null}
                          <span className="truncate">{inquiry.fullName}</span>
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {inquiry.email}
                        </p>
                        {inquiry.company ? (
                          <p className="truncate text-xs text-zinc-400">
                            {inquiry.company}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="border-teal-200 bg-teal-50 font-normal text-teal-700"
                        >
                          {serviceLabel(inquiry.service) ?? inquiry.service}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {inquiry.budget ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm text-zinc-600">
                          {formatDate(inquiry.createdAt)}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatRelative(inquiry.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {inquiry.status === "converted" ? (
                          <Badge className={statusBadgeClass("converted")}>
                            Converted
                          </Badge>
                        ) : (
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) =>
                              void updateStatus(inquiry, value as InquiryStatus)
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-32"
                              aria-label={`Status for ${inquiry.fullName}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INQUIRY_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {INQUIRY_STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-zinc-500 hover:text-teal-700"
                            aria-label={`View inquiry from ${inquiry.fullName}`}
                            onClick={() => setSelected(inquiry)}
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-zinc-500 hover:text-red-600"
                            aria-label={`Delete inquiry from ${inquiry.fullName}`}
                            onClick={() => setPendingDelete(inquiry)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Inquiry from {selected.fullName}</DialogTitle>
                <DialogDescription>
                  Received {formatDate(selected.createdAt)} ·{" "}
                  {formatRelative(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Name" value={selected.fullName} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Company" value={selected.company ?? ""} />
                <DetailRow
                  label="Service"
                  value={serviceLabel(selected.service) ?? selected.service}
                />
                <DetailRow label="Budget" value={selected.budget ?? ""} />
                <DetailRow label="Timeline" value={selected.timeline ?? ""} />
                <div className="sm:col-span-2">
                  <DetailRow label="Message" value={selected.description} />
                </div>
                <div className="sm:col-span-2">
                  <DetailRow label="Internal notes" value={selected.notes ?? ""} />
                </div>
                <DetailRow label="Created" value={formatDate(selected.createdAt)} />
                <DetailRow label="Last updated" value={formatDate(selected.updatedAt)} />
              </dl>
              <DialogFooter className="gap-2 sm:gap-0">
                {selected.status === "converted" ? (
                  <Badge className={statusBadgeClass("converted")}>
                    Converted to lead
                  </Badge>
                ) : (
                  <Button
                    onClick={() => void convertInquiry(selected)}
                    disabled={converting}
                    className="bg-teal-600 text-white hover:bg-teal-700"
                  >
                    {converting ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <UserPlus className="size-4" aria-hidden="true" />
                    )}
                    Convert to lead
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the inquiry from{" "}
              <span className="font-medium text-zinc-900">
                {pendingDelete?.fullName}
              </span>{" "}
              ({pendingDelete?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (pendingDelete) void deleteInquiry(pendingDelete);
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
