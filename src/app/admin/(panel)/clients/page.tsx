"use client";

/**
 * Clients — onboarded customers, usually converted from won leads.
 * Inline status updates, create/edit via ClientDialog, delete with confirm.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Briefcase, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ClientDialog } from "@/components/admin/client-dialog";
import {
  apiFetch,
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
  formatDate,
  formatMoney,
  serviceLabel,
  useAdminErrorHandler,
  type AdminClient,
  type ClientStatus,
} from "@/components/admin/shared";

type ClientsResponse = { clients: AdminClient[] };

function ClientsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<AdminClient[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<AdminClient | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminClient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleError = useAdminErrorHandler();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ClientsResponse>("/api/admin/clients");
      setClients(data.clients);
    } catch (error) {
      handleError(error, "Could not load clients.");
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalValue = useMemo(
    () => (clients ?? []).reduce((sum, client) => sum + (client.value ?? 0), 0),
    [clients]
  );

  async function updateStatus(client: AdminClient, status: ClientStatus) {
    if (status === client.status) return;
    const previous = clients;
    setClients(
      (current) =>
        current?.map((item) =>
          item.id === client.id ? { ...item, status } : item
        ) ?? current
    );
    try {
      await apiFetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
    } catch (error) {
      setClients(previous); // roll back the optimistic change
      handleError(error, "Could not update the status.");
    }
  }

  async function deleteClient(client: AdminClient) {
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
      toast.success("Client deleted");
      setClients(
        (current) => current?.filter((item) => item.id !== client.id) ?? current
      );
      setPendingDelete(null);
    } catch (error) {
      handleError(error, "Could not delete the client.");
    } finally {
      setDeleting(false);
    }
  }

  if (clients === null) {
    return <ClientsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Clients
            <span className="ml-2 text-base font-normal text-zinc-400">
              {clients.length}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {clients.length > 0
              ? `${clients.length} client${clients.length === 1 ? "" : "s"} · ${formatMoney(totalValue)} total value.`
              : "Business you are onboarding or actively working with."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add client
        </Button>
      </div>

      {/* Table */}
      <Card className="gap-0 py-0">
        <div className="p-0">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <Briefcase className="size-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-zinc-900">No clients yet.</p>
              <p className="max-w-sm text-sm text-zinc-500">
                Convert a won lead on the Leads page, or add a client directly.
              </p>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="mt-2 bg-teal-600 text-white hover:bg-teal-700"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add client
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Source lead</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="max-w-48 whitespace-nowrap">
                        <p className="truncate font-medium text-zinc-900">
                          {client.name}
                        </p>
                        {client.email ? (
                          <p className="truncate text-xs text-zinc-500">
                            {client.email}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {client.company ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {serviceLabel(client.service) ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Select
                          value={client.status}
                          onValueChange={(value) =>
                            void updateStatus(client, value as ClientStatus)
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-36"
                            aria-label={`Status for ${client.name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CLIENT_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {CLIENT_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {formatMoney(client.value)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {formatDate(client.startDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-zinc-600">
                        {client.lead ? client.lead.name : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-zinc-500 hover:text-teal-700"
                            aria-label={`Edit ${client.name}`}
                            onClick={() => setEditClient(client)}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-zinc-500 hover:text-red-600"
                            aria-label={`Delete ${client.name}`}
                            onClick={() => setPendingDelete(client)}
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
        </div>
      </Card>

      {/* Create / edit dialog */}
      <ClientDialog
        open={createOpen || editClient !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditClient(null);
          }
        }}
        client={editClient}
        onSaved={() => void load()}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-zinc-900">
                {pendingDelete?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (pendingDelete) void deleteClient(pendingDelete);
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
