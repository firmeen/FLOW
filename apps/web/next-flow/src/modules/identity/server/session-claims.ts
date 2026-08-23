import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

export function persistAuthenticatedIdentity(token: JWT, user?: User): JWT {
  if (!user?.id) return token;

  return {
    ...token,
    sub: user.id,
    email: user.email ?? token.email,
  };
}

export function exposeAuthenticatedIdentity(session: Session, token: JWT): Session {
  if (!session.user || typeof token.sub !== "string" || !token.sub) {
    return session;
  }

  session.user.id = token.sub;
  if (typeof token.email === "string") {
    session.user.email = token.email;
  }

  return session;
}
