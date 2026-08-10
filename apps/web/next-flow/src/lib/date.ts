import {
  FOODFLOW_DISPLAY_LOCALE,
  FOODFLOW_TIME_ZONE,
  MILLISECONDS,
} from "@/lib/constants";

export type DateTimeInput = Date | number | string;

export type BangkokDateTimeFormatOptions = Omit<
  Intl.DateTimeFormatOptions,
  "timeZone"
> & {
  readonly locale?: string;
};

function asValidDate(value: DateTimeInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInBangkok(
  value: DateTimeInput,
  options: BangkokDateTimeFormatOptions,
): string {
  const date = asValidDate(value);
  if (!date) {
    return "\u2014";
  }

  const { locale = FOODFLOW_DISPLAY_LOCALE, ...dateTimeOptions } = options;

  return new Intl.DateTimeFormat(locale, {
    ...dateTimeOptions,
    timeZone: FOODFLOW_TIME_ZONE,
  }).format(date);
}

/** Formats an instant in restaurant-local Bangkok time, e.g. `12:42 PM`. */
export function formatBangkokTime(
  value: DateTimeInput,
  options: BangkokDateTimeFormatOptions = {},
): string {
  return formatInBangkok(value, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

/** Formats an instant as a concise Bangkok-local calendar date. */
export function formatBangkokDate(
  value: DateTimeInput,
  options: BangkokDateTimeFormatOptions = {},
): string {
  return formatInBangkok(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/** Formats an instant with both a Bangkok-local date and time. */
export function formatBangkokDateTime(
  value: DateTimeInput,
  options: BangkokDateTimeFormatOptions = {},
): string {
  return formatInBangkok(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...options,
  });
}

function safeDuration(durationMs: number): number {
  return Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
}

/** Formats milliseconds as an operational timer: `01:32` or `01:02:03`. */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(
    safeDuration(durationMs) / MILLISECONDS.second,
  );
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const minutePart = String(minutes).padStart(2, "0");
  const secondPart = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${minutePart}:${secondPart}`;
  }

  return `${minutePart}:${secondPart}`;
}

/** Formats milliseconds as a compact phrase such as `6m 41s` or `1h 8m`. */
export function formatCompactDuration(durationMs: number): string {
  const totalSeconds = Math.floor(
    safeDuration(durationMs) / MILLISECONDS.second,
  );
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function getElapsedMilliseconds(
  startedAt: DateTimeInput,
  endedAt: DateTimeInput = Date.now(),
): number {
  const start = asValidDate(startedAt);
  const end = asValidDate(endedAt);

  if (!start || !end) {
    return 0;
  }

  return Math.max(0, end.getTime() - start.getTime());
}

/** Formats elapsed time as the timer used by staff and kitchen cards. */
export function formatElapsed(
  startedAt: DateTimeInput,
  endedAt: DateTimeInput = Date.now(),
): string {
  return formatDuration(getElapsedMilliseconds(startedAt, endedAt));
}

/** Formats elapsed time for service queues, e.g. `40 seconds ago`. */
export function formatTimeAgo(
  startedAt: DateTimeInput,
  endedAt: DateTimeInput = Date.now(),
): string {
  const elapsedMs = getElapsedMilliseconds(startedAt, endedAt);
  const seconds = Math.floor(elapsedMs / MILLISECONDS.second);

  if (seconds < 5) {
    return "Just now";
  }
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
