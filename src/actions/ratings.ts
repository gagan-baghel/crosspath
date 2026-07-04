"use server";

import { RatingTag } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { rateChatSchema } from "@/schemas/rating";
import { isPositiveRating } from "@/lib/trust";

type ActionResult = { success: true } | { success: false; error: string };

/**
 * One rating per user per chat, only for ended chats. Updates the rated
 * user's hidden trust counters; only the label is ever shown.
 */
export async function rateChat(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  const raterId = session.user.id;

  const parsed = rateChatSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { chatId, feedback } = parsed.data;
  const tags = parsed.data.tags as RatingTag[];

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, authorId: true, partnerId: true, status: true },
  });
  if (!chat || (chat.authorId !== raterId && chat.partnerId !== raterId)) {
    return { success: false, error: "Chat not found" };
  }
  if (chat.status !== "ENDED") {
    return { success: false, error: "You can rate once the chat has ended" };
  }

  const ratedId = chat.authorId === raterId ? chat.partnerId : chat.authorId;

  const existing = await prisma.rating.findUnique({
    where: { chatId_raterId: { chatId, raterId } },
  });
  if (existing) return { success: false, error: "You've already rated this conversation" };

  await prisma.rating.create({
    data: { chatId, raterId, ratedId, tags, feedback },
  });

  const positive = isPositiveRating(tags);
  await prisma.profile.update({
    where: { userId: ratedId },
    data: positive
      ? { positiveCount: { increment: 1 } }
      : { negativeCount: { increment: 1 } },
  });

  return { success: true };
}
