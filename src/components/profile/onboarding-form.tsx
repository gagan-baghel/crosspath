"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeOnboarding } from "@/actions/profile";
import { avatarVariants } from "@/lib/avatars";
import { LANGUAGES, usernameSchema } from "@/schemas/profile";
import { UsernameField, useUsernameAvailability } from "@/components/profile/username-field";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BIO_MAX = 160;

export function OnboardingForm({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState<string>("English");
  const [submitting, setSubmitting] = useState(false);

  const { status, message } = useUsernameAvailability(username);
  const validUsername = usernameSchema.safeParse(username.trim()).success;
  const avatars = useMemo(
    () => avatarVariants(username.trim() || "anonymous"),
    [username]
  );

  async function onSubmit() {
    setSubmitting(true);
    try {
      const result = await completeOnboarding({
        username: username.trim(),
        avatarUrl: avatars[avatarIndex],
        bio,
        language,
      });
      if (!result.success) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-6 pt-6">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Choose your anonymous username</Label>
          <UsernameField
            value={username}
            onChange={setUsername}
            status={status}
            message={message}
          />
        </div>

        {/* Avatar */}
        <div className="flex flex-col gap-2">
          <Label>Pick an avatar</Label>
          <div className="grid grid-cols-6 gap-2">
            {avatars.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Avatar option ${i + 1}`}
                onClick={() => setAvatarIndex(i)}
                className={cn(
                  "overflow-hidden rounded-full border-2 transition",
                  i === avatarIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/40"
                )}
              >
                <Image src={url} alt="" width={48} height={48} unoptimized className="size-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <span className="text-xs text-muted-foreground">
              {bio.length}/{BIO_MAX}
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            maxLength={BIO_MAX}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A line about you — no real names needed."
            rows={2}
          />
        </div>

        {/* Language */}
        <div className="flex flex-col gap-2">
          <Label>Preferred language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onSubmit}
          disabled={submitting || !validUsername || status === "unavailable"}
          className="w-full"
          size="lg"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Enter Relate
        </Button>
      </CardContent>
    </Card>
  );
}
