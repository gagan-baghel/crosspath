import { describe, it, expect } from "vitest";
import { avatarVariants, defaultAvatar } from "../avatars";

describe("avatarVariants", () => {
  it("returns 6 URLs", () => {
    const variants = avatarVariants("test-seed");
    expect(variants).toHaveLength(6);
  });

  it("returns URLs starting with dicebear", () => {
    const variants = avatarVariants("test-seed");
    for (const url of variants) {
      expect(url).toMatch(/^https:\/\/api\.dicebear\.com\/9\.x\//);
    }
  });

  it("includes the seed in each URL", () => {
    const variants = avatarVariants("my-seed");
    for (const url of variants) {
      expect(url).toContain("my-seed");
    }
  });

  it("uses URL-encoded seed", () => {
    const variants = avatarVariants("seed with spaces");
    for (const url of variants) {
      expect(url).toContain("seed%20with%20spaces");
    }
  });

  it("includes radius=50 in each URL", () => {
    const variants = avatarVariants("test");
    for (const url of variants) {
      expect(url).toContain("radius=50");
    }
  });
});

describe("defaultAvatar", () => {
  it("returns the first variant", () => {
    const seed = "my-seed";
    const default_ = defaultAvatar(seed);
    const variants = avatarVariants(seed);
    expect(default_).toBe(variants[0]);
  });
});
