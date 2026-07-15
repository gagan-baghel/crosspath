import { z } from "zod";

export const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Japanese",
  "Other",
] as const;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
  .max(USERNAME_MAX, `Username must be ${USERNAME_MAX} characters or less`)
  .regex(
    /^[A-Za-z][A-Za-z0-9_]*$/,
    "Use letters, numbers and underscores, starting with a letter"
  );

export const onboardingSchema = z.object({
  username: usernameSchema,
  avatarUrl: z.string().url().startsWith("https://api.dicebear.com/"),
  bio: z.string().max(160, "Bio must be 160 characters or less").default(""),
  language: z.enum(LANGUAGES),
});

export const editProfileSchema = z.object({
  username: usernameSchema,
  avatarUrl: z.string().url().startsWith("https://api.dicebear.com/"),
  bio: z.string().max(160, "Bio must be 160 characters or less").default(""),
  language: z.enum(LANGUAGES),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
