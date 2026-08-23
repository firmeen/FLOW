import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import { CustomerDataError } from "../errors";
import type {
  CustomerIdempotencyAcquisition,
  CustomerIdempotencyCommand,
  CustomerIdempotencyResource,
} from "./types";

interface AcquireRow {
  record_id: string;
  acquisition: string;
  response_status: number | null;
  response_version: number | null;
  response_body: unknown;
  resource_type: string | null;
  resource_id: string | null;
}

interface CompleteRow {
  completed: boolean;
}

export class CustomerIdempotencyRepository {
  constructor(private readonly trx: DatabaseTransaction) {}

  async acquire(input: {
    readonly command: CustomerIdempotencyCommand;
    readonly keyDigest: string;
    readonly requestFingerprint: string;
  }): Promise<CustomerIdempotencyAcquisition> {
    const result = await sql<AcquireRow>`
      select
        record_id,
        acquisition,
        response_status,
        response_version,
        response_body,
        resource_type,
        resource_id
      from private.acquire_customer_command_idempotency(
        ${input.command}::text,
        ${input.keyDigest}::text,
        ${input.requestFingerprint}::text
      )
    `.execute(this.trx);
    const row = result.rows[0];
    if (!row) {
      throw new CustomerDataError("CUSTOMER_DATA_UNAVAILABLE");
    }

    switch (row.acquisition) {
      case "OWNER":
        return Object.freeze({ kind: "OWNER" as const, recordId: row.record_id });
      case "MISMATCH":
        return Object.freeze({ kind: "MISMATCH" as const, recordId: row.record_id });
      case "EXPIRED":
        return Object.freeze({ kind: "EXPIRED" as const, recordId: row.record_id });
      case "REPLAY":
        if (
          row.response_status === null ||
          row.response_version === null ||
          row.response_body === null
        ) {
          throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
        }
        return Object.freeze({
          kind: "REPLAY" as const,
          recordId: row.record_id,
          responseStatus: row.response_status,
          responseVersion: row.response_version,
          responseBody: row.response_body,
          resourceType: row.resource_type,
          resourceId: row.resource_id,
        });
      case "IN_PROGRESS":
        throw new CustomerDataError("CUSTOMER_DATA_UNAVAILABLE");
      default:
        throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }
  }

  async completeSuccess(input: {
    readonly recordId: string;
    readonly responseStatus: number;
    readonly responseVersion: number;
    readonly responseBody: unknown;
    readonly resource: CustomerIdempotencyResource | null;
  }): Promise<void> {
    let serialized: string;
    try {
      serialized = JSON.stringify(input.responseBody);
    } catch (error) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION", error);
    }
    if (!serialized) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    const result = await sql<CompleteRow>`
      select private.complete_customer_command_idempotency(
        ${input.recordId}::uuid,
        ${input.responseStatus}::integer,
        ${input.responseVersion}::integer,
        ${serialized}::jsonb,
        ${input.resource?.type ?? null}::text,
        ${input.resource?.id ?? null}::uuid
      ) as completed
    `.execute(this.trx);

    if (result.rows[0]?.completed !== true) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }
  }
}
