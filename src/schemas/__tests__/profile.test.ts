import { describe, it, expect } from "vitest";
import { onboardingSchema, editProfileSchema, usernameSchema } from "../profile";

describe("usernameSchema", () => {
  it("accepts custom usernames with letters, digits and underscores", () => {
    for (const name of ["QuietRiver482", "sam", "night_owl", "Anna2026", "a_b_c"]) {
      expect(usernameSchema.safeParse(name).success, name).toBe(true);
    }
  });

  it("trims surrounding whitespace", () => {
    const result = usernameSchema.safeParse("  night_owl  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("night_owl");
  });

  it("rejects invalid usernames", () => {
    for (const name of ["ab", "1starts_with_digit", "_underscore", "has space", "héllo", "a".repeat(25), ""]) {
      expect(usernameSchema.safeParse(name).success, name).toBe(false);
    }
  });
});

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

  it("accepts a custom username without a digit suffix", () => {
    const result = onboardingSchema.safeParse({
      username: "QuietRiver",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid username format", () => {
    const result = onboardingSchema.safeParse({
      username: "not valid!",
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
      username: "night_owl",
      avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=test",
      bio: "Updated bio",
      language: "Spanish",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing username", () => {
    const result = editProfileSchema.safeParse({
      avatarUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=test",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-dicebear avatar URL", () => {
    const result = editProfileSchema.safeParse({
      username: "night_owl",
      avatarUrl: "https://example.com/avatar.png",
      bio: "",
      language: "English",
    });
    expect(result.success).toBe(false);
  });

  it("rejects bio over 160 characters", () => {
    const result = editProfileSchema.safeParse({
      username: "night_owl",
      avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=test",
      bio: "a".repeat(161),
      language: "English",
    });
    expect(result.success).toBe(false);
  });
});
