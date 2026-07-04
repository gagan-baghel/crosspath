import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ChatRoom } from "@/components/chat/chat-room";
import type { ChatMessage } from "@/types/chat";

export const metadata: Metadata = { title: "Chat" };

const INITIAL_MESSAGES = 50;

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const userId = await requireUserId();

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      postId: true,
      authorId: true,
      partnerId: true,
      status: true,
    },
  });
  // Participants only — everyone else gets a 404.
  if (!chat || (chat.authorId !== userId && chat.partnerId !== userId)) notFound();

  const otherId = chat.authorId === userId ? chat.partnerId : chat.authorId;

  const [otherProfile, initialRows, myRating] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: otherId },
      select: {
        userId: true,
        username: true,
        avatarUrl: true,
        bio: true,
        language: true,
        positiveCount: true,
        negativeCount: true,
      },
    }),
    prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      take: INITIAL_MESSAGES + 1,
    }),
    prisma.rating.findUnique({
      where: { chatId_raterId: { chatId, raterId: userId } },
      select: { id: true },
    }),
  ]);
  if (!otherProfile) notFound();

  const hasMore = initialRows.length > INITIAL_MESSAGES;
  const page = hasMore ? initialRows.slice(0, INITIAL_MESSAGES) : initialRows;
  const initialMessages: ChatMessage[] = page
    .map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt?.toISOString() ?? null,
    }))
    .reverse();

  return (
    <ChatRoom
      chatId={chat.id}
      postId={chat.postId}
      viewerId={userId}
      other={otherProfile}
      ended={chat.status === "ENDED"}
      alreadyRated={!!myRating}
      initialMessages={initialMessages}
      initialCursor={hasMore ? page[page.length - 1].id : null}
    />
  );
}
