"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/foodflow-ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function signOut() {
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setSubmitting(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size={compact ? "icon-sm" : "sm"}
      className={cn(className)}
      disabled={submitting}
      aria-label={compact ? "Sign out" : undefined}
      title="Sign out"
      onClick={signOut}
      leftIcon={compact ? undefined : <LogOut className="size-4" />}
    >
      {compact ? <LogOut className="size-4" aria-hidden="true" /> : "Sign out"}
    </Button>
  );
}
