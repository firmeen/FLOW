import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { FoodFlowLogo, FoodFlowMark } from "./foodflow-logo";
import { RoleSwitcher, type DemoRole } from "./role-switcher";

export interface OperationalNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
}

export interface OperationalShellProps {
  title: string;
  subtitle?: string;
  role: string;
  navItems: readonly OperationalNavItem[];
  children: ReactNode;
  headerActions?: ReactNode;
  restaurantName?: string;
  restaurantMeta?: string;
  currentRole?: DemoRole;
  contentClassName?: string;
}

export function OperationalShell({
  title,
  subtitle,
  role,
  navItems,
  children,
  headerActions,
  restaurantName = "Melbourne House",
  restaurantMeta = "Demo restaurant",
  currentRole,
  contentClassName = "",
}: OperationalShellProps) {
  return (
    <div className="min-h-screen bg-muted/35 text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-sidebar-border px-5 py-5">
          <a
            href="/"
            aria-label="FoodFlow demo home"
            className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            <FoodFlowLogo showTagline />
          </a>
        </div>

        <div className="mx-4 mt-4 border border-sidebar-border bg-sidebar-accent px-3.5 py-3">
          <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{restaurantName}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <p className="truncate text-[11px] text-muted-foreground">{restaurantMeta}</p>
          </div>
        </div>

        <nav aria-label={`${role} navigation`} className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Workspace
          </p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={item.onClick}
                  aria-current={item.active ? "page" : undefined}
                  className={[
                    "flex min-h-10 items-center gap-3 rounded-none border px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
                    item.active
                      ? "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
                      : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${item.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="mb-2 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Demo views
          </p>
          <RoleSwitcher currentRole={currentRole} />
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <a
              href="/"
              aria-label="FoodFlow demo home"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
            >
              <FoodFlowMark className="size-8" />
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-heading text-base font-semibold uppercase tracking-[0.04em] text-foreground sm:text-lg">
                  {title}
                </h1>
                <Badge tone="forest" className="hidden sm:inline-flex">{role}</Badge>
              </div>
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>

            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <RoleSwitcher currentRole={currentRole} />
              {headerActions && <div className="flex items-center gap-2 border-l border-border pl-3">{headerActions}</div>}
            </div>
            {headerActions && <div className="flex shrink-0 items-center gap-2 sm:hidden">{headerActions}</div>}
          </div>
        </header>

        <main className={`px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 lg:pb-8 ${contentClassName}`}>
          {children}
        </main>
      </div>

      <nav
        aria-label={`${role} mobile navigation`}
        className="fixed inset-x-0 bottom-0 z-30 flex min-h-16 items-stretch overflow-x-auto border-t border-border bg-background/98 px-1 pb-[env(safe-area-inset-bottom)] shadow-sm backdrop-blur-sm lg:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={item.onClick}
              aria-current={item.active ? "page" : undefined}
              className={[
                "relative flex min-w-16 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
                item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item.active && <span className="absolute inset-x-4 top-0 h-0.5 bg-primary" aria-hidden="true" />}
              <span className="relative">
                <Icon className="size-5" strokeWidth={item.active ? 2.2 : 1.8} aria-hidden="true" />
                {item.badge !== undefined && (
                  <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-destructive px-1 text-center text-[9px] leading-4 text-white">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="max-w-20 truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
