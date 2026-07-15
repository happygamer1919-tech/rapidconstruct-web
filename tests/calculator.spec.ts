import { test, expect } from "@playwright/test";

/**
 * RC-107 roof calculator page + lead form smoke tests.
 *
 * Covers the ticket's definition of done: the page renders server-side in both
 * locales, the live estimate produces a numeric range for a real config, the
 * lead form validates on the server (submitting without a phone shows an error),
 * and the honeypot rejects bot submissions.
 */

test.describe("roof calculator page", () => {
  test("/calculator-acoperis responds 200 with a single H1 (RO)", async ({
    request,
  }) => {
    const res = await request.get("/calculator-acoperis");
    expect(res.status()).toBe(200);
    const html = await res.text();
    // Service JSON-LD is emitted server-side (SEO/GEO surface).
    expect(html).toContain('"@type":"Service"');
    // Material prices are present in server-rendered HTML (crawlable facts).
    expect(html).toContain("lei/m²");
    // Exactly one H1.
    expect((html.match(/<h1[\s>]/g) ?? []).length).toBe(1);
  });

  test("/ru/calculator-acoperis responds 200 (RU)", async ({ request }) => {
    const res = await request.get("/ru/calculator-acoperis");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('lang="ru"');
    expect(html).toContain("лей/м²");
  });

  test("10x10 + first material shows a numeric range", async ({ page }) => {
    await page.goto("/calculator-acoperis");

    await page.fill('input[name="lungime"]', "10");
    await page.fill('input[name="latime"]', "10");
    await page.getByTestId("to-material").click();

    await page.getByTestId("material-card").first().click();
    await page.getByTestId("to-result").click();

    const range = page.getByTestId("calc-range");
    await expect(range).toBeVisible();
    // The range must contain digits (a real estimate, not a placeholder).
    await expect(range).toHaveText(/\d/);
  });

  test("lead submit without a phone shows a validation error", async ({
    page,
  }) => {
    await page.goto("/calculator-acoperis");
    await page.fill('input[name="lungime"]', "10");
    await page.fill('input[name="latime"]', "10");
    await page.getByTestId("to-material").click();
    await page.getByTestId("material-card").first().click();
    await page.getByTestId("to-result").click();

    // Fill name, leave phone empty, submit.
    await page.fill('input[name="nume"]', "Ion Testu");
    await page.getByRole("button", { name: /trimite/i }).click();

    await expect(page.locator('input[name="telefon"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });

  test("a filled honeypot is rejected (no success shown)", async ({ page }) => {
    await page.goto("/calculator-acoperis");
    await page.fill('input[name="lungime"]', "10");
    await page.fill('input[name="latime"]', "10");
    await page.getByTestId("to-material").click();
    await page.getByTestId("material-card").first().click();
    await page.getByTestId("to-result").click();

    await page.fill('input[name="nume"]', "Bot");
    await page.fill('input[name="telefon"]', "+373 79 123 456");
    await page.locator('input[name="website"]').fill("http://spam.example", {
      force: true,
    });
    await page.getByRole("button", { name: /trimite/i }).click();

    await expect(page.locator('[role="alert"]').first()).toBeVisible();
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });
});
