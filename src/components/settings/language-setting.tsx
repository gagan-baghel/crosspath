"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { LANGUAGES } from "@/schemas/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSetting({
  language,
  avatarUrl,
  bio,
}: {
  language: string;
  avatarUrl: string;
  bio: string;
}) {
  const router = useRouter();

  async function onChange(value: string) {
    const result = await updateProfile({ avatarUrl, bio, language: value });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Language updated");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm">Preferred language</p>
      <Select defaultValue={language} onValueChange={onChange}>
        <SelectTrigger className="w-40">
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
  );
}
