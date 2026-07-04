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

test.describe("Feed and Posts", () => {
  test("onboarded user sees feed page", async ({ page }) => {
    const email = testEmail("feed");
    await signUpAndOnboard(page, email);

    await expect(page.locator("text=Feed")).toBeVisible();
    await expect(page.locator("text=Be the first to share")).toBeVisible();
  });

  test("user can create a post", async ({ page }) => {
    const email = testEmail("createpost");
    await signUpAndOnboard(page, email);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "This is a test post created by E2E.");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=This is a test post created by E2E.")).toBeVisible();
  });

  test("shows error for post content under 10 characters", async ({ page }) => {
    const email = testEmail("shortpost");
    await signUpAndOnboard(page, email);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "Short");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=at least 10 characters")).toBeVisible();
  });

  test("user can filter feed by topic", async ({ page }) => {
    const email = testEmail("topicfilter");
    await signUpAndOnboard(page, email);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "Feeling stressed today.");
    await page.click('button:has-text("Stress")');
    await page.click('button:has-text("Post")');
    await expect(page.locator("text=Feeling stressed today.")).toBeVisible();

    await page.click('button:has-text("Family")');
    await expect(page.locator("text=Feeling stressed today.")).not.toBeVisible();

    await page.click('button:has-text("Stress")');
    await expect(page.locator("text=Feeling stressed today.")).toBeVisible();
  });

  test("user can search posts", async ({ page }) => {
    const email = testEmail("search");
    await signUpAndOnboard(page, email);

    const uniqueText = `Unique search text ${Date.now()}`;
    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', uniqueText);
    await page.click('button:has-text("Post")');
    await expect(page.locator(`text=${uniqueText}`)).toBeVisible();

    await page.fill('input[aria-label="Search posts"]', uniqueText);
    await page.waitForTimeout(500);

    await expect(page.locator(`text=${uniqueText}`)).toBeVisible();
  });

  test("user can soft-delete their own post", async ({ page }) => {
    const email = testEmail("delete");
    await signUpAndOnboard(page, email);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "Post to delete");
    await page.click('button:has-text("Post")');
    await expect(page.locator("text=Post to delete")).toBeVisible();

    await page.click('button[aria-label="Post options"]');
    await page.click('text=Delete');
    await page.click('button:has-text("Delete")');

    await expect(page.locator("text=Post to delete")).not.toBeVisible();
  });

  test("daily post limit is enforced", async ({ page }) => {
    const email = testEmail("limit");
    await signUpAndOnboard(page, email);

    for (let i = 0; i < 10; i++) {
      await page.click('button[aria-label="Create post"]');
      await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
      await page.fill('textarea[placeholder="What\'s on your mind?"]', `Post number ${i + 1} for limit test.`);
      await page.click('button:has-text("Post")');
      await page.waitForTimeout(300);
    }

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "This should fail.");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=daily posting limit")).toBeVisible();
  });

  test("user can toggle interest on another user's post", async ({ page, browser }) => {
    const emailA = testEmail("interest-a");
    await signUpAndOnboard(page, emailA);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "Interesting post for toggle test.");
    await page.click('button:has-text("Post")');
    await expect(page.locator("text=Interesting post for toggle test.")).toBeVisible();

    const pageB = await browser.newPage();
    const emailB = testEmail("interest-b");
    await signUpAndOnboard(pageB, emailB);

    await pageB.goto("/feed");
    await expect(pageB.locator("text=Interesting post for toggle test.")).toBeVisible();
    await pageB.click('button:has-text("I relate")');
    await expect(pageB.locator("text=Interested")).toBeVisible();

    await pageB.close();
  });

  test("user cannot toggle interest on their own post", async ({ page }) => {
    const email = testEmail("owninterest");
    await signUpAndOnboard(page, email);

    await page.click('button[aria-label="Create post"]');
    await page.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await page.fill('textarea[placeholder="What\'s on your mind?"]', "My own post.");
    await page.click('button:has-text("Post")');

    await expect(page.locator("text=View interested")).toBeVisible();
    await expect(page.locator('button:has-text("I relate")')).not.toBeVisible();
  });
});
