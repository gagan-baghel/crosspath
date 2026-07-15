"use client";

import { PenSquare } from "lucide-react";
import { useCreatePost } from "@/stores/create-post";
import { FeedList } from "@/components/feed/feed-list";
import { TopBar } from "@/components/shell/top-bar";
import { Button } from "@/components/ui/button";

export function MyPostsScreen({ suggestions }: { suggestions?: React.ReactNode }) {
  const openCreatePost = useCreatePost((s) => s.open);

  return (
    <>
      <TopBar title="My Posts" />
      <div className="flex flex-col gap-4 p-4">
        {suggestions}
        <FeedList
          mine
          emptyState={
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="font-medium">You haven&apos;t shared anything yet.</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                When you share, people who relate can raise their hand — and you choose who to
                talk to.
              </p>
              <Button onClick={openCreatePost} className="rounded-full">
                <PenSquare className="size-4" />
                Share something
              </Button>
            </div>
          }
        />
      </div>
    </>
  );
}
