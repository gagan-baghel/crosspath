"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { FeedPage } from "@/types/feed";

export function useInfinitePosts(params: { topic?: string; q?: string; mine?: boolean }) {
  const { topic, q, mine } = params;

  return useInfiniteQuery({
    queryKey: ["posts", { topic: topic ?? null, q: q ?? null, mine: !!mine }],
    queryFn: async ({ pageParam }): Promise<FeedPage> => {
      const search = new URLSearchParams();
      if (pageParam) search.set("cursor", pageParam);
      if (topic) search.set("topic", topic);
      if (q) search.set("q", q);
      if (mine) search.set("mine", "1");
      const res = await fetch(`/api/posts?${search.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
