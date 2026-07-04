import { describe, it, expect } from "vitest";
import { onboardingSchema, editProfileSchema } from "../profile";

describe("onboardingSchema", () => {
  it("accepts valid input", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver482",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "Hello world",
      language: "English",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid username format", () => {
    const result = onboardingSchema.safeParse({
      username: "invalid",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username without 3-digit suffix", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-dicebear avatar URL", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver482",
      avatarUrl: "https://evil.com/avatar.svg",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio over 160 characters", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver482",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "a".repeat(161),
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid language", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver482",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "",
      language: "Klingon",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty bio", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver482",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(true);
  });
});

describe("editProfileSchema", () => {
  it("accepts valid input", () => {
    const result = editProfileSchema.safeParse({
      avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=test",
      bio: "Updated bio",
      language: "Spanish",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-dicebear avatar URL", () => {
    const result = editProfileSchema.safeParse({
      avatarUrl: "https://example.com/avatar.png",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio over 160 characters", () => {
    const result = editProfileSchema.safeParse({
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "a".repeat(161),
      language: "English",
    });
    expect(result.success).toBe(false);
  });
});
