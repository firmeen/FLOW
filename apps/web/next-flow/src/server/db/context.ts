import "server-only";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function validateUuid(value: string, field: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new DatabaseContextError(`${field} must be a valid UUID.`);
  }

  return value;
}

export function validateActorId(actorId: string): string {
  return validateUuid(actorId, "actorId");
}

export function validateDatabaseContext(
  context: DatabaseRequestContext,
): DatabaseRequestContext {
  validateUuid(context.tenantId, "tenantId");

  if (context.branchId !== undefined) {
    validateUuid(context.branchId, "branchId");
  }

  if (context.actorId !== undefined) {
    validateActorId(context.actorId);
  }

  return context;
}
