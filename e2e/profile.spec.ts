import { test, expect, type Page } from "@playwright/test";

function testEmail(prefix: string) {
  return `${prefix}-${Date.now()}@e2e.relate.local`;
}

const TEST_PASSWORD = "TestPass123!";

async function signUpAndOnboard(page: Page, email: string) {
  await page.goto("/signup");
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', TEST_PASSWORD);
  await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("/onboarding", { timeout: 10000 });
  await page.click('button:has-text("Get started")');
  await page.waitForURL("/feed", { timeout: 10000 });
}

test.describe("Profile and Onboarding", () => {
  test("new user is redirected to onboarding", async ({ page }) => {
    const email = testEmail("onboard");
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL("/onboarding", { timeout: 10000 });
    await expect(page).toHaveURL("/onboarding");
    await expect(page.locator("text=Welcome to Relate")).toBeVisible();
  });

  test("user can complete onboarding", async ({ page }) => {
    const email = testEmail("complete");
    await page.goto("/signup");
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/onboarding", { timeout: 10000 });

    await expect(page.locator("text=Set up your anonymous identity")).toBeVisible();
    await page.click('button:has-text("Get started")');
    await page.waitForURL("/feed", { timeout: 10000 });
    await expect(page).toHaveURL("/feed");
  });

  test("user can view their profile", async ({ page }) => {
    const email = testEmail("profile");
    await signUpAndOnboard(page, email);

    await page.goto("/profile");
    await expect(page.locator("text=Profile")).toBeVisible();
    await expect(page.locator("text=New")).toBeVisible(); // Trust badge
  });

  test("user can edit their profile", async ({ page }) => {
    const email = testEmail("edit");
    await signUpAndOnboard(page, email);

    await page.goto("/profile");
    await page.click('button:has-text("Edit profile")');

    await page.fill('textarea[id="bio"]', "Updated bio from E2E test.");
    await page.click('button:has-text("Save changes")');

    await expect(page.locator("text=Updated bio from E2E test.")).toBeVisible();
  });

  test("user can change password", async ({ page }) => {
    const email = testEmail("changepw");
    await signUpAndOnboard(page, email);

    await page.goto("/settings");
    await page.click('button:has-text("Change password")');

    await page.fill('input[id="currentPassword"]', TEST_PASSWORD);
    await page.fill('input[id="newPassword"]', "NewPass123!");
    await page.fill('input[id="confirmPassword"]', "NewPass123!");
    await page.click('button:has-text("Update password")');

    await expect(page.locator("text=Password updated")).toBeVisible();
  });

  test("user can delete their account", async ({ page }) => {
    const email = testEmail("delete");
    await signUpAndOnboard(page, email);

    await page.goto("/settings");
    await page.click('button:has-text("Delete account")');
    await page.click('button:has-text("Delete")'); // Confirm

    await page.waitForURL("/", { timeout: 10000 });
    await expect(page).toHaveURL("/");
  });

  test("onboarded user is redirected from onboarding to feed", async ({ page }) => {
    const email = testEmail("redirect-onboard");
    await signUpAndOnboard(page, email);

    // Try to visit onboarding again
    await page.goto("/onboarding");
    await page.waitForURL("/feed", { timeout: 10000 });
    await expect(page).toHaveURL("/feed");
  });
});
