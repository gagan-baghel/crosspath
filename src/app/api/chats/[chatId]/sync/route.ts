import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isObjectId } from "@/lib/validation";
import type { ChatMessage } from "@/types/chat";

/**
 * Polling fallback used when Ably isn't configured. Returns everything the
 * chat room needs to stay near-live without a websocket:
 *   - messages created after the client's cursor (both participants)
 *   - peerReadAt: how far the other person has read (for read receipts)
 *   - ended: whether the chat has since ended
 *
 * Participants only — everyone else gets a 404.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { chatId } = await params;
  if (!isObjectId(chatId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const viewerId = session.user.id;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { authorId: true, partnerId: true, status: true },
  });
  if (!chat || (chat.authorId !== viewerId && chat.partnerId !== viewerId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const after = req.nextUrl.searchParams.get("after");
  const afterDate = after ? new Date(after) : null;

  const rows = await prisma.message.findMany({
    where: {
      chatId,
      ...(afterDate && !Number.isNaN(afterDate.getTime())
        ? { createdAt: { gt: afterDate } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const messages: ChatMessage[] = rows.map((m) => ({
    id: m.id,
    chatId: m.chatId,
    senderId: m.senderId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null,
  }));

  // Furthest point the peer has read among the viewer's own messages.
  const lastReadOwn = await prisma.message.findFirst({
    where: { chatId, senderId: viewerId, readAt: { not: null } },
    orderBy: { readAt: "desc" },
    select: { readAt: true },
  });

  return NextResponse.json({
    messages,
    peerReadAt: lastReadOwn?.readAt?.toISOString() ?? null,
    ended: chat.status === "ENDED",
  });
}
