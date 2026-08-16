import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import {
  getMissingRequiredModifierGroupIds,
  isMenuAvailabilityActive,
} from "@/domain";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

describe("menu business rules", () => {
  it("evaluates scheduled availability deterministically in the configured timezone", () => {
    const state = createDemoState(referenceDate);
    const weekend = state.menuAvailabilities.find(
      (rule) => rule.id === "availability-weekend",
    )!;

    expect(
      isMenuAvailabilityActive(
        weekend,
        new Date("2026-08-15T05:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      isMenuAvailabilityActive(
        weekend,
        new Date("2026-08-17T05:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("reports missing required modifier groups without rejecting a draft cart item", () => {
    const state = createDemoState(referenceDate);
    const item = state.menuItems.find(
      (candidate) => candidate.id === "menu-uji-matcha",
    )!;

    expect(
      getMissingRequiredModifierGroupIds(item, state.modifierGroups, []),
    ).toEqual(["modifier-milk"]);
    expect(
      getMissingRequiredModifierGroupIds(item, state.modifierGroups, [
        {
          modifierGroupId: "modifier-milk",
          modifierChoiceId: "choice-milk-oat",
        },
      ]),
    ).toEqual([]);
  });
});
