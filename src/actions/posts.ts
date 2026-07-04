"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createPostSchema } from "@/schemas/post";
import { isObjectId } from "@/lib/validation";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const DAILY_POST_LIMIT = 10;

export async function createPost(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.post.count({
    where: { authorId: session.user.id, createdAt: { gte: since } },
  });
  if (recentCount >= DAILY_POST_LIMIT) {
    return { success: false, error: "You've reached the daily posting limit. Try again tomorrow." };
  }

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      content: parsed.data.content,
      topic: parsed.data.topic,
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
