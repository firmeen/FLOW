"use client";

import { useState, type FormEvent } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@/components/foodflow-ui";

interface LoginFormProps {
  nextPath: string;
  developmentCredentials?: {
    email: string;
    password: string;
  };
}

export function LoginForm({ nextPath, developmentCredentials }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(result?.error ?? "Sign in could not be completed. Please try again.");
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError("Sign in could not be completed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={developmentCredentials?.email}
          disabled={submitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue={developmentCredentials?.password}
          disabled={submitting}
          required
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive" role="alert">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={submitting}
        loadingText="Signing in..."
        leftIcon={<LogIn className="size-4" />}
      >
        Sign in
      </Button>

      {developmentCredentials && (
        <p className="border border-border bg-muted/50 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          Local development access is prefilled. Configure environment variables for production.
        </p>
      )}
    </form>
  );
}
