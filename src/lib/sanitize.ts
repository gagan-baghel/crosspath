/**
 * Content sanitization helpers for user-generated text.
 *
 * These run *in addition to* React's built-in XSS protection. They guard
 * against malicious URLs, HTML injection, and formatting abuse.
 */

/** Prohibited URL schemes that could execute JavaScript. */
const DANGEROUS_SCHEMES = /^javascript:|data:text\/html|vbscript:|file:/i;

/** Sanitises a single line / word: blocks dangerous URL schemes. */
export function isDangerousUrl(text: string): boolean {
  return DANGEROUS_SCHEMES.test(text.trim());
}

/**
 * Strips HTML-like tags and limits consecutive newlines.
 * React already escapes HTML, but this prevents raw HTML from being
 * stored in the database (defence in depth).
 */
export function sanitizeText(input: string): string {
  return (
    input
      // Strip HTML tags
      .replace(/<[^>]*>/g, "")
      // Collapse more than 3 consecutive newlines
      .replace(/\n{4,}/g, "\n\n\n")
      // Trim
      .trim()
  );
}

/**
 * Validates that a message body is safe to store and render.
 * Returns `null` if valid, otherwise an error string.
 */
export function validateMessageBody(body: string): string | null {
  if (!body || body.trim().length === 0) {
    return "Message can't be empty";
  }

  const lines = body.split(/\s+/);
  for (const line of lines) {
    if (isDangerousUrl(line)) {
      return "Message contains a disallowed link";
    }
  }

  return null;
}

/**
 * Validates that a post content is safe to store and render.
 * Same rules as messages but with length already handled by Zod.
 */
export function validatePostContent(content: string): string | null {
  if (!content || content.trim().length === 0) {
    return "Content can't be empty";
  }

  const lines = content.split(/\s+/);
  for (const line of lines) {
    if (isDangerousUrl(line)) {
      return "Content contains a disallowed link";
    }
  }

  return null;
}
