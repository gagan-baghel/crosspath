import type { Metadata } from "next";
import { requireUserId } from "@/lib/session";
import { MyPostsScreen } from "@/components/feed/my-posts-screen";
import { SuggestionsBanner } from "@/components/feed/suggestions-banner";

export const metadata: Metadata = { title: "My Posts" };

export default async function MyPostsPage() {
  const userId = await requireUserId();
  return <MyPostsScreen suggestions={<SuggestionsBanner userId={userId} />} />;
}
