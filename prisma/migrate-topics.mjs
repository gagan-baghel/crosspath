// One-off migration: Post.topic (single enum) -> Post.topics (enum array).
// Safe to re-run; only touches documents that still have the old field.
// Usage: node prisma/migrate-topics.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const result = await prisma.$runCommandRaw({
  update: "Post",
  updates: [
    {
      q: { topic: { $exists: true } },
      u: [{ $set: { topics: ["$topic"] } }, { $unset: "topic" }],
      multi: true,
    },
  ],
});

console.log(`Migrated ${result.nModified ?? result.n ?? 0} post(s) to topics[].`);
await prisma.$disconnect();
