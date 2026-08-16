import "server-only";

import type { Transaction } from "kysely";

import type { Database } from "./generated/database";

export type DatabaseTransaction = Transaction<Database>;
export type { Database } from "./generated/database";
export type { DatabaseRequestContext } from "./context";
