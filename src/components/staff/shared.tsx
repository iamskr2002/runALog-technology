"use client";

/**
 * Staff panel shared helpers — types mirroring the staff API payloads and
 * a per-panel error handler that redirects expired sessions to
 * /staff/login. Generic fetch/format utilities are reused from the admin
 * shared module so both panels stay consistent.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ApiError, isAuthError } from "@/components/admin/shared";
import { toast } from "sonner";

/* ── API entity types (dates arrive as ISO strings) ───────────────────── */

export type StaffActivity = {
  id: string;
  leadId: string;
  type: "call" | "meeting" | "email" | "follow-up";
  title: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  outcome: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string; company: string | null; status: string };
};

export type StaffLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: "manual" | "import" | "website";
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  value: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  nextActivity: StaffActivity | null;
  client: { id: string; name: string } | null;
  assignedTo: { id: string; name: string } | null;
};

export type StaffStats = {
  role: "admin" | "staff";
  leads: {
    total: number;
    byStatus: Record<string, number>;
    won: number;
    pipelineValue: number;
  };
  activities: {
    upcoming: number;
    today: number;
    overdue: number;
    completedThisWeek: number;
  };
  conversionRate: number;
  myLeads: StaffLead[];
  todayActivities: StaffActivity[];
  upcomingActivities: StaffActivity[];
};

export type StaffProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
};

/* ── Error handling ───────────────────────────────────────────────────── */

/**
 * Error handler shared by all staff pages: redirects to the staff login
 * page on 401, otherwise surfaces the server message as an error toast.
 */
export function useStaffErrorHandler() {
  const router = useRouter();
  return useCallback(
    (error: unknown, fallback = "Something went wrong. Please try again.") => {
      if (isAuthError(error)) {
        router.replace("/staff/login");
        return;
      }
      toast.error(
        error instanceof Error && error.message ? error.message : fallback
      );
    },
    [router]
  );
}

export { ApiError, isAuthError };
