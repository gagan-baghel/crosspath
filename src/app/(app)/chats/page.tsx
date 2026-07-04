import type { Metadata } from "next";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/shell/top-bar";
import { ChatList } from "@/components/chat/chat-list";

export const metadata: Metadata = { title: "Chats" };

export default async function ChatsPage() {
  const userId = await requireUserId();

  const chats = await prisma.chat.findMany({
    where: { OR: [{ authorId: userId }, { partnerId: userId }] },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true,
      authorId: true,
      partnerId: true,
      status: true,
      lastMessageAt: true,
      lastMessagePreview: true,
    },
  });

  const otherIds = [...new Set(chats.map((c) => (c.authorId === userId ? c.partnerId : c.authorId)))];
  const [profiles, unreadCounts] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: otherIds } },
      select: { userId: true, username: true, avatarUrl: true },
    }),
    prisma.message.groupBy({
      by: ["chatId"],
      where: {
        chatId: { in: chats.map((c) => c.id) },
        senderId: { not: userId },
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
      _count: { id: true },
    }),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const unreadMap = new Map(unreadCounts.map((u) => [u.chatId, u._count.id]));

  const items = chats
    .map((c) => {
      const otherId = c.authorId === userId ? c.partnerId : c.authorId;
      const other = profileMap.get(otherId);
      if (!other) return null;
      return {
        id: c.id,
        username: other.username,
        avatarUrl: other.avatarUrl,
        preview: c.lastMessagePreview,
        lastMessageAt: c.lastMessageAt.toISOString(),
        ended: c.status === "ENDED",
        unread: unreadMap.get(c.id) ?? 0,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <>
      <TopBar title="Chats" />
      <ChatList items={items} />
    </>
  );
}
