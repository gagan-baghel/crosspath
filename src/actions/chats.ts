"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isBlockedBetween } from "@/lib/blocks";
import { isObjectId } from "@/lib/validation";
import { publishToChat, publishToUser } from "@/lib/ably";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * The post author picks an interested user and opens the private chat.
 * Idempotent: reuses the existing chat for the same (post, partner) pair.
 */
export async function startChat(
  postId: string,
  partnerId: string
): Promise<ActionResult<{ chatId: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(postId) || !isObjectId(partnerId)) {
    return { success: false, error: "Post not found" };
  }
  const authorId = session.user.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  // Only the post author can initiate a conversation.
  if (!post || post.authorId !== authorId) {
    return { success: false, error: "Post not found" };
  }

  const interest = await prisma.interest.findUnique({
    where: { postId_userId: { postId, userId: partnerId } },
  });
  if (!interest) {
    return { success: false, error: "This user hasn't expressed interest" };
  }

  if (await isBlockedBetween(authorId, partnerId)) {
    return { success: false, error: "You can't start a chat with this user" };
  }

  const existing = await prisma.chat.findUnique({
    where: { postId_partnerId: { postId, partnerId } },
    select: { id: true },
  });
  if (existing) return { success: true, data: { chatId: existing.id } };

  const chat = await prisma.chat.create({
    data: { postId, authorId, partnerId },
  });
  await prisma.interest.update({
    where: { id: interest.id },
    data: { status: "CHAT_STARTED" },
  });

  // Tell the chosen user an author picked them.
  await publishToUser(partnerId, "chat-started", { chatId: chat.id }).catch(() => {});

  revalidatePath("/chats");
  return { success: true, data: { chatId: chat.id } };
}

/** Either participant can end the chat; both are then asked to rate. */
export async function endChat(chatId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(chatId)) return { success: false, error: "Chat not found" };
  const userId = session.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, authorId: true, partnerId: true, status: true },
  });
  if (!chat || (chat.authorId !== userId && chat.partnerId !== userId)) {
    return { success: false, error: "Chat not found" };
  }
  if (chat.status === "ENDED") return { success: true };

  await prisma.chat.update({
    where: { id: chatId },
    data: { status: "ENDED", endedAt: new Date(), endedById: userId },
  });

  await publishToChat(chatId, "chat-ended", { endedById: userId }).catch(() => {});

  revalidatePath("/chats");
  revalidatePath(`/chats/${chatId}`);
  return { success: true };
}
