"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAblyClient } from "@/hooks/use-ably";

/**
 * Subscribes to the signed-in user's personal channel and surfaces the
 * events other users trigger for them: someone relating to their post,
 * and an author opening a chat with them. Without Ably configured this
 * renders nothing and the server-rendered pages still show the same
 * state on next load.
 */
export function NotificationListener({ userId }: { userId: string }) {
  const client = useAblyClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client) return;
    const channel = client.channels.get(`user:${userId}`);

    const onInterest = (msg: { data?: { postId?: string } }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      const postId = msg.data?.postId;
      toast("Someone relates to your post", {
        description: "See who raised their hand — you choose who to talk to.",
        action: postId
          ? { label: "View", onClick: () => router.push(`/posts/${postId}/interested`) }
          : undefined,
      });
    };

    const onChatStarted = (msg: { data?: { chatId?: string } }) => {
      router.refresh();
      const chatId = msg.data?.chatId;
      toast("An author picked you to chat", {
        description: "You can message them directly now.",
        action: chatId
          ? { label: "Open chat", onClick: () => router.push(`/chats/${chatId}`) }
          : undefined,
      });
    };

    channel.subscribe("new-interest", onInterest);
    channel.subscribe("chat-started", onChatStarted);
    return () => {
      channel.unsubscribe("new-interest", onInterest);
      channel.unsubscribe("chat-started", onChatStarted);
    };
  }, [client, userId, router, queryClient]);

  return null;
}
