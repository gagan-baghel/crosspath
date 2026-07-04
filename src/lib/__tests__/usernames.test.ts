import { describe, it, expect } from "vitest";
import { generateUsername } from "../usernames";

describe("generateUsername", () => {
  it("returns a string", () => {
    const username = generateUsername();
    expect(typeof username).toBe("string");
  });

  it("matches the expected format AdjectiveNoun###", () => {
    const username = generateUsername();
    expect(username).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+\d{3}$/);
  });

  it("returns different values on multiple calls", () => {
    const usernames = new Set();
    for (let i = 0; i < 20; i++) {
      usernames.add(generateUsername());
    }
    // Very unlikely all 20 are identical (1/810,000 chance)
    expect(usernames.size).toBeGreaterThan(1);
  });

  it("has a 3-digit number suffix", () => {
    const username = generateUsername();
    const match = username.match(/(\d{3})$/);
    expect(match).not.toBeNull();
    const num = parseInt(match![1], 10);
    expect(num).toBeGreaterThanOrEqual(100);
    expect(num).toBeLessThanOrEqual(999);
  });
});
