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

type DatabaseEnvironment = Pick<
  NodeJS.ProcessEnv,
  | "DATABASE_URL"
  | "DATABASE_POOL_MAX"
  | "DATABASE_CONNECTION_TIMEOUT_MS"
  | "DATABASE_IDLE_TIMEOUT_MS"
>;

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

function readDatabaseEnvironment(): Partial<DatabaseEnvironment> {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
    DATABASE_CONNECTION_TIMEOUT_MS: process.env.DATABASE_CONNECTION_TIMEOUT_MS,
    DATABASE_IDLE_TIMEOUT_MS: process.env.DATABASE_IDLE_TIMEOUT_MS,
  };
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
  env?: Partial<DatabaseEnvironment>,
): DatabaseRuntimeConfig {
  const resolvedEnv = env ?? readDatabaseEnvironment();
  const connectionString = resolvedEnv.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError("Database runtime is not configured.");
  }

  return {
    connectionString,
    poolMax: parsePositiveInteger(
      resolvedEnv.DATABASE_POOL_MAX,
      DEFAULT_POOL_MAX,
      "DATABASE_POOL_MAX",
      20,
    ),
    connectionTimeoutMillis: parsePositiveInteger(
      resolvedEnv.DATABASE_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS,
      "DATABASE_CONNECTION_TIMEOUT_MS",
      60_000,
    ),
    idleTimeoutMillis: parsePositiveInteger(
      resolvedEnv.DATABASE_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS,
      "DATABASE_IDLE_TIMEOUT_MS",
      300_000,
    ),
  };
}
