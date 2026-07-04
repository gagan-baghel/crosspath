import { describe, it, expect } from "vitest";
import {
  isDangerousUrl,
  sanitizeText,
  validateMessageBody,
  validatePostContent,
} from "../sanitize";

describe("isDangerousUrl", () => {
  it("blocks javascript: URLs", () => {
    expect(isDangerousUrl("javascript:alert(1)")).toBe(true);
    expect(isDangerousUrl("  javascript:alert(1)  ")).toBe(true);
  });

  it("blocks data:text/html URLs", () => {
    expect(isDangerousUrl("data:text/html,<script>alert(1)</script>")).toBe(true);
  });

  it("blocks vbscript: URLs", () => {
    expect(isDangerousUrl("vbscript:msgbox(1)")).toBe(true);
  });

  it("blocks file: URLs", () => {
    expect(isDangerousUrl("file:///etc/passwd")).toBe(true);
  });

  it("allows normal https URLs", () => {
    expect(isDangerousUrl("https://example.com")).toBe(false);
  });

  it("allows normal http URLs", () => {
    expect(isDangerousUrl("http://example.com")).toBe(false);
  });

  it("allows plain text without URLs", () => {
    expect(isDangerousUrl("hello world")).toBe(false);
  });
});

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert(1)</script>")).toBe("alert(1)");
    expect(sanitizeText("<b>bold</b>")).toBe("bold");
  });

  it("collapses more than 3 consecutive newlines", () => {
    const input = "a\n\n\n\n\n\nb";
    expect(sanitizeText(input)).toBe("a\n\n\nb");
  });

  it("does not collapse 3 or fewer newlines", () => {
    const input = "a\n\n\nb";
    expect(sanitizeText(input)).toBe("a\n\n\nb");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("validateMessageBody", () => {
  it("returns error for empty string", () => {
    expect(validateMessageBody("")).toBe("Message can't be empty");
  });

  it("returns error for whitespace-only string", () => {
    expect(validateMessageBody("   ")).toBe("Message can't be empty");
  });

  it("returns error for dangerous URL", () => {
    expect(validateMessageBody("click here: javascript:alert(1)")).toBe(
      "Message contains a disallowed link"
    );
  });

  it("returns null for safe text", () => {
    expect(validateMessageBody("Hello, how are you?")).toBeNull();
  });

  it("returns null for safe URL", () => {
    expect(validateMessageBody("Check https://example.com")).toBeNull();
  });
});

describe("validatePostContent", () => {
  it("returns error for empty string", () => {
    expect(validatePostContent("")).toBe("Content can't be empty");
  });

  it("returns error for dangerous URL", () => {
    expect(validatePostContent("Visit javascript:alert(1)")).toBe(
      "Content contains a disallowed link"
    );
  });

  it("returns null for safe content", () => {
    expect(validatePostContent("This is a safe post")).toBeNull();
  });
});
