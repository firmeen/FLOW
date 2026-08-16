import "server-only";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface DatabaseRequestContext {
  tenantId: string;
  branchId?: string;
  actorId?: string;
}

export class DatabaseContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseContextError";
  }
}

function assertUuid(value: string, field: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new DatabaseContextError(`${field} must be a valid UUID.`);
  }
}

export function validateDatabaseContext(
  context: DatabaseRequestContext,
): DatabaseRequestContext {
  assertUuid(context.tenantId, "tenantId");

  if (context.branchId !== undefined) {
    assertUuid(context.branchId, "branchId");
  }

  if (context.actorId !== undefined) {
    assertUuid(context.actorId, "actorId");
  }

  return context;
}
