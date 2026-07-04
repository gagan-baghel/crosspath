import { describe, it, expect } from "vitest";
import { rateLimit, getClientIdentifier } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const key = "test:allow";
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks requests over the limit", () => {
    const key = "test:block";
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60_000);
    }
    const result = rateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfter).toBeGreaterThan(0);
    }
  });

  it("resets the counter after the window expires", async () => {
    const key = "test:reset";
    rateLimit(key, 1, 50);
    const blocked = rateLimit(key, 1, 50);
    expect(blocked.allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    const result = rateLimit(key, 1, 50);
    expect(result.allowed).toBe(true);
  });

  it("returns correct retryAfter value", () => {
    const key = "test:retry";
    rateLimit(key, 1, 10_000);
    const blocked = rateLimit(key, 1, 10_000);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfter).toBeGreaterThanOrEqual(9);
      expect(blocked.retryAfter).toBeLessThanOrEqual(10);
    }
  });

  it("tracks different keys independently", () => {
    rateLimit("a", 1, 60_000);
    const result = rateLimit("b", 1, 60_000);
    expect(result.allowed).toBe(true);
  });
});

describe("getClientIdentifier", () => {
  it("extracts IP from x-forwarded-for", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");
    expect(getClientIdentifier(headers)).toBe("192.168.1.1");
  });

  it("extracts IP from x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "192.168.1.2");
    expect(getClientIdentifier(headers)).toBe("192.168.1.2");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1");
    headers.set("x-real-ip", "192.168.1.2");
    expect(getClientIdentifier(headers)).toBe("192.168.1.1");
  });

  it("returns fallback when no headers are present", () => {
    expect(getClientIdentifier(null, "fallback")).toBe("fallback");
  });

  it("returns fallback for empty x-forwarded-for", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "");
    expect(getClientIdentifier(headers, "fb")).toBe("fb");
  });
});
