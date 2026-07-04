"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dices, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { completeOnboarding } from "@/actions/profile";
import { avatarVariants } from "@/lib/avatars";
import { LANGUAGES } from "@/schemas/profile";
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

export function OnboardingForm({ usernameCandidates }: { usernameCandidates: string[] }) {
  const router = useRouter();
  const [usernameIndex, setUsernameIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState<string>("English");
  const [submitting, setSubmitting] = useState(false);

  const username = usernameCandidates[usernameIndex % usernameCandidates.length];
  const avatars = useMemo(() => avatarVariants(username), [username]);

  async function onSubmit() {
    setSubmitting(true);
    const result = await completeOnboarding({
      username,
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
  }

  return (
    <Card className="w-full rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-6 pt-6">
        {/* Username */}
        <div className="flex flex-col gap-2">
          <Label>Your anonymous username</Label>
          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center rounded-lg border bg-muted/40 px-3 font-medium">
              {username}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Regenerate username"
              onClick={() => setUsernameIndex((i) => i + 1)}
            >
              <Dices className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Usernames are generated to protect your identity.
          </p>
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

        <Button onClick={onSubmit} disabled={submitting} className="w-full" size="lg">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Enter Relate
        </Button>
      </CardContent>
    </Card>
  );
}
