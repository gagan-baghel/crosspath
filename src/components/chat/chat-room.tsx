"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type * as Ably from "ably";
import {
  ArrowDown,
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MoreVertical,
  OctagonX,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { endChat } from "@/actions/chats";
import { blockUser } from "@/actions/safety";
import { sendMessage, markChatRead } from "@/actions/messages";
import { useAblyClient } from "@/hooks/use-ably";
import type { ChatMessage, MessagesPage } from "@/types/chat";
import type { PublicProfile } from "@/lib/public-profile";
import { MessageBubble, DaySeparator } from "@/components/chat/message-bubble";
import { ChatComposer } from "@/components/chat/chat-composer";
import { RatingModal } from "@/components/chat/rating-modal";
import { ReportDialog } from "@/components/safety/report-dialog";
import { ProfilePreviewSheet } from "@/components/profile/profile-preview-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const NEAR_BOTTOM_PX = 120;

export function ChatRoom({
  chatId,
  postId,
  viewerId,
  other,
  ended: initialEnded,
  alreadyRated,
  initialMessages,
  initialCursor,
}: {
  chatId: string;
  postId: string;
  viewerId: string;
  other: PublicProfile;
  ended: boolean;
  alreadyRated: boolean;
  initialMessages: ChatMessage[];
  initialCursor: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [ended, setEnded] = useState(initialEnded);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rated, setRated] = useState(alreadyRated);
  const [reportOpen, setReportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [endConfirmOpen, setEndConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showNewPill, setShowNewPill] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const messagesRef = useRef<ChatMessage[]>(initialMessages);
  const client = useAblyClient(true);

  // Mirror messages into a ref so the polling loop always reads the latest.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setShowNewPill(false);
  }, []);

  // Initial scroll + mark existing messages read.
  useEffect(() => {
    scrollToBottom(false);
    markChatRead(chatId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ably: messages, read receipts, chat-ended, presence, typing.
  // No-op when realtime isn't configured — messages still persist and load
  // from the database, so the chat stays fully usable, just not live.
  useEffect(() => {
    if (!client) return;
    const channel = client.channels.get(`chat:${chatId}`);
    channelRef.current = channel;

    const onMessage = (msg: Ably.InboundMessage) => {
      const data = msg.data as ChatMessage;
      if (data.senderId === viewerId) return; // own messages render optimistically
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data]
      );
      if (isNearBottom()) {
        requestAnimationFrame(() => scrollToBottom());
      } else {
        setShowNewPill(true);
      }
      if (document.visibilityState === "visible") {
        markChatRead(chatId).catch(() => {});
      }
    };

    const onRead = (msg: Ably.InboundMessage) => {
      const { readerId, readAt } = msg.data as { readerId: string; readAt: string };
      if (readerId === viewerId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === viewerId && !m.readAt ? { ...m, readAt } : m
        )
      );
    };

    const onEnded = () => {
      setEnded(true);
      setRated((r) => {
        if (!r) setRatingOpen(true);
        return r;
      });
    };

    const syncPresence = async () => {
      try {
        const members = await channel.presence.get();
        const partner = members.find((m) => m.clientId === other.userId);
        setPartnerOnline(!!partner);
        setPartnerTyping(!!(partner?.data as { typing?: boolean } | undefined)?.typing);
      } catch {
        // presence unavailable (e.g. no Ably key in dev) — leave as offline
      }
    };

    channel.subscribe("message", onMessage);
    channel.subscribe("read", onRead);
    channel.subscribe("chat-ended", onEnded);
    channel.presence.subscribe(syncPresence);
    channel.presence.enter({ typing: false }).catch(() => {});
    syncPresence();

    return () => {
      channel.unsubscribe("message", onMessage);
      channel.unsubscribe("read", onRead);
      channel.unsubscribe("chat-ended", onEnded);
      channel.presence.unsubscribe(syncPresence);
      channel.presence.leave().catch(() => {});
    };
  }, [chatId, client, viewerId, other.userId, isNearBottom, scrollToBottom]);

  // Polling fallback — runs only when Ably isn't configured. Keeps the chat
  // near-live (new messages + read receipts within a couple of seconds)
  // without any external service. Ably, when present, supersedes this.
  useEffect(() => {
    if (client || ended) return;

    let active = true;

    const poll = async () => {
      const real = messagesRef.current.filter((m) => !m.id.startsWith("temp-"));
      const cursor = real.length ? real[real.length - 1].createdAt : "";
      try {
        const res = await fetch(
          `/api/chats/${chatId}/sync?after=${encodeURIComponent(cursor)}`
        );
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          messages: ChatMessage[];
          peerReadAt: string | null;
          ended: boolean;
        };

        // Append the peer's new messages (our own render optimistically).
        const incoming = data.messages.filter((m) => m.senderId !== viewerId);
        if (incoming.length > 0) {
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = incoming.filter((m) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
          if (isNearBottom()) requestAnimationFrame(() => scrollToBottom());
          else setShowNewPill(true);
          if (document.visibilityState === "visible") {
            markChatRead(chatId).catch(() => {});
          }
        }

        // Read receipts: mark our sent messages read up to peerReadAt.
        if (data.peerReadAt) {
          const cutoff = data.peerReadAt;
          setMessages((prev) =>
            prev.map((m) =>
              m.senderId === viewerId && !m.readAt && m.createdAt <= cutoff
                ? { ...m, readAt: cutoff }
                : m
            )
          );
        }

        if (data.ended) {
          setEnded(true);
          setRated((r) => {
            if (!r) setRatingOpen(true);
            return r;
          });
        }
      } catch {
        // transient network error — next tick retries
      }
    };

    const interval = setInterval(poll, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [client, ended, chatId, viewerId, isNearBottom, scrollToBottom]);

  // Load older messages when scrolled to the top.
  async function onScroll() {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop < 60 && cursor && !loadingOlder) {
      setLoadingOlder(true);
      const prevHeight = el.scrollHeight;
      try {
        const res = await fetch(`/api/chats/${chatId}/messages?cursor=${cursor}`);
        if (res.ok) {
          const page: MessagesPage = await res.json();
          setMessages((prev) => [...page.messages, ...prev]);
          setCursor(page.nextCursor);
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight - prevHeight;
          });
        }
      } finally {
        setLoadingOlder(false);
      }
    }
    if (isNearBottom()) setShowNewPill(false);
  }

  async function onSend(body: string) {
    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: viewerId,
      body,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, temp]);
    requestAnimationFrame(() => scrollToBottom());

    try {
      const result = await sendMessage({ chatId, body });
      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        toast.error(result.error);
        return;
      }
      const real = result.data!;
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? real : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      toast.error("Message failed to send. Please try again.");
    }
  }

  function setTyping(typing: boolean) {
    channelRef.current?.presence.update({ typing }).catch(() => {});
  }

  async function onEndChat() {
    setEndConfirmOpen(false);
    try {
      const result = await endChat(chatId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setEnded(true);
      if (!rated) setRatingOpen(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function onBlock() {
    setBlockConfirmOpen(false);
    try {
      const result = await blockUser(other.userId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${other.username} blocked`);
      setEnded(true);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  // Online/Offline presence is only meaningful with Ably. In polling mode
  // we show the topic-agnostic subtitle instead of a misleading "Offline".
  const statusLine = ended
    ? "Chat ended"
    : partnerTyping
      ? "typing…"
      : client
        ? partnerOnline
          ? "Online"
          : "Offline"
        : "Tap to view profile";

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-2 sm:px-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to chats">
          <Link href="/chats">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <div className="relative shrink-0">
            <Image
              src={other.avatarUrl}
              alt=""
              width={38}
              height={38}
              unoptimized
              className="rounded-full"
            />
            {partnerOnline && !ended && (
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{other.username}</p>
            <p
              className={cn(
                "truncate text-xs",
                partnerTyping && !ended ? "text-primary" : "text-muted-foreground"
              )}
            >
              {statusLine}
            </p>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Chat options">
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/posts/${postId}`}>
                <FileText className="size-4" />
                View post
              </Link>
            </DropdownMenuItem>
            {!ended && (
              <DropdownMenuItem onSelect={() => setEndConfirmOpen(true)}>
                <OctagonX className="size-4" />
                End chat
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setBlockConfirmOpen(true)}>
              <Ban className="size-4" />
              Block user
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setReportOpen(true)}>
              <Flag className="size-4" />
              Report user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-3 py-4 sm:px-4"
      >
        {loadingOlder && (
          <div className="flex justify-center pb-3">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium">Say hello 👋</p>
            <p className="max-w-56 text-xs text-muted-foreground">
              You&apos;re both here because of the same experience.
            </p>
          </div>
        )}
        {messages.map((message, i) => {
          const prev = messages[i - 1];
          const newDay =
            !prev ||
            new Date(prev.createdAt).toDateString() !==
              new Date(message.createdAt).toDateString();
          const grouped =
            !!prev && prev.senderId === message.senderId && !newDay;
          return (
            <div key={message.id}>
              {newDay && <DaySeparator date={message.createdAt} />}
              <MessageBubble message={message} own={message.senderId === viewerId} grouped={grouped} />
            </div>
          );
        })}
      </div>

      {/* New messages pill */}
      {showNewPill && (
        <div className="pointer-events-none relative">
          <Button
            size="sm"
            onClick={() => scrollToBottom()}
            className="pointer-events-auto absolute -top-12 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          >
            <ArrowDown className="size-4" />
            New messages
          </Button>
        </div>
      )}

      {/* Composer / ended notice */}
      {ended ? (
        <div className="shrink-0 border-t bg-muted/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
          <p className="text-sm text-muted-foreground">This chat has ended.</p>
          {!rated && (
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={() => setRatingOpen(true)}
            >
              Rate the conversation
            </Button>
          )}
        </div>
      ) : (
        <ChatComposer onSend={onSend} onTyping={setTyping} />
      )}

      {/* Dialogs */}
      <RatingModal
        chatId={chatId}
        username={other.username}
        open={ratingOpen}
        onClose={() => {
          setRatingOpen(false);
          setRated(true);
        }}
      />
      <ReportDialog
        reportedId={other.userId}
        username={other.username}
        chatId={chatId}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onBlocked={() => {
          setEnded(true);
          router.refresh();
        }}
      />
      <ProfilePreviewSheet
        profile={previewOpen ? other : null}
        onOpenChange={(open) => setPreviewOpen(open)}
      />

      <AlertDialog open={endConfirmOpen} onOpenChange={setEndConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Neither of you will be able to send more messages, and you&apos;ll both be asked
              to rate the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onEndChat}>End chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {other.username}?</AlertDialogTitle>
            <AlertDialogDescription>
              This ends the chat and you won&apos;t see each other&apos;s posts or messages
              anymore. You can unblock later from Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBlock}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
