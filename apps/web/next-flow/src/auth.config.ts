import type { NextAuthConfig } from "next-auth";

import { sanitizeInternalPath } from "@/lib/auth/redirect";
import {
  exposeAuthenticatedIdentity,
  persistAuthenticatedIdentity,
} from "@/modules/identity/server/session-claims";

export const INTERNAL_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: INTERNAL_SESSION_MAX_AGE_SECONDS,
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      return persistAuthenticatedIdentity(token, user);
    },
    session({ session, token }) {
      return exposeAuthenticatedIdentity(session, token);
    },
    authorized({ auth, request }) {
      if (auth?.user?.id) return true;

      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set(
        "next",
        sanitizeInternalPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
      );
      return Response.redirect(loginUrl);
    },
  },
} satisfies NextAuthConfig;
