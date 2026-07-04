"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        An unexpected error occurred. It&apos;s not you — try again.
      </p>
      <Button onClick={reset} className="rounded-full">
        Try again
      </Button>
    </main>
  );
}
