"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center bg-destructive/10 text-destructive"><AlertTriangle className="size-5" /></span>
        <h1 className="mt-5 font-heading text-2xl font-semibold uppercase tracking-[0.04em] text-foreground">FoodFlow hit a snag.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your persistent demo data is still safe. Retry this screen to continue the operation.</p>
        <button className="mt-6 inline-flex h-11 items-center gap-2 bg-primary px-5 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground" onClick={reset}><RefreshCcw className="size-4" />Try again</button>
      </div>
    </main>
  );
}
