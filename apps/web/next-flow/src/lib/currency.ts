import {
  FOODFLOW_CURRENCY,
  FOODFLOW_CURRENCY_LOCALE,
} from "@/lib/constants";

export interface THBFormatOptions {
  /** Defaults to the Thai English locale so the baht symbol is used. */
  readonly locale?: string;
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly signDisplay?: Intl.NumberFormatOptions["signDisplay"];
}

/** Formats a numeric amount as Thai baht, for example `THB 169`. */
export function formatTHB(
  amount: number,
  options: THBFormatOptions = {},
): string {
  if (!Number.isFinite(amount)) {
    return "\u2014";
  }

  const {
    locale = FOODFLOW_CURRENCY_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = Number.isInteger(amount) ? 0 : 2,
    signDisplay = "auto",
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: FOODFLOW_CURRENCY,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
  }).format(amount);
}

/** Formats a signed adjustment with an explicit plus or minus sign. */
export function formatTHBAdjustment(amount: number): string {
  return formatTHB(amount, { signDisplay: "always" });
}
