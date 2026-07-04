"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rateChat } from "@/actions/ratings";
import { RATING_TAGS } from "@/schemas/rating";
import { Button } from "@/components/ui/button";
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

export function RatingModal({
  chatId,
  username,
  open,
  onClose,
}: {
  chatId: string;
  username: string;
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function onSubmit() {
    setSubmitting(true);
    const result = await rateChat({ chatId, tags: selected, feedback: feedback || undefined });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Thanks for the feedback");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How was this conversation?</DialogTitle>
          <DialogDescription>
            Your feedback about {username} shapes their trust label. It stays anonymous.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {RATING_TAGS.map((tag) => {
            const active = selected.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active && tag.positive &&
                    "border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                  active && !tag.positive &&
                    "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
                  !active && "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <Textarea
          value={feedback}
          maxLength={300}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Anything else? (optional)"
          rows={2}
        />

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={onSubmit} disabled={selected.length === 0 || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
