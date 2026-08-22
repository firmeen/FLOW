import "server-only";

import { scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import {
  CredentialEncodingError,
  IdentityInputError,
  UnsupportedCredentialAlgorithmError,
} from "./errors";
import { MAX_PASSWORD_INPUT_LENGTH } from "./policy";

const scrypt = promisify(nodeScrypt);
const DUMMY_ENCODING = "scrypt-v1$16384$8$1$Zmxvdy1kdW1teS1zYWx0$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

interface ParsedCredential {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  expected: Buffer;
}

function decodeBase64(value: string): Buffer {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new CredentialEncodingError();
  return Buffer.from(value, "base64");
}

function parseCredential(algorithm: string, encoded: string): ParsedCredential {
  if (algorithm !== "scrypt-v1") throw new UnsupportedCredentialAlgorithmError();
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt-v1") throw new CredentialEncodingError();

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = decodeBase64(parts[4]);
  const expected = decodeBase64(parts[5]);

  if (!Number.isInteger(n) || n < 2 || (n & (n - 1)) !== 0 || n > 2 ** 20) throw new CredentialEncodingError();
  if (!Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 16) throw new CredentialEncodingError();
  if (salt.length < 8 || salt.length > 64 || expected.length < 16 || expected.length > 64) throw new CredentialEncodingError();

  return { n, r, p, salt, expected };
}

async function verifyParsed(password: string, parsed: ParsedCredential): Promise<boolean> {
  const derived = (await scrypt(password, parsed.salt, parsed.expected.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p,
    maxmem: Math.max(32 * 1024 * 1024, 128 * parsed.n * parsed.r * 2),
  })) as Buffer;
  return derived.length === parsed.expected.length && timingSafeEqual(derived, parsed.expected);
}

export async function verifyPassword(
  password: unknown,
  algorithm: string,
  encoded: string,
): Promise<boolean> {
  if (typeof password !== "string" || password.length > MAX_PASSWORD_INPUT_LENGTH) {
    throw new IdentityInputError();
  }
  return verifyParsed(password, parseCredential(algorithm, encoded));
}

export async function performDummyPasswordVerification(password: unknown): Promise<void> {
  if (typeof password !== "string" || password.length > MAX_PASSWORD_INPUT_LENGTH) {
    throw new IdentityInputError();
  }
  await verifyParsed(password, parseCredential("scrypt-v1", DUMMY_ENCODING));
}
