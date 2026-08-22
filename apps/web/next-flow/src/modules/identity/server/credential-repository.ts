import "server-only";

import { sql } from "kysely";

import { withAuthenticationTransaction } from "@/server/db/authentication-transaction";

import { AuthenticationDatabaseError } from "./errors";
import { normalizeLoginEmail } from "./email";
import type { CredentialCandidate } from "./types";

interface CredentialRow {
  user_id: string;
  normalized_email: string;
  password_hash: string;
  algorithm: string;
  password_changed_at: Date;
}

export async function findActiveCredentialCandidateByEmail(
  email: unknown,
): Promise<CredentialCandidate | null> {
  const normalizedEmail = normalizeLoginEmail(email);
  try {
    return await withAuthenticationTransaction(async (trx) => {
      const result = await sql<CredentialRow>`
        select * from private.lookup_login_credential(${normalizedEmail})
      `.execute(trx);
      const row = result.rows[0];
      if (!row) return null;
      if (row.algorithm !== "scrypt-v1") return null;
      return {
        userId: row.user_id,
        normalizedEmail: row.normalized_email,
        passwordHash: row.password_hash,
        algorithm: "scrypt-v1",
        passwordChangedAt: new Date(row.password_changed_at),
      };
    });
  } catch (error) {
    throw new AuthenticationDatabaseError(error);
  }
}
