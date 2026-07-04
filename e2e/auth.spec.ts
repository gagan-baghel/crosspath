import { test, expect } from "@playwright/test";

function testEmail(prefix: string) {
  return `${prefix}-${Date.now()}@e2e.relate.local`;
}

const TEST_PASSWORD = "TestPass123!";

test.describe("Authentication", () => {
  test("user can sign up with valid credentials", async ({ page }) => {
    await page.goto("/signup");
    const email = testEmail("signup");

    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to onboarding after successful signup + auto-login
    await page.waitForURL("/onboarding", { timeout: 10000 });
    await expect(page).toHaveURL("/onboarding");
  });

  test("shows error for invalid email format", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[id="email"]', "not-an-email");
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Enter a valid email")).toBeVisible();
  });

  test("shows error for short password", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[id="email"]', testEmail("short"));
    await page.fill('input[id="password"]', "short");
    await page.fill('input[id="confirmPassword"]', "short");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=At least 8 characters")).toBeVisible();
  });

  test("shows error for mismatched passwords", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[id="email"]', testEmail("mismatch"));
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', "DifferentPass123!");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Passwords don't match")).toBeVisible();
  });

  test("user can log in with valid credentials", async ({ page }) => {
    // First sign up
    const email = testEmail("login");
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/onboarding", { timeout: 10000 });

    // Complete onboarding
    await page.click('button:has-text("Get started")');
    await page.waitForURL("/feed", { timeout: 10000 });

    // Log out
    await page.goto("/settings");
    await page.click('button:has-text("Log out")');
    await page.waitForURL("/login", { timeout: 10000 });

    // Log back in
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("/feed", { timeout: 10000 });
    await expect(page).toHaveURL("/feed");
  });

  test("shows error for wrong password", async ({ page }) => {
    const email = testEmail("wrongpass");

    // Sign up first
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/onboarding", { timeout: 10000 });

    // Log out
    await page.goto("/settings");
    await page.click('button:has-text("Log out")');
    await page.waitForURL("/login", { timeout: 10000 });

    // Try wrong password
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', "WrongPass123!");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Invalid email or password. Please check and try again.")
    ).toBeVisible();
  });

  test("redirects to callbackUrl after login", async ({ page }) => {
    const email = testEmail("callback");

    // Sign up and onboard
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/onboarding", { timeout: 10000 });
    await page.click('button:has-text("Get started")');
    await page.waitForURL("/feed", { timeout: 10000 });

    // Log out
    await page.goto("/settings");
    await page.click('button:has-text("Log out")');
    await page.waitForURL("/login", { timeout: 10000 });

    // Visit a protected page while logged out
    await page.goto("/chats");
    await page.waitForURL(/\/login\?callbackUrl=%2Fchats/, { timeout: 10000 });

    // Log in
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to /chats, not /feed
    await page.waitForURL("/chats", { timeout: 10000 });
    await expect(page).toHaveURL("/chats");
  });

  test("shows rate limit error after too many login attempts", async ({ page }) => {
    await page.goto("/login");

    for (let i = 0; i < 6; i++) {
      await page.fill('input[id="email"]', testEmail("ratelimit"));
      await page.fill('input[id="password"]', "wrong");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    await expect(page.locator("text=Too many login attempts")).toBeVisible();
  });

  test("already logged-in user is redirected from login to feed", async ({ page }) => {
    const email = testEmail("redirect");

    // Sign up and onboard
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/onboarding", { timeout: 10000 });
    await page.click('button:has-text("Get started")');
    await page.waitForURL("/feed", { timeout: 10000 });

    // Try to visit login page
    await page.goto("/login");
    await page.waitForURL("/feed", { timeout: 10000 });
    await expect(page).toHaveURL("/feed");
  });
});
