import { ShieldCheck, Shield, Sparkles } from "lucide-react";
import { trustLabel } from "@/lib/trust";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TrustBadge({
  positiveCount,
  negativeCount,
  className,
}: {
  positiveCount: number;
  negativeCount: number;
  className?: string;
}) {
  const label = trustLabel(positiveCount, negativeCount);

  const styles = {
    New: "bg-muted text-muted-foreground",
    Trusted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "Highly Trusted": "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  }[label];

  const Icon = { New: Sparkles, Trusted: Shield, "Highly Trusted": ShieldCheck }[label];

  return (
    <Badge variant="secondary" className={cn("gap-1 rounded-full font-normal", styles, className)}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
