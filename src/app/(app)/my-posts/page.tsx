import type { Metadata } from "next";
import { MyPostsScreen } from "@/components/feed/my-posts-screen";

export const metadata: Metadata = { title: "My Posts" };

export default function MyPostsPage() {
  return <MyPostsScreen />;
}
