"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[#f8e7e4] text-status-red"><AlertTriangle className="size-5" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-forest">FoodFlow hit a snag.</h1>
        <p className="mt-2 text-sm leading-6 text-foreground/55">Your persistent demo data is still safe. Retry this screen to continue the operation.</p>
        <button className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-forest px-5 text-sm font-semibold text-white" onClick={reset}><RefreshCcw className="size-4" />Try again</button>
      </div>
    </main>
  );
}
