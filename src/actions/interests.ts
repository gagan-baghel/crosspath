"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isBlockedBetween } from "@/lib/blocks";
import { isObjectId } from "@/lib/validation";
import { publishToUser } from "@/lib/ably";

type ActionResult = { success: true } | { success: false; error: string };

/** Express or withdraw interest in a post. One interest per user per post. */
export async function toggleInterest(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(postId)) return { success: false, error: "Post not found" };
  const userId = session.user.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true },
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
    await prisma.$transaction([
      prisma.interest.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { interestCount: { decrement: 1 } },
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
