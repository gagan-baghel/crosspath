import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, ShieldCheck, Ear, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/shell/brand";
import { cn } from "@/lib/utils";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Free stock portraits (Unsplash) — representative faces for warmth.
const PORTRAITS = [
  "1494790108377-be9c29b29330",
  "1500648767791-00dcc994a43e",
  "1438761681033-6461ffad8d80",
  "1507003211169-0a1dd7228f2d",
  "1544005313-94ddf0286df2",
  "1517841905240-472988babdf9",
  "1506794778202-cad84cf45f1d",
  "1534528741775-53994a69daeb",
];

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

function FeelingCard({ quote, topic, className }: { quote: string; topic: string; className?: string }) {
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

const MOMENTS = [
  {
    img: "1499750310107-5fef28a66643",
    icon: Sparkles,
    title: "Finally saying it",
    body: "Write the thing you've been holding. No real name, no feed of judgment — just the weight, set down.",
  },
  {
    img: "1521737604893-d14cc237f11d",
    icon: HeartHandshake,
    title: "Someone raises their hand",
    body: "People who've felt the same quietly say 'me too.' Only you can see who reached out.",
  },
  {
    img: "1543269865-cbf427effbad",
    icon: Ear,
    title: "Being heard",
    body: "You choose one person and open a private conversation. No crowd, no performance — just two people.",
  },
] as const;

const TESTIMONIALS = [
  {
    portrait: PORTRAITS[0],
    name: "QuietRiver",
    label: "Highly Trusted",
    quote: "I typed something at 2am I'd never said to anyone. Someone answered like they'd lived it. I didn't feel so alone after that.",
  },
  {
    portrait: PORTRAITS[3],
    name: "SlowTide",
    label: "Trusted",
    quote: "It wasn't advice. It was someone actually listening. That was the whole thing I needed.",
  },
  {
    portrait: PORTRAITS[5],
    name: "PaperLantern",
    label: "Trusted",
    quote: "No likes, no comments, nobody watching. Just one honest conversation. It felt safe in a way social apps never do.",
  },
] as const;

const MOSAIC = [
  { portrait: PORTRAITS[1], topic: "Career", tall: true },
  { portrait: PORTRAITS[2], topic: "Relationships", tall: false },
  { portrait: PORTRAITS[6], topic: "Grief", tall: false },
  { portrait: PORTRAITS[7], topic: "Academic", tall: true },
  { portrait: PORTRAITS[4], topic: "Health", tall: false },
] as const;

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60 [mask-image:radial-gradient(ellipse_80%_40%_at_50%_0%,black,transparent)]"
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
        {/* Header */}
        <header className="flex h-20 items-center justify-between gap-4 pr-0 sm:pr-32">
          <div className="flex items-center gap-3">
            <BrandMark />
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
            <Link href="#stories" className="hidden hover:text-foreground sm:inline">
              Stories
            </Link>
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </nav>
        </header>

        {/* Hero */}
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

          {/* Social proof — people here now */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {PORTRAITS.slice(0, 6).map((p) => (
                <span
                  key={p}
                  className="relative size-10 overflow-hidden rounded-full border-2 border-background bg-muted"
                >
                  <Image src={img(p, 120)} alt="" fill unoptimized className="object-cover" sizes="40px" />
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Real people</span>, sitting with the same
              things you are — right now.
            </p>
          </div>
        </section>

        {/* Voices */}
        <section id="voices" className="mt-24 sm:mt-32">
          <p className="mb-8 max-w-md text-balance text-sm text-muted-foreground">
            Right now, someone here is carrying one of these. You don&apos;t have to carry yours alone
            either.
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
        </section>

        {/* Conversation mockup */}
        <section className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
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
            Every conversation here starts with one person choosing to listen. You pick who — always
            your call, always just the two of you.
          </p>
        </section>
      </div>

      {/* Company mosaic */}
      <section className="relative mx-auto mt-28 max-w-6xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              You&apos;re in good company
            </h2>
            <p className="mt-4 max-w-md text-balance text-muted-foreground">
              Students, parents, people between jobs, people who just moved, people who look fine on the
              outside. Different lives, the same quiet need — to be understood by someone who&apos;s been
              there.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Loneliness", "Anxiety", "Family", "Career", "Grief", "Burnout"].map((t) => (
                <Badge key={t} variant="outline" className="rounded-full font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {MOSAIC.map(({ portrait, topic, tall }) => (
              <div
                key={portrait}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-muted",
                  tall ? "row-span-2 aspect-[3/5]" : "aspect-square"
                )}
              >
                <Image
                  src={img(portrait, 500)}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 33vw, 220px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-xs font-medium text-white">{topic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moments — how it feels */}
      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-8">
        <h2 className="max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">
          What it feels like to be here
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Not a process. A few honest moments, in order.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MOMENTS.map(({ img: id, icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full bg-muted">
                <Image
                  src={img(id, 700)}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur">
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="mx-auto mt-28 max-w-6xl px-4 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
            Conversations that stayed with people
          </h2>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Names are anonymous. Trust is earned.
          </span>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ portrait, name, label, quote }) => (
            <figure
              key={name}
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <MessageCircle className="size-5 text-rose-400" />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="relative size-10 overflow-hidden rounded-full bg-muted">
                  <Image src={img(portrait, 120)} alt="" fill unoptimized className="object-cover" sizes="40px" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Trust & safety */}
      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-2">
          <div className="relative min-h-64 bg-muted">
            <Image
              src={img("1516302752625-fcc3c50ae61f", 900)}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
            <ShieldCheck className="size-7 text-foreground" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Safe enough to be honest
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                Your real name, email and photo never leave your account — others only ever see your
                anonymous username.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                Rate the conversations that helped. Trust builds quietly over time, no scores to chase.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400" />
                Block or report anyone, end any chat, any time. You&apos;re always in control.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto mt-28 max-w-6xl px-4 pb-28 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <Image
            src={img("1521791136064-7986c2920216", 1400)}
            alt=""
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 1152px) 100vw, 1088px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40" />
          <div className="relative flex flex-col items-start gap-6 p-8 sm:p-16">
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              You don&apos;t have to carry it alone.
            </h2>
            <p className="max-w-md text-balance text-white/80">
              Share what&apos;s on your mind, or be the person who listens. It only takes a minute to
              start — and it&apos;s completely anonymous.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full bg-white px-8 text-black hover:bg-white/90" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/30 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex h-14 items-center justify-center gap-4 border-t border-border text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Relate</span>
        <span>·</span>
        <span>Terms</span>
        <span>·</span>
        <span>Privacy</span>
      </footer>
    </main>
  );
}
