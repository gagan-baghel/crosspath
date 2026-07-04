import type { PublicProfile } from "@/lib/public-profile";

export type FeedPost = {
  id: string;
  content: string;
  topic: string;
  createdAt: string;
  interestCount: number;
  viewerInterested: boolean;
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
