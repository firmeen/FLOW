"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  House,
  LoaderCircle,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { FlowLogo } from "@/components/shared/flow-logo";
import { Badge, Button, StatusPill } from "@/components/foodflow-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime } from "@/lib/date";

import { DurableCustomerCartSheet } from "./durable-customer-cart-sheet";
import { DurableCustomerProductSheet } from "./durable-customer-product-sheet";
import type {
  CustomerApiResponse,
  DurableCartAggregate,
  DurableCartDraft,
  DurableCustomerMenuItem,
  DurableCustomerSnapshot,
  DurableSubmittedOrder,
} from "./durable-customer-types";

type CustomerView = "home" | "menu" | "orders";

type CustomerVisibleOrder = {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly submittedAt: string | null;
  readonly acceptedAt: string | null;
  readonly preparingAt: string | null;
  readonly readyAt: string | null;
  readonly servedAt: string | null;
  readonly rejectedAt: string | null;
  readonly closedAt: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Waiting for restaurant",
  CHANGED: "Needs review",
  ACCEPTED: "Confirmed",
  PREPARING: "Preparing",
  REMAKE: "Being remade",
  READY: "Ready",
  SERVED: "Served",
  REJECTED: "Not accepted",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  CLOSED: "Closed",
};

function minorToMajor(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : Number.NaN;
}

function commandMessage(code: string): string {
  switch (code) {
    case "CUSTOMER_COMMAND_CONTEXT_REQUIRED":
    case "CUSTOMER_COMMAND_CONTEXT_REVOKED":
      return "This table session is no longer active. Scan the table QR again.";
    case "CUSTOMER_COMMAND_ITEM_UNAVAILABLE":
      return "That item just became unavailable. Refresh the menu and choose another item.";
    case "CUSTOMER_COMMAND_CART_NOT_EDITABLE":
      return "That cart has already been sent. A new cart is ready for your next order.";
    case "CUSTOMER_COMMAND_CONFLICT":
      return "The order changed while you were using it. Refresh and try again.";
    default:
      return "We could not save that change. Please try again.";
  }
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as CustomerApiResponse<T>;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "CUSTOMER_COMMAND_UNAVAILABLE" : body.error.code;
    throw new Error(commandMessage(code));
  }
  return body.data;
}

function idempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `flow-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function menuImageStyle(imageUrl: string | null): React.CSSProperties | undefined {
  return imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;
}

function OrderStatusRail({ order }: { readonly order: CustomerVisibleOrder }) {
  const stages = [
    { key: "submitted", label: "Sent", active: Boolean(order.submittedAt) },
    { key: "accepted", label: "Confirmed", active: Boolean(order.acceptedAt) },
    { key: "preparing", label: "Preparing", active: Boolean(order.preparingAt) },
    { key: "ready", label: "Ready", active: Boolean(order.readyAt) },
    { key: "served", label: "Served", active: Boolean(order.servedAt) },
  ];

  if (order.status === "REJECTED" || order.status === "CANCELLED") {
    return (
      <div className="mt-4 rounded-xl border border-destructive/15 bg-destructive/7 px-3 py-2.5 text-xs font-semibold text-destructive">
        {STATUS_LABELS[order.status] ?? order.status}
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-5 gap-1" aria-label="Order progress">
      {stages.map((stage) => (
        <div key={stage.key} className="min-w-0">
          <div className={`h-1 rounded-full ${stage.active ? "bg-foreground" : "bg-border"}`} />
          <p className={`mt-1.5 truncate text-[9px] font-bold uppercase tracking-[0.08em] ${stage.active ? "text-foreground" : "text-muted-foreground/60"}`}>
            {stage.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DurableCustomerExperience({ snapshot }: { readonly snapshot: DurableCustomerSnapshot }) {
  const { storefront, menu } = snapshot;
  const [view, setView] = useState<CustomerView>("home");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedItem, setSelectedItem] = useState<DurableCustomerMenuItem | null>(null);
  const [cart, setCart] = useState<DurableCartAggregate | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<readonly CustomerVisibleOrder[]>([]);
  const [busy, setBusy] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const cartPromise = useRef<Promise<DurableCartAggregate> | null>(null);

  const categories = useMemo(
    () => [...menu.categories].sort((a, b) => a.displayOrder - b.displayOrder),
    [menu.categories],
  );
  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return [...menu.items]
      .filter((item) => categoryId === "all" || item.categoryId === categoryId)
      .filter((item) => !term || `${item.name} ${item.thaiName ?? ""} ${item.description}`.toLocaleLowerCase().includes(term))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categoryId, menu.items, search]);

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const activeOrder = orders.find((order) => !["REJECTED", "CANCELLED", "CLOSED"].includes(order.status)) ?? orders[0] ?? null;

  const loadOrders = useCallback(async () => {
    const response = await fetch("/api/customer/orders", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const data = await readApi<readonly CustomerVisibleOrder[]>(response);
    setOrders(data);
  }, []);

  const ensureCart = useCallback(async (): Promise<DurableCartAggregate> => {
    if (cart?.status === "DRAFT") return cart;
    if (cartPromise.current) return cartPromise.current;

    const promise = (async () => {
      const response = await fetch("/api/customer/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const data = await readApi<DurableCartAggregate>(response);
      setCart(data);
      return data;
    })();
    cartPromise.current = promise;
    try {
      return await promise;
    } finally {
      cartPromise.current = null;
    }
  }, [cart]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [nextCart] = await Promise.all([ensureCart(), loadOrders()]);
        if (active) setCart(nextCart);
      } catch (error) {
        if (active) setPageError(error instanceof Error ? error.message : "The table experience could not be loaded.");
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [ensureCart, loadOrders]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 2_800);
  }

  async function addItem(draft: DurableCartDraft) {
    setBusy(true);
    setCartError(null);
    try {
      const current = await ensureCart();
      const response = await fetch("/api/customer/cart/items", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey(),
        },
        body: JSON.stringify({
          cartId: current.id,
          menuItemId: draft.menuItemId,
          quantity: draft.quantity,
          modifierChoiceIds: draft.modifierChoiceIds,
          specialRequest: draft.specialRequest,
        }),
      });
      const next = await readApi<DurableCartAggregate>(response);
      setCart(next);
      showNotice("Added to your table cart");
    } finally {
      setBusy(false);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (!cart || busy) return;
    setBusy(true);
    setCartError(null);
    try {
      const response = await fetch("/api/customer/cart/items", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey(),
        },
        body: JSON.stringify({ cartId: cart.id, cartItemId: itemId, quantity }),
      });
      setCart(await readApi<DurableCartAggregate>(response));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Quantity could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(itemId: string) {
    if (!cart || busy) return;
    setBusy(true);
    setCartError(null);
    try {
      const response = await fetch("/api/customer/cart/items", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey(),
        },
        body: JSON.stringify({ cartId: cart.id, cartItemId: itemId }),
      });
      setCart(await readApi<DurableCartAggregate>(response));
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Item could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOrder() {
    if (!cart || cart.items.length === 0 || busy) return;
    setBusy(true);
    setCartError(null);
    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey(),
        },
        body: JSON.stringify({ cartId: cart.id, customerNote: null }),
      });
      const submitted = await readApi<DurableSubmittedOrder>(response);
      setCartOpen(false);
      setView("orders");
      showNotice(`Order ${submitted.orderNumber} sent`);
      setCart(null);
      await Promise.all([ensureCart(), loadOrders()]);
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Your order could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshLiveState() {
    setBusy(true);
    setPageError(null);
    try {
      await Promise.all([ensureCart(), loadOrders()]);
      showNotice("Live table state refreshed");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Live state could not be refreshed.");
    } finally {
      setBusy(false);
    }
  }

  if (initializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6" data-flow-customer-runtime="durable">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Opening your table</p>
          <p className="mt-1 text-xs text-muted-foreground">Connecting the live menu and order session.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground" data-flow-customer-runtime="durable">
      {notice && (
        <div className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl" role="status">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {notice}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {view !== "home" && (
              <button type="button" className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card transition hover:bg-muted" onClick={() => setView("home")} aria-label="Back to table home">
                <ArrowLeft className="size-4" />
              </button>
            )}
            <button type="button" className="min-w-0 text-left" onClick={() => setView("home")} aria-label="Return to table home">
              <span className="block truncate text-sm font-semibold tracking-[-0.025em]">{storefront.restaurantName}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                <span className={`size-1.5 rounded-full ${storefront.isOpen ? "bg-emerald-500" : "bg-zinc-400"}`} />
                {storefront.branchName} · {storefront.isOpen ? "Open" : "Closed"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              title="Secure staff requests will be enabled after the durable service-request plane is connected."
              className="hidden h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-[11px] font-semibold text-muted-foreground opacity-60 sm:flex"
            >
              <Bell className="size-3.5" /> Staff
            </button>
            <button
              type="button"
              className="relative grid size-9 place-items-center rounded-xl bg-foreground text-background shadow-sm transition hover:opacity-90"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart with ${cartCount} items`}
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-background bg-foreground px-1 text-[9px] font-bold leading-4 text-background">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {pageError && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/20 bg-destructive/7 px-4 py-3">
            <p className="text-xs font-semibold text-destructive">{pageError}</p>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void refreshLiveState()}>Retry</Button>
          </div>
        </div>
      )}

      {view === "home" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-[0_32px_100px_rgb(0_0_0/0.18)] sm:px-9 sm:py-10">
              <div className="absolute -right-20 -top-24 size-72 rounded-full bg-white/[0.055] blur-2xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill className="border-white/12 bg-white/8 text-white" dot>{storefront.isOpen ? "Kitchen open" : "Currently closed"}</StatusPill>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">{storefront.tableLabel}</span>
                </div>
                <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Your table. Your pace.</p>
                <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Order beautifully.<br />Everything stays connected.</h1>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/60">Browse the live menu, save your cart directly to this table, and follow each order from confirmation to service.</p>
                <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                  <Button className="bg-white text-zinc-950 hover:bg-white/90" size="lg" disabled={!storefront.isOpen} rightIcon={<ChevronRight className="size-4" />} onClick={() => setView("menu")}>Explore menu</Button>
                  <Button className="border-white/15 bg-white/5 text-white hover:bg-white/10" variant="outline" size="lg" leftIcon={<ReceiptText className="size-4" />} onClick={() => setView("orders")}>View orders</Button>
                </div>
                <div className="mt-10 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.13em] text-white/35">
                  <span>Powered by</span>
                  <FlowLogo variant="wordmark" decorative className="w-11 invert" sizes="44px" />
                  <span>· Secure table session</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <button type="button" onClick={() => setView("orders")} className="group rounded-[1.75rem] border border-border bg-card p-5 text-left shadow-[0_18px_55px_rgb(0_0_0/0.05)] transition hover:-translate-y-0.5 hover:border-foreground/20">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-2xl bg-foreground text-background"><Clock3 className="size-4" /></span>
                  <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Current order</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.035em]">{activeOrder ? STATUS_LABELS[activeOrder.status] ?? activeOrder.status : "Nothing sent yet"}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{activeOrder ? `${activeOrder.orderNumber} · ${formatTHB(minorToMajor(activeOrder.subtotalMinor))}` : "Your live order status will appear here."}</p>
              </button>

              <button type="button" onClick={() => setCartOpen(true)} className="group rounded-[1.75rem] border border-border bg-muted/45 p-5 text-left transition hover:-translate-y-0.5 hover:border-foreground/20">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-2xl border border-border bg-background"><ShoppingBag className="size-4" /></span>
                  <span className="text-2xl font-semibold tracking-[-0.04em]">{cartCount}</span>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Saved cart</p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.03em]">{cartCount ? "Ready when you are" : "Start with the menu"}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Cart changes are persisted to this verified table session.</p>
              </button>
            </div>
          </div>
        </section>
      )}

      {view === "menu" && (
        <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10" data-flow-live-menu="database">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live from {storefront.branchName}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Choose what feels right.</h1>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/25 focus:ring-4 focus:ring-foreground/5"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search the menu"
                type="search"
              />
            </label>
          </div>

          <div className="-mx-4 mt-7 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            <div className="flex min-w-max gap-2">
              <button type="button" onClick={() => setCategoryId("all")} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${categoryId === "all" ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/20"}`}>All dishes</button>
              {categories.map((category) => (
                <button key={category.id} type="button" onClick={() => setCategoryId(category.id)} className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${categoryId === category.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/20"}`}>{category.name}</button>
              ))}
            </div>
          </div>

          {visibleItems.length === 0 ? (
            <div className="mt-12">
              <EmptyState icon={<Search className="size-5" />} title="No dishes match" description="Try another search or category." />
            </div>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <article key={item.id} data-flow-menu-item={item.id} className="group overflow-hidden rounded-[1.6rem] border border-border/80 bg-card shadow-[0_16px_50px_rgb(0_0_0/0.045)] transition hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_24px_65px_rgb(0_0_0/0.075)]">
                  <button type="button" className="block w-full text-left" onClick={() => setSelectedItem(item)}>
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-stone-100 via-zinc-100 to-stone-200 dark:from-zinc-900 dark:via-stone-900 dark:to-zinc-950">
                      {item.imageUrl ? (
                        <div className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.025]" style={menuImageStyle(item.imageUrl)} role="img" aria-label={item.name} />
                      ) : (
                        <div className="grid h-full place-items-center"><Sparkles className="size-6 text-muted-foreground/35" /></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-zinc-950/35 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {item.badges.slice(0, 2).map((badge) => <span key={badge.id} className="rounded-full border border-white/15 bg-zinc-950/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-white backdrop-blur">{badge.name}</span>)}
                      </div>
                    </div>
                    <div className="p-4.5 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-base font-semibold tracking-[-0.025em]">{item.name}</h2>
                          {item.thaiName && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.thaiName}</p>}
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">{formatTHB(minorToMajor(item.basePriceMinor))}</p>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{item.modifierGroups.length ? "Options available" : "Ready as listed"}</span>
                        <span className="grid size-8 place-items-center rounded-xl bg-foreground text-background"><Plus className="size-3.5" /></span>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {view === "orders" && (
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10" data-flow-customer-orders="database">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">This table session</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">Your orders</h1>
            </div>
            <Button variant="outline" size="sm" disabled={busy} leftIcon={<RefreshCcw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />} onClick={() => void refreshLiveState()}>Refresh</Button>
          </div>

          {orders.length === 0 ? (
            <div className="mt-12">
              <EmptyState icon={<ReceiptText className="size-5" />} title="No orders yet" description="When you send your first order, its live restaurant status will stay here." action={<Button size="sm" onClick={() => setView("menu")}>Open menu</Button>} />
            </div>
          ) : (
            <div className="mt-7 space-y-3">
              {orders.map((order, index) => (
                <article key={order.id} data-flow-customer-order={order.id} className={`rounded-[1.6rem] border p-5 sm:p-6 ${index === 0 ? "border-foreground/16 bg-card shadow-[0_20px_65px_rgb(0_0_0/0.06)]" : "border-border bg-card/70"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={order.status === "REJECTED" || order.status === "CANCELLED" ? "danger" : order.status === "SERVED" || order.status === "CLOSED" ? "success" : "neutral"}>{STATUS_LABELS[order.status] ?? order.status}</Badge>
                        {index === 0 && <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Latest</span>}
                      </div>
                      <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em]">{order.orderNumber}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{order.submittedAt ? `Sent ${formatBangkokTime(order.submittedAt)}` : "Submission time unavailable"}</p>
                    </div>
                    <p className="text-xl font-semibold tracking-[-0.035em] tabular-nums">{formatTHB(minorToMajor(order.subtotalMinor))}</p>
                  </div>
                  <OrderStatusRail order={order} />
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:hidden" aria-label="Customer navigation">
        <div className="mx-auto grid max-w-md grid-cols-3 px-3">
          {([
            ["home", "Home", House],
            ["menu", "Menu", Search],
            ["orders", "Orders", ReceiptText],
          ] as const).map(([target, label, Icon]) => (
            <button key={target} type="button" onClick={() => setView(target)} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${view === target ? "text-foreground" : "text-muted-foreground"}`}>
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
      </nav>

      <DurableCustomerProductSheet item={selectedItem} busy={busy} onClose={() => setSelectedItem(null)} onAdd={addItem} />
      <DurableCustomerCartSheet
        open={cartOpen}
        tableLabel={storefront.tableLabel}
        cart={cart}
        busy={busy}
        error={cartError}
        onClose={() => setCartOpen(false)}
        onQuantity={updateQuantity}
        onRemove={removeItem}
        onSubmit={submitOrder}
      />
    </main>
  );
}
