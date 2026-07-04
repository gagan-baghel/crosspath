import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";
import { requireProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/shell/top-bar";
import { TrustBadge } from "@/components/profile/trust-badge";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await requireProfile();

  const [postCount, chatCount] = await Promise.all([
    prisma.post.count({ where: { authorId: profile.userId, status: "ACTIVE" } }),
    prisma.chat.count({
      where: { OR: [{ authorId: profile.userId }, { partnerId: profile.userId }] },
    }),
  ]);

  return (
    <>
      <TopBar
        title="Profile"
        action={
          <Button variant="ghost" size="icon" asChild aria-label="Settings">
            <Link href="/settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 p-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Image
              src={profile.avatarUrl}
              alt=""
              width={88}
              height={88}
              unoptimized
              className="rounded-full"
            />
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <TrustBadge
                positiveCount={profile.positiveCount}
                negativeCount={profile.negativeCount}
              />
            </div>
            {profile.bio ? (
              <p className="max-w-sm text-sm text-muted-foreground">{profile.bio}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No bio yet</p>
            )}
            <p className="text-xs text-muted-foreground">
              Speaks {profile.language} · Joined {format(profile.createdAt, "MMMM yyyy")}
            </p>
            <EditProfileSheet
              username={profile.username}
              avatarUrl={profile.avatarUrl}
              bio={profile.bio}
              language={profile.language}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold">{postCount}</p>
              <p className="text-xs text-muted-foreground">Posts shared</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-semibold">{chatCount}</p>
              <p className="text-xs text-muted-foreground">Conversations</p>
            </CardContent>
          </Card>
        </div>

        <Accordion type="single" collapsible className="rounded-2xl border px-4">
          <AccordionItem value="trust" className="border-0">
            <AccordionTrigger className="text-sm">How trust works</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              After each conversation, both people rate the interaction. Positive ratings move
              you from <strong>New</strong> to <strong>Trusted</strong> and eventually{" "}
              <strong>Highly Trusted</strong>. Exact scores stay hidden — only the label is
              visible, so one bad day never defines you.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
