import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "./config";
import {
  createSessionToken,
  verifySession,
  type InternalSession,
} from "./token";

export async function createSession(): Promise<InternalSession> {
  const { token, session } = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(session.expiresAt),
  });

  return session;
}

export async function getInternalSession(): Promise<InternalSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function requireInternalSession(): Promise<InternalSession> {
  const session = await getInternalSession();
  if (!session) redirect("/login");
  return session;
}
