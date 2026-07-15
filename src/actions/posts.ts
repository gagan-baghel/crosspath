"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPostSchema } from "@/schemas/post";
import { isObjectId } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeText, validatePostContent } from "@/lib/sanitize";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const DAILY_POST_LIMIT = 10;

/** Per-IP rate limit: 10 posts per hour. */
const POST_IP_LIMIT = 10;
const POST_IP_WINDOW_MS = 60 * 60 * 1000;

export async function createPost(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // In-memory per-IP rate limit (defence against spam bots creating accounts).
  const h = await headers();
  const ip = getClientIdentifier(h, "unknown");
  const ipLimit = rateLimit(`post:${ip}`, POST_IP_LIMIT, POST_IP_WINDOW_MS);
  if (!ipLimit.allowed) {
    return {
      success: false,
      error: `You're posting too quickly. Try again in ${ipLimit.retryAfter}s.`,
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.post.count({
    where: { authorId: session.user.id, createdAt: { gte: since } },
  });
  if (recentCount >= DAILY_POST_LIMIT) {
    return { success: false, error: "You've reached the daily posting limit. Try again tomorrow." };
  }

  // Sanitize content.
  const content = sanitizeText(parsed.data.content);
  const validationError = validatePostContent(content);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content,
      topics: parsed.data.topics,
    },
  });

  revalidatePath("/feed");
  revalidatePath("/my-posts");
  return { success: true, data: { id: post.id } };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(postId)) return { success: false, error: "Post not found" };

  // Author-only soft delete.
  const result = await prisma.post.updateMany({
    where: { id: postId, authorId: session.user.id },
    data: { status: "DELETED" },
  });
  if (result.count === 0) return { success: false, error: "Post not found" };

  revalidatePath("/feed");
  revalidatePath("/my-posts");
  return { success: true };
}
