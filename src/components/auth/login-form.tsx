"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Info, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Only allow same-site relative redirect targets (guards against open redirects). */
function safeCallbackUrl(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/feed";
}

function getLoginErrorMessage(error: string | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  if (error === "InvalidCredentials") {
    return "Invalid email or password. Please check and try again.";
  }
  if (error.startsWith("RateLimit:")) {
    const seconds = error.split(":")[1];
    return `Too many login attempts. Please try again in ${seconds}s.`;
  }
  if (error === "AccountSuspended") {
    return "This account has been suspended. Contact support if you believe this is a mistake.";
  }
  return "Something went wrong on our side. Please refresh the page and try again.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const justCreated = searchParams.get("created") === "1";
  const wasRedirected = searchParams.has("callbackUrl");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) {
        setServerError(getLoginErrorMessage(res.error));
        return;
      }
      // Full navigation (not client routing) so the new session cookie is
      // picked up everywhere — server components, proxy, the lot.
      window.location.assign(callbackUrl);
    } catch {
      setServerError(
        "Something went wrong on our side. Please refresh the page and try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {justCreated && (
        <p className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <Info className="mt-0.5 size-4 shrink-0" />
          Account created. Sign in to continue.
        </p>
      )}
      {!justCreated && wasRedirected && (
        <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Please sign in to continue.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
