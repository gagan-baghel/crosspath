"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { onboardingSchema, editProfileSchema, usernameSchema } from "@/schemas/profile";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/** Case-insensitive lookup: is this username taken by someone other than `userId`? */
async function usernameTaken(username: string, userId: string): Promise<boolean> {
  const existing = await prisma.profile.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { userId: true },
  });
  return existing !== null && existing.userId !== userId;
}

/** Per-IP rate limit for availability checks: 30 per minute. */
const USERNAME_CHECK_LIMIT = 30;
const USERNAME_CHECK_WINDOW_MS = 60_000;

/** Live availability check used while the user types their username. */
export async function checkUsernameAvailable(
  input: unknown
): Promise<{ available: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { available: false, error: "Not authenticated" };

  const h = await headers();
  const ip = getClientIdentifier(h, "unknown");
  if (!rateLimit(`username-check:${ip}`, USERNAME_CHECK_LIMIT, USERNAME_CHECK_WINDOW_MS).allowed) {
    return { available: false, error: "Too many checks. Slow down a little." };
  }

  const parsed = usernameSchema.safeParse(input);
  if (!parsed.success) {
    return { available: false, error: parsed.error.issues[0]?.message ?? "Invalid username" };
  }

  const taken = await usernameTaken(parsed.data, session.user.id);
  return taken ? { available: false, error: "That username is already taken" } : { available: true };
}

export async function completeOnboarding(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (existing?.onboarded) return { success: true };

  const { username } = parsed.data;
  // The user chose this name, so a collision is their call to fix — no silent regeneration.
  if (await usernameTaken(username, session.user.id)) {
    return { success: false, error: "That username is already taken. Try another one." };
  }

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      username,
      avatarUrl: parsed.data.avatarUrl,
      bio: parsed.data.bio,
      language: parsed.data.language,
      onboarded: true,
    },
    update: {
      username,
      avatarUrl: parsed.data.avatarUrl,
      bio: parsed.data.bio,
      language: parsed.data.language,
      onboarded: true,
    },
  });

  return { success: true };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = editProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (await usernameTaken(parsed.data.username, session.user.id)) {
    return { success: false, error: "That username is already taken. Try another one." };
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      username: parsed.data.username,
      avatarUrl: parsed.data.avatarUrl,
      bio: parsed.data.bio,
      language: parsed.data.language,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Deletes the account and all owned data. Prisma emulates the
 * onDelete: Cascade rules, removing the profile, posts, interests,
 * chats, messages, ratings, blocks, and reports tied to this user.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });
  return { success: true };
}
