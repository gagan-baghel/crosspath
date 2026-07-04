"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { unblockUser } from "@/actions/safety";
import type { PublicProfile } from "@/lib/public-profile";
import { Button } from "@/components/ui/button";

export function BlockedUsers({ profiles }: { profiles: PublicProfile[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (profiles.length === 0) {
    return <p className="text-sm text-muted-foreground">You haven&apos;t blocked anyone.</p>;
  }

  async function onUnblock(userId: string) {
    setPendingId(userId);
    const result = await unblockUser(userId);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("User unblocked");
    router.refresh();
  }

  return (
    <ul className="flex flex-col gap-3">
      {profiles.map((p) => (
        <li key={p.userId} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Image
              src={p.avatarUrl}
              alt=""
              width={32}
              height={32}
              unoptimized
              className="rounded-full"
            />
            <span className="truncate text-sm font-medium">{p.username}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={pendingId === p.userId}
            onClick={() => onUnblock(p.userId)}
          >
            Unblock
          </Button>
        </li>
      ))}
    </ul>
  );
}
