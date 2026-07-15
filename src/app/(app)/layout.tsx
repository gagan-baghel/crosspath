import { requireProfile } from "@/lib/session";
import { Sidebar } from "@/components/shell/sidebar";
import { BottomTabBar } from "@/components/shell/bottom-tab-bar";
import { NotificationListener } from "@/components/shell/notification-listener";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="mx-auto flex w-full max-w-5xl">
      <Sidebar username={profile.username} avatarUrl={profile.avatarUrl} />
      <div className="min-h-dvh w-full min-w-0 pb-16 md:pb-0">{children}</div>
      <BottomTabBar />
      <CreatePostDialog />
      <NotificationListener userId={profile.userId} />
    </div>
  );
}
