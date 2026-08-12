import { expect, test } from "@playwright/test";

test("health API is up", async ({ request }) => {
  const res = await request.get("/api/v1/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test("landing renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText(/platform for modern teams|Master Template|Get started/i);
});

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("body")).toContainText(/account|sign|password|email/i);
});
