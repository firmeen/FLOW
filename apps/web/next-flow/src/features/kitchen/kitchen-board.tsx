"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChefHat,
  Clock3,
  CookingPot,
  Flame,
  Play,
  RotateCcw,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, EmptyState, Modal } from "@/components/foodflow-ui";
import type {
  KitchenTicket,
  KitchenTicketItem,
  MenuItem,
  Order,
  RestaurantTable,
} from "@/domain";
import { useNow } from "@/hooks/use-now";
import {
  formatBangkokTime,
  formatElapsed,
  getElapsedMilliseconds,
} from "@/lib/date";
import { useFoodFlow } from "@/store";

type KitchenLane = "NEW" | "PREPARING" | "READY";
type NoteAction = "problem" | "remake";

interface NoteDialogState {
  action: NoteAction;
  ticket: KitchenTicket;
}

interface SoldOutDialogState {
  ticket: KitchenTicket;
  selectedMenuItemId: string;
}

const laneDefinitions: readonly {
  id: KitchenLane;
  label: string;
  helper: string;
  icon: LucideIcon;
  accentClassName: string;
  countClassName: string;
}[] = [
  {
    id: "NEW",
    label: "New",
    helper: "Waiting to start",
    icon: Flame,
    accentClassName: "bg-amber-500",
    countClassName: "bg-amber-500 text-zinc-950",
  },
  {
    id: "PREPARING",
    label: "Preparing",
    helper: "On the make-line",
    icon: CookingPot,
    accentClassName: "bg-ring",
    countClassName: "bg-ring text-accent-foreground",
  },
  {
    id: "READY",
    label: "Ready",
    helper: "Waiting for pickup",
    icon: CheckCircle2,
    accentClassName: "bg-chart-3",
    countClassName: "bg-chart-3 text-zinc-950",
  },
] as const;

const activeStatuses = new Set<KitchenTicket["status"]>([
  "NEW",
  "PREPARING",
  "PROBLEM",
  "REMAKE",
  "READY",
]);

export function KitchenBoard() {
  const {
    state,
    hydrated,
    startKitchenTicket,
    markKitchenTicketReady,
    markKitchenProblem,
    remakeKitchenTicket,
    setMenuItemStatus,
  } = useFoodFlow();
  const now = useNow();
  const [station, setStation] = useState("ALL");
  const [workingTicketId, setWorkingTicketId] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState<NoteDialogState | null>(null);
  const [note, setNote] = useState("");
  const [soldOutDialog, setSoldOutDialog] = useState<SoldOutDialogState | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeTickets = useMemo(
    () =>
      state.kitchenTickets
        .filter((ticket) => activeStatuses.has(ticket.status))
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    [state.kitchenTickets],
  );

  const stations = useMemo(
    () =>
      Array.from(new Set(activeTickets.map((ticket) => ticket.station))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [activeTickets],
  );

  const visibleTickets = useMemo(
    () =>
      station === "ALL"
        ? activeTickets
        : activeTickets.filter((ticket) => ticket.station === station),
    [activeTickets, station],
  );

  const ticketsByLane = useMemo(
    () =>
      laneDefinitions.reduce<Record<KitchenLane, KitchenTicket[]>>(
        (lanes, lane) => {
          lanes[lane.id] = visibleTickets.filter(
            (ticket) => getTicketLane(ticket.status) === lane.id,
          );
          return lanes;
        },
        { NEW: [], PREPARING: [], READY: [] },
      ),
    [visibleTickets],
  );

  const navItems = [
    {
      label: "Kitchen",
      href: "/kitchen",
      icon: ChefHat,
      active: true,
      badge: activeTickets.length || undefined,
    },
  ];

  async function runTicketAction(
    ticketId: string,
    successMessage: string,
    action: () => void,
  ): Promise<boolean> {
    setWorkingTicketId(ticketId);
    setActionError(null);
    setFeedback(null);

    try {
      await Promise.resolve(action());
      setFeedback(successMessage);
      return true;
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "The kitchen action could not be completed.",
      );
      return false;
    } finally {
      setWorkingTicketId(null);
    }
  }

  function openNoteDialog(action: NoteAction, ticket: KitchenTicket) {
    setNote("");
    setNoteDialog({ action, ticket });
  }

  async function confirmNoteAction() {
    if (!noteDialog || !note.trim()) return;

    const reason = note.trim();
    const { action, ticket } = noteDialog;
    const completed = await runTicketAction(
      ticket.id,
      action === "problem"
        ? `${ticket.orderNumber} flagged for attention.`
        : `${ticket.orderNumber} returned to the make-line.`,
      () => {
        if (action === "problem") {
          markKitchenProblem(ticket.id, reason);
        } else {
          remakeKitchenTicket(ticket.id, reason);
        }
      },
    );

    if (completed) {
      setNoteDialog(null);
      setNote("");
    }
  }

  function openSoldOutDialog(ticket: KitchenTicket) {
    const candidates = getTicketMenuItems(ticket, state.orders, state.menuItems);
    setSoldOutDialog({
      ticket,
      selectedMenuItemId:
        candidates.find((menuItem) => menuItem.status !== "SOLD_OUT")?.id ??
        candidates[0]?.id ??
        "",
    });
  }

  async function confirmSoldOut() {
    if (!soldOutDialog?.selectedMenuItemId) return;
    const menuItem = state.menuItems.find(
      (candidate) => candidate.id === soldOutDialog.selectedMenuItemId,
    );
    if (!menuItem) return;

    const completed = await runTicketAction(
      soldOutDialog.ticket.id,
      `${menuItem.name} marked sold out for future orders.`,
      () =>
        setMenuItemStatus(
          menuItem.id,
          "SOLD_OUT",
          `Marked sold out from kitchen ticket ${soldOutDialog.ticket.orderNumber}`,
        ),
    );

    if (completed) setSoldOutDialog(null);
  }

  const selectedSoldOutCandidates = soldOutDialog
    ? getTicketMenuItems(soldOutDialog.ticket, state.orders, state.menuItems)
    : [];

  return (
    <OperationalShell
      title="Kitchen display"
      subtitle={`${activeTickets.length} active ticket${activeTickets.length === 1 ? "" : "s"} across ${stations.length || 1} station${stations.length === 1 ? "" : "s"}`}
      role="Kitchen"
      currentRole="kitchen"
      navItems={navItems}
      headerActions={
        <Badge tone="success" dot>
          Live
        </Badge>
      }
      contentClassName="!min-h-[calc(100vh-4rem)] !bg-foreground !px-3 !py-3 !pb-24 sm:!px-4 sm:!py-4 lg:!px-5 lg:!pb-5"
    >
      <div className="mx-auto max-w-[1800px]">
        <section
          aria-label="Kitchen display controls"
          className="mb-3 overflow-hidden rounded-lg border border-white/10 bg-foreground shadow-lg"
        >
          <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-chart-3 text-zinc-950">
                <Utensils className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
                  Live make-line
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-semibold text-white">All active orders</p>
                  <span className="hidden h-4 w-px bg-card/12 sm:block" aria-hidden="true" />
                  <p
                    className="font-mono text-sm font-bold tabular-nums text-chart-1"
                    aria-label={hydrated ? "Current restaurant time" : "Kitchen clock loading"}
                  >
                    {hydrated ? formatBangkokTime(now, { second: "2-digit" }) : "--:--:--"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto"
              role="group"
              aria-label="Filter by kitchen station"
            >
              <StationButton
                active={station === "ALL"}
                count={activeTickets.length}
                label="All stations"
                onClick={() => setStation("ALL")}
              />
              {stations.map((stationName) => (
                <StationButton
                  key={stationName}
                  active={station === stationName}
                  count={activeTickets.filter((ticket) => ticket.station === stationName).length}
                  label={formatStation(stationName)}
                  onClick={() => setStation(stationName)}
                />
              ))}
            </div>
          </div>

          {(feedback || actionError) && (
            <div
              aria-live="polite"
              className={`flex items-center gap-2 border-t px-4 py-2.5 text-xs font-semibold ${
                actionError
                  ? "border-destructive/30 bg-destructive/25 text-destructive/80"
                  : "border-white/10 bg-card/[0.04] text-chart-1"
              }`}
            >
              {actionError ? (
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">{actionError ?? feedback}</span>
              <button
                type="button"
                className="rounded px-2 py-1 text-[10px] uppercase tracking-wide text-current/70 hover:bg-card/10 hover:text-current"
                onClick={() => {
                  setFeedback(null);
                  setActionError(null);
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        <div className="grid items-start gap-3 md:grid-cols-3" aria-label="Kitchen ticket lanes">
          {laneDefinitions.map((lane) => {
            const Icon = lane.icon;
            const tickets = ticketsByLane[lane.id];

            return (
              <section
                key={lane.id}
                aria-labelledby={`kitchen-lane-${lane.id.toLocaleLowerCase()}`}
                className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-foreground"
              >
                <div className={`h-1.5 w-full ${lane.accentClassName}`} aria-hidden="true" />
                <header className="flex min-h-16 items-center gap-3 border-b border-white/10 px-3.5 py-3">
                  <Icon className="size-5 shrink-0 text-white/72" strokeWidth={2} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <h2
                      id={`kitchen-lane-${lane.id.toLocaleLowerCase()}`}
                      className="text-sm font-black uppercase tracking-[0.12em] text-white"
                    >
                      {lane.label}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-white/42">{lane.helper}</p>
                  </div>
                  <span
                    className={`grid min-w-8 place-items-center rounded-md px-2 py-1 text-sm font-black tabular-nums ${lane.countClassName}`}
                    aria-label={`${tickets.length} ${lane.label.toLocaleLowerCase()} tickets`}
                  >
                    {tickets.length}
                  </span>
                </header>

                <div className="space-y-3 p-2.5 md:min-h-[calc(100dvh-13.75rem)] xl:max-h-[calc(100dvh-13.75rem)] xl:overflow-y-auto">
                  {tickets.length === 0 ? (
                    <EmptyState
                      compact
                      className="min-h-52 border-white/10 bg-muted"
                      icon={<Icon className="size-5" />}
                      title={`No ${lane.label.toLocaleLowerCase()} tickets`}
                      description={emptyLaneMessage(lane.id, station)}
                    />
                  ) : (
                    tickets.map((ticket) => (
                      <KitchenTicketCard
                        key={ticket.id}
                        ticket={ticket}
                        lane={lane.id}
                        now={hydrated ? now : null}
                        orders={state.orders}
                        tables={state.tables}
                        menuItems={state.menuItems}
                        working={workingTicketId === ticket.id}
                        onStart={() =>
                          void runTicketAction(
                            ticket.id,
                            `${ticket.orderNumber} moved to preparing.`,
                            () => startKitchenTicket(ticket.id),
                          )
                        }
                        onReady={() =>
                          void runTicketAction(
                            ticket.id,
                            `${ticket.orderNumber} is ready for pickup.`,
                            () => markKitchenTicketReady(ticket.id),
                          )
                        }
                        onProblem={() => openNoteDialog("problem", ticket)}
                        onRemake={() => openNoteDialog("remake", ticket)}
                        onSoldOut={() => openSoldOutDialog(ticket)}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Modal
        open={Boolean(noteDialog)}
        onClose={() => {
          setNoteDialog(null);
          setNote("");
        }}
        title={noteDialog?.action === "remake" ? "Send ticket for remake" : "Report a kitchen problem"}
        description={
          noteDialog
            ? `${noteDialog.ticket.orderNumber} - ${getTableCode(noteDialog.ticket, state.tables)}. A note is required and will remain in the operational record.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={Boolean(workingTicketId)}
              onClick={() => {
                setNoteDialog(null);
                setNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={Boolean(noteDialog && workingTicketId === noteDialog.ticket.id)}
              disabled={!note.trim()}
              leftIcon={
                noteDialog?.action === "remake" ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <AlertTriangle className="size-4" />
                )
              }
              onClick={() => void confirmNoteAction()}
            >
              {noteDialog?.action === "remake" ? "Start remake" : "Flag problem"}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-semibold text-foreground" htmlFor="kitchen-action-note">
          {noteDialog?.action === "remake" ? "Reason for remake" : "What is blocking this ticket?"}
        </label>
        <textarea
          id="kitchen-action-note"
          autoFocus
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={
            noteDialog?.action === "remake"
              ? "Example: Steak overcooked - remake medium rare"
              : "Example: Waiting for replacement ingredient"
          }
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-border bg-card p-3 text-sm leading-6 text-foreground placeholder:text-foreground/35 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/15"
        />
        <p className="mt-2 text-xs text-foreground/45">
          Required for shift handover and audit history.
        </p>
      </Modal>

      <Modal
        open={Boolean(soldOutDialog)}
        onClose={() => setSoldOutDialog(null)}
        title="Mark an item sold out"
        description={
          soldOutDialog
            ? `${soldOutDialog.ticket.orderNumber} stays on the make-line. This only blocks the item from future orders.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              disabled={Boolean(workingTicketId)}
              onClick={() => setSoldOutDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={Boolean(soldOutDialog && workingTicketId === soldOutDialog.ticket.id)}
              disabled={!soldOutDialog?.selectedMenuItemId}
              leftIcon={<Ban className="size-4" />}
              onClick={() => void confirmSoldOut()}
            >
              Mark sold out
            </Button>
          </>
        }
      >
        {selectedSoldOutCandidates.length === 0 ? (
          <EmptyState
            compact
            icon={<Ban className="size-5" />}
            title="No linked menu item"
            description="This historical ticket is not linked to a current menu item."
          />
        ) : (
          <div role="radiogroup" aria-label="Choose menu item" className="space-y-2">
            {selectedSoldOutCandidates.map((menuItem) => {
              const selected = soldOutDialog?.selectedMenuItemId === menuItem.id;
              const alreadySoldOut = menuItem.status === "SOLD_OUT";

              return (
                <button
                  key={menuItem.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={alreadySoldOut}
                  onClick={() =>
                    setSoldOutDialog((current) =>
                      current ? { ...current, selectedMenuItemId: menuItem.id } : current,
                    )
                  }
                  className={`flex min-h-16 w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                    selected
                      ? "border-destructive bg-destructive/10 ring-1 ring-destructive"
                      : "border-border bg-card hover:border-border"
                  } disabled:cursor-not-allowed disabled:opacity-55`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                      selected ? "border-destructive" : "border-border"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <span className="size-2.5 rounded-full bg-destructive" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{menuItem.name}</span>
                    <span className="mt-0.5 block text-xs text-foreground/45">
                      {formatStation(menuItem.preparationStation)}
                    </span>
                  </span>
                  {alreadySoldOut && <Badge tone="danger">Already sold out</Badge>}
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </OperationalShell>
  );
}

interface KitchenTicketCardProps {
  ticket: KitchenTicket;
  lane: KitchenLane;
  now: number | null;
  orders: Order[];
  tables: RestaurantTable[];
  menuItems: MenuItem[];
  working: boolean;
  onStart: () => void;
  onReady: () => void;
  onProblem: () => void;
  onRemake: () => void;
  onSoldOut: () => void;
}

function KitchenTicketCard({
  ticket,
  lane,
  now,
  orders,
  tables,
  menuItems,
  working,
  onStart,
  onReady,
  onProblem,
  onRemake,
  onSoldOut,
}: KitchenTicketCardProps) {
  const order = orders.find((candidate) => candidate.id === ticket.orderId);
  const ticketMenuItems = getTicketMenuItems(ticket, orders, menuItems);
  const timerStart = lane === "READY" && ticket.readyAt ? ticket.readyAt : ticket.createdAt;
  const timerText = now === null ? "--:--" : formatElapsed(timerStart, now);
  const timerTone =
    now === null
      ? "border-border bg-chart-1/20 text-muted-foreground"
      : getTimerTone(getElapsedMilliseconds(timerStart, now), lane);
  const tableCode = getTableCode(ticket, tables);
  const statusLabel = getStatusLabel(ticket.status);

  return (
    <article
      className={`animate-ticket overflow-hidden rounded-lg border bg-muted shadow-lg ${
        ticket.status === "PROBLEM"
          ? "border-destructive/30 ring-2 ring-destructive/30/30"
          : ticket.status === "REMAKE"
            ? "border-amber-500/50 ring-2 ring-amber-500/25"
            : "border-black/15"
      }`}
      aria-label={`${ticket.orderNumber}, table ${tableCode}, ${statusLabel}`}
    >
      <div className={`h-1.5 ${ticketAccent(ticket.status)}`} aria-hidden="true" />
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-foreground/40">
            Table
          </p>
          <p className="mt-0.5 text-[2rem] font-black leading-none tracking-[-0.055em] text-foreground">
            {tableCode}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={ticketStatusTone(ticket.status)}>{statusLabel}</Badge>
            {ticket.remakeCount > 0 && (
              <Badge tone="warning">Remake {ticket.remakeCount}</Badge>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-black tracking-[-0.02em] text-foreground">{ticket.orderNumber}</p>
          <div
            className={`mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 font-mono text-base font-black tabular-nums ${timerTone}`}
            aria-label={
              now === null
                ? "Ticket timer loading"
                : `${lane === "READY" ? "Ready for" : "Waiting"} ${timerText}`
            }
          >
            <Clock3 className="size-4" aria-hidden="true" />
            {timerText}
          </div>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/35">
            {lane === "READY" ? "Ready for" : "Order age"}
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-foreground/65">
          <ChefHat className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{formatStation(ticket.station)}</span>
        </span>
        <span className="shrink-0 text-[10px] font-semibold text-foreground/38">
          Sent {formatBangkokTime(ticket.createdAt)}
        </span>
      </div>

      <div className="divide-y divide-border px-4">
        {ticket.items.map((item) => {
          const linkedMenuItem = getLinkedMenuItem(item, ticket, order, menuItems);
          const soldOut = linkedMenuItem?.status === "SOLD_OUT";

          return (
            <div key={item.id} className="py-3.5">
              <div className="flex items-start gap-3">
                <span className="grid min-h-9 min-w-9 shrink-0 place-items-center rounded-md bg-foreground px-1 text-base font-black text-white">
                  {item.quantity}x
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-extrabold leading-5 tracking-[-0.015em] text-foreground">
                      {item.menuItemName}
                    </p>
                    {soldOut && <Badge tone="danger">Sold out</Badge>}
                  </div>
                  {item.modifiers.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs font-semibold leading-5 text-foreground/58">
                      {item.modifiers.map((modifier, index) => (
                        <li
                          key={`${modifier}-${index}`}
                          className="before:mr-1.5 before:text-muted-foreground before:content-['+']"
                        >
                          {modifier}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {item.specialRequest && (
                <div className="mt-2.5 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-2.5 text-xs font-bold leading-5 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{item.specialRequest}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {order?.customerNote && (
        <TicketNotice icon={<Utensils className="size-4" />} label="Order note">
          {order.customerNote}
        </TicketNotice>
      )}

      {ticket.problemNote && (
        <TicketNotice
          danger={ticket.status === "PROBLEM"}
          icon={<AlertTriangle className="size-4" />}
          label={ticket.status === "REMAKE" ? "Remake reason" : "Kitchen note"}
        >
          {ticket.problemNote}
        </TicketNotice>
      )}

      <footer className="grid grid-cols-2 gap-2 border-t border-border bg-muted p-3">
        {lane === "NEW" && (
          <Button
            size="lg"
            fullWidth
            isLoading={working}
            className="col-span-2 !min-h-14 !border-primary !bg-primary !text-primary-foreground hover:!border-primary/60 hover:!bg-primary"
            leftIcon={<Play className="size-5 fill-current" />}
            onClick={onStart}
          >
            Start ticket
          </Button>
        )}

        {lane === "PREPARING" && (ticket.status === "PROBLEM" || ticket.status === "REMAKE") && (
          <Button
            size="lg"
            fullWidth
            isLoading={working}
            className="col-span-2 !min-h-14 !border-primary !bg-primary !text-primary-foreground hover:!border-primary/60 hover:!bg-primary"
            leftIcon={<Play className="size-5 fill-current" />}
            onClick={onStart}
          >
            {ticket.status === "REMAKE" ? "Start remake" : "Resume ticket"}
          </Button>
        )}

        {lane === "PREPARING" && ticket.status === "PREPARING" && (
          <Button
            size="lg"
            fullWidth
            isLoading={working}
            className="col-span-2 !min-h-14 !border-primary !bg-primary !text-primary-foreground hover:!border-primary/60 hover:!bg-primary"
            leftIcon={<CheckCircle2 className="size-5" />}
            onClick={onReady}
          >
            Mark ready
          </Button>
        )}

        {lane === "READY" && (
          <Button
            size="lg"
            fullWidth
            variant="outline"
            disabled={working}
            className="col-span-2 !min-h-14 !border-destructive/30 !bg-destructive/10 !text-destructive hover:!bg-destructive/10"
            leftIcon={<RotateCcw className="size-5" />}
            onClick={onRemake}
          >
            Remake ticket
          </Button>
        )}

        {lane !== "READY" && (
          <Button
            size="lg"
            fullWidth
            variant="outline"
            disabled={working}
            className="!min-h-12 !border-destructive/30 !bg-destructive/10 !text-destructive hover:!bg-destructive/15"
            leftIcon={<AlertTriangle className="size-4" />}
            onClick={onProblem}
          >
            Problem
          </Button>
        )}

        <Button
          size="lg"
          fullWidth
          variant="outline"
          disabled={working || ticketMenuItems.length === 0}
          className={`!min-h-12 !border-destructive/30 !bg-destructive/10 !text-destructive hover:!bg-destructive/10 ${
            lane === "READY" ? "col-span-2" : ""
          }`}
          leftIcon={<Ban className="size-4" />}
          onClick={onSoldOut}
        >
          Sold out
        </Button>
      </footer>
    </article>
  );
}

function TicketNotice({
  icon,
  label,
  danger = false,
  children,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-4 mb-3 rounded-md border px-3 py-2.5 ${
        danger
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-chart-1/20 text-foreground"
      }`}
    >
      <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.13em] opacity-65">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs font-bold leading-5">{children}</p>
    </div>
  );
}

function StationButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-white/12 bg-card/[0.04] text-white/65 hover:border-white/25 hover:bg-card/[0.08] hover:text-white"
      }`}
    >
      {label}
      <span
        className={`min-w-5 rounded px-1.5 py-0.5 text-[10px] tabular-nums ${
          active ? "bg-foreground/12" : "bg-card/10"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function getTicketLane(status: KitchenTicket["status"]): KitchenLane | null {
  if (status === "NEW") return "NEW";
  if (status === "PREPARING" || status === "PROBLEM" || status === "REMAKE") {
    return "PREPARING";
  }
  if (status === "READY") return "READY";
  return null;
}

function getTableCode(ticket: KitchenTicket, tables: RestaurantTable[]): string {
  return tables.find((table) => table.id === ticket.tableId)?.code ?? "Unassigned";
}

function formatStation(station: string): string {
  return station
    .replaceAll("_", " ")
    .toLocaleLowerCase()
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

function getStatusLabel(status: KitchenTicket["status"]): string {
  if (status === "PROBLEM") return "Problem";
  if (status === "REMAKE") return "Remake";
  if (status === "PREPARING") return "Preparing";
  if (status === "READY") return "Ready";
  return "New";
}

function ticketStatusTone(
  status: KitchenTicket["status"],
): "warning" | "danger" | "info" | "success" {
  if (status === "PROBLEM") return "danger";
  if (status === "REMAKE" || status === "NEW") return "warning";
  if (status === "READY") return "success";
  return "info";
}

function ticketAccent(status: KitchenTicket["status"]): string {
  if (status === "PROBLEM") return "bg-destructive";
  if (status === "REMAKE" || status === "NEW") return "bg-amber-500";
  if (status === "READY") return "bg-chart-3";
  return "bg-ring";
}

function getTimerTone(elapsedMs: number, lane: KitchenLane): string {
  if (lane === "READY") {
    return elapsedMs >= 5 * 60_000
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-chart-3/50 bg-chart-1/20 text-chart-5";
  }
  if (elapsedMs >= 15 * 60_000) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }
  if (elapsedMs >= 8 * 60_000) {
    return "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300";
  }
  return "border-border bg-chart-1/20 text-muted-foreground";
}

function getLinkedMenuItem(
  ticketItem: KitchenTicketItem,
  ticket: KitchenTicket,
  order: Order | undefined,
  menuItems: MenuItem[],
): MenuItem | undefined {
  const directMenuItemId = ticketItem.menuItemId;
  const orderMenuItemId = order?.items.find(
    (orderItem) => orderItem.id === ticketItem.orderItemId,
  )?.menuItemId;

  return (
    menuItems.find((menuItem) => menuItem.id === (directMenuItemId ?? orderMenuItemId)) ??
    menuItems.find(
      (menuItem) =>
        menuItem.name.toLocaleLowerCase() === ticketItem.menuItemName.toLocaleLowerCase() &&
        menuItem.preparationStation === ticket.station,
    ) ??
    menuItems.find(
      (menuItem) => menuItem.name.toLocaleLowerCase() === ticketItem.menuItemName.toLocaleLowerCase(),
    )
  );
}

function getTicketMenuItems(
  ticket: KitchenTicket,
  orders: Order[],
  menuItems: MenuItem[],
): MenuItem[] {
  const order = orders.find((candidate) => candidate.id === ticket.orderId);
  const uniqueItems = new Map<string, MenuItem>();

  ticket.items.forEach((ticketItem) => {
    const menuItem = getLinkedMenuItem(ticketItem, ticket, order, menuItems);
    if (menuItem) uniqueItems.set(menuItem.id, menuItem);
  });

  return Array.from(uniqueItems.values());
}

function emptyLaneMessage(lane: KitchenLane, station: string): string {
  const scope = station === "ALL" ? "the kitchen" : formatStation(station);
  if (lane === "NEW") return `Newly accepted orders for ${scope} will appear here.`;
  if (lane === "PREPARING") return `Nothing is currently cooking at ${scope}.`;
  return `No orders are waiting for pickup from ${scope}.`;
}
