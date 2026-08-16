import "server-only";

export class DatabaseMoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseMoneyError";
  }
}

export function assertMinorUnitScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 0 || scale > 6) {
    throw new DatabaseMoneyError("Minor-unit scale must be an integer between 0 and 6.");
  }
}

export function toMinorUnits(amount: number, scale: number): bigint {
  assertMinorUnitScale(scale);
  if (!Number.isFinite(amount)) {
    throw new DatabaseMoneyError("Amount must be finite.");
  }

  const factor = 10 ** scale;
  const scaled = amount * factor;
  if (!Number.isSafeInteger(Math.round(scaled))) {
    throw new DatabaseMoneyError("Amount exceeds the safe JavaScript integer range.");
  }

  return BigInt(Math.round(scaled));
}

export function minorUnitsToNumber(value: bigint | string, scale: number): number {
  assertMinorUnitScale(scale);
  const minor = typeof value === "bigint" ? value : BigInt(value);
  const maximum = BigInt(Number.MAX_SAFE_INTEGER);
  const minimum = BigInt(Number.MIN_SAFE_INTEGER);
  if (minor > maximum || minor < minimum) {
    throw new DatabaseMoneyError("Minor-unit value exceeds the safe JavaScript integer range.");
  }

  return Number(minor) / 10 ** scale;
}
