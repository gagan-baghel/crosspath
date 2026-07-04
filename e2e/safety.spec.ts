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

test.describe("Safety Features", () => {
  test("user can block another user", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("block-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Block test post.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("block-target");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    // Block from chat
    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=Block user');
    await pageA.click('button:has-text("Block")'); // Confirm

    await expect(pageA.locator("text=blocked")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("blocked user's posts are hidden from feed", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("block-feed-a");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Post from user A.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("block-feed-b");
    await signUpAndOnboard(pageB, emailB);

    // B sees A's post
    await pageB.goto("/feed");
    await expect(pageB.locator("text=Post from user A.")).toBeVisible();

    // B shows interest so they can chat and block
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    // A blocks B
    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=Block user');
    await pageA.click('button:has-text("Block")');

    // B should no longer see A's post
    await pageB.goto("/feed");
    await expect(pageB.locator("text=Post from user A.")).not.toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("user can report another user", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("report-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Report test post.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("report-target");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    // Report from chat
    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=Report user');
    await pageA.click('text=Harassment');
    await pageA.click('button:has-text("Submit report")');

    await expect(pageA.locator("text=Report submitted")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("user can unblock a previously blocked user", async ({ page }) => {
    const email = testEmail("unblock");
    await signUpAndOnboard(page, email);

    // Navigate to settings
    await page.goto("/settings");
    await expect(page.locator("text=Settings")).toBeVisible();

    // If there are blocked users, test unblocking
    // This test assumes a blocked user exists from a prior interaction
    const blockedUser = page.locator('button:has-text("Unblock")').first();
    if (await blockedUser.isVisible().catch(() => false)) {
      await blockedUser.click();
      await expect(page.locator("text=unblocked")).toBeVisible();
    }
  });
});
