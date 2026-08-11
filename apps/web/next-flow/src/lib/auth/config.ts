export const SESSION_COOKIE_NAME = "foodflow_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;
export const INTERNAL_USER_ID = "foodflow-internal";
export const INTERNAL_SESSION_TYPE = "INTERNAL";

const DEVELOPMENT_CONFIG = {
  email: "admin@foodflow.local",
  password: "foodflow-demo",
  secret: "foodflow-development-session-secret-change-before-production",
} as const;

export interface InternalAuthConfig {
  email: string;
  password: string;
  secret: string;
}

export function getInternalAuthConfig(): InternalAuthConfig | null {
  const email = process.env.FOODFLOW_INTERNAL_EMAIL?.trim();
  const password = process.env.FOODFLOW_INTERNAL_PASSWORD;
  const secret = process.env.FOODFLOW_SESSION_SECRET;

  if (email && password && secret && secret.length >= 32) {
    return { email, password, secret };
  }

  if (process.env.NODE_ENV !== "production") {
    return DEVELOPMENT_CONFIG;
  }

  return null;
}

export function credentialsMatch(
  email: string,
  password: string,
  config: InternalAuthConfig,
): boolean {
  return safeEqual(
    `${email.trim().toLocaleLowerCase()}\u0000${password}`,
    `${config.email.toLocaleLowerCase()}\u0000${config.password}`,
  );
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}
