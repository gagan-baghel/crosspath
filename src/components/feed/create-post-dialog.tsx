"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/actions/posts";
import { OTHER_TOPIC_MAX, POST_CONTENT_MAX, TOPICS, type TopicValue } from "@/schemas/post";
import { useCreatePost } from "@/stores/create-post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CONTENT_MIN = 10;

export function CreatePostDialog() {
  const { isOpen, close } = useCreatePost();
  const queryClient = useQueryClient();
  const [topics, setTopics] = useState<TopicValue[]>([]);
  const [otherTopic, setOtherTopic] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasOther = topics.includes("OTHER");
  const valid =
    topics.length > 0 &&
    content.trim().length >= CONTENT_MIN &&
    (!hasOther || otherTopic.trim().length > 0);

  function toggleTopic(value: TopicValue) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
    if (value === "OTHER") setOtherTopic("");
  }

  async function onSubmit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      const result = await createPost({
        content,
        topics,
        otherTopic: hasOther ? otherTopic.trim() : undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      toast.success("Shared with the community");
      setSubmitting(false);
      setContent("");
      setTopics([]);
      setOtherTopic("");
      close();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex h-dvh max-w-full flex-col gap-4 rounded-none p-4 sm:h-auto sm:max-w-lg sm:rounded-2xl sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle>Share what&apos;s on your mind</DialogTitle>
          <DialogDescription>Be honest. You&apos;re anonymous.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const selected = topics.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTopic(t.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {hasOther && (
          <div className="flex flex-col gap-1.5">
            <Input
              value={otherTopic}
              maxLength={OTHER_TOPIC_MAX}
              onChange={(e) => setOtherTopic(e.target.value)}
              placeholder="What's the topic? (e.g. Health, Grief)"
              autoFocus
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1.5 sm:flex-none">
          <Textarea
            value={content}
            maxLength={POST_CONTENT_MAX}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you going through?"
            className="min-h-40 flex-1 resize-none text-[15px] sm:flex-none"
            autoFocus
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{topics.length === 0 ? "Pick one or more topics above" : ""}</span>
            {/* Only surface the technical ceiling once it's within reach. */}
            {content.length >= POST_CONTENT_MAX - 500 && (
              <span>
                {content.length.toLocaleString()}/{POST_CONTENT_MAX.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit} disabled={!valid || submitting} className="w-full sm:w-auto">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
