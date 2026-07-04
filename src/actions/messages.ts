"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isBlockedBetween } from "@/lib/blocks";
import { isObjectId } from "@/lib/validation";
import { publishToChat } from "@/lib/ably";
import { sendMessageSchema } from "@/schemas/message";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeText, validateMessageBody } from "@/lib/sanitize";
import type { ChatMessage } from "@/types/chat";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

/** Per-IP rate limit: 30 messages per minute. */
const MSG_IP_LIMIT = 30;
const MSG_IP_WINDOW_MS = 60_000;

export async function sendMessage(input: unknown): Promise<ActionResult<ChatMessage>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  const senderId = session.user.id;

  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { chatId, body: rawBody } = parsed.data;

  // In-memory per-IP rate limit (defence against spam bots).
  const h = await headers();
  const ip = getClientIdentifier(h, "unknown");
  const ipLimit = rateLimit(`msg:${ip}`, MSG_IP_LIMIT, MSG_IP_WINDOW_MS);
  if (!ipLimit.allowed) {
    return {
      success: false,
      error: `You're sending messages too quickly. Try again in ${ipLimit.retryAfter}s.`,
    };
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, authorId: true, partnerId: true, status: true },
  });
  if (!chat || (chat.authorId !== senderId && chat.partnerId !== senderId)) {
    return { success: false, error: "Chat not found" };
  }
  if (chat.status === "ENDED") {
    return { success: false, error: "This chat has ended" };
  }

  const otherId = chat.authorId === senderId ? chat.partnerId : chat.authorId;
  if (await isBlockedBetween(senderId, otherId)) {
    return { success: false, error: "You can't message this user" };
  }

  // Light rate limit: at most ~1 message per second per chat.
  const oneSecondAgo = new Date(Date.now() - 1000);
  const recent = await prisma.message.count({
    where: { chatId, senderId, createdAt: { gte: oneSecondAgo } },
  });
  if (recent > 0) {
    return { success: false, error: "You're sending messages too quickly" };
  }

  // Sanitize and validate body.
  const body = sanitizeText(rawBody);
  const validationError = validateMessageBody(body);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // readAt is set to null explicitly: Prisma's MongoDB connector does not
  // match missing fields with `readAt: null` filters.
  const message = await prisma.message.create({
    data: { chatId, senderId, body, readAt: null },
  });
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      lastMessageAt: message.createdAt,
      lastMessagePreview: body.slice(0, 80),
    },
  });

  const payload: ChatMessage = {
    id: message.id,
    chatId,
    senderId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    readAt: null,
  };

  await publishToChat(chatId, "message", payload).catch(() => {});

  return { success: true, data: payload };
}

/** Marks all of the other participant's messages as read, then echoes it. */
export async function markChatRead(chatId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(chatId)) return { success: false, error: "Chat not found" };
  const readerId = session.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true, authorId: true, partnerId: true },
  });
  if (!chat || (chat.authorId !== readerId && chat.partnerId !== readerId)) {
    return { success: false, error: "Chat not found" };
  }

  const now = new Date();
  const result = await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: readerId },
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    },
    data: { readAt: now },
  });

  if (result.count > 0) {
    await publishToChat(chatId, "read", {
      readerId,
      readAt: now.toISOString(),
    }).catch(() => {});
  }

  return { success: true };
}
