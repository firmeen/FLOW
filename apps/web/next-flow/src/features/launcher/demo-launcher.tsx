"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  QrCode,
  RefreshCcw,
  Sparkles,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFoodFlow } from "@/store";

const experiences = [
  {
    title: "Customer",
    subtitle: "Table T05",
    description: "Browse, customize, order, and follow the live table session.",
    href: "/r/demo/table/T05",
    icon: QrCode,
    accent: "bg-[#dff07a] text-[#173f35]",
  },
  {
    title: "Staff operations",
    subtitle: "Floor team",
    description: "Confirm orders, answer service calls, and serve ready items.",
    href: "/staff",
    icon: ClipboardCheck,
    accent: "bg-[#e4eee8] text-[#245849]",
  },
  {
    title: "Kitchen display",
    subtitle: "Main kitchen",
    description: "Move tickets from new to preparing and ready for service.",
    href: "/kitchen",
    icon: ChefHat,
    accent: "bg-[#f7e9cf] text-[#815d21]",
  },
  {
    title: "Cashier",
    subtitle: "Front counter",
    description: "Review combined table bills, apply adjustments, and record payment.",
    href: "/cashier",
    icon: CircleDollarSign,
    accent: "bg-[#e8eef4] text-[#355f79]",
  },
  {
    title: "Owner / Admin",
    subtitle: "Control room",
    description: "Watch live performance and manage the restaurant menu.",
    href: "/admin",
    icon: BarChart3,
    accent: "bg-[#eee9f2] text-[#644d70]",
  },
] as const;

export function DemoLauncher() {
  const { state, hydrated, resetDemo } = useFoodFlow();

  const activeTables = state.tables.filter((table) => table.status !== "AVAILABLE").length;
  const kitchenOrders = state.kitchenTickets.filter((ticket) => ticket.status !== "SERVED").length;
  const billRequests = state.serviceRequests.filter(
    (request) => request.type === "REQUEST_BILL" && request.status !== "RESOLVED",
  ).length;
  const waitingOrders = state.orders.filter((order) => order.status === "PENDING_CONFIRMATION").length;

  const summary = [
    { label: "Tables", value: state.tables.length, icon: Store },
    { label: "Active now", value: activeTables, icon: Users },
    { label: "Kitchen orders", value: kitchenOrders, icon: ChefHat },
    { label: "Bill requests", value: billRequests, icon: BellRing },
  ];

  return (
    <main className="min-h-screen bg-[#f4f2eb] lg:grid lg:grid-cols-[minmax(320px,0.78fr)_minmax(620px,1.22fr)]">
      <section className="relative flex min-h-[38vh] flex-col overflow-hidden bg-forest px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-12 lg:py-10">
        <div className="ff-grid-fade absolute inset-0 opacity-30" />
        <div className="absolute -bottom-28 -right-24 size-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-16 -right-8 size-64 rounded-full border border-lime/30" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-lime text-forest">
              <UtensilsCrossed className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-black tracking-[-0.035em]">FOODFLOW</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-white/50">by Fimin Flow</p>
            </div>
          </div>
          <Badge className="border-white/15 bg-white/10 text-white" dot>
            Live demo
          </Badge>
        </div>

        <div className="relative my-auto max-w-xl py-12 lg:py-20">
          <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-lime">
            <Sparkles className="size-4" aria-hidden="true" />
            Restaurant operations platform
          </div>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-[3.55rem]">
            One order. One table. Full traceability.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/68 sm:text-base">
            Follow every dining moment from a customer&apos;s first tap through kitchen, service, payment, and owner visibility.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] text-white/70">
            <span>Table</span><ArrowRight className="size-3 text-lime" />
            <span>Staff</span><ArrowRight className="size-3 text-lime" />
            <span>Kitchen</span><ArrowRight className="size-3 text-lime" />
            <span>Serve</span><ArrowRight className="size-3 text-lime" />
            <span>Pay</span>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
          <span>Melbourne House - Bangkok</span>
          <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> Asia/Bangkok</span>
        </div>
      </section>

      <section className="px-5 py-7 sm:px-9 lg:px-12 lg:py-10 xl:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage">Demo restaurant</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-forest sm:text-3xl">Melbourne House</h2>
              <p className="mt-1 text-sm text-foreground/55">Choose an experience to enter the live operation.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCcw className="size-3.5" />}
              onClick={resetDemo}
              disabled={!hydrated}
            >
              Reset demo
            </Button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {summary.map((item) => (
              <div className="ff-panel rounded-lg p-3.5" key={item.label}>
                <div className="flex items-center justify-between">
                  <item.icon className="size-4 text-sage" aria-hidden="true" />
                  <span className={`size-1.5 rounded-full ${hydrated ? "bg-[#4e956b]" : "bg-line"}`} />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-forest">{hydrated ? item.value : "--"}</p>
                <p className="mt-0.5 text-[11px] font-medium text-foreground/50">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-forest">Choose experience</p>
              <p className="mt-1 text-xs text-foreground/48">All roles share one persistent demo state.</p>
            </div>
            {waitingOrders > 0 && (
              <Badge tone="warning" dot>{waitingOrders} awaiting confirmation</Badge>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {experiences.map((experience, index) => (
              <Link
                className={`group ff-panel flex min-h-[150px] flex-col justify-between rounded-lg p-4.5 transition duration-200 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-[0_12px_30px_rgba(22,55,43,0.08)] ${index === 0 ? "md:col-span-2 md:min-h-[128px] md:flex-row md:items-center" : ""}`}
                href={experience.href}
                key={experience.title}
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${experience.accent}`}>
                  <experience.icon className="size-5" aria-hidden="true" />
                </div>
                <div className={index === 0 ? "mt-4 min-w-0 md:mx-5 md:mt-0 md:flex-1" : "mt-4"}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold tracking-[-0.02em] text-forest">{experience.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-sage">{experience.subtitle}</span>
                  </div>
                  <p className="mt-1.5 max-w-lg text-xs leading-5 text-foreground/55">{experience.description}</p>
                </div>
                <span className={`mt-4 grid size-8 shrink-0 place-items-center rounded-full border border-line text-forest transition group-hover:border-forest group-hover:bg-forest group-hover:text-white ${index === 0 ? "md:mt-0" : "self-end"}`}>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-7 text-center text-[11px] text-foreground/38">
            Tip: start at Table T05, send an order, then follow it through each role.
          </p>
        </div>
      </section>
    </main>
  );
}
