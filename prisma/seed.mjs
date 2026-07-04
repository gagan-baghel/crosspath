import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const demoUsers = [
  {
    email: "demo1@relate.local",
    username: "QuietRiver482",
    bio: "Figuring things out, one day at a time.",
  },
  {
    email: "demo2@relate.local",
    username: "GentleAspen311",
    bio: "Been through a lot. Happy to listen.",
  },
  {
    email: "demo3@relate.local",
    username: "BraveHarbor907",
    bio: "",
  },
];

const demoPosts = [
  {
    email: "demo1@relate.local",
    topic: "CAREER",
    content:
      "I've been at the same job for four years and I feel completely stuck. Everyone around me seems to be moving up or moving on, and I'm scared that if I leave I'll fail, but staying feels like slowly giving up. Has anyone made a big change like this after feeling frozen for years?",
  },
  {
    email: "demo2@relate.local",
    topic: "LONELINESS",
    content:
      "Moved to a new city six months ago for work. I still haven't made a single real friend here. Weekends are the hardest — I just walk around alone. I'm not sad exactly, just... invisible.",
  },
  {
    email: "demo2@relate.local",
    topic: "FAMILY",
    content:
      "My parents still treat me like a child even though I'm 26 and support myself. Every phone call turns into criticism about my choices. I love them but I dread calling home.",
  },
  {
    email: "demo3@relate.local",
    topic: "ANXIETY",
    content:
      "Job interview next week and my anxiety is through the roof. I keep imagining every way it could go wrong. I know it's irrational but knowing that doesn't stop the 3am spirals.",
  },
];

function avatar(seed) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&radius=50`;
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: { email: u.email, passwordHash },
      update: {},
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        username: u.username,
        avatarUrl: avatar(u.username),
        bio: u.bio,
        language: "English",
        onboarded: true,
      },
      update: {},
    });
    console.log(`✓ user ${u.email} (${u.username})`);
  }

  for (const p of demoPosts) {
    const user = await prisma.user.findUnique({ where: { email: p.email } });
    const existing = await prisma.post.findFirst({
      where: { authorId: user.id, content: p.content },
    });
    if (!existing) {
      await prisma.post.create({
        data: { authorId: user.id, topic: p.topic, content: p.content },
      });
      console.log(`✓ post [${p.topic}] by ${p.email}`);
    }
  }

  console.log(`\nSeed complete. Sign in with any demo account, password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
