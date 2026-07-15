import { describe, it, expect } from "vitest";
import {
  createPostSchema,
  displayTopicLabels,
  OTHER_TOPIC_MAX,
  POST_CONTENT_MAX,
  topicLabel,
  TOPICS,
  topicValues,
} from "../post";

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
        otherTopic: topic === "OTHER" ? "Health" : undefined,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects OTHER without an otherTopic label", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["OTHER"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects OTHER with a blank otherTopic label", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["OTHER"],
      otherTopic: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("accepts OTHER with a trimmed otherTopic label", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["OTHER"],
      otherTopic: "  Health  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.otherTopic).toBe("Health");
    }
  });

  it("rejects an otherTopic label over the max length", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["OTHER"],
      otherTopic: "a".repeat(OTHER_TOPIC_MAX + 1),
    });
    expect(result.success).toBe(false);
  });

  it("ignores otherTopic when OTHER isn't selected", () => {
    const result = createPostSchema.safeParse({
      content: "This is a valid post with enough characters.",
      topics: ["STRESS"],
    });
    expect(result.success).toBe(true);
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

describe("displayTopicLabels", () => {
  it("returns generic labels when there's no otherTopic", () => {
    expect(displayTopicLabels(["STRESS", "OTHER"])).toEqual(["Stress", "Other"]);
  });

  it("swaps the OTHER label for the custom otherTopic text", () => {
    expect(displayTopicLabels(["STRESS", "OTHER"], "Health")).toEqual(["Stress", "Health"]);
  });

  it("falls back to the generic label when otherTopic is null or empty", () => {
    expect(displayTopicLabels(["OTHER"], null)).toEqual(["Other"]);
    expect(displayTopicLabels(["OTHER"], "")).toEqual(["Other"]);
  });

  it("doesn't touch non-OTHER topics even when otherTopic is set", () => {
    expect(displayTopicLabels(["STRESS", "FAMILY"], "Health")).toEqual(["Stress", "Family"]);
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
