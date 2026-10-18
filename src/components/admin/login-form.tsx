"use client";

/**
 * Admin sign-in form (client). The `next` redirect target is read from the
 * URL, so the inner form lives under a <Suspense> boundary to satisfy the
 * useSearchParams prerender requirement.
 */

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response
        .json()
        .catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Incorrect password.");
        return;
      }
      // Open-redirect guard: only follow targets inside /admin.
      const requested = searchParams.get("next") ?? "/admin";
      const next = requested.startsWith("/admin") ? requested : "/admin";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm border-zinc-200 shadow-sm">
        <CardHeader className="items-center gap-3 text-center">
          <Logo className="justify-center" />
          <CardTitle className="font-display text-xl font-bold">
            Admin panel
          </CardTitle>
          <CardDescription>
            RunA Log Technologies — internal use only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter the admin password"
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "admin-password-error" : undefined}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {error ? (
                <p
                  id="admin-password-error"
                  role="alert"
                  className="text-sm font-medium text-red-600"
                >
                  {error}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 text-white hover:bg-teal-700"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LockKeyhole className="size-4" aria-hidden="true" />
              )}
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminLoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <Loader2
            className="size-5 animate-spin text-zinc-400"
            aria-label="Loading sign-in form"
          />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
