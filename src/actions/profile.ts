"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/auth";
import { onboardingSchema, editProfileSchema } from "@/schemas/profile";
import { generateUsername } from "@/lib/usernames";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function completeOnboarding(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (existing?.onboarded) return { success: true };

  let { username } = parsed.data;
  // Regenerate on the rare collision instead of failing onboarding.
  let found = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.profile.findUnique({ where: { username } });
    if (!taken) {
      found = true;
      break;
    }
    username = generateUsername();
  }

  if (!found) {
    return { success: false, error: "Unable to generate a unique username. Please try again." };
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

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
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
