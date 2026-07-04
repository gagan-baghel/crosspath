import { NextResponse } from "next/server";
import Ably from "ably";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Issues an Ably token scoped to exactly the channels this user may use:
 * their personal channel plus every chat they participate in. Anyone else's
 * chat channels are unreachable regardless of what the client requests.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const key = process.env.ABLY_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Realtime not configured" }, { status: 503 });
  }

  const chats = await prisma.chat.findMany({
    where: { OR: [{ authorId: userId }, { partnerId: userId }] },
    select: { id: true },
  });

  const capability: Record<string, Ably.CapabilityOp[]> = {
    [`user:${userId}`]: ["subscribe"],
  };
  for (const chat of chats) {
    capability[`chat:${chat.id}`] = ["subscribe", "publish", "presence"];
  }

  const client = new Ably.Rest({ key });
  const tokenRequest = await client.auth.createTokenRequest({
    clientId: userId,
    capability: JSON.stringify(capability),
    ttl: 60 * 60 * 1000, // 1 hour
  });

  return NextResponse.json(tokenRequest);
}
