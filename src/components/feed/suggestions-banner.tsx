import Link from "next/link";
import { ChevronRight, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

/**
 * The "Suggestions" surface: people who related to your posts and are
 * waiting for you to start a chat. Server component — renders nothing
 * when there's nobody waiting.
 */
export async function SuggestionsBanner({ userId }: { userId: string }) {
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      status: "ACTIVE",
      interests: { some: { status: "PENDING" } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      interests: { where: { status: "PENDING" }, select: { id: true } },
    },
  });

  if (posts.length === 0) return null;
  const totalWaiting = posts.reduce((sum, p) => sum + p.interests.length, 0);

  return (
    <Card className="rounded-2xl border-primary/30 bg-primary/5 shadow-sm">
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">
            Suggestions — {totalWaiting === 1 ? "1 person wants" : `${totalWaiting} people want`} to
            connect with you
          </h2>
        </div>
        <ul className="flex flex-col gap-1">
          {posts.slice(0, 3).map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}/interested`}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10"
              >
                <span className="line-clamp-1 flex-1 text-muted-foreground">
                  &ldquo;{post.content}&rdquo;
                </span>
                <span className="shrink-0 font-medium text-primary">
                  {post.interests.length} waiting
                </span>
                <ChevronRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
