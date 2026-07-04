import { z } from "zod";
import { objectId } from "@/lib/validation";

export const RATING_TAGS = [
  { value: "HELPFUL", label: "Helpful", positive: true },
  { value: "RESPECTFUL", label: "Respectful", positive: true },
  { value: "GOOD_LISTENER", label: "Good listener", positive: true },
  { value: "COMFORTABLE", label: "Comfortable", positive: true },
  { value: "NOT_HELPFUL", label: "Not helpful", positive: false },
  { value: "INAPPROPRIATE", label: "Inappropriate", positive: false },
  { value: "SPAM", label: "Spam", positive: false },
  { value: "RUDE", label: "Rude", positive: false },
] as const;

const tagValues = RATING_TAGS.map((t) => t.value) as [string, ...string[]];

export const rateChatSchema = z.object({
  chatId: objectId,
  tags: z.array(z.enum(tagValues)).min(1, "Pick at least one tag").max(8),
  feedback: z.string().max(300, "Keep feedback under 300 characters").optional(),
});

export type RateChatInput = z.infer<typeof rateChatSchema>;
