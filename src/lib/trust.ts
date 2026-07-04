import { RatingTag } from "@prisma/client";

export const POSITIVE_TAGS: RatingTag[] = [
  "HELPFUL",
  "RESPECTFUL",
  "GOOD_LISTENER",
  "COMFORTABLE",
];

export const NEGATIVE_TAGS: RatingTag[] = [
  "NOT_HELPFUL",
  "INAPPROPRIATE",
  "SPAM",
  "RUDE",
];

export type TrustLabel = "New" | "Trusted" | "Highly Trusted";

/** A rating counts once as positive or negative by majority of its tags. */
export function isPositiveRating(tags: RatingTag[]): boolean {
  const positives = tags.filter((t) => POSITIVE_TAGS.includes(t)).length;
  return positives >= tags.length - positives;
}

/**
 * Hidden trust score -> public label. Numeric counts are never exposed.
 * - New: fewer than 3 ratings
 * - Trusted: >=3 ratings and >=70% positive
 * - Highly Trusted: >=10 ratings and >=85% positive
 */
export function trustLabel(positiveCount: number, negativeCount: number): TrustLabel {
  const total = positiveCount + negativeCount;
  if (total < 3) return "New";
  const ratio = positiveCount / total;
  if (total >= 10 && ratio >= 0.85) return "Highly Trusted";
  if (ratio >= 0.7) return "Trusted";
  return "New";
}
