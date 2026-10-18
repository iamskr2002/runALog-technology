"use client";

/**
 * Staff login form — email + password against the Staff table.
 * On success the signed staff cookie is set and the member lands on
 * their personal dashboard.
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { ApiError } from "@/components/admin/shared";

export function StaffLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        throw new ApiError(
          payload?.message ?? "Sign-in failed. Please try again.",
          response.status
        );
      }
      router.replace("/staff");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : "Sign-in failed. Please try again."
      );
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="font-display text-xl font-bold text-zinc-900">
              Staff sign-in
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Sign in to work your assigned leads and calls.
            </p>
          </div>
        </div>

        <Card className="p-0">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-login-email">Email</Label>
                <Input
                  id="staff-login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@runalog.com"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-login-password">Password</Label>
                <Input
                  id="staff-login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="size-4" aria-hidden="true" />
                )}
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Accounts are created by the RunA Log Technologies owner. Forgot your
          password? Ask the owner to reset it.
        </p>
      </div>
    </div>
  );
}
