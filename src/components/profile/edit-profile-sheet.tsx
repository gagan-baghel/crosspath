"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { avatarVariants } from "@/lib/avatars";
import { LANGUAGES, usernameSchema } from "@/schemas/profile";
import { UsernameField, useUsernameAvailability } from "@/components/profile/username-field";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const BIO_MAX = 160;

export function EditProfileSheet(props: {
  username: string;
  avatarUrl: string;
  bio: string;
  language: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(props.username);
  const [bio, setBio] = useState(props.bio);
  const [language, setLanguage] = useState(props.language);
  const [submitting, setSubmitting] = useState(false);

  const { status, message } = useUsernameAvailability(username, props.username);
  const validUsername = usernameSchema.safeParse(username.trim()).success;

  const avatars = useMemo(() => avatarVariants(props.username), [props.username]);
  const [avatarUrl, setAvatarUrl] = useState(
    avatars.includes(props.avatarUrl) ? props.avatarUrl : avatars[0]
  );

  async function onSave() {
    setSubmitting(true);
    try {
      const result = await updateProfile({
        username: username.trim(),
        avatarUrl,
        bio,
        language,
      });
      setSubmitting(false);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            This is all anyone ever sees of you — keep it anonymous.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4 pb-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-username">Username</Label>
            <UsernameField
              id="edit-username"
              value={username}
              onChange={setUsername}
              status={status}
              message={message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Avatar</Label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Avatar option ${i + 1}`}
                  onClick={() => setAvatarUrl(url)}
                  className={cn(
                    "overflow-hidden rounded-full border-2 transition",
                    url === avatarUrl
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-muted-foreground/40"
                  )}
                >
                  <Image src={url} alt="" width={44} height={44} unoptimized className="size-full" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="edit-bio">Bio</Label>
              <span className="text-xs text-muted-foreground">
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <Textarea
              id="edit-bio"
              value={bio}
              maxLength={BIO_MAX}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
            />
          </div>

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
        </div>

        <SheetFooter>
          <Button
            onClick={onSave}
            disabled={submitting || !validUsername || status === "unavailable"}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
