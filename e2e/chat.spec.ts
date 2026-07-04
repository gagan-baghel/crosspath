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

test.describe("Chat Flow", () => {
  test("post author can start a chat with interested user", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("chat-author");
    await signUpAndOnboard(pageA, emailA);

    // Author creates a post
    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Chat test post.");
    await pageA.click('button:has-text("Post")');
    await expect(pageA.locator("text=Chat test post.")).toBeVisible();

    // User B shows interest
    const pageB = await browser.newPage();
    const emailB = testEmail("chat-partner");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await expect(pageB.locator("text=Chat test post.")).toBeVisible();
    await pageB.click('button:has-text("I relate")');

    // Author opens interested list and starts chat
    await pageA.goto("/my-posts");
    await expect(pageA.locator("text=Chat test post.")).toBeVisible();
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');

    // Should navigate to chat
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });
    await expect(pageA.locator("text=Say hello")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("both participants can send messages", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("msg-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Message test post.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("msg-partner");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    // Get chat URL
    const chatUrlA = pageA.url();

    // Send message from A
    await pageA.fill('textarea[placeholder="Type a message…"]', "Hello from author!");
    await pageA.click('button[aria-label="Send message"]');
    await expect(pageA.locator("text=Hello from author!")).toBeVisible();

    // B navigates to the chat
    await pageB.goto(chatUrlA);
    await expect(pageB.locator("text=Hello from author!")).toBeVisible();

    // B replies
    await pageB.fill('textarea[placeholder="Type a message…"]', "Hello from partner!");
    await pageB.click('button[aria-label="Send message"]');
    await expect(pageB.locator("text=Hello from partner!")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("either participant can end the chat", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("end-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "End chat test post.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("end-partner");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    // End chat from A
    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=End chat');
    await pageA.click('button:has-text("End chat")'); // Confirm

    await expect(pageA.locator("text=This chat has ended.")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("rating modal appears after chat ends", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("rate-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Rate test post.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("rate-partner");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=End chat');
    await pageA.click('button:has-text("End chat")');

    await expect(pageA.locator("text=Rate the conversation")).toBeVisible();

    await pageA.close();
    await pageB.close();
  });

  test("user cannot send messages after chat ends", async ({ browser }) => {
    const pageA = await browser.newPage();
    const emailA = testEmail("ended-author");
    await signUpAndOnboard(pageA, emailA);

    await pageA.click('button[aria-label="Create post"]');
    await pageA.waitForSelector('textarea[placeholder="What\'s on your mind?"]');
    await pageA.fill('textarea[placeholder="What\'s on your mind?"]', "Ended chat test.");
    await pageA.click('button:has-text("Post")');

    const pageB = await browser.newPage();
    const emailB = testEmail("ended-partner");
    await signUpAndOnboard(pageB, emailB);
    await pageB.goto("/feed");
    await pageB.click('button:has-text("I relate")');

    await pageA.goto("/my-posts");
    await pageA.click('text=View interested');
    await pageA.waitForURL(/\/posts\/.*\/interested/);
    await pageA.click('button:has-text("Start chat")');
    await pageA.waitForURL(/\/chats\//, { timeout: 10000 });

    await pageA.click('button[aria-label="Chat options"]');
    await pageA.click('text=End chat');
    await pageA.click('button:has-text("End chat")');

    // Composer should be replaced with ended notice
    await expect(pageA.locator("text=This chat has ended.")).toBeVisible();
    await expect(pageA.locator('textarea[placeholder="Type a message…"]')).not.toBeVisible();

    await pageA.close();
    await pageB.close();
  });
});
