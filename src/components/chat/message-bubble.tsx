"use client";

import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

export function DaySeparator({ date }: { date: string }) {
  const d = new Date(date);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "d MMMM yyyy");
  return (
    <div className="flex justify-center py-3">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function MessageBubble({
  message,
  own,
  grouped,
}: {
  message: ChatMessage;
  own: boolean;
  grouped: boolean;
}) {
  const [showTime, setShowTime] = useState(false);
  const pending = message.id.startsWith("temp-");

  return (
    <div className={cn("flex", own ? "justify-end" : "justify-start", grouped ? "mt-0.5" : "mt-2.5")}>
      <div className="flex max-w-[80%] flex-col sm:max-w-[65%]">
        <button
          type="button"
          onClick={() => setShowTime((s) => !s)}
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-[15px] leading-relaxed",
            own
              ? "self-end bg-primary text-primary-foreground"
              : "self-start bg-muted",
            own && grouped && "rounded-tr-md",
            !own && grouped && "rounded-tl-md",
            pending && "opacity-70"
          )}
        >
          {message.body}
        </button>
        <span
          className={cn(
            "flex items-center gap-1 px-1 pt-0.5 text-[10px] text-muted-foreground",
            own ? "self-end" : "self-start",
            !showTime && !own && "hidden",
            !showTime && own && "[&>span]:hidden"
          )}
        >
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          {own &&
            (pending ? (
              <Check className="size-3 opacity-50" />
            ) : message.readAt ? (
              <CheckCheck className="size-3 text-sky-500" />
            ) : (
              <Check className="size-3" />
            ))}
        </span>
      </div>
    </div>
  );
}
