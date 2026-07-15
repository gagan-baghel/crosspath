import { describe, it, expect } from "vitest";
import { createPostSchema, POST_CONTENT_MAX, topicLabel, TOPICS, topicValues } from "../post";

describe("createPostSchema", () => {
  it("accepts valid content and topics", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["STRESS"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multiple topics and dedupes them", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["STRESS", "ANXIETY", "STRESS"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topics).toEqual(["STRESS", "ANXIETY"]);
    }
  });

  it("rejects an empty topics list", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects short content", () => {
    const result = createPostSchema.safeParse({
      content: "Short",
      topics: ["STRESS"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts long content up to the technical ceiling", () => {
    const result = createPostSchema.safeParse({
      content: "a".repeat(POST_CONTENT_MAX),
      topics: ["STRESS"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects content over the technical ceiling", () => {
    const result = createPostSchema.safeParse({
      content: "a".repeat(POST_CONTENT_MAX + 1),
      topics: ["STRESS"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid topic", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["INVALID_TOPIC"],
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid topics", () => {
    for (const topic of topicValues) {
      const result = createPostSchema.safeParse({
        content: "This is a valid post with enough characters.",
        topics: [topic],
      });
      expect(result.success).toBe(true);
    }
  });

  it("trims content (handled by caller after parse)", () => {
    const result = createPostSchema.safeParse({
      content: "  This is a valid post with enough characters.  ",
      topics: ["STRESS"],
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
