import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

/**
 * Admin panel root segment — noindex/no-follow, and a sonner Toaster scoped
 * to the admin area (the public site keeps its own toast system untouched).
 */
export const metadata: Metadata = {
  title: { absolute: "Admin — RunA Log Technologies" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
