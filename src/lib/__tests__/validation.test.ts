import { describe, it, expect } from "vitest";
import { isObjectId, escapeRegex, objectId } from "../validation";

describe("isObjectId", () => {
  it("returns true for valid 24-character hex", () => {
    expect(isObjectId("507f1f77bcf86cd799439011")).toBe(true);
    expect(isObjectId("000000000000000000000000")).toBe(true);
    expect(isObjectId("ffffffffffffffffffffffff")).toBe(true);
  });

  it("returns false for invalid hex", () => {
    expect(isObjectId("507f1f77bcf86cd79943901g")).toBe(false);
  });

  it("returns false for wrong length", () => {
    expect(isObjectId("507f1f77bcf86cd79943901")).toBe(false);
    expect(isObjectId("507f1f77bcf86cd7994390111")).toBe(false);
  });

  it("returns false for non-strings", () => {
    expect(isObjectId(123)).toBe(false);
    expect(isObjectId(null)).toBe(false);
    expect(isObjectId(undefined)).toBe(false);
    expect(isObjectId({})).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isObjectId("507F1F77BCF86CD799439011")).toBe(true);
  });
});

describe("escapeRegex", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\"
    );
  });

  it("leaves normal text unchanged", () => {
    expect(escapeRegex("hello world")).toBe("hello world");
  });
});

describe("objectId schema", () => {
  it("accepts valid ObjectId", () => {
    const result = objectId.safeParse("507f1f77bcf86cd799439011");
    expect(result.success).toBe(true);
  });

  it("rejects invalid ObjectId", () => {
    const result = objectId.safeParse("invalid");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = objectId.safeParse("");
    expect(result.success).toBe(false);
  });
});
