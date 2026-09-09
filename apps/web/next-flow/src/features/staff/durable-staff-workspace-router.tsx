"use client";

import { useEffect, useState } from "react";

import { DurableReadyHandoffWorkspace } from "./durable-ready-handoff-workspace";
import { DurableServiceFloorWorkspace } from "./durable-service-floor-workspace";
import { DurableStaffMenuWorkspace } from "./durable-staff-menu-workspace";
import { StaffOperationsRouter } from "./operational-orders-workspace";

type StaffTab = "orders" | "tables" | "service" | "ready" | "menu";
const TABS: readonly StaffTab[] = ["orders", "tables", "service", "ready", "menu"];

function currentTab(): StaffTab {
  if (typeof window === "undefined") return "orders";
  const hash = window.location.hash.slice(1) as StaffTab;
  return TABS.includes(hash) ? hash : "orders";
}

export function DurableStaffWorkspaceRouter() {
  const [tab, setTab] = useState<StaffTab>("orders");

  useEffect(() => {
    const sync = () => setTab(currentTab());
    queueMicrotask(sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  if (tab === "tables" || tab === "service") return <DurableServiceFloorWorkspace mode={tab} />;
  if (tab === "ready") return <DurableReadyHandoffWorkspace />;
  if (tab === "menu") return <DurableStaffMenuWorkspace />;
  return <StaffOperationsRouter />;
}
