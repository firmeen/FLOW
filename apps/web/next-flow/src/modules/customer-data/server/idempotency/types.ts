import "server-only";

export const CUSTOMER_IDEMPOTENCY_RESULT_VERSION = 1 as const;
export const CUSTOMER_IDEMPOTENCY_RETENTION_HOURS = 48 as const;

export type CustomerIdempotencyCommand =
  | "CART_ADD_ITEM"
  | "CART_UPDATE_ITEM"
  | "CART_REMOVE_ITEM"
  | "ORDER_SUBMIT";

export interface CustomerIdempotencyResource {
  readonly type: "cart" | "order";
  readonly id: string;
}

export type CustomerIdempotencyAcquisition =
  | {
      readonly kind: "OWNER";
      readonly recordId: string;
    }
  | {
      readonly kind: "REPLAY";
      readonly recordId: string;
      readonly responseStatus: number;
      readonly responseVersion: number;
      readonly responseBody: unknown;
      readonly resourceType: string | null;
      readonly resourceId: string | null;
    }
  | {
      readonly kind: "MISMATCH";
      readonly recordId: string;
    }
  | {
      readonly kind: "EXPIRED";
      readonly recordId: string;
    };

export interface IdempotentCustomerCommandResult<T> {
  readonly data: T;
  readonly replayed: boolean;
  readonly statusCode: number;
}
