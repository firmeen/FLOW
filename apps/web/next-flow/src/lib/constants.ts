export const APP_NAME = "FoodFlow";
export const APP_DESCRIPTION =
  "One connected operational flow from table to kitchen to payment.";

export const FOODFLOW_TIME_ZONE = "Asia/Bangkok";
export const FOODFLOW_DISPLAY_LOCALE = "en-US";
export const FOODFLOW_CURRENCY_LOCALE = "en-TH";
export const FOODFLOW_CURRENCY = "THB";

export const MILLISECONDS = {
  second: 1_000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
} as const;

export const DEMO_SETTINGS = {
  restaurantName: "Melbourne House",
  restaurantSlug: "demo",
  tableCode: "T05",
  tableCount: 12,
  defaultPreparationMinutes: 15,
  duplicateSubmissionWindowMs: 2_500,
} as const;

/** Demo-only billing defaults; these remain configurable in the cashier UI. */
export const DEFAULT_BILLING_SETTINGS = {
  serviceChargeEnabled: true,
  serviceChargeRate: 0.1,
  vatEnabled: true,
  vatRate: 0.07,
} as const;

export const WAIT_TIME_THRESHOLDS_MS = {
  warning: 5 * MILLISECONDS.minute,
  critical: 10 * MILLISECONDS.minute,
} as const;

export const STORAGE_KEYS = {
  demoState: "foodflow:demo-state:v1",
} as const;

export const APP_ROUTES = {
  home: "/",
  customerDemo: `/r/${DEMO_SETTINGS.restaurantSlug}/table/${DEMO_SETTINGS.tableCode}`,
  staff: "/staff",
  kitchen: "/kitchen",
  cashier: "/cashier",
  admin: "/admin",
} as const;

export const STATUS_TONE_CLASSNAMES = {
  neutral: {
    badge: "border-stone-200 bg-stone-100 text-stone-700",
    dot: "bg-stone-400",
    text: "text-stone-700",
  },
  info: {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
    text: "text-sky-800",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    text: "text-amber-900",
  },
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
  },
  danger: {
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
    text: "text-rose-800",
  },
  accent: {
    badge: "border-violet-200 bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
    text: "text-violet-800",
  },
} as const;

export type StatusTone = keyof typeof STATUS_TONE_CLASSNAMES;

export interface StatusPresentation {
  readonly label: string;
  readonly tone: StatusTone;
  readonly className: string;
  readonly dotClassName: string;
  readonly textClassName: string;
}

function status(label: string, tone: StatusTone): StatusPresentation {
  const classes = STATUS_TONE_CLASSNAMES[tone];

  return {
    label,
    tone,
    className: classes.badge,
    dotClassName: classes.dot,
    textClassName: classes.text,
  };
}

export const ORDER_STATUS_PRESENTATIONS = {
  DRAFT: status("Draft", "neutral"),
  PENDING_CONFIRMATION: status("Pending confirmation", "warning"),
  ACCEPTED: status("Accepted", "info"),
  PREPARING: status("Preparing", "warning"),
  READY: status("Ready", "success"),
  SERVED: status("Served", "success"),
  PAYMENT_PENDING: status("Payment pending", "warning"),
  PAID: status("Paid", "success"),
  CLOSED: status("Closed", "neutral"),
  REJECTED: status("Rejected", "danger"),
  CANCELLED: status("Cancelled", "danger"),
  CHANGED: status("Changed by staff", "accent"),
  REMAKE: status("Remake", "accent"),
  VOIDED: status("Voided", "danger"),
} as const;

export type OperationalOrderStatus = keyof typeof ORDER_STATUS_PRESENTATIONS;

export const CUSTOMER_ORDER_STATUS_PRESENTATIONS = {
  SENT: status("Sent", "warning"),
  CONFIRMED: status("Confirmed", "info"),
  PREPARING: status("Preparing", "warning"),
  COMING_TO_TABLE: status("Coming to your table", "success"),
  SERVED: status("Served", "success"),
} as const;

export type CustomerOrderStatus =
  keyof typeof CUSTOMER_ORDER_STATUS_PRESENTATIONS;

/**
 * Exceptional internal states intentionally map to null. Their friendly
 * exceptional label should be shown instead of implying normal progress.
 */
export const CUSTOMER_STATUS_BY_ORDER_STATUS: Readonly<
  Record<OperationalOrderStatus, CustomerOrderStatus | null>
> = {
  DRAFT: null,
  PENDING_CONFIRMATION: "SENT",
  ACCEPTED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "COMING_TO_TABLE",
  SERVED: "SERVED",
  PAYMENT_PENDING: "SERVED",
  PAID: "SERVED",
  CLOSED: "SERVED",
  REJECTED: null,
  CANCELLED: null,
  CHANGED: "CONFIRMED",
  REMAKE: "PREPARING",
  VOIDED: null,
};

export const TABLE_STATUS_PRESENTATIONS = {
  AVAILABLE: status("Available", "success"),
  OCCUPIED: status("Occupied", "info"),
  WAITING: status("Waiting", "warning"),
  PREPARING: status("Preparing", "warning"),
  READY: status("Ready to serve", "success"),
  BILL_REQUESTED: status("Bill requested", "accent"),
  PAYMENT_PENDING: status("Payment pending", "warning"),
} as const;

export const KITCHEN_STATUS_PRESENTATIONS = {
  NEW: status("New", "info"),
  PREPARING: status("Preparing", "warning"),
  READY: status("Ready", "success"),
  SERVED: status("Served", "neutral"),
  PROBLEM: status("Problem", "danger"),
  REMAKE: status("Remake", "accent"),
  VOIDED: status("Voided", "danger"),
} as const;

export const SERVICE_STATUS_PRESENTATIONS = {
  OPEN: status("Open", "warning"),
  ACKNOWLEDGED: status("Acknowledged", "info"),
  RESOLVED: status("Resolved", "success"),
  CANCELLED: status("Cancelled", "neutral"),
} as const;

export const MENU_STATUS_PRESENTATIONS = {
  DRAFT: status("Draft", "neutral"),
  ACTIVE: status("Active", "success"),
  SOLD_OUT: status("Sold out", "warning"),
  HIDDEN: status("Hidden", "neutral"),
  ARCHIVED: status("Archived", "neutral"),
} as const;

export const SESSION_STATUS_PRESENTATIONS = {
  ACTIVE: status("Active", "info"),
  BILL_REQUESTED: status("Bill requested", "accent"),
  PAYMENT_PENDING: status("Payment pending", "warning"),
  CLOSED: status("Closed", "neutral"),
} as const;

export const PAYMENT_STATUS_PRESENTATIONS = {
  PENDING: status("Pending", "warning"),
  PAID: status("Paid", "success"),
  VOIDED: status("Voided", "danger"),
  FAILED: status("Failed", "danger"),
} as const;

const STATUS_PRESENTATIONS = {
  ...TABLE_STATUS_PRESENTATIONS,
  ...KITCHEN_STATUS_PRESENTATIONS,
  ...SERVICE_STATUS_PRESENTATIONS,
  ...SESSION_STATUS_PRESENTATIONS,
  ...MENU_STATUS_PRESENTATIONS,
  ...PAYMENT_STATUS_PRESENTATIONS,
  // Order semantics win for shared exceptional keys such as CANCELLED.
  ...ORDER_STATUS_PRESENTATIONS,
} as const;

export function humanizeStatus(value: string): string {
  const words = value.trim().replace(/[-_]+/g, " ").toLocaleLowerCase();

  return words ? words.charAt(0).toLocaleUpperCase() + words.slice(1) : "Unknown";
}

export function getStatusPresentation(value: string): StatusPresentation {
  const key = value
    .trim()
    .toLocaleUpperCase() as keyof typeof STATUS_PRESENTATIONS;

  return STATUS_PRESENTATIONS[key] ?? status(humanizeStatus(value), "neutral");
}

export function toCustomerOrderStatus(
  value: OperationalOrderStatus,
): CustomerOrderStatus | null {
  return CUSTOMER_STATUS_BY_ORDER_STATUS[value];
}

export function getCustomerOrderStatusPresentation(
  value: OperationalOrderStatus,
): StatusPresentation {
  const customerStatus = toCustomerOrderStatus(value);

  return customerStatus
    ? CUSTOMER_ORDER_STATUS_PRESENTATIONS[customerStatus]
    : ORDER_STATUS_PRESENTATIONS[value];
}
