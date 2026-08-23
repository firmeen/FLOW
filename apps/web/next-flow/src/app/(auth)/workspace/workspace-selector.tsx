"use client";

import { useState } from "react";
import { Building2, LogOut, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/foodflow-ui";

export interface WorkspaceChoice {
  tenantId: string;
  tenantName: string;
  branchId: string;
  branchName: string;
  branchCode: string | null;
}

interface WorkspaceSelectorProps {
  choices: readonly WorkspaceChoice[];
  nextPath: string;
  unavailable?: boolean;
}

export function WorkspaceSelector({
  choices,
  nextPath,
  unavailable = false,
}: WorkspaceSelectorProps) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function selectWorkspace(choice: WorkspaceChoice) {
    if (pendingKey || signingOut) return;
    const key = `${choice.tenantId}:${choice.branchId}`;
    setPendingKey(key);
    setError(null);

    try {
      const response = await fetch("/api/auth/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: choice.tenantId,
          branchId: choice.branchId,
          next: nextPath,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { redirectTo?: string; error?: string }
        | null;

      if (!response.ok || !result?.redirectTo) {
        setError(result?.error ?? "Workspace access could not be confirmed.");
        return;
      }

      router.replace(result.redirectTo);
      router.refresh();
    } catch {
      setError("Workspace access could not be confirmed.");
    } finally {
      setPendingKey(null);
    }
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {unavailable && (
        <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          Workspace access is temporarily unavailable. Try again shortly.
        </div>
      )}

      {!unavailable && choices.length === 0 && (
        <div className="border border-border bg-muted/50 px-4 py-4 text-sm leading-6 text-muted-foreground">
          Your account is authenticated, but it does not currently have an active workspace.
        </div>
      )}

      {choices.map((choice) => {
        const key = `${choice.tenantId}:${choice.branchId}`;
        return (
          <button
            key={key}
            type="button"
            disabled={Boolean(pendingKey) || signingOut}
            onClick={() => void selectWorkspace(choice)}
            className="flex w-full items-center justify-between gap-4 border border-border bg-background p-4 text-left transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center bg-muted text-foreground">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {choice.tenantName}
                </span>
                <span className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" />
                  {choice.branchName}
                  {choice.branchCode ? ` · ${choice.branchCode}` : ""}
                </span>
              </span>
            </span>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {pendingKey === key ? "Opening…" : "Open"}
            </span>
          </button>
        );
      })}

      {error && (
        <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <Button
        variant="outline"
        fullWidth
        leftIcon={<LogOut className="size-4" />}
        isLoading={signingOut}
        loadingText="Signing out..."
        onClick={() => void signOut()}
      >
        Sign out
      </Button>
    </div>
  );
}
