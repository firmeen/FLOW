import "server-only";

import { cookies } from "next/headers";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COOKIE_VERSION = "v1";
const EMPTY_BRANCH = "none";
const WORKSPACE_SELECTION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const WORKSPACE_SELECTION_COOKIE = "flow_workspace";

export interface WorkspaceSelection {
  tenantId: string;
  branchId: string | null;
}

export function encodeWorkspaceSelection(selection: WorkspaceSelection): string {
  return `${COOKIE_VERSION}.${selection.tenantId}.${selection.branchId ?? EMPTY_BRANCH}`;
}

export function decodeWorkspaceSelection(
  value: string | null | undefined,
): WorkspaceSelection | null {
  if (!value) return null;
  const [version, tenantId, branchValue, ...rest] = value.split(".");
  if (rest.length > 0 || version !== COOKIE_VERSION || !UUID_PATTERN.test(tenantId ?? "")) {
    return null;
  }
  if (branchValue === EMPTY_BRANCH) return { tenantId, branchId: null };
  if (!UUID_PATTERN.test(branchValue ?? "")) return null;
  return { tenantId, branchId: branchValue };
}

export async function readWorkspaceSelection(): Promise<WorkspaceSelection | null> {
  const cookieStore = await cookies();
  return decodeWorkspaceSelection(cookieStore.get(WORKSPACE_SELECTION_COOKIE)?.value);
}

export async function persistWorkspaceSelection(
  selection: WorkspaceSelection,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_SELECTION_COOKIE, encodeWorkspaceSelection(selection), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WORKSPACE_SELECTION_MAX_AGE_SECONDS,
  });
}

export async function clearWorkspaceSelection(): Promise<void> {
  (await cookies()).delete(WORKSPACE_SELECTION_COOKIE);
}
