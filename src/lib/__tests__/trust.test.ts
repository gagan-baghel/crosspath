import { describe, it, expect } from "vitest";
import { isPositiveRating, trustLabel, POSITIVE_TAGS, NEGATIVE_TAGS } from "../trust";
import { RatingTag } from "@prisma/client";

describe("isPositiveRating", () => {
  it("returns true for all positive tags", () => {
    expect(isPositiveRating(["HELPFUL", "RESPECTFUL", "GOOD_LISTENER"])).toBe(true);
  });

  it("returns false for all negative tags", () => {
    expect(isPositiveRating(["NOT_HELPFUL", "INAPPROPRIATE", "SPAM"])).toBe(false);
  });

  it("returns true on a tie (majority wins)", () => {
    expect(isPositiveRating(["HELPFUL", "NOT_HELPFUL"])).toBe(true);
  });

  it("returns false when negatives outnumber positives", () => {
    expect(isPositiveRating(["HELPFUL", "NOT_HELPFUL", "INAPPROPRIATE"])).toBe(false);
  });

  it("returns true when positives outnumber negatives", () => {
    expect(isPositiveRating(["HELPFUL", "RESPECTFUL", "NOT_HELPFUL"])).toBe(true);
  });
});

describe("trustLabel", () => {
  it('returns "New" for fewer than 3 ratings', () => {
    expect(trustLabel(0, 0)).toBe("New");
    expect(trustLabel(2, 0)).toBe("New");
    expect(trustLabel(1, 1)).toBe("New");
  });

  it('returns "Trusted" for >=3 ratings and >=70% positive', () => {
    expect(trustLabel(3, 0)).toBe("Trusted");
    expect(trustLabel(7, 3)).toBe("Trusted"); // 70%
    expect(trustLabel(5, 2)).toBe("Trusted"); // ~71%
  });

  it('returns "Highly Trusted" for >=10 ratings and >=85% positive', () => {
    expect(trustLabel(10, 0)).toBe("Highly Trusted");
    expect(trustLabel(9, 1)).toBe("Highly Trusted"); // 90%
    expect(trustLabel(17, 3)).toBe("Highly Trusted"); // 85%
  });

  it('returns "New" for <70% positive even with many ratings', () => {
    expect(trustLabel(5, 5)).toBe("New"); // 50%
    expect(trustLabel(3, 4)).toBe("New"); // <50%
  });

  it('returns "Trusted" for >=70% but <85% with >=10 ratings', () => {
    expect(trustLabel(8, 2)).toBe("Trusted"); // 80%, >=10 total
  });
});

describe("POSITIVE_TAGS and NEGATIVE_TAGS", () => {
  it("have no overlap", () => {
    const overlap = POSITIVE_TAGS.filter((t) =>
      NEGATIVE_TAGS.includes(t as RatingTag)
    );
    expect(overlap).toHaveLength(0);
  });

  it("cover all RatingTag values", () => {
    const allTags: RatingTag[] = [...POSITIVE_TAGS, ...NEGATIVE_TAGS];
    const allEnumValues: RatingTag[] = [
      "HELPFUL",
      "RESPECTFUL",
      "GOOD_LISTENER",
      "COMFORTABLE",
      "NOT_HELPFUL",
      "INAPPROPRIATE",
      "SPAM",
      "RUDE",
    ];
    expect(new Set(allTags)).toEqual(new Set(allEnumValues));
  });
});
