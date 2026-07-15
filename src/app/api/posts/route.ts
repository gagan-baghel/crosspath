import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blockedUserIds } from "@/lib/blocks";
import { topicValues, type TopicValue } from "@/schemas/post";
import { escapeRegex, isObjectId, SEARCH_MAX_LEN } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import type { FeedPage, FeedPost } from "@/types/feed";

const PAGE_SIZE = 20;

/** Per-IP rate limit: 120 feed requests per minute. */
const FEED_IP_LIMIT = 120;
const FEED_IP_WINDOW_MS = 60_000;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const viewerId = session.user.id;

  // Rate-limit feed fetches.
  const ip = getClientIdentifier(req.headers, "unknown");
  const limit = rateLimit(`feed:${ip}`, FEED_IP_LIMIT, FEED_IP_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry after ${limit.retryAfter}s.` },
      { status: 429 }
    );
  }

  const { searchParams } = req.nextUrl;
  // Ignore a malformed cursor instead of letting Prisma throw a 500.
  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam && isObjectId(cursorParam) ? cursorParam : null;
  const topic = searchParams.get("topic");
  // Cap length and escape regex metacharacters: Prisma's Mongo `contains`
  // compiles the value as a regex, so raw input allows injection / ReDoS.
  const rawQ = searchParams.get("q")?.trim().slice(0, SEARCH_MAX_LEN);
  const q = rawQ ? escapeRegex(rawQ) : undefined;
  const mine = searchParams.get("mine") === "1";

  const excluded = await blockedUserIds(viewerId);

  const posts = await prisma.post.findMany({
    where: {
      status: "ACTIVE",
      ...(mine
        ? { authorId: viewerId }
        : excluded.length > 0
          ? { authorId: { notIn: excluded } }
          : {}),
      ...(topic && topicValues.includes(topic as TopicValue)
        ? { topics: { has: topic as TopicValue } }
        : {}),
      ...(q ? { content: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      authorId: true,
      content: true,
      topics: true,
      otherTopic: true,
      createdAt: true,
      interestCount: true,
      interests: {
        where: { userId: viewerId },
        select: { id: true },
      },
    },
  });

  const hasMore = posts.length > PAGE_SIZE;
  const page = hasMore ? posts.slice(0, PAGE_SIZE) : posts;

  // Author profiles fetched separately with the public-only selection.
  const authorIds = [...new Set(page.map((p) => p.authorId))];
  const [profiles, viewerChats] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: authorIds } },
      select: {
        userId: true,
        username: true,
        avatarUrl: true,
        positiveCount: true,
        negativeCount: true,
      },
    }),
    // Chats where the viewer was picked by an author on these posts, so the
    // card can link straight to the conversation.
    prisma.chat.findMany({
      where: { postId: { in: page.map((p) => p.id) }, partnerId: viewerId },
      select: { id: true, postId: true },
    }),
  ]);
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const chatMap = new Map(viewerChats.map((c) => [c.postId, c.id]));

  const feedPosts: FeedPost[] = page
    .filter((p) => profileMap.has(p.authorId))
    .map((p) => ({
      id: p.id,
      content: p.content,
      topics: p.topics,
      otherTopic: p.otherTopic ?? null,
      createdAt: p.createdAt.toISOString(),
      interestCount: p.interestCount,
      viewerInterested: p.interests.length > 0,
      viewerChatId: chatMap.get(p.id) ?? null,
      isOwn: p.authorId === viewerId,
      author: profileMap.get(p.authorId)!,
    }));

  const body: FeedPage = {
    posts: feedPosts,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
  return NextResponse.json(body);
}
