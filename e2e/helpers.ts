import type { Page } from "@playwright/test";

export function randomEmail(prefix = "e2e"): string {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@test.local`;
}

export async function signUp(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function completeOnboarding(page: Page): Promise<void> {
  await page.waitForURL("/onboarding");
  // Pick first avatar
  await page.getByRole("button", { name: /^Avatar option /i }).first().click();
  // Optional bio
  await page.getByPlaceholder("A line about you").fill("E2E test user");
  await page.getByRole("button", { name: "Enter Relate" }).click();
  await page.waitForURL("/feed");
}

export async function logout(page: Page): Promise<void> {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/");
}

export async function createPost(page: Page, content: string, topicLabel: string): Promise<void> {
  await page.getByRole("button", { name: "Share" }).click();
  await page.getByRole("dialog").getByRole("button", { name: topicLabel }).click();
  await page.getByPlaceholder("What are you going through?").fill(content);
  await page.getByRole("dialog").getByRole("button", { name: "Post" }).click();
}

export async function openCreatePostDialog(page: Page): Promise<void> {
  // Desktop: sidebar Share button
  await page.getByRole("button", { name: "Share" }).click();
}
