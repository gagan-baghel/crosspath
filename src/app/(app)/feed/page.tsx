import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { FeedScreen } from "@/components/feed/feed-screen";
import { SuggestionsBanner } from "@/components/feed/suggestions-banner";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const userId = await requireUserId();
  return (
    <FeedScreen
      suggestions={
        // Streams in after first paint so its queries never block navigation.
        <Suspense fallback={null}>
          <SuggestionsBanner userId={userId} />
        </Suspense>
      }
    />
  );
}
