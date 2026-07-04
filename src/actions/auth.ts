"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema, changePasswordSchema } from "@/schemas/auth";
import { auth } from "@/auth";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

type ActionResult = { success: true } | { success: false; error: string };

/** Rate limit: 3 signups per IP per 15 minutes. */
const SIGNUP_LIMIT = 3;
const SIGNUP_WINDOW_MS = 15 * 60_000;

export async function signup(input: unknown): Promise<ActionResult> {
  const h = await headers();
  const ip = getClientIdentifier(h, "unknown");
  const limit = rateLimit(`signup:${ip}`, SIGNUP_LIMIT, SIGNUP_WINDOW_MS);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many sign-up attempts. Please try again in ${limit.retryAfter}s.`,
    };
  }

  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague to avoid confirming which emails are registered.
    return { success: false, error: "Unable to create account with this email" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({ data: { email, passwordHash } });

  return { success: true };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "Not authenticated" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
