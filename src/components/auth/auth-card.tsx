import { Brand } from "@/components/shell/brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10">
      {/* Branded backdrop — matches the landing page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/10"
      />

      <Brand href="/" />

      <Card className="relative w-full max-w-sm rounded-2xl shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>

      <div className="relative text-center text-sm text-muted-foreground">{footer}</div>
      <p className="relative max-w-xs text-center text-xs text-muted-foreground">
        Your email is never shown to anyone. You appear under an anonymous username.
      </p>
    </main>
  );
}
