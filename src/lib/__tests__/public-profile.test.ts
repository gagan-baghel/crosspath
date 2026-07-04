import { describe, it, expect } from "vitest";
import { publicProfileSelect, type PublicProfile } from "@/lib/public-profile";

describe("publicProfileSelect", () => {
  it("only includes safe fields", () => {
    const allowedKeys = [
      "userId",
      "username",
      "avatarUrl",
      "bio",
      "language",
      "positiveCount",
      "negativeCount",
    ];

    const selectKeys = Object.keys(publicProfileSelect);

    expect(selectKeys.sort()).toEqual(allowedKeys.sort());
  });

  it("does not include email", () => {
    expect(publicProfileSelect).not.toHaveProperty("email");
  });

  it("does not include passwordHash", () => {
    expect(publicProfileSelect).not.toHaveProperty("passwordHash");
  });

  it("marks every field as true", () => {
    for (const value of Object.values(publicProfileSelect)) {
      expect(value).toBe(true);
    }
  });
});

describe("PublicProfile type", () => {
  it("accepts a valid public profile object", () => {
    const profile: PublicProfile = {
      userId: "user-123",
      username: "Alice",
      avatarUrl: "https://example.com/avatar.svg",
      bio: "Hello world",
      language: "English",
      positiveCount: 5,
      negativeCount: 1,
    };

    expect(profile.userId).toBe("user-123");
    expect(profile.username).toBe("Alice");
    expect(profile.avatarUrl).toBe("https://example.com/avatar.svg");
    expect(profile.bio).toBe("Hello world");
    expect(profile.language).toBe("English");
    expect(profile.positiveCount).toBe(5);
    expect(profile.negativeCount).toBe(1);
  });

  it("has the correct property types", () => {
    const profile: PublicProfile = {
      userId: "u1",
      username: "Bob",
      avatarUrl: "https://example.com/a.svg",
      bio: "",
      language: "Hindi",
      positiveCount: 0,
      negativeCount: 0,
    };

    expect(typeof profile.userId).toBe("string");
    expect(typeof profile.username).toBe("string");
    expect(typeof profile.avatarUrl).toBe("string");
    expect(typeof profile.bio).toBe("string");
    expect(typeof profile.language).toBe("string");
    expect(typeof profile.positiveCount).toBe("number");
    expect(typeof profile.negativeCount).toBe("number");
  });
});
