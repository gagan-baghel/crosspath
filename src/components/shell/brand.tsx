import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

/** The filled rounded-square logo mark — the single source of brand truth. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background",
        className
      )}
    >
      <HeartHandshake className="size-5" />
    </span>
  );
}

/** Mark + "Relate" wordmark, linked. Used in the sidebar, auth pages, etc. */
export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-lg font-semibold tracking-tight">Relate</span>
    </Link>
  );
}
