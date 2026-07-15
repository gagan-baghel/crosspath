import type { Metadata } from "next";
import { requireUserId } from "@/lib/session";
import { FeedScreen } from "@/components/feed/feed-screen";
import { SuggestionsBanner } from "@/components/feed/suggestions-banner";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const userId = await requireUserId();
  return <FeedScreen suggestions={<SuggestionsBanner userId={userId} />} />;
}
