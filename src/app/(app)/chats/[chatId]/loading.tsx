import { Skeleton } from "@/components/ui/skeleton";

export default function ChatRoomLoading() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 p-4">
        <Skeleton className="h-10 w-48 self-start rounded-2xl" />
        <Skeleton className="h-10 w-56 self-end rounded-2xl" />
        <Skeleton className="h-10 w-40 self-start rounded-2xl" />
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
