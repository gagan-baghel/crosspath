import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Connector({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 40"
      fill="none"
      className={cn("h-8 w-10 shrink-0 text-border lg:w-14", className)}
    >
      <path
        d="M2 20c22 0 28-14 46-14s24 14 46 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <circle cx="2" cy="20" r="3" className="fill-background" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="94" cy="20" r="3" fill="currentColor" />
    </svg>
  );
}

function FeelingCard({
  quote,
  topic,
  className,
}: {
  quote: string;
  topic: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-48 shrink-0 rounded-2xl border border-border bg-card p-4 shadow-sm lg:w-56",
        className
      )}
    >
      <Badge variant="outline" className="mb-2 rounded-full font-normal text-muted-foreground">
        {topic}
      </Badge>
      <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}

const VOICES = [
  { quote: "I moved for work six months ago. I still eat dinner alone every night.", topic: "Loneliness" },
  { quote: "Everyone thinks I'm fine. I haven't been fine in weeks.", topic: "Anxiety" },
  { quote: "My parents still call and it still wrecks me every time.", topic: "Family" },
  { quote: "I don't know when 'just tired' became 'always tired.'", topic: "Burnout" },
] as const;

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60 [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-500/10"
      />

      <Link
        href="/signup"
        className="absolute right-4 top-4 z-20 hidden rotate-3 rounded-md bg-rose-300 px-4 py-2 text-sm font-bold uppercase tracking-wide text-rose-950 shadow-md transition-transform hover:rotate-0 sm:right-8 sm:top-6 sm:block"
      >
        Come in
      </Link>

      <div className="relative mx-auto flex max-w-6xl flex-col px-4 sm:px-8">
        <header className="flex h-20 items-center justify-between gap-4 pr-0 sm:pr-32">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-foreground text-background">
              <HeartHandshake className="size-5" />
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm font-semibold uppercase tracking-wide">Relate</span>
              <span className="h-4 w-px bg-border" />
              <span className="text-sm uppercase tracking-wide text-muted-foreground">
                You&apos;re not the only one
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#voices" className="hidden hover:text-foreground sm:inline">
              What people share
            </Link>
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </nav>
        </header>

        <section className="mt-8 sm:mt-16">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">Relate</h1>
            <span className="text-3xl font-normal text-muted-foreground sm:text-4xl">
              Someone gets it
            </span>
          </div>
          <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Say the thing you haven&apos;t said out loud. Somewhere in this room is someone who&apos;s
            felt exactly that — and they&apos;re listening, no names attached.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>

        <section id="voices" className="mt-20 pb-16 sm:mt-28">
          <p className="mb-8 max-w-md text-balance text-sm text-muted-foreground">
            Right now, someone here is carrying one of these. You don&apos;t have to carry yours
            alone either.
          </p>

          <div className="flex items-start gap-3 overflow-x-auto pb-6 sm:gap-0">
            <FeelingCard {...VOICES[0]} className="sm:translate-y-4" />
            <Connector className="mt-16 hidden sm:flex" />
            <FeelingCard {...VOICES[1]} className="sm:-translate-y-2" />
            <Connector className="mt-10 hidden sm:flex" />
            <FeelingCard {...VOICES[2]} className="sm:translate-y-6" />
            <Connector className="mt-16 hidden sm:flex" />
            <FeelingCard {...VOICES[3]} className="sm:-translate-y-1" />
          </div>

          <div className="mt-2 flex flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Private conversation
              </div>
              <div className="mt-3 space-y-2">
                <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                  I&apos;ve felt that too. What&apos;s been the hardest part?
                </p>
                <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                  Honestly? Just someone asking that.
                </p>
              </div>
            </div>
            <p className="max-w-xs text-balance text-sm text-muted-foreground">
              Every conversation here starts with one person choosing to listen. You pick who —
              always your call, always just the two of you.
            </p>
          </div>
        </section>

        <section id="safety" className="border-t border-border py-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-foreground" />
            <span>
              Rate the conversations that helped. Block or report the ones that didn&apos;t. Your
              name, email, and photo never leave your account.
            </span>
          </div>
        </section>
      </div>

      <footer className="relative flex h-14 items-center justify-center gap-4 border-t border-border text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Relate</span>
        <span>·</span>
        <span>Terms</span>
        <span>·</span>
        <span>Privacy</span>
      </footer>
    </main>
  );
}
