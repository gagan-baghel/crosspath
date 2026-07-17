"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageCircle, Users } from "lucide-react";
import { OwnPostMenu } from "@/components/feed/own-post-menu";
import type { FeedPost } from "@/types/feed";
import { displayTopicLabels } from "@/schemas/post";
import { TrustBadge } from "@/components/profile/trust-badge";
import { InterestedButton } from "@/components/feed/interested-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CLAMP_THRESHOLD = 320;

export function PostCard({ post, detail = false }: { post: FeedPost; detail?: boolean }) {
  const [expanded, setExpanded] = useState(detail);
  const clampable = !detail && post.content.length > CLAMP_THRESHOLD;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2.5">
          <Image
            src={post.author.avatarUrl}
            alt=""
            width={38}
            height={38}
            unoptimized
            className="rounded-full"
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{post.author.username}</span>
              <TrustBadge
                positiveCount={post.author.positiveCount}
                negativeCount={post.author.negativeCount}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="ml-auto flex shrink-0 max-w-[45%] flex-wrap justify-end gap-1">
            {displayTopicLabels(post.topics, post.otherTopic).map((label) => (
              <Badge key={label} variant="outline" className="rounded-full font-normal">
                {label}
              </Badge>
            ))}
          </div>
          {post.isOwn && <OwnPostMenu postId={post.id} />}
        </div>

        <Link href={`/posts/${post.id}`} className="group">
          <p
            className={cn(
              "whitespace-pre-wrap break-words text-[15px] leading-relaxed",
              clampable && !expanded && "line-clamp-6"
            )}
          >
            {post.content}
          </p>
        </Link>
        {clampable && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="self-start text-sm font-medium text-primary hover:underline"
          >
            Read more
          </button>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          {post.isOwn ? (
            <Button
              variant={post.interestCount > 0 ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href={`/posts/${post.id}/interested`}>
                <Users className="size-4" />
                View interested ({post.interestCount})
              </Link>
            </Button>
          ) : post.viewerChatId ? (
            <Button size="sm" className="rounded-full" asChild>
              <Link href={`/chats/${post.viewerChatId}`}>
                <MessageCircle className="size-4" />
                Open chat
              </Link>
            </Button>
          ) : (
            <InterestedButton
              postId={post.id}
              initialInterested={post.viewerInterested}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {post.interestCount === 1
              ? "1 person relates"
              : `${post.interestCount} people relate`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
