import { describe, it, expect } from "vitest";
import { rateChatSchema, RATING_TAGS } from "../rating";

describe("rateChatSchema", () => {
  it("accepts valid input with tags", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: ["HELPFUL", "RESPECTFUL"],
      feedback: "Great chat!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts input without feedback", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: ["HELPFUL"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty tags array", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: ["HELPFUL", "RESPECTFUL", "GOOD_LISTENER", "COMFORTABLE", "NOT_HELPFUL", "INAPPROPRIATE", "SPAM", "RUDE", "EXTRA"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tags", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: ["INVALID_TAG"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects feedback over 300 characters", () => {
    const result = rateChatSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      tags: ["HELPFUL"],
      feedback: "a".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid chatId", () => {
    const result = rateChatSchema.safeParse({
      chatId: "invalid",
      tags: ["HELPFUL"],
    });
    expect(result.success).toBe(false);
  });
});

describe("RATING_TAGS", () => {
  it("has 8 tags", () => {
    expect(RATING_TAGS).toHaveLength(8);
  });

  it("has 4 positive tags", () => {
    const positive = RATING_TAGS.filter((t) => t.positive);
    expect(positive).toHaveLength(4);
  });

  it("has 4 negative tags", () => {
    const negative = RATING_TAGS.filter((t) => !t.positive);
    expect(negative).toHaveLength(4);
  });

  it("has unique values", () => {
    const values = RATING_TAGS.map((t) => t.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
