# Relate

An anonymous peer-support app: **share a problem → find people who relate → choose who to talk to → have a private conversation → build trust through feedback.**

Users post what they're going through under an anonymous username they choose (with generated suggestions). Anyone who relates taps **Interested** — but only the post's author sees who raised their hand, and only the author can open a private one-to-one chat. After a chat ends, both people rate the interaction, which feeds a hidden trust score shown publicly only as a label (*New / Trusted / Highly Trusted*).

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Lucide |
| Database | MongoDB Atlas + Prisma ORM |
| Auth | Auth.js v5 — email + password (bcrypt), JWT sessions |
| Realtime | Polling fallback out of the box; Ably optional for instant delivery + typing + presence |
| Data | TanStack Query + Server Actions + Zod |

MongoDB is the source of truth for all messages. Live chat works **with no external service**: when `ABLY_API_KEY` is not set, the chat room polls a scoped `/api/chats/[id]/sync` endpoint every ~2.5s, giving near-live message delivery and read receipts. Set `ABLY_API_KEY` to upgrade to instant websocket delivery plus typing indicators and online presence — the app switches automatically, no code change. Ably tokens are issued by `/api/ably-token` and scoped server-side to exactly the channels each user may access.

## Getting started

### 1. Prerequisites

- Node 20+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works; Atlas clusters are replica sets, which Prisma requires)
- An [Ably](https://ably.com) account (free tier works)

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` — your Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/relate?retryWrites=true&w=majority`
- `AUTH_SECRET` — generate with `npx auth secret` (or `openssl rand -base64 32`)
- `ABLY_API_KEY` — from your Ably dashboard (the root key is fine for dev)

### 3. Install & push schema

```bash
npm install
npx prisma db push
```

### 4. (Optional) Seed demo data

```bash
npm run db:seed
```

Creates three demo users (`demo1@relate.local` … `demo3@relate.local`, password `password123`) and a few posts.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000. To try the full loop, sign up with two accounts in two browsers: post from A, tap Interested from B, start the chat from A's interested list.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to MongoDB |
| `npm run db:seed` | Seed demo users/posts |

## Deployment (Vercel + Atlas + Ably)

1. Push the repo to GitHub and import it in Vercel.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `ABLY_API_KEY`, and `NEXT_PUBLIC_APP_URL` (your production URL) in Vercel project settings.
3. In Atlas, allow network access from anywhere (or Vercel's IPs).
4. Deploy. No separate realtime server is needed — Ably handles websockets.

## Privacy & safety model

- Other users only ever see the `Profile` (generated username, avatar, bio, language, trust label). `User.email` and `passwordHash` are never selected in public queries (`src/lib/public-profile.ts`).
- Interested lists are visible **only to the post author**; chats are accessible **only to their two participants** (enforced in every server action and API route, and in Ably token capabilities).
- Blocking hides posts both ways, prevents interest/chat/messages, and ends any active chat. Reports are stored with categories for review.
- Trust scores are never exposed as numbers — only as labels.

## Project structure

```
src/
  app/            # routes: landing, signup/login, onboarding, feed, my-posts,
                  # posts/[id](/interested), chats(/[id]), profile, settings, api/
  actions/        # server actions: auth, profile, posts, interests, chats, messages, ratings, safety
  components/     # ui/ (shadcn), shell/, feed/, chat/, interested/, profile/, safety/, settings/
  hooks/          # use-ably, use-infinite-posts, use-debounced-value
  lib/            # prisma, ably (server REST), trust, usernames, avatars, blocks, session
  schemas/        # zod schemas shared client/server
  stores/         # zustand (create-post dialog)
prisma/           # schema.prisma, seed.mjs
```

## Out of scope (deliberately)

Friend requests/contacts, notification center, admin dashboard, media uploads, group chats, voice/video. The MVP validates the core loop first.
