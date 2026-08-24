import "server-only";

import type {
  CustomerCartAggregate,
  CustomerSubmittedOrder,
} from "../persistence-types";

export interface AddCartItemCommandInput {
  readonly cartId: string;
  readonly menuItemId: string;
  readonly quantity: number;
  readonly modifierChoiceIds?: readonly string[];
  readonly specialRequest?: string | null;
}

export interface UpdateCartItemCommandInput {
  readonly cartId: string;
  readonly cartItemId: string;
  readonly quantity: number;
}

export interface RemoveCartItemCommandInput {
  readonly cartId: string;
  readonly cartItemId: string;
}

export interface SubmitOrderCommandInput {
  readonly cartId: string;
  readonly customerNote?: string | null;
}

export type CreateCartCommandResult = CustomerCartAggregate;
export type AddCartItemCommandResult = CustomerCartAggregate;
export type UpdateCartItemCommandResult = CustomerCartAggregate;
export type RemoveCartItemCommandResult = CustomerCartAggregate;
export type SubmitOrderCommandResult = CustomerSubmittedOrder;
