import type { FoodFlowState } from "@/domain/types";

const STORAGE_KEY = "foodflow-mvp-v1";

export const localFoodFlowRepository = {
  load(): FoodFlowState | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FoodFlowState) : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
  save(state: FoodFlowState) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  clear() {
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
