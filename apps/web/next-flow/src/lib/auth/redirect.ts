const DEFAULT_INTERNAL_PATH = "/staff";
const INTERNAL_PREFIXES = ["/staff", "/kitchen", "/cashier", "/admin"] as const;

export function sanitizeInternalPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_INTERNAL_PATH;
  }

  try {
    const base = new URL("https://foodflow.local");
    const target = new URL(value, base);
    const isInternalOrigin = target.origin === base.origin;
    const isProtectedPath = INTERNAL_PREFIXES.some(
      (prefix) => target.pathname === prefix || target.pathname.startsWith(`${prefix}/`),
    );

    if (!isInternalOrigin || !isProtectedPath) {
      return DEFAULT_INTERNAL_PATH;
    }

    return `${target.pathname}${target.search}`;
  } catch {
    return DEFAULT_INTERNAL_PATH;
  }
}

export function getInternalExperienceLabel(path: string): string {
  if (path.startsWith("/kitchen")) return "Kitchen Display";
  if (path.startsWith("/cashier")) return "Cashier";
  if (path.startsWith("/admin")) return "Owner / Admin";
  return "Staff Operations";
}
