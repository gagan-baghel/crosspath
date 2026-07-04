import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { topicLabel } from "@/schemas/post";
import { InterestedList } from "@/components/interested/interested-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Interested" };

export default async function InterestedPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const viewerId = await requireUserId();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, content: true, topic: true, status: true },
  });
  // Author-only: anyone else gets a 404, not a permission error.
  if (!post || post.authorId !== viewerId) notFound();

  const interests = await prisma.interest.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: { userId: true, status: true, createdAt: true },
  });

  const profiles = await prisma.profile.findMany({
    where: { userId: { in: interests.map((i) => i.userId) } },
    select: {
      userId: true,
      username: true,
      avatarUrl: true,
      bio: true,
      language: true,
      positiveCount: true,
      negativeCount: true,
    },
  });
  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const items = interests
    .filter((i) => profileMap.has(i.userId))
    .map((i) => ({
      profile: profileMap.get(i.userId)!,
      chatStarted: i.status === "CHAT_STARTED",
      interestedAt: i.createdAt.toISOString(),
    }));

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-2 px-4">
          <Button variant="ghost" size="icon" asChild aria-label="Back">
            <Link href="/my-posts">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Interested</h1>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="flex flex-col gap-2 pt-4">
            <Badge variant="outline" className="w-fit rounded-full font-normal">
              {topicLabel(post.topic)}
            </Badge>
            <p className="line-clamp-3 text-sm text-muted-foreground">{post.content}</p>
          </CardContent>
        </Card>

        <InterestedList postId={postId} items={items} />
      </div>
    </>
  );
}
