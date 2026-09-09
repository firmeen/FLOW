import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

import { FlowLogo } from "@/components/shared/flow-logo";

const workspaces = [
  {
    title: "Staff operations",
    eyebrow: "Floor",
    description: "Orders, tables, guest service, ready handoff and live menu availability.",
    href: "/staff",
    icon: ClipboardCheck,
  },
  {
    title: "Kitchen display",
    eyebrow: "Production",
    description: "A focused make-line queue driven by durable operational order state.",
    href: "/kitchen",
    icon: ChefHat,
  },
  {
    title: "Cashier",
    eyebrow: "Payments",
    description: "Live table bills, server-calculated charges and merchant payment ledger.",
    href: "/cashier",
    icon: CircleDollarSign,
  },
  {
    title: "Owner control room",
    eyebrow: "Management",
    description: "Tenant-wide operating pulse, menu publishing and branch policy.",
    href: "/admin",
    icon: LayoutDashboard,
  },
] as const;

export function FlowEntryHub() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -right-24 -top-40 size-[34rem] rounded-full border border-background/10" />
        <div className="absolute -right-4 -top-20 size-[22rem] rounded-full border border-background/10" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <FlowLogo variant="reverse" preload className="w-32 sm:w-40" sizes="160px" />
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] opacity-45">FoodFlow operating system</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-background/10 bg-background/[0.055] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Durable runtime
            </div>
          </div>

          <div className="grid gap-10 py-16 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:py-24">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-background/60"><Sparkles className="size-4" /> Connected restaurant operations</div>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                One operating core.
                <br />Every service moment connected.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-background/58 sm:text-base">
                FoodFlow keeps ordering, floor service, kitchen production, payment capture and owner visibility on one durable restaurant state.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-background/10 bg-background/[0.055] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-background text-foreground"><ShieldCheck className="size-4" /></span><div><p className="font-semibold">Authority-first runtime</p><p className="mt-1 text-xs leading-5 text-background/50">Business state is server-mediated and persisted before it is presented as live.</p></div></div>
              <div className="mt-5 grid grid-cols-3 gap-2"><Signal label="Order" /><Signal label="Service" /><Signal label="Payment" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[1.8rem] border border-border bg-muted/35 p-6 sm:p-7">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground"><QrCode className="size-3.5" /> Customer entry</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">Verified table sessions begin with the table QR.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">Customer ordering is intentionally not opened from a generic demo route. Scan a real configured table QR so tenant, branch, table and session context are verified before access.</p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-background p-4"><span className="grid size-10 place-items-center rounded-xl bg-foreground text-background"><Store className="size-4" /></span><div><p className="text-sm font-semibold">Table-scoped capability</p><p className="mt-0.5 text-xs text-muted-foreground">Public entry without staff credentials</p></div></div>
          </aside>

          <section>
            <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Internal workspaces</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Choose your operating surface.</h2></div><span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground sm:flex"><LockKeyhole className="size-3.5" /> Sign-in required</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {workspaces.map((workspace) => {
                const Icon = workspace.icon;
                return (
                  <Link key={workspace.href} href={workspace.href} className="group relative overflow-hidden rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_18px_55px_rgb(0_0_0/0.035)] transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_28px_80px_rgb(0_0_0/0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="absolute -right-12 -top-16 size-32 rounded-full bg-foreground/[0.025] blur-2xl" />
                    <div className="relative flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-foreground text-background"><Icon className="size-4" /></span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" /></div>
                    <div className="relative mt-7"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{workspace.eyebrow}</p><h3 className="mt-1.5 text-xl font-semibold tracking-[-0.035em]">{workspace.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{workspace.description}</p></div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Signal({ label }: { readonly label: string }) {
  return <div className="rounded-xl border border-background/10 bg-background/[0.04] px-3 py-3"><span className="block size-1.5 rounded-full bg-emerald-400" /><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-background/55">{label}</p></div>;
}
