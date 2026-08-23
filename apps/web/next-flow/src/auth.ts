import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { authenticateInternalUser } from "@/modules/identity/server/authenticate-internal-user";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "FLOW internal credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await authenticateInternalUser(
          credentials?.email,
          credentials?.password,
        );

        if (result.status === "authenticated") {
          return {
            id: result.user.id,
            email: result.user.email,
          };
        }

        if (result.status === "unavailable") {
          throw new Error("Internal authentication is temporarily unavailable");
        }

        return null;
      },
    }),
  ],
});
