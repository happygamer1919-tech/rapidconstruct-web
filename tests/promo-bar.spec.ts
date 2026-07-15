import { test, expect } from "@playwright/test";

/**
 * RC-110 — promo bar. Verifies the bar is server-rendered on both locales with
 * the right offer text, that dismissing it persists across a reload (localStorage
 * keyed by the offer id), and that the page hydrates without React warnings.
 */

test.describe("promo bar", () => {
  test("is visible on / with the RO offer text", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("#promo-bar");
    await expect(bar).toBeVisible();
    // Concrete, quotable facts must be in the bar copy.
    await expect(bar).toContainText("160 lei/m²");
    await expect(bar).toContainText("2026");
  });

  test("is visible on /ru with the RU offer text", async ({ page }) => {
    await page.goto("/ru");
    const bar = page.locator("#promo-bar");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("160 лей/м²");
    // Copy register: customer text uses "крыша", never the banned "кровля".
    await expect(bar).not.toContainText("кровл");
  });

  test("stays dismissed after clicking X and reloading", async ({ page }) => {
    await page.goto("/");
    const bar = page.locator("#promo-bar");
    await expect(bar).toBeVisible();

    await page.getByRole("button", { name: "Închide anunțul" }).click();
    await expect(bar).toHaveCount(0);

    // Reload: the pre-paint inline script hides it, React never remounts it.
    await page.reload();
    await expect(page.locator("#promo-bar")).toBeHidden();
  });

  test("hydrates without React warnings", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") problems.push(msg.text());
    });
    page.on("pageerror", (err) => problems.push(err.message));

    await page.goto("/");
    await expect(page.locator("#promo-bar")).toBeVisible();

    const hydrationIssues = problems.filter((m) =>
      /hydrat|did not match|server rendered/i.test(m),
    );
    expect(hydrationIssues, hydrationIssues.join("\n")).toEqual([]);
  });
});
