import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="border-t pt-3">
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
