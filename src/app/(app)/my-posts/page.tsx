import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { MyPostsScreen } from "@/components/feed/my-posts-screen";
import { SuggestionsBanner } from "@/components/feed/suggestions-banner";

export const metadata: Metadata = { title: "My Posts" };

export default async function MyPostsPage() {
  const userId = await requireUserId();
  return (
    <MyPostsScreen
      suggestions={
        // Streams in after first paint so its queries never block navigation.
        <Suspense fallback={null}>
          <SuggestionsBanner userId={userId} />
        </Suspense>
      }
    />
  );
}
