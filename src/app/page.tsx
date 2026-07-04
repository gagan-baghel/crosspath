import Link from "next/link";
import { HeartHandshake, MessageCircle, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: UserRound,
    title: "Share anonymously",
    body: "Post what you're going through under a generated username. Your real identity stays yours.",
  },
  {
    icon: HeartHandshake,
    title: "People relate",
    body: "Anyone who's been there can raise their hand. Only you see who's interested.",
  },
  {
    icon: MessageCircle,
    title: "You choose who to talk to",
    body: "Pick one person and open a private one-to-one conversation. No comments, no crowd.",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <HeartHandshake className="size-6 text-primary" />
          Relate
        </div>
        <Button variant="ghost" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Talk to someone who <span className="text-primary">gets it</span>.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Share what you&apos;re going through — stress, loneliness, family, anything — and have
          a private conversation with someone who truly relates. Completely anonymous.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="rounded-2xl shadow-sm">
              <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          Rate conversations, build trust, block or report anyone — safety is built in.
        </p>
      </section>

      <footer className="flex h-14 items-center justify-center gap-4 border-t text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Relate</span>
        <span>·</span>
        <span>Terms</span>
        <span>·</span>
        <span>Privacy</span>
      </footer>
    </main>
  );
}
