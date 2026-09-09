import "server-only";

import { toManagementOperationError } from "./errors";

export function managementSuccess<T>(data: T): Response {
  return Response.json({ ok: true, data }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

export function managementFailure(error: unknown): Response {
  const mapped = toManagementOperationError(error);
  return Response.json(
    { ok: false, error: { code: mapped.code } },
    { status: mapped.code === "MANAGEMENT_FORBIDDEN" ? 403 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
