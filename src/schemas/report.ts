import { z } from "zod";
import { objectId } from "@/lib/validation";

export const REPORT_CATEGORIES = [
  { value: "HARASSMENT", label: "Harassment" },
  { value: "ABUSE", label: "Abuse" },
  { value: "SPAM", label: "Spam" },
  { value: "SEXUAL_CONTENT", label: "Sexual content" },
  { value: "THREATS", label: "Threats" },
  { value: "FAKE_ACCOUNT", label: "Fake account" },
  { value: "OTHER", label: "Other" },
] as const;

export const reportSchema = z.object({
  reportedId: objectId,
  chatId: objectId.optional(),
  postId: objectId.optional(),
  category: z.enum([
    "HARASSMENT",
    "ABUSE",
    "SPAM",
    "SEXUAL_CONTENT",
    "THREATS",
    "FAKE_ACCOUNT",
    "OTHER",
  ]),
  details: z.string().max(300, "Keep details under 300 characters").optional(),
  alsoBlock: z.boolean().default(true),
});

export type ReportInput = z.infer<typeof reportSchema>;
