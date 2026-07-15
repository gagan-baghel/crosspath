"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { startChat } from "@/actions/chats";
import type { PublicProfile } from "@/lib/public-profile";
import { TrustBadge } from "@/components/profile/trust-badge";
import { ProfilePreviewSheet } from "@/components/profile/profile-preview-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type InterestedItem = {
  profile: PublicProfile;
  /** Set once the author has started a chat with this person. */
  chatId: string | null;
  interestedAt: string;
};

export function InterestedList({
  postId,
  items,
}: {
  postId: string;
  items: InterestedItem[];
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<PublicProfile | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  async function onStartChat(partnerId: string) {
    setStartingId(partnerId);
    try {
      const result = await startChat(postId, partnerId);
      setStartingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.push(`/chats/${result.data!.chatId}`);
    } catch {
      setStartingId(null);
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium">No one yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Interest usually comes within a day. You&apos;ll see everyone who relates here — and
          you choose who to talk to.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map(({ profile, chatId, interestedAt }) => (
          <li key={profile.userId}>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="flex items-center gap-3 py-4">
                <button
                  type="button"
                  onClick={() => setPreview(profile)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <Image
                    src={profile.avatarUrl}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="shrink-0 rounded-full"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{profile.username}</span>
                      <TrustBadge
                        positiveCount={profile.positiveCount}
                        negativeCount={profile.negativeCount}
                      />
                    </div>
                    {profile.bio && (
                      <p className="truncate text-xs text-muted-foreground">{profile.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      interested{" "}
                      {formatDistanceToNowStrict(new Date(interestedAt), { addSuffix: true })}
                    </p>
                  </div>
                </button>

                {chatId ? (
                  <Button size="sm" className="shrink-0 rounded-full" asChild>
                    <Link href={`/chats/${chatId}`}>
                      <MessageCircle className="size-4" />
                      Open chat
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="shrink-0 rounded-full"
                    disabled={startingId === profile.userId}
                    onClick={() => onStartChat(profile.userId)}
                  >
                    {startingId === profile.userId ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MessageCircle className="size-4" />
                    )}
                    Start chat
                  </Button>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <ProfilePreviewSheet
        profile={preview}
        onOpenChange={(open) => !open && setPreview(null)}
        action={
          preview ? (
            (() => {
              const chatId = items.find((i) => i.profile.userId === preview.userId)?.chatId;
              return chatId ? (
                <Button className="w-full rounded-full" asChild>
                  <Link href={`/chats/${chatId}`}>
                    <MessageCircle className="size-4" />
                    Open chat
                  </Link>
                </Button>
              ) : (
                <Button
                  className="w-full rounded-full"
                  disabled={startingId === preview.userId}
                  onClick={() => onStartChat(preview.userId)}
                >
                  {startingId === preview.userId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MessageCircle className="size-4" />
                  )}
                  Start chat
                </Button>
              );
            })()
          ) : null
        }
      />
    </>
  );
}
