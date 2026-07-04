import { PostSkeleton } from "@/components/feed/post-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <>
      <div className="border-b p-4">
        <Skeleton className="h-9 w-full max-w-xs rounded-full" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </>
  );
}
