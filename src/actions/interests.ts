"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isBlockedBetween } from "@/lib/blocks";
import { isObjectId } from "@/lib/validation";
import { publishToUser } from "@/lib/ably";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

type ActionResult = { success: true } | { success: false; error: string };

/** Per-IP rate limit: 20 interest toggles per minute. */
const INTEREST_LIMIT = 20;
const INTEREST_WINDOW_MS = 60_000;

/** Express or withdraw interest in a post. One interest per user per post. */
export async function toggleInterest(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(postId)) return { success: false, error: "Post not found" };
  const userId = session.user.id;

  // In-memory rate limit to prevent spam-toggling.
  const h = await headers();
  const ip = getClientIdentifier(h, "unknown");
  const limit = rateLimit(`interest:${ip}`, INTEREST_LIMIT, INTEREST_WINDOW_MS);
  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many actions. Please try again in ${limit.retryAfter}s.`,
    };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true, interestCount: true },
  });
  if (!post || post.status !== "ACTIVE") {
    return { success: false, error: "This post is no longer available" };
  }
  if (post.authorId === userId) {
    return { success: false, error: "You can't be interested in your own post" };
  }
  if (await isBlockedBetween(userId, post.authorId)) {
    return { success: false, error: "You can't interact with this post" };
  }

  const existing = await prisma.interest.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    // Withdrawing after a chat started would orphan the conversation.
    if (existing.status === "CHAT_STARTED") {
      return { success: false, error: "A chat has already started from this interest" };
    }
    // Guard against negative counts (defence in depth).
    const newCount = Math.max(0, (post.interestCount ?? 0) - 1);
    await prisma.$transaction([
      prisma.interest.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { interestCount: newCount },
      }),
    ]);
    return { success: true };
  }

  await prisma.$transaction([
    prisma.interest.create({ data: { postId, userId } }),
    prisma.post.update({
      where: { id: postId },
      data: { interestCount: { increment: 1 } },
    }),
  ]);

  // Live badge ping for the author; non-fatal if Ably is unavailable.
  await publishToUser(post.authorId, "new-interest", { postId }).catch(() => {});

  return { success: true };
}

/**
 * Reconciles the denormalized `interestCount` on a post with the actual
 * number of Interest records. Call this after bulk deletes or if you
 * suspect counter drift.
 */
export async function reconcileInterestCount(postId: string): Promise<number> {
  if (!isObjectId(postId)) return 0;
  const count = await prisma.interest.count({ where: { postId } });
  await prisma.post.update({ where: { id: postId }, data: { interestCount: count } });
  return count;
}
