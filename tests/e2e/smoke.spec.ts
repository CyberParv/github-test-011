import { test, expect } from '@playwright/test';

/**
 * E2E smoke test for primary UI route.
 * Set E2E_BASE_URL (defaults to http://localhost:3000).
 */

test('home page loads and has a document title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\//);

  // Basic readiness check: DOM + title present.
  await expect(page.locator('html')).toBeVisible();
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});
