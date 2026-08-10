import {
  BarChart3,
  ChefHat,
  ClipboardList,
  ScanLine,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type DemoRole = "customer" | "staff" | "kitchen" | "cashier" | "admin";

export interface DemoRoleItem {
  id: DemoRole;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
}

export const demoRoles: readonly DemoRoleItem[] = [
  { id: "customer", label: "Customer - Table T05", shortLabel: "Guest", href: "/r/demo/table/T05", icon: ScanLine },
  { id: "staff", label: "Staff operations", shortLabel: "Staff", href: "/staff", icon: ClipboardList },
  { id: "kitchen", label: "Kitchen display", shortLabel: "Kitchen", href: "/kitchen", icon: ChefHat },
  { id: "cashier", label: "Cashier", shortLabel: "Cashier", href: "/cashier", icon: WalletCards },
  { id: "admin", label: "Owner / Admin", shortLabel: "Admin", href: "/admin", icon: BarChart3 },
] as const;

export interface RoleSwitcherProps {
  currentRole?: DemoRole;
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}

export function RoleSwitcher({
  currentRole,
  compact = true,
  inverted = false,
  className = "",
}: RoleSwitcherProps) {
  return (
    <nav aria-label="Switch demo experience" className={className}>
      {!compact && (
        <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.14em] ${inverted ? "text-white/50" : "text-[#75817b]"}`}>
          Switch experience
        </p>
      )}
      <div className={compact ? "flex items-center gap-1" : "grid grid-cols-1 gap-1"}>
        {demoRoles.map((item) => {
          const Icon = item.icon;
          const active = item.id === currentRole;

          return (
            <a
              key={item.id}
              href={item.href}
              aria-label={compact ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              title={compact ? item.label : undefined}
              className={[
                "group inline-flex items-center rounded-md border text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a152] focus-visible:ring-offset-2",
                compact ? "size-8 justify-center" : "min-h-9 gap-2 px-2.5",
                inverted
                  ? active
                    ? "border-white/25 bg-white/16 text-white"
                    : "border-transparent text-white/62 hover:bg-white/10 hover:text-white"
                  : active
                    ? "border-[#b9ccc4] bg-[#e4eee9] text-[#173f35]"
                    : "border-transparent text-[#68766f] hover:bg-[#ebeee9] hover:text-[#29483e]",
              ].filter(Boolean).join(" ")}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              {!compact && <span className="truncate">{item.shortLabel}</span>}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
