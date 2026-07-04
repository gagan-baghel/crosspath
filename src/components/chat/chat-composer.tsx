"use client";

import { useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TYPING_IDLE_MS = 3000;
const BODY_MAX = 2000;

export function ChatComposer({
  onSend,
  onTyping,
}: {
  onSend: (body: string) => void;
  onTyping: (typing: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const typingRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    setValue(next);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      typingRef.current = false;
      onTyping(false);
    }, TYPING_IDLE_MS);
  }

  function submit() {
    const body = value.trim();
    if (!body) return;
    setValue("");
    if (idleTimer.current) clearTimeout(idleTimer.current);
    typingRef.current = false;
    onTyping(false);
    onSend(body);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends on desktop; Shift+Enter adds a newline.
    if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(min-width: 768px)").matches) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="shrink-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          maxLength={BODY_MAX}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl"
          aria-label="Message"
        />
        <Button
          size="icon"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Send message"
          className="size-10 shrink-0 rounded-full"
        >
          <SendHorizontal className="size-5" />
        </Button>
      </div>
    </div>
  );
}
