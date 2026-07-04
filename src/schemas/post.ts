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

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10, "Share a little more — at least 10 characters")
    .max(1000, "Posts are limited to 1000 characters"),
  topic: z.enum(topicValues),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
