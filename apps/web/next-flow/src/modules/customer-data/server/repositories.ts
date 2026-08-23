import "server-only";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";
import { CustomerCartRepository } from "./cart-repository";
import { CustomerMenuAvailabilityRepository } from "./menu-availability-repository";
import { CustomerMenuRepository } from "./menu-repository";
import { CustomerOrderRepository } from "./order-repository";
import { CustomerStorefrontRepository } from "./storefront-repository";

export interface CustomerRepositories {
  readonly storefront: CustomerStorefrontRepository;
  readonly menu: CustomerMenuRepository;
  readonly menuAvailability: CustomerMenuAvailabilityRepository;
  readonly carts: CustomerCartRepository;
  readonly orders: CustomerOrderRepository;
}

export function createCustomerRepositories(
  trx: DatabaseTransaction,
  context: CustomerDatabaseContext,
): CustomerRepositories {
  return Object.freeze({
    storefront: new CustomerStorefrontRepository(trx, context),
    menu: new CustomerMenuRepository(trx, context),
    menuAvailability: new CustomerMenuAvailabilityRepository(trx, context),
    carts: new CustomerCartRepository(trx, context),
    orders: new CustomerOrderRepository(trx, context),
  });
}
