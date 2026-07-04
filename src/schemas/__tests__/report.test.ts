import { describe, it, expect } from "vitest";
import { reportSchema, REPORT_CATEGORIES } from "../report";

describe("reportSchema", () => {
  it("accepts valid input", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      category: "HARASSMENT",
      details: "They were rude to me",
      alsoBlock: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts input without optional fields", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      category: "SPAM",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      category: "INVALID_CATEGORY",
    });
    expect(result.success).toBe(false);
  });

  it("rejects details over 300 characters", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      category: "HARASSMENT",
      details: "a".repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid reportedId", () => {
    const result = reportSchema.safeParse({
      reportedId: "invalid",
      category: "HARASSMENT",
    });
    expect(result.success).toBe(false);
  });

  it("defaults alsoBlock to true", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      category: "HARASSMENT",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alsoBlock).toBe(true);
    }
  });

  it("accepts optional chatId and postId", () => {
    const result = reportSchema.safeParse({
      reportedId: "507f1f77bcf86cd799439011",
      chatId: "507f1f77bcf86cd799439022",
      postId: "507f1f77bcf86cd799439033",
      category: "ABUSE",
    });
    expect(result.success).toBe(true);
  });
});

describe("REPORT_CATEGORIES", () => {
  it("has 7 categories", () => {
    expect(REPORT_CATEGORIES).toHaveLength(7);
  });

  it("has unique values", () => {
    const values = REPORT_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
