/**
 * Lightweight in-memory rate limiter for Server Actions and API routes.
 * Uses a fixed-size sliding window with automatic cleanup.
 *
 * No external dependencies (Redis, etc.) — suitable for single-instance
 * deployments or moderate traffic. For multi-instance / scale, swap the
 * store for Redis or a shared cache.
 */

type WindowEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, WindowEntry>();

/** Max entries before aggressive cleanup (prevents unbounded growth). */
const MAX_ENTRIES = 10_000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

function aggressiveCleanup() {
  // Remove oldest 50% of entries when the map is too large.
  const entries = Array.from(store.entries());
  entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
  const toRemove = Math.floor(entries.length * 0.5);
  for (let i = 0; i < toRemove; i++) {
    store.delete(entries[i][0]);
  }
}

/**
 * Check whether a request is allowed under the given rate limit.
 *
 * @param key      Unique identifier for the client (e.g. IP + action).
 * @param limit    Max requests allowed in the window.
 * @param windowMs Duration of the window in milliseconds.
 * @returns        `{ allowed: true }` or `{ allowed: false, retryAfter: seconds }`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfter: number } {
  if (store.size > MAX_ENTRIES) {
    cleanup();
    aggressiveCleanup();
  }

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

/**
 * Best-effort IP extraction for API routes and Server Actions.
 * Prefers the `x-forwarded-for` header (common behind proxies) and
 * falls back to a placeholder for local / Server Action contexts.
 */
export function getClientIdentifier(
  headers?: Headers | null,
  fallback = "unknown"
): string {
  if (!headers) return fallback;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For can be a comma-separated list; take the first.
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? fallback;
}
