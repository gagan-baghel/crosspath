"use client";

import Image from "next/image";
import type { PublicProfile } from "@/lib/public-profile";
import { TrustBadge } from "@/components/profile/trust-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The only view other users ever get of someone: username, avatar,
 * trust label, bio, language. Never email or any real identity.
 */
export function ProfilePreviewSheet({
  profile,
  onOpenChange,
  action,
}: {
  profile: PublicProfile | null;
  onOpenChange: (open: boolean) => void;
  action?: React.ReactNode;
}) {
  return (
    <Sheet open={!!profile} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
        {profile && (
          <>
            <SheetHeader className="items-center text-center">
              <Image
                src={profile.avatarUrl}
                alt=""
                width={72}
                height={72}
                unoptimized
                className="rounded-full"
              />
              <SheetTitle className="flex items-center gap-2">
                {profile.username}
                <TrustBadge
                  positiveCount={profile.positiveCount}
                  negativeCount={profile.negativeCount}
                />
              </SheetTitle>
              <SheetDescription className="text-center">
                {profile.bio || "No bio yet"}
              </SheetDescription>
              <p className="text-xs text-muted-foreground">Speaks {profile.language}</p>
            </SheetHeader>
            {action && <div className="px-4 pb-4">{action}</div>}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
