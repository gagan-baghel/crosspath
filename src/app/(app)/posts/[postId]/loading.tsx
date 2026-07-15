import { PostSkeleton } from "@/components/feed/post-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="p-4">
        <PostSkeleton />
      </div>
    </>
  );
}
