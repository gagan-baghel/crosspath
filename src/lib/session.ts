import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/** Returns the session user id or redirects to login. Server-side only. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

/**
 * Returns the user's onboarded profile, redirecting to /onboarding when
 * missing. Used by every page inside the authed app shell.
 */
export async function requireProfile() {
  const userId = await requireUserId();
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile?.onboarded) redirect("/onboarding");
  return profile;
}
