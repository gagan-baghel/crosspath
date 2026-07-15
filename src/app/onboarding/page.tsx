import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HeartHandshake } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateUsername } from "@/lib/usernames";
import { OnboardingForm } from "@/components/profile/onboarding-form";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const userId = await requireUserId();

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile?.onboarded) redirect("/feed");

  // A starting suggestion; the user can type their own or roll new ones client-side.
  const initialUsername = generateUsername();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <HeartHandshake className="size-8 text-primary" />
        <h1 className="text-2xl font-semibold">Welcome to Relate</h1>
        <p className="text-sm text-muted-foreground">
          Set up your anonymous identity. This is all anyone will ever see.
        </p>
      </div>
      <OnboardingForm initialUsername={initialUsername} />
    </main>
  );
}
