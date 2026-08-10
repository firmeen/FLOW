"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFoodFlow } from "@/store/foodflow-store";

const roleLinks = [
  { href: "/r/melbourne-house/table/T05", label: "Customer" },
  { href: "/staff", label: "Staff" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/cashier", label: "Cashier" },
  { href: "/admin", label: "Owner" },
];

export function AppShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, resetDemo } = useFoodFlow();
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-black/8 bg-[color:var(--canvas)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black tracking-tight text-white">F</div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">FoodFlow</div>
              <div className="text-sm font-semibold">{state.restaurant.name}</div>
            </div>
          </Link>
          <div className="hidden items-center rounded-xl border border-black/8 bg-white p-1 shadow-sm md:flex">
            {roleLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("/").slice(0, 2).join("/")));
              return (
                <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"}`}>
                  {link.label}
                </Link>
              );
            })}
          </div>
          <button onClick={resetDemo} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)] shadow-sm transition hover:text-[var(--ink)]">
            Reset demo
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        </div>
        {children}
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl backdrop-blur md:hidden">
        {roleLinks.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl px-1 py-2 text-center text-[10px] font-semibold text-[var(--muted)] hover:bg-black/5">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-rose-100 text-rose-800",
    blue: "bg-sky-100 text-sky-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
}
