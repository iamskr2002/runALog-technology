"use client";

/**
 * RunA Log Technologies — admin panel shared helpers.
 *
 * Types mirroring the admin API payloads (dates arrive as ISO strings),
 * status enums + label/badge maps, date/money formatters, an authenticated
 * fetch helper and small building blocks shared by every admin page.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  RefreshCw,
  Video,
  type LucideIcon,
} from "lucide-react";
import { serviceOptions } from "@/lib/site-config";

/* ── API entity types ──────────────────────────────────────────────────── */

export type AdminInquiry = {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  service: string;
  budget: string | null;
  timeline: string | null;
  description: string;
  status: InquiryStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminActivity = {
  id: string;
  leadId: string;
  type: ActivityType;
  title: string;
  scheduledAt: string;
  status: ActivityStatus;
  outcome: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string; company: string | null; status: string };
};

export type AdminLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: LeadSource;
  status: LeadStatus;
  value: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  nextActivity: AdminActivity | null;
  client: { id: string; name: string } | null;
};

export type AdminClient = {
  id: string;
  leadId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  service: string | null;
  status: ClientStatus;
  value: number | null;
  startDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead: { id: string; name: string; company: string | null } | null;
};

export type AdminStats = {
  inquiries: { total: number; new: number; converted: number };
  leads: {
    total: number;
    byStatus: Record<string, number>;
    won: number;
    pipelineValue: number;
  };
  clients: { total: number; active: number };
  activities: { upcoming: number };
  conversionRate: number;
  recentInquiries: AdminInquiry[];
  upcomingActivities: AdminActivity[];
};

/* ── Status enums ──────────────────────────────────────────────────────── */

export const INQUIRY_STATUSES = [
  "new",
  "read",
  "replied",
  "converted",
  "archived",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["manual", "import", "website"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const ACTIVITY_TYPES = ["call", "meeting", "email", "follow-up"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const CLIENT_STATUSES = [
  "onboarding",
  "active",
  "paused",
  "completed",
  "churned",
] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  converted: "Converted",
  archived: "Archived",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Call",
  meeting: "Meeting",
  email: "Email",
  "follow-up": "Follow-up",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  onboarding: "Onboarding",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  churned: "Churned",
};

/** Semantic badge classes for every status across all entities. */
const STATUS_BADGE_CLASS: Record<string, string> = {
  // Inquiry statuses
  new: "border-teal-200 bg-teal-50 text-teal-700",
  read: "border-zinc-200 bg-zinc-100 text-zinc-600",
  replied: "border-amber-200 bg-amber-50 text-amber-700",
  converted: "border-teal-600 bg-teal-600 text-white",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-400",
  // Lead statuses
  contacted: "border-amber-200 bg-amber-50 text-amber-700",
  qualified: "border-cyan-200 bg-cyan-50 text-cyan-700",
  proposal: "border-violet-200 bg-violet-50 text-violet-700",
  negotiation: "border-orange-200 bg-orange-50 text-orange-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-red-200 bg-red-50 text-red-700",
  // Activity statuses
  scheduled: "border-teal-200 bg-teal-50 text-teal-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-zinc-200 bg-zinc-100 text-zinc-500",
  // Client statuses
  onboarding: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-zinc-200 bg-zinc-100 text-zinc-500",
  churned: "border-red-200 bg-red-50 text-red-700",
};

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASS[status] ?? "border-zinc-200 bg-zinc-100 text-zinc-600";
}

/* ── Activity type icons ───────────────────────────────────────────────── */

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, LucideIcon> = {
  call: Phone,
  meeting: Video,
  email: Mail,
  "follow-up": RefreshCw,
};

export function activityTypeIcon(type: string): LucideIcon {
  return ACTIVITY_TYPE_ICONS[type as ActivityType] ?? Phone;
}

/* ── Service labels ────────────────────────────────────────────────────── */

const SERVICE_LABELS = new Map<string, string>(
  serviceOptions.map((option) => [option.slug, option.label] as const)
);

export function serviceLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return SERVICE_LABELS.get(slug) ?? slug;
}

/* ── Formatters ────────────────────────────────────────────────────────── */

/** "$4,500" or "$12.5K" for big values. Returns "—" for null/invalid. */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (Math.abs(value) >= 10_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** "Oct 20, 2025" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Mon, Oct 20 · 10:00" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${day} · ${time}`;
}

/** "2h ago" / "3d ago" / "just now" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 45) return "just now";
  const suffix = diffSeconds >= 0 ? "ago" : "from now";
  const minutes = Math.round(abs / 60);
  if (minutes < 60) return `${minutes}m ${suffix}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ${suffix}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ${suffix}`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ${suffix}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ${suffix}`;
  return formatDate(iso);
}

/** ISO string → value for `<input type="datetime-local">` in local time. */
export function dateToLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `<input type="datetime-local">` value → ISO string with local offset. */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/* ── Authenticated fetch helper ────────────────────────────────────────── */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** True when the error came from an unauthenticated admin API call. */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * JSON fetch helper for admin APIs. Throws ApiError with the server's
 * message on failure (status 401 for expired sessions — pages redirect
 * to /admin/login via {@link useAdminErrorHandler}).
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers:
        init?.body instanceof FormData
          ? init?.headers
          : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      "Network error — please check your connection and try again.",
      0
    );
  }

  const payload = (await response
    .json()
    .catch(() => null)) as (T & { ok?: boolean; message?: string }) | null;

  if (response.status === 401) {
    throw new ApiError(
      payload?.message ?? "Your session has expired. Please sign in again.",
      401
    );
  }
  if (!response.ok || !payload || payload.ok === false) {
    throw new ApiError(
      payload?.message ?? `Request failed (${response.status}).`,
      response.status
    );
  }
  return payload;
}

/**
 * Error handler shared by all admin pages: redirects to the login page on
 * 401, otherwise surfaces the server message as an error toast.
 */
export function useAdminErrorHandler() {
  const router = useRouter();
  return useCallback(
    (error: unknown, fallback = "Something went wrong. Please try again.") => {
      if (isAuthError(error)) {
        router.replace("/admin/login");
        return;
      }
      toast.error(
        error instanceof Error && error.message ? error.message : fallback
      );
    },
    [router]
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-zinc-500">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
