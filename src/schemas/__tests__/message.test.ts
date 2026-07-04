import { describe, it, expect } from "vitest";
import { sendMessageSchema } from "../message";

describe("sendMessageSchema", () => {
  it("accepts valid input", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "Hello, this is a message.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty body", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only body", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid chatId", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "not-valid",
      body: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects body over 2000 characters", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts body at exactly 2000 characters", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("trims body (handled by schema)", () => {
    const result = sendMessageSchema.safeParse({
      chatId: "507f1f77bcf86cd799439011",
      body: "  Hello  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe("Hello");
    }
  });
});
