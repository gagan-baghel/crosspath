import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <HeartHandshake className="size-8 text-muted-foreground" />
      <h1 className="text-xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        It may have been removed, or you might not have access to it.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/feed">Back to the feed</Link>
      </Button>
    </main>
  );
}
