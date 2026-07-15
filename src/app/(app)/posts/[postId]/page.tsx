import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isBlockedBetween } from "@/lib/blocks";
import { PostCard } from "@/components/feed/post-card";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/types/feed";

export const metadata: Metadata = { title: "Post" };

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const viewerId = await requireUserId();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true,
      content: true,
      topics: true,
      otherTopic: true,
      createdAt: true,
      interestCount: true,
      status: true,
      interests: { where: { userId: viewerId }, select: { id: true } },
    },
  });

  if (!post || post.status !== "ACTIVE") notFound();
  if (post.authorId !== viewerId && (await isBlockedBetween(viewerId, post.authorId))) {
    notFound();
  }

  const [authorProfile, viewerChat] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: post.authorId },
      select: {
        userId: true,
        username: true,
        avatarUrl: true,
        positiveCount: true,
        negativeCount: true,
      },
    }),
    prisma.chat.findUnique({
      where: { postId_partnerId: { postId: post.id, partnerId: viewerId } },
      select: { id: true },
    }),
  ]);
  if (!authorProfile) notFound();

  const feedPost: FeedPost = {
    id: post.id,
    content: post.content,
    topics: post.topics,
    otherTopic: post.otherTopic ?? null,
    createdAt: post.createdAt.toISOString(),
    interestCount: post.interestCount,
    viewerInterested: post.interests.length > 0,
    viewerChatId: viewerChat?.id ?? null,
    isOwn: post.authorId === viewerId,
    author: authorProfile,
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-2 px-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back to feed">
            <Link href="/feed">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Post</h1>
        </div>
      </header>
      <div className="p-4">
        <PostCard post={feedPost} detail />
      </div>
    </>
  );
}
