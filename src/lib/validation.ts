import { z } from "zod";

/** MongoDB ObjectIds are 24 hex characters. */
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_RE.test(value);
}

/** Zod schema for a MongoDB ObjectId — use for any client-supplied id. */
export const objectId = z.string().regex(OBJECT_ID_RE, "Invalid id");

/**
 * Escapes regex metacharacters so user input is matched literally.
 * Prisma's MongoDB `contains` compiles the value as a regex, so an
 * unescaped query allows regex injection and catastrophic-backtracking
 * (ReDoS). Escaping makes it a plain substring search.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Max length for a free-text search query (defense against ReDoS/abuse). */
export const SEARCH_MAX_LEN = 100;
