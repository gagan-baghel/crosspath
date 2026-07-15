import { z } from "zod";

export const TOPICS = [
  { value: "STRESS", label: "Stress" },
  { value: "FAMILY", label: "Family" },
  { value: "RELATIONSHIPS", label: "Relationships" },
  { value: "ANXIETY", label: "Anxiety" },
  { value: "LONELINESS", label: "Loneliness" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "CAREER", label: "Career" },
  { value: "FINANCIAL", label: "Financial" },
  { value: "OTHER", label: "Other" },
] as const;

export type TopicValue = (typeof TOPICS)[number]["value"];

export const topicValues = TOPICS.map((t) => t.value) as [TopicValue, ...TopicValue[]];

export function topicLabel(value: string): string {
  return TOPICS.find((t) => t.value === value)?.label ?? value;
}

export const OTHER_TOPIC_MAX = 30;

/**
 * Labels to display for a post's topics. Unlike `topicLabel`, this swaps the
 * generic "Other" badge for the post's own `otherTopic` text when present,
 * so readers see what "Other" actually means for that post.
 */
export function displayTopicLabels(topics: string[], otherTopic?: string | null): string[] {
  return topics.map((t) => (t === "OTHER" && otherTopic ? otherTopic : topicLabel(t)));
}

/**
 * Practical technical ceiling only — the product no longer imposes a
 * creative limit on how much someone can share.
 */
export const POST_CONTENT_MAX = 10_000;

export const createPostSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(10, "Share a little more — at least 10 characters")
      .max(
        POST_CONTENT_MAX,
        `Posts are limited to ${POST_CONTENT_MAX.toLocaleString()} characters`
      ),
    topics: z
      .array(z.enum(topicValues))
      .min(1, "Pick at least one topic")
      .max(TOPICS.length)
      .transform((topics) => [...new Set(topics)]),
    otherTopic: z
      .string()
      .trim()
      .max(OTHER_TOPIC_MAX, `Keep it under ${OTHER_TOPIC_MAX} characters`)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.topics.includes("OTHER") && !data.otherTopic) {
      ctx.addIssue({
        code: "custom",
        path: ["otherTopic"],
        message: "Tell us what \"Other\" means here",
      });
    }
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
