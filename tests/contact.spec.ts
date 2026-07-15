import { test, expect } from "@playwright/test";

/**
 * RC-105 contact page + lead form smoke tests.
 *
 * Covers the ticket's definition of done: the page renders server-side in both
 * locales, the form validates on the server (submitting without a phone shows an
 * error), and the honeypot rejects bot submissions (no success confirmation).
 */

test.describe("contact page", () => {
  test("/contact renders the form server-side (RO)", async ({ request }) => {
    const res = await request.get("/contact");
    expect(res.status()).toBe(200);
    const html = await res.text();
    // Form + fields must be in the server HTML (no client-only rendering).
    expect(html).toContain('name="nume"');
    expect(html).toContain('name="telefon"');
    expect(html).toContain('name="mesaj"');
    // ContactPage JSON-LD is emitted server-side.
    expect(html).toContain('"@type":"ContactPage"');
  });

  test("/ru/contact renders the form server-side (RU)", async ({ request }) => {
    const res = await request.get("/ru/contact");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('name="telefon"');
    expect(html).toContain('lang="ru"');
  });

  test("submitting without a phone shows a validation error", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.fill('input[name="nume"]', "Ion Testu");
    await page.fill('textarea[name="mesaj"]', "Am nevoie de o ofertă.");
    // Leave telefon empty.
    await page.getByRole("button", { name: /trimite/i }).click();

    // Server returns a field error; the invalid input is flagged and an alert
    // is shown. No success confirmation appears.
    await expect(page.locator('input[name="telefon"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });

  test("a filled honeypot is rejected (no success shown)", async ({ page }) => {
    await page.goto("/contact");
    await page.fill('input[name="nume"]', "Bot");
    await page.fill('input[name="telefon"]', "+373 79 123 456");
    await page.fill('textarea[name="mesaj"]', "spam spam spam");
    // The honeypot is off-screen; force-fill it as a bot would.
    await page.locator('input[name="website"]').fill("http://spam.example", {
      force: true,
    });
    await page.getByRole("button", { name: /trimite/i }).click();

    // Rejected: an error alert appears and the success panel never does.
    await expect(page.locator('[role="alert"]').first()).toBeVisible();
    await expect(page.locator('[role="status"]')).toHaveCount(0);
  });

  test("a valid submission shows the confirmation state", async ({ page }) => {
    await page.goto("/contact");
    await page.fill('input[name="nume"]', "Maria Client");
    await page.fill('input[name="telefon"]', "+373 79 123 456");
    await page.fill('textarea[name="mesaj"]', "Vreau o ofertă pentru acoperiș.");
    await page.getByRole("button", { name: /trimite/i }).click();

    // Success confirmation replaces the form (no email creds in CI → log path,
    // which still returns success per the delivery seam).
    await expect(page.locator('[role="status"]')).toBeVisible();
  });
});
