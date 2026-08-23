import "server-only";

import type { Session } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

import { sanitizeInternalPath } from "./redirect";

export async function getInternalSession(): Promise<Session | null> {
  return auth();
}

export async function deleteSession(): Promise<void> {
  await signOut({ redirect: false });
}

export async function requireInternalSession(nextPath = "/staff"): Promise<Session> {
  const session = await getInternalSession();
  if (!session?.user?.id) {
    redirect(`/login?next=${encodeURIComponent(sanitizeInternalPath(nextPath))}`);
  }
  return session;
}
