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

export const onboardingSchema = z.object({
  username: z
    .string()
    .regex(/^[A-Za-z]+[0-9]{3}$/, "Invalid username")
    .max(40),
  avatarUrl: z.string().url().startsWith("https://api.dicebear.com/"),
  bio: z.string().max(160, "Bio must be 160 characters or less").default(""),
  language: z.enum(LANGUAGES),
});

export const editProfileSchema = z.object({
  avatarUrl: z.string().url().startsWith("https://api.dicebear.com/"),
  bio: z.string().max(160, "Bio must be 160 characters or less").default(""),
  language: z.enum(LANGUAGES),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
