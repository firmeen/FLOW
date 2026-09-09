import Link from "next/link";
import { Settings2, Utensils } from "lucide-react";

const links = [
  { href: "/admin/menu", label: "Menu studio", icon: Utensils },
  { href: "/admin/settings", label: "Operating settings", icon: Settings2 },
] as const;

export function OwnerStudioLauncher() {
  return (
    <nav
      aria-label="Owner studio shortcuts"
      className="fixed bottom-5 right-5 z-50 hidden items-center gap-2 rounded-2xl border border-border/80 bg-background/92 p-2 shadow-[0_24px_80px_rgb(0_0_0/0.12)] backdrop-blur-xl lg:flex"
    >
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
