"use client";

import { useEffect, useState } from "react";
import { Check, Dices, Loader2, X } from "lucide-react";
import { checkUsernameAvailable } from "@/actions/profile";
import { generateUsername } from "@/lib/usernames";
import { usernameSchema, USERNAME_MAX } from "@/schemas/profile";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type UsernameStatus = "idle" | "checking" | "available" | "unavailable";

type RemoteResult = { name: string; status: UsernameStatus; message: string };

/**
 * Validation is derived synchronously; only the debounced server-side
 * availability check lives in the effect. `skipFor` (the user's current
 * name) short-circuits to "available" so editing other profile fields
 * doesn't flag your own username.
 */
export function useUsernameAvailability(
  username: string,
  skipFor?: string
): { status: UsernameStatus; message: string } {
  const trimmed = username.trim();
  const debounced = useDebouncedValue(trimmed, 400);
  const [remote, setRemote] = useState<RemoteResult | null>(null);

  const isOwn = !!skipFor && trimmed.toLowerCase() === skipFor.toLowerCase();
  const parsed = usernameSchema.safeParse(trimmed);

  useEffect(() => {
    if (!debounced || (skipFor && debounced.toLowerCase() === skipFor.toLowerCase())) return;
    const check = usernameSchema.safeParse(debounced);
    if (!check.success) return;
    let cancelled = false;
    checkUsernameAvailable(check.data)
      .then((result) => {
        if (cancelled) return;
        setRemote({
          name: debounced,
          status: result.available ? "available" : "unavailable",
          message: result.available ? "Available" : (result.error ?? "That username is already taken"),
        });
      })
      .catch(() => {
        // Network hiccup: don't block typing; the server re-checks on submit.
        if (!cancelled) setRemote({ name: debounced, status: "idle", message: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, skipFor]);

  if (!trimmed) return { status: "idle", message: "" };
  if (isOwn) return { status: "available", message: "" };
  if (!parsed.success) {
    return {
      status: "unavailable",
      message: parsed.error.issues[0]?.message ?? "Invalid username",
    };
  }
  if (remote && remote.name === debounced && trimmed === debounced) {
    return { status: remote.status, message: remote.message };
  }
  return { status: "checking", message: "" };
}

export function UsernameField({
  id = "username",
  value,
  onChange,
  status,
  message,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  status: UsernameStatus;
  message: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            value={value}
            maxLength={USERNAME_MAX}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Pick a username"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={status === "unavailable"}
            className="pr-9"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "checking" && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
            {status === "available" && <Check className="size-4 text-emerald-600" />}
            {status === "unavailable" && <X className="size-4 text-destructive" />}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Suggest a random username"
          onClick={() => onChange(generateUsername())}
        >
          <Dices className="size-4" />
        </Button>
      </div>
      <p
        className={cn(
          "min-h-4 text-xs",
          status === "unavailable" ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {message ||
          "Letters, numbers and underscores. Pick anything — no real names needed."}
      </p>
    </div>
  );
}
