"use client";

/**
 * ImportDialog — upload a CSV/XLSX file of leads. Shows a downloadable
 * CSV template, a drag-and-drop zone, and an in-dialog result panel with
 * per-row errors returned by POST /api/admin/leads/import.
 */

import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch, ApiError, useAdminErrorHandler } from "@/components/admin/shared";

type ImportResult = {
  imported: number;
  skipped: number;
  total: number;
  errors: { row: number; reason: string }[];
};

const CSV_TEMPLATE = [
  "Full Name,Email,Phone,Company,Status,Value,Notes",
  "Jane Doe,jane.doe@example.com,+1 555 010 0199,Acme Corp,qualified,8000,Met at a conference",
  'John Smith,john.smith@example.com,+1 555 010 0155,,new,,"Requested a quote via email"',
].join("\n");

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "runa-leads-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleError = useAdminErrorHandler();

  function reset() {
    setFile(null);
    setError(null);
    setResult(null);
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset shortly after closing so the transition stays smooth.
      window.setTimeout(reset, 200);
    }
    onOpenChange(next);
  }

  function acceptFile(nextFile: File | null | undefined) {
    setError(null);
    setResult(null);
    if (!nextFile) return;
    const name = nextFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("Please choose a .csv, .xlsx or .xls file.");
      return;
    }
    setFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  async function handleImport() {
    if (!file || pending) return;
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiFetch<ImportResult>("/api/admin/leads/import", {
        method: "POST",
        body: formData,
      });
      setResult(data);
      onImported();
      toast.success(`${data.imported} lead${data.imported === 1 ? "" : "s"} imported`);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        handleError(caught); // redirects to the login screen
      }
      // Parse/validation errors (400) are shown inside the dialog.
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Could not import the file. Please try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import leads from CSV/XLSX</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet of leads. Rows with an email that already
            exists are skipped.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <CheckCircle2
                className="size-8 shrink-0 text-teal-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-lg font-bold text-zinc-900">
                  {result.imported} imported · {result.skipped} skipped
                </p>
                <p className="text-sm text-zinc-600">
                  {result.total} row{result.total === 1 ? "" : "s"} processed
                  from {file?.name ?? "the file"}.
                </p>
              </div>
            </div>

            {result.errors.length > 0 ? (
              <div>
                <p className="mb-1 text-sm font-medium text-zinc-700">
                  Skipped rows
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                  {result.errors.map((rowError) => (
                    <li key={`${rowError.row}-${rowError.reason}`}>
                      Row {rowError.row}: {rowError.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={reset}
                className="border-zinc-200"
              >
                Import another file
              </Button>
              <Button
                onClick={() => handleOpenChange(false)}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose a CSV or XLSX file to upload"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragging
                  ? "border-teal-400 bg-teal-50"
                  : "border-zinc-300 bg-zinc-50 hover:border-teal-300 hover:bg-teal-50/50"
              }`}
            >
              <FileUp
                className="size-8 text-zinc-400"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-zinc-700">
                {file ? file.name : "Drag & drop your file here, or click to browse"}
              </p>
              <p className="text-xs text-zinc-500">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB — click to choose a different file`
                  : "Accepts .csv, .xlsx and .xls with a Name column"}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                aria-label="Lead import file"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="text-teal-700 hover:bg-teal-50 hover:text-teal-700"
            >
              <Download className="size-4" aria-hidden="true" />
              Download CSV template
            </Button>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
                className="border-zinc-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleImport()}
                disabled={!file || pending}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                {pending ? "Importing…" : "Import leads"}
              </Button>
            </div>
          </div>
        )}

        {/* Visual hint for supported formats */}
        <p className="flex items-center gap-1.5 text-xs text-zinc-400">
          <FileSpreadsheet className="size-3.5" aria-hidden="true" />
          Columns: Name, Email, Phone, Company, Status, Value, Notes — only
          Name is required.
        </p>
      </DialogContent>
    </Dialog>
  );
}
