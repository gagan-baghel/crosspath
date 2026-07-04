import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isObjectId } from "@/lib/validation";
import type { ChatMessage, MessagesPage } from "@/types/chat";

const PAGE_SIZE = 50;

/** Paginated history, newest page first; each page is oldest→newest. */
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

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { authorId: true, partnerId: true },
  });
  // Participants only; everyone else sees a 404.
  if (!chat || (chat.authorId !== session.user.id && chat.partnerId !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cursorParam = req.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam && isObjectId(cursorParam) ? cursorParam : null;

  const rows = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

  const messages: ChatMessage[] = page
    .map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt?.toISOString() ?? null,
    }))
    .reverse();

  const body: MessagesPage = {
    messages,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
  return NextResponse.json(body);
}
