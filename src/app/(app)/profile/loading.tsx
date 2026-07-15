import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border p-6">
          <Skeleton className="size-[72px] rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </>
  );
}
