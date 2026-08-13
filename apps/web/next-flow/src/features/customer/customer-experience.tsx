"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  House,
  Leaf,
  Menu as MenuIcon,
  Plus,
  ReceiptText,
  Search,
  UtensilsCrossed,
} from "lucide-react";

import { FoodImage } from "@/components/menu/food-image";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { MenuItem } from "@/domain";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime } from "@/lib/date";
import { selectCustomerMenuItems, selectTableByCode, useFoodFlow } from "@/store";

import { CartSheet, getCartLineTotal } from "./cart-sheet";
import { ProductSheet } from "./product-sheet";
import type { CustomerCartLine } from "./types";

type CustomerView = "landing" | "menu" | "session";

export function CustomerExperience({ tableCode }: { tableCode: string }) {
  const { state, submitOrder, requestService, addCartItem, updateCartItem, removeCartItem, clearCart } = useFoodFlow();
  const [view, setView] = useState<CustomerView>("landing");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const submissionLock = useRef(false);

  const table = selectTableByCode(state, tableCode);
  const cart = table ? state.carts[table.id]?.items ?? [] : [];
  const branch = state.branches[0];
  const session = table?.currentSessionId
    ? state.tableSessions.find((candidate) => candidate.id === table.currentSessionId)
    : undefined;
  const sessionOrders = session
    ? session.orderIds.map((orderId) => state.orders.find((order) => order.id === orderId)).filter(Boolean)
    : [];

  const categories = state.categories.filter((category) => category.active && !category.archivedAt).sort((a, b) => a.displayOrder - b.displayOrder);
  const customerMenuItems = useMemo(() => selectCustomerMenuItems(state), [state]);
  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return customerMenuItems
      .filter((item) => categoryId === "all" || item.categoryId === categoryId)
      .filter((item) => !term || `${item.name} ${item.thaiName ?? ""} ${item.description}`.toLocaleLowerCase().includes(term))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categoryId, customerMenuItems, search]);
  const cartSubtotal = cart.reduce((sum, line) => sum + getCartLineTotal(line, state.menuItems, state.modifierGroups), 0);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function itemIsAvailable(item: MenuItem): boolean {
    return item.status === "ACTIVE" && customerMenuItems.some((candidate) => candidate.id === item.id);
  }

  function addLine(line: CustomerCartLine) {
    if (!table) return;
    const cartItem = {
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      modifiers: line.modifiers,
      specialRequest: line.specialRequest,
    };
    if (editingLineId) {
      updateCartItem(table.id, editingLineId, cartItem);
    } else {
      addCartItem(table.id, cartItem);
    }
    setEditingLineId(null);
    setServiceMessage(`${state.menuItems.find((item) => item.id === line.menuItemId)?.name ?? "Item"} added to cart`);
    window.setTimeout(() => setServiceMessage(null), 2_000);
  }

  function editLine(lineId: string) {
    const line = cart.find((candidate) => candidate.id === lineId);
    if (!line) return;
    const item = state.menuItems.find((candidate) => candidate.id === line.menuItemId) ?? null;
    setEditingLineId(lineId);
    setCartOpen(false);
    setSelectedItem(item);
  }

  function closeProductSheet() {
    setSelectedItem(null);
    setEditingLineId(null);
  }

  function sendService(type: "CALL_STAFF" | "REQUEST_BILL") {
    if (!table) return;
    try {
      requestService(table.id, type);
      setServiceMessage(type === "CALL_STAFF" ? "Staff have been called to your table." : "Your bill request was sent to the cashier.");
    } catch (error) {
      setServiceMessage(error instanceof Error ? error.message : "That request could not be sent. Please try again.");
    }
    window.setTimeout(() => setServiceMessage(null), 3_000);
  }

  function sendOrder() {
    if (!table || cart.length === 0 || submissionLock.current) return;
    const cartSnapshot = cart.map((line) => ({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      modifiers: line.modifiers,
      specialRequest: line.specialRequest,
    }));
    submissionLock.current = true;
    setSubmitting(true);
    setSubmissionError(null);
    window.setTimeout(() => {
      try {
        const submissionKey = `submit-${table.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const result = submitOrder({
          tableId: table.id,
          submissionKey,
          items: cartSnapshot,
        });
        const orderId = typeof result === "string" ? result : result.orderId;
        setLastOrderId(orderId);
        clearCart(table.id);
        setCartOpen(false);
        setView("session");
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : "Your order could not be sent. Please review the cart and try again.");
      } finally {
        setSubmitting(false);
        submissionLock.current = false;
      }
    }, 420);
  }

  if (!table) {
    return <main className="grid min-h-screen place-items-center"><EmptyState title="Table unavailable" description="This demo table could not be resolved." /></main>;
  }

  return (
    <main className="min-h-screen bg-muted pb-24 text-foreground">
      {serviceMessage && (
        <div className="fixed left-1/2 top-4 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-white shadow-xl" role="status">
          <CheckCircle2 className="size-4 text-primary" /> {serviceMessage}
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-border bg-muted/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {view !== "landing" && (
              <button className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted" onClick={() => setView("landing")} aria-label="Back to table home"><ArrowLeft className="size-4" /></button>
            )}
            <button
              type="button"
              className="flex items-center gap-2.5 text-left"
              onClick={() => setView("landing")}
              aria-label="Return to table home"
            >
              <span className="grid size-8 place-items-center rounded-md bg-foreground text-primary"><UtensilsCrossed className="size-4" /></span>
              <span>
                <span className="block text-sm font-black tracking-[-0.03em] text-foreground">{state.restaurant.name}</span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Powered by FoodFlow</span>
              </span>
            </button>
          </div>
          <Badge tone="forest">Table {table.code.replace("T", "")}</Badge>
        </div>
      </header>

      {view === "landing" && (
        <section className="mx-auto max-w-xl px-5 py-10 sm:py-16">
          <div className="overflow-hidden rounded-xl bg-foreground text-white ff-shadow">
            <div className="food-sprite h-48 bg-cover opacity-90 sm:h-56" data-image="gyudon" role="img" aria-label="Melbourne House signature dishes" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <StatusPill className="border-white/15 bg-card/10 text-white" dot>{branch?.isOpen ? "Open now" : "Closed"}</StatusPill>
                <span className="text-xs font-semibold text-white/50">Dine in - {table.label}</span>
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em]">Welcome to {state.restaurant.name}</h1>
              <p className="mt-3 text-sm leading-6 text-white/65">Order at your own pace. Everything you send stays connected to this table until the bill is paid.</p>
              <Button className="mt-7 bg-primary text-foreground hover:bg-primary" size="lg" fullWidth onClick={() => setView("menu")} rightIcon={<ChevronRight className="size-4" />}>View menu</Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="ff-panel rounded-lg p-4 text-left transition hover:border-foreground/35" onClick={() => sendService("CALL_STAFF")}>
              <Bell className="size-5 text-primary-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Call staff</p>
              <p className="mt-1 text-[11px] leading-4 text-foreground/45">Send a request to the floor team.</p>
            </button>
            <button className="ff-panel rounded-lg p-4 text-left transition hover:border-foreground/35" onClick={() => setView("session")}>
              <ReceiptText className="size-5 text-accent-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Current order</p>
              <p className="mt-1 text-[11px] leading-4 text-foreground/45">{sessionOrders.length ? `${sessionOrders.length} order${sessionOrders.length === 1 ? "" : "s"} in this visit` : "No orders placed yet"}</p>
            </button>
          </div>
          <p className="mt-7 text-center text-[11px] leading-5 text-foreground/40">No account or sign-in needed. This QR is securely linked to {table.code}.</p>
        </section>
      )}

      {view === "menu" && (
        <>
          <section className="border-b border-border bg-card">
            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Fresh from our kitchen</p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-foreground">What would you like?</h1>
                </div>
                <label className="relative block w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" />
                  <span className="sr-only">Search menu</span>
                  <input className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-3 text-sm outline-none transition focus:border-ring" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes or drinks" />
                </label>
              </div>
            </div>
          </section>
          <nav className="sticky top-16 z-20 border-b border-border bg-muted/95 backdrop-blur" aria-label="Menu categories">
            <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
              {[{ id: "all", name: "All" }, ...categories].map((category) => (
                <button key={category.id} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${categoryId === category.id ? "bg-foreground text-white" : "text-foreground/55 hover:bg-muted hover:text-foreground"}`} onClick={() => setCategoryId(category.id)}>{category.name}</button>
              ))}
            </div>
          </nav>
          <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
            {visibleItems.length === 0 ? (
              <EmptyState icon={<Search className="size-5" />} title="No dishes found" description="Try another search or category." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item) => (
                  <MenuCard
                    item={item}
                    available={itemIsAvailable(item)}
                    badges={state.menuBadges.filter((badge) => item.badgeIds.includes(badge.id))}
                    key={item.id}
                    onSelect={() => itemIsAvailable(item) && setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {view === "session" && (
        <section className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
          {lastOrderId && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-chart-3/50 bg-chart-1/20 p-4 text-chart-5">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div><p className="text-sm font-bold">Order sent successfully.</p><p className="mt-1 text-xs leading-5 opacity-75">It is waiting for restaurant confirmation. Rapid re-submission is blocked.</p></div>
            </div>
          )}
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Live table session</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-foreground">Table {table.code.replace("T", "")}</h1>
              {session && <p className="mt-1 text-xs text-foreground/45">{session.sessionNumber} - Started {formatBangkokTime(session.openedAt)}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => setView("menu")} leftIcon={<Plus className="size-3.5" />}>Order more</Button>
          </div>

          <div className="mt-6 space-y-4">
            {sessionOrders.length === 0 ? (
              <EmptyState icon={<ReceiptText className="size-5" />} title="No orders yet" description="Browse the menu whenever you are ready." action={<Button onClick={() => setView("menu")}>Browse menu</Button>} />
            ) : sessionOrders.map((order) => order && (
              <article className={`ff-panel rounded-lg p-5 ${order.id === lastOrderId ? "ring-2 ring-chart-3/30" : ""}`} key={order.id}>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-sm font-bold text-foreground">Order {order.number}</p><p className="mt-1 text-[11px] text-foreground/42">Sent {formatBangkokTime(order.submittedAt)}</p></div>
                  <StatusPill tone={order.customerStatus === "REJECTED" || order.customerStatus === "CANCELLED" ? "danger" : order.customerStatus === "SERVED" ? "success" : order.customerStatus === "SENT" ? "warning" : "info"}>{order.customerStatus.replaceAll("_", " ").toLocaleLowerCase()}</StatusPill>
                </div>
                <div className="my-5"><OrderStatusTimeline status={order.customerStatus} /></div>
                {order.rejectionReason && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs leading-5 text-destructive"><strong className="mr-1">Restaurant note:</strong>{order.rejectionReason}</div>}
                <div className="border-t border-border pt-4">
                  {order.items.map((item) => (
                    <div className="flex justify-between gap-4 py-1 text-sm" key={item.id}><span className="text-foreground/68"><strong className="mr-2 text-foreground">{item.quantity}x</strong>{item.menuItemName}</span><span className="font-semibold text-foreground">{formatTHB(item.lineTotal)}</span></div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {sessionOrders.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" leftIcon={<Bell className="size-4" />} onClick={() => sendService("CALL_STAFF")}>Call staff</Button>
              <Button leftIcon={<ReceiptText className="size-4" />} onClick={() => sendService("REQUEST_BILL")} disabled={session?.status === "BILL_REQUESTED" || session?.status === "PAYMENT_PENDING"}>{session?.status === "BILL_REQUESTED" ? "Bill requested" : "Request bill"}</Button>
            </div>
          )}
        </section>
      )}

      {view === "menu" && cartCount > 0 && (
        <button className="fixed bottom-24 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-xl bg-foreground px-4 py-3.5 text-white shadow-lg" onClick={() => setCartOpen(true)}>
          <span className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-black text-foreground">{cartCount}</span><span className="text-sm font-semibold">View cart</span></span>
          <span className="text-sm font-bold">{formatTHB(cartSubtotal)}</span>
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/96 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Customer navigation">
        <div className="mx-auto grid h-16 max-w-xl grid-cols-3">
          <CustomerNav active={view === "landing"} icon={<House />} label="Table" onClick={() => setView("landing")} />
          <CustomerNav active={view === "menu"} icon={<MenuIcon />} label="Menu" onClick={() => setView("menu")} />
          <CustomerNav active={view === "session"} icon={<ReceiptText />} label="Current order" onClick={() => setView("session")} />
        </div>
      </nav>

      <ProductSheet key={`${selectedItem?.id ?? "closed"}-${editingLineId ?? "new"}`} item={selectedItem} initialLine={editingLineId ? cart.find((line) => line.id === editingLineId) : null} modifierGroups={state.modifierGroups} badges={state.menuBadges} onClose={closeProductSheet} onAdd={addLine} />
      <CartSheet open={cartOpen} tableLabel={table.label} lines={cart} menuItems={state.menuItems} modifierGroups={state.modifierGroups} submitting={submitting} error={submissionError} onClose={() => setCartOpen(false)} onQuantity={(id, quantity) => quantity <= 0 ? removeCartItem(table.id, id) : updateCartItem(table.id, id, { quantity })} onRemove={(id) => removeCartItem(table.id, id)} onEdit={editLine} onSubmit={sendOrder} />
    </main>
  );
}

function MenuCard({ item, badges, available, onSelect }: { item: MenuItem; badges: { id: string; name: string }[]; available: boolean; onSelect: () => void }) {
  return (
    <article className={`group overflow-hidden rounded-lg border border-border bg-card ${available ? "transition hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg" : "opacity-72"}`}>
      <button className="block w-full text-left" disabled={!available} onClick={onSelect}>
        <div className="relative h-44 overflow-hidden">
          <FoodImage className={`h-full w-full transition duration-300 ${available ? "group-hover:scale-[1.025]" : "grayscale-[35%]"}`} imageKey={item.imageKey ?? item.imageUrl} alt={item.name} />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {badges.slice(0, 1).map((badge) => <Badge key={badge.id} tone="warning">{badge.name}</Badge>)}
            {item.vegetarian && <Badge tone="success" icon={<Leaf className="size-3" />}>Veg</Badge>}
          </div>
          {!available && <span className="absolute inset-0 grid place-items-center bg-foreground/25"><span className="rounded-full bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground">{item.status === "SOLD_OUT" ? "Sold out" : "Available on selected days"}</span></span>}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0"><h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">{item.name}</h2>{item.thaiName && <p className="mt-0.5 truncate text-xs text-foreground/43">{item.thaiName}</p>}</div>
            <span className="shrink-0 text-base font-bold text-foreground">{formatTHB(item.basePrice)}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground/52">{item.description}</p>
          <div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[10px] font-medium text-foreground/42"><Clock3 className="size-3" /> {item.estimatedPreparationMinutes} min</span><span className={`grid size-8 place-items-center rounded-full ${available ? "bg-foreground text-white" : "bg-muted text-foreground/35"}`}><Plus className="size-4" /></span></div>
        </div>
      </button>
    </article>
  );
}

function CustomerNav({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement<{ className?: string }>; label: string; onClick: () => void }) {
  return <button className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active ? "text-foreground" : "text-foreground/38"}`} onClick={onClick}>{<span className={active ? "text-foreground" : "text-foreground/38"}>{icon}</span>}<span>{label}</span></button>;
}
