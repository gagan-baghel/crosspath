import Link from "next/link";
import { HeartHandshake } from "lucide-react";
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <HeartHandshake className="size-6 text-primary" />
        Relate
      </Link>
      <Card className="w-full max-w-sm rounded-2xl shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
      <div className="text-center text-sm text-muted-foreground">{footer}</div>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Your email is never shown to anyone. You appear under an anonymous username.
      </p>
    </main>
  );
}
