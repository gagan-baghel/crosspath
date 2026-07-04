import { z } from "zod";
import { objectId } from "@/lib/validation";

export const sendMessageSchema = z.object({
  chatId: objectId,
  body: z.string().trim().min(1, "Message can't be empty").max(2000, "Message too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
