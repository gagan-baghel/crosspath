"use client";

import { useState } from "react";
import { PenSquare, Search, X } from "lucide-react";
import { TOPICS } from "@/schemas/post";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCreatePost } from "@/stores/create-post";
import { FeedList } from "@/components/feed/feed-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FeedScreen({ suggestions }: { suggestions?: React.ReactNode }) {
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 350);
  const openCreatePost = useCreatePost((s) => s.open);

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-3 px-4">
          <h1 className="text-lg font-semibold">Feed</h1>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="rounded-full pl-9 pr-8"
              aria-label="Search posts"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3">
          <TopicChip label="All" active={!topic} onClick={() => setTopic(undefined)} />
          {TOPICS.map((t) => (
            <TopicChip
              key={t.value}
              label={t.label}
              active={topic === t.value}
              onClick={() => setTopic(topic === t.value ? undefined : t.value)}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {suggestions}
        <FeedList
          topic={topic}
          q={q || undefined}
          emptyState={
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="font-medium">
                {q || topic ? "Nothing matches your search." : "No posts yet."}
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {q || topic
                  ? "Try a different topic or search term."
                  : "Be the first to share what's on your mind."}
              </p>
              {!q && !topic && (
                <Button onClick={openCreatePost} className="rounded-full">
                  <PenSquare className="size-4" />
                  Share something
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={openCreatePost}
        size="icon"
        aria-label="Create post"
        className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg md:hidden"
      >
        <PenSquare className="size-6" />
      </Button>
    </>
  );
}

function TopicChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
