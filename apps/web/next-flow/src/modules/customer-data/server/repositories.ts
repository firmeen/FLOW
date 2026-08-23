import "server-only";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";
import { CustomerMenuRepository } from "./menu-repository";
import { CustomerStorefrontRepository } from "./storefront-repository";

export interface CustomerRepositories {
  readonly storefront: CustomerStorefrontRepository;
  readonly menu: CustomerMenuRepository;
}

export function createCustomerRepositories(
  trx: DatabaseTransaction,
  context: CustomerDatabaseContext,
): CustomerRepositories {
  return Object.freeze({
    storefront: new CustomerStorefrontRepository(trx, context),
    menu: new CustomerMenuRepository(trx, context),
  });
}
