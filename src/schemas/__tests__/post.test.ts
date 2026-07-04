import { describe, it, expect } from "vitest";
import { createPostSchema, topicLabel, TOPICS, topicValues } from "../post";

describe("createPostSchema", () => {
  it("accepts valid content and topic", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topic: "STRESS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short content", () => {
    const result = createPostSchema.safeParse({
      content: "Short",
      topic: "STRESS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 1000 characters", () => {
    const result = createPostSchema.safeParse({
      content: "a".repeat(1001),
      topic: "STRESS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid topic", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topic: "INVALID_TOPIC",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid topics", () => {
    for (const topic of topicValues) {
      const result = createPostSchema.safeParse({
        content: "This is a valid post with enough characters.",
        topic,
      });
      expect(result.success).toBe(true);
    }
  });

  it("trims content (handled by caller after parse)", () => {
    const result = createPostSchema.safeParse({
      content: "  This is a valid post with enough characters.  ",
      topic: "STRESS",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("This is a valid post with enough characters.");
    }
  });
});

describe("topicLabel", () => {
  it("returns correct labels for known topics", () => {
    expect(topicLabel("STRESS")).toBe("Stress");
    expect(topicLabel("FAMILY")).toBe("Family");
    expect(topicLabel("RELATIONSHIPS")).toBe("Relationships");
  });

  it("returns the input for unknown topics", () => {
    expect(topicLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("TOPICS", () => {
  it("has 9 topics", () => {
    expect(TOPICS).toHaveLength(9);
  });

  it("has unique values", () => {
    const values = TOPICS.map((t) => t.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
