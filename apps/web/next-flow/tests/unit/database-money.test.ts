import { describe, expect, it } from "vitest";

import {
  DatabaseMoneyError,
  minorUnitsToNumber,
  toMinorUnits,
} from "@/server/db/money";

describe("database money adapters", () => {
  it("converts values with explicit scale", () => {
    expect(toMinorUnits(123.45, 2)).toBe(BigInt(12345));
    expect(minorUnitsToNumber("12345", 2)).toBe(123.45);
  });

  it("rounds representation conversion without replacing business calculation", () => {
    expect(toMinorUnits(1.005, 2)).toBe(BigInt(100));
  });

  it("supports zero", () => {
    expect(toMinorUnits(0, 2)).toBe(BigInt(0));
    expect(minorUnitsToNumber(BigInt(0), 2)).toBe(0);
  });

  it("rejects non-finite input", () => {
    expect(() => toMinorUnits(Number.POSITIVE_INFINITY, 2)).toThrow(DatabaseMoneyError);
  });

  it("rejects unsafe bigint conversion to number", () => {
    expect(() => minorUnitsToNumber(BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1), 2)).toThrow(
      DatabaseMoneyError,
    );
  });
});
