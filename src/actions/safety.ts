"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reportSchema } from "@/schemas/report";
import { isObjectId } from "@/lib/validation";

type ActionResult = { success: true } | { success: false; error: string };

export async function blockUser(blockedId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(blockedId)) return { success: false, error: "User not found" };
  if (blockedId === session.user.id) return { success: false, error: "You can't block yourself" };

  const target = await prisma.user.findUnique({ where: { id: blockedId }, select: { id: true } });
  if (!target) return { success: false, error: "User not found" };

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: session.user.id, blockedId } },
    create: { blockerId: session.user.id, blockedId },
    update: {},
  });

  // Blocking ends any active conversation between the two.
  await prisma.chat.updateMany({
    where: {
      status: "ACTIVE",
      OR: [
        { authorId: session.user.id, partnerId: blockedId },
        { authorId: blockedId, partnerId: session.user.id },
      ],
    },
    data: { status: "ENDED", endedAt: new Date(), endedById: session.user.id },
  });

  revalidatePath("/feed");
  revalidatePath("/chats");
  revalidatePath("/settings");
  return { success: true };
}

export async function unblockUser(blockedId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!isObjectId(blockedId)) return { success: false, error: "User not found" };

  await prisma.block.deleteMany({
    where: { blockerId: session.user.id, blockedId },
  });

  revalidatePath("/settings");
  revalidatePath("/feed");
  return { success: true };
}

export async function reportUser(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { reportedId, chatId, postId, category, details, alsoBlock } = parsed.data;
  if (reportedId === session.user.id) {
    return { success: false, error: "You can't report yourself" };
  }

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      reportedId,
      chatId,
      postId,
      category,
      details,
    },
  });

  if (alsoBlock) {
    await blockUser(reportedId);
  }

  return { success: true };
}
