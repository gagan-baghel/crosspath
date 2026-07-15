import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </>
  );
}
