import type { PublicProfile } from "@/lib/public-profile";

export type FeedPost = {
  id: string;
  content: string;
  topics: string[];
  otherTopic: string | null;
  createdAt: string;
  interestCount: number;
  viewerInterested: boolean;
  /** Chat opened from the viewer's interest in this post, if any. */
  viewerChatId: string | null;
  isOwn: boolean;
  author: Pick<
    PublicProfile,
    "userId" | "username" | "avatarUrl" | "positiveCount" | "negativeCount"
  >;
};

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
};
