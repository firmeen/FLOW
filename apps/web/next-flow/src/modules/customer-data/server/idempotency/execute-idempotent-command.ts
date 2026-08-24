import "server-only";

import type { CustomerContext } from "@/modules/customer-capability/server/types";

import type { CustomerDataTransactionScope } from "../transaction";
import { CustomerCommandError, toCustomerCommandError } from "../commands/errors";
import {
  defaultCustomerCommandDependencies,
  requireCurrentCustomerContext,
  type CustomerCommandDependencies,
} from "../commands/runtime";
import {
  createCustomerCommandFingerprint,
  digestCustomerIdempotencyKey,
  normalizeCustomerIdempotencyKey,
} from "./fingerprint";
import {
  CUSTOMER_IDEMPOTENCY_RESULT_VERSION,
  type CustomerIdempotencyCommand,
  type CustomerIdempotencyResource,
  type IdempotentCustomerCommandResult,
} from "./types";

const MAX_TRANSACTION_ATTEMPTS = 2;
const RETRYABLE_POSTGRES_CODES = new Set(["40001", "40P01"]);

function postgresCode(error: unknown, depth = 0): string | null {
  if (depth > 4 || !error || typeof error !== "object") return null;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return postgresCode(error.cause, depth + 1);
  return null;
}

function isRetryableTransactionFailure(error: unknown): boolean {
  const code = postgresCode(error);
  return code !== null && RETRYABLE_POSTGRES_CODES.has(code);
}

export interface IdempotentCustomerCommandExecutionScope {
  readonly scope: CustomerDataTransactionScope;
  readonly customerContext: CustomerContext;
}

export interface ExecuteIdempotentCustomerCommandInput<T> {
  readonly command: CustomerIdempotencyCommand;
  readonly idempotencyKey: string;
  readonly fingerprintSource: unknown;
  readonly successStatus: number;
  readonly execute: (scope: IdempotentCustomerCommandExecutionScope) => Promise<T>;
  readonly serializeResult: (result: T) => unknown;
  readonly deserializeResult: (value: unknown) => T;
  readonly resource?: (result: T) => CustomerIdempotencyResource | null;
  readonly dependencies?: CustomerCommandDependencies;
}

export async function executeIdempotentCustomerCommand<T>(
  input: ExecuteIdempotentCustomerCommandInput<T>,
): Promise<IdempotentCustomerCommandResult<T>> {
  const dependencies = input.dependencies ?? defaultCustomerCommandDependencies;
  const normalizedKey = normalizeCustomerIdempotencyKey(input.idempotencyKey);
  const keyDigest = digestCustomerIdempotencyKey(normalizedKey);
  const requestFingerprint = createCustomerCommandFingerprint(
    input.command,
    input.fingerprintSource,
  );
  const customerContext = await requireCurrentCustomerContext(dependencies);

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      return await dependencies.withCustomerDataTransaction(customerContext, async (scope) => {
        const acquisition = await scope.repositories.idempotency.acquire({
          command: input.command,
          keyDigest,
          requestFingerprint,
        });

        if (acquisition.kind === "MISMATCH") {
          throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_MISMATCH");
        }
        if (acquisition.kind === "EXPIRED") {
          throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_EXPIRED");
        }
        if (acquisition.kind === "REPLAY") {
          if (acquisition.responseVersion !== CUSTOMER_IDEMPOTENCY_RESULT_VERSION) {
            throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
          }

          let data: T;
          try {
            data = input.deserializeResult(acquisition.responseBody);
          } catch (error) {
            throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT", error);
          }

          return Object.freeze({
            data,
            replayed: true,
            statusCode: acquisition.responseStatus,
          });
        }

        const data = await input.execute({ scope, customerContext });
        let responseBody: unknown;
        try {
          responseBody = input.serializeResult(data);
        } catch (error) {
          throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT", error);
        }

        await scope.repositories.idempotency.completeSuccess({
          recordId: acquisition.recordId,
          responseStatus: input.successStatus,
          responseVersion: CUSTOMER_IDEMPOTENCY_RESULT_VERSION,
          responseBody,
          resource: input.resource?.(data) ?? null,
        });

        return Object.freeze({
          data,
          replayed: false,
          statusCode: input.successStatus,
        });
      });
    } catch (error) {
      if (attempt < MAX_TRANSACTION_ATTEMPTS && isRetryableTransactionFailure(error)) {
        continue;
      }
      throw toCustomerCommandError(error);
    }
  }

  throw new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE");
}
