import { SignJWT, jwtVerify, type JWTPayload } from "jose";

import {
  getInternalAuthConfig,
  INTERNAL_SESSION_TYPE,
  INTERNAL_USER_ID,
  SESSION_DURATION_SECONDS,
} from "./config";

const SESSION_ISSUER = "foodflow";
const SESSION_AUDIENCE = "foodflow-internal";

export interface InternalSession extends JWTPayload {
  userId: typeof INTERNAL_USER_ID;
  type: typeof INTERNAL_SESSION_TYPE;
  expiresAt: number;
}

export class AuthConfigurationError extends Error {
  constructor() {
    super("FoodFlow internal authentication is not configured.");
    this.name = "AuthConfigurationError";
  }
}

export async function createSessionToken(): Promise<{
  token: string;
  session: InternalSession;
}> {
  const config = getInternalAuthConfig();
  if (!config) throw new AuthConfigurationError();

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const session: InternalSession = {
    userId: INTERNAL_USER_ID,
    type: INTERNAL_SESSION_TYPE,
    expiresAt,
  };
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(new TextEncoder().encode(config.secret));

  return { token, session };
}

export async function verifySession(
  token: string | null | undefined,
): Promise<InternalSession | null> {
  if (!token) return null;

  const config = getInternalAuthConfig();
  if (!config) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.secret), {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });

    if (
      payload.userId !== INTERNAL_USER_ID ||
      payload.type !== INTERNAL_SESSION_TYPE ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      userId: INTERNAL_USER_ID,
      type: INTERNAL_SESSION_TYPE,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}
