"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";
import { MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ChatListItem = {
  id: string;
  username: string;
  avatarUrl: string;
  preview: string;
  lastMessageAt: string;
  ended: boolean;
  unread: number;
};

export function ChatList({ items }: { items: ChatListItem[] }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((c) =>
    c.username.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <MessageCircle className="size-8 text-muted-foreground" />
        <p className="font-medium">No conversations yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Chats begin when you pick someone from your post&apos;s interested list — or when an
          author picks you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="rounded-full pl-9"
            aria-label="Search chats"
          />
        </div>
      </div>

      <ul className="divide-y">
        {filtered.map((chat) => (
          <li key={chat.id}>
            <Link
              href={`/chats/${chat.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <Image
                src={chat.avatarUrl}
                alt=""
                width={48}
                height={48}
                unoptimized
                className={cn("shrink-0 rounded-full", chat.ended && "opacity-60")}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      chat.ended && "text-muted-foreground"
                    )}
                  >
                    {chat.username}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(chat.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.preview || "Say hello 👋"}
                  </p>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {chat.ended && (
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        Ended
                      </Badge>
                    )}
                    {chat.unread > 0 && !chat.ended && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {chat.unread > 9 ? "9+" : chat.unread}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            No chats match &ldquo;{search}&rdquo;
          </li>
        )}
      </ul>
    </div>
  );
}
