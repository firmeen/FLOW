import "server-only";

import { createHash, randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { sql } from "kysely";

import { MAX_PASSWORD_INPUT_LENGTH } from "@/modules/identity/server/policy";
import { withAuthenticationTransaction } from "@/server/db/authentication-transaction";

import type {
  TeamInvitationAcceptanceResult,
  TeamInvitationPreview,
} from "../types";

export type TeamInvitationAcceptanceErrorCode =
  | "TEAM_INVITATION_INVALID"
  | "TEAM_INVITATION_PASSWORD_INVALID"
  | "TEAM_INVITATION_EXPIRED_OR_USED"
  | "TEAM_INVITATION_UNAVAILABLE";

export class TeamInvitationAcceptanceError extends Error {
  constructor(
    readonly code: TeamInvitationAcceptanceErrorCode,
    cause?: unknown,
  ) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "TeamInvitationAcceptanceError";
  }
}

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = Math.min(128, MAX_PASSWORD_INPUT_LENGTH);
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 32;

interface InvitationPreviewRow {
  invitation_id: string;
  tenant_id: string;
  tenant_name: string;
  email: string;
  display_name: string;
  role_name: string;
  branch_name: string | null;
  expires_at: Date | string;
  is_active: boolean;
}

interface InvitationAcceptanceRow {
  user_id: string;
  normalized_email: string;
  existing_credential: boolean;
}

function tokenDigest(tokenInput: unknown): string {
  if (typeof tokenInput !== "string") {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  const token = tokenInput.trim();
  if (!TOKEN_PATTERN.test(token)) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function normalizePassword(password: unknown): string {
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH ||
    password.trim().length < MIN_PASSWORD_LENGTH
  ) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_PASSWORD_INVALID");
  }
  return password;
}

function deriveScrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: Math.max(32 * 1024 * 1024, 128 * SCRYPT_N * SCRYPT_R * 2),
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(derivedKey);
      },
    );
  });
}

async function encodePassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await deriveScrypt(password, salt);
  return [
    "scrypt-v1",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_UNAVAILABLE");
  }
  return parsed.toISOString();
}

export async function previewTeamInvitation(tokenInput: unknown): Promise<TeamInvitationPreview> {
  const digest = tokenDigest(tokenInput);
  try {
    return await withAuthenticationTransaction(async (trx) => {
      const result = await sql<InvitationPreviewRow>`
        select * from private.lookup_team_invitation(${digest}, now())
      `.execute(trx);
      const row = result.rows[0];
      if (!row) throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
      return Object.freeze({
        invitationId: row.invitation_id,
        tenantId: row.tenant_id,
        tenantName: row.tenant_name,
        email: row.email,
        displayName: row.display_name,
        roleName: row.role_name,
        branchName: row.branch_name,
        expiresAt: iso(row.expires_at),
        active: row.is_active,
      });
    });
  } catch (error) {
    if (error instanceof TeamInvitationAcceptanceError) throw error;
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_UNAVAILABLE", error);
  }
}

export async function acceptTeamInvitation(
  tokenInput: unknown,
  passwordInput: unknown,
): Promise<TeamInvitationAcceptanceResult> {
  const digest = tokenDigest(tokenInput);
  const password = normalizePassword(passwordInput);

  try {
    const encoded = await encodePassword(password);
    return await withAuthenticationTransaction(async (trx) => {
      const result = await sql<InvitationAcceptanceRow>`
        select * from private.accept_team_invitation(${digest}, ${encoded}, now())
      `.execute(trx);
      const row = result.rows[0];
      if (!row) {
        throw new TeamInvitationAcceptanceError("TEAM_INVITATION_EXPIRED_OR_USED");
      }
      return Object.freeze({
        userId: row.user_id,
        normalizedEmail: row.normalized_email,
        existingCredential: row.existing_credential,
      });
    });
  } catch (error) {
    if (error instanceof TeamInvitationAcceptanceError) throw error;
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_UNAVAILABLE", error);
  }
}

export const TEAM_INVITATION_MIN_PASSWORD_LENGTH = MIN_PASSWORD_LENGTH;
