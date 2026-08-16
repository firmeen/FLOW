import "server-only";

const DEFAULT_POOL_MAX = 4;
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000;
const DEFAULT_IDLE_TIMEOUT_MS = 10_000;

export interface DatabaseRuntimeConfig {
  connectionString: string;
  poolMax: number;
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
}

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  field: string,
  maximum: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    throw new DatabaseConfigurationError(`${field} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new DatabaseConfigurationError(`${field} is outside the supported range.`);
  }

  return parsed;
}

export function getDatabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): DatabaseRuntimeConfig {
  const connectionString = env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError("Database runtime is not configured.");
  }

  return {
    connectionString,
    poolMax: parsePositiveInteger(env.DATABASE_POOL_MAX, DEFAULT_POOL_MAX, "DATABASE_POOL_MAX", 20),
    connectionTimeoutMillis: parsePositiveInteger(
      env.DATABASE_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS,
      "DATABASE_CONNECTION_TIMEOUT_MS",
      60_000,
    ),
    idleTimeoutMillis: parsePositiveInteger(
      env.DATABASE_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS,
      "DATABASE_IDLE_TIMEOUT_MS",
      300_000,
    ),
  };
}
