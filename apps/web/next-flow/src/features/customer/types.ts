import type { CartItemSelection } from "@/domain";

export interface CustomerCartLine {
  id: string;
  menuItemId: string;
  quantity: number;
  modifiers: CartItemSelection[];
  specialRequest?: string;
}
