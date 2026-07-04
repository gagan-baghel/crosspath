import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";
import { authConfig } from "@/auth.config";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

/** Rate limit: 5 login attempts per IP per minute. */
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 60_000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("InvalidCredentials");
        }

        // Rate-limit by IP + email to slow brute-force without penalising
        // legitimate users on shared networks.
        const h = await headers();
        const ip = getClientIdentifier(h, "unknown");
        const key = `login:${ip}:${parsed.data.email.toLowerCase()}`;
        const limit = rateLimit(key, LOGIN_LIMIT, LOGIN_WINDOW_MS);
        if (!limit.allowed) {
          throw new Error(`RateLimit:${limit.retryAfter}`);
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) {
          throw new Error("InvalidCredentials");
        }
        if (user.suspended) {
          throw new Error("AccountSuspended");
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          throw new Error("InvalidCredentials");
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
});
