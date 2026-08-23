import type { Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "./config";
import { createSessionToken, type InternalSession } from "./token";

/**
 * @deprecated Source-level rollback helper only. Live R03 authentication must
 * not call this legacy session issuer. R06 owns physical removal.
 */
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

export async function getInternalSession(): Promise<Session | null> {
  return auth();
}

export async function deleteSession(): Promise<void> {
  await signOut({ redirect: false });
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function requireInternalSession(): Promise<Session> {
  const session = await getInternalSession();
  if (!session?.user?.id) redirect("/login");
  return session;
}
