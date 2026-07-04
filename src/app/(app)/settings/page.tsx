import type { Metadata } from "next";
import { requireProfile, requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { publicProfileSelect } from "@/lib/public-profile";
import { TopBar } from "@/components/shell/top-bar";
import { ThemeSetting } from "@/components/settings/theme-setting";
import { LanguageSetting } from "@/components/settings/language-setting";
import { BlockedUsers } from "@/components/settings/blocked-users";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { AccountActions } from "@/components/settings/account-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await requireProfile();
  const userId = await requireUserId();

  const [user, blocks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.block.findMany({
      where: { blockerId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const blockedProfiles = await prisma.profile.findMany({
    where: { userId: { in: blocks.map((b) => b.blockedId) } },
    select: publicProfileSelect,
  });

  return (
    <>
      <TopBar title="Settings" />
      <div className="flex flex-col gap-4 p-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSetting />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageSetting
              language={profile.language}
              avatarUrl={profile.avatarUrl}
              bio={profile.bio}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Privacy &amp; Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockedUsers profiles={blockedProfiles} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Only you can see this. Others only ever see {profile.username}.
              </p>
            </div>
            <ChangePasswordDialog />
            <AccountActions />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
