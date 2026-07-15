import { test, expect } from "@playwright/test";

/**
 * RC-106 — floating click-to-chat widget.
 *
 * The widget is a client component but Next SSRs it, so its channel links must
 * appear in the RAW server HTML (not injected only after hydration). We assert
 * against the raw response for both locales, and confirm the collapsed shell
 * (the toggle button) is present in the rendered page.
 */

const DIGITS = "37376837180";

for (const path of ["/", "/ru"]) {
  test(`chat links render server-side on ${path}`, async ({ request }) => {
    const res = await request.get(path);

    // /ru is provided by RC-004; skip (don't fail) if that base isn't present.
    test.skip(
      res.status() === 404,
      `${path} returned 404 — RC-004 (i18n routing) not in this base`,
    );
    expect(res.status()).toBe(200);

    const html = await res.text();
    expect(html, "WhatsApp link missing from server HTML").toContain(
      `wa.me/${DIGITS}`,
    );
    expect(html, "Viber link missing from server HTML").toContain(
      `viber://chat?number=%2B${DIGITS}`,
    );
    expect(html, "tel: fallback missing from server HTML").toContain(
      `tel:+${DIGITS}`,
    );
  });
}

test("collapsed toggle is present and expands the channel links", async ({
  page,
}) => {
  await page.goto("/");

  // Collapsed shell: the toggle button carries an accessible label.
  const toggle = page.getByRole("button", { name: /chat/i });
  await expect(toggle).toBeVisible();

  // The channel links exist in the DOM even while collapsed (SSR requirement),
  // but are pulled out of the tab order until opened.
  const whatsapp = page.locator('a[href*="wa.me"]');
  await expect(whatsapp).toHaveCount(1);
  await expect(whatsapp).toHaveAttribute("tabindex", "-1");

  await toggle.click();
  await expect(whatsapp).toHaveAttribute("tabindex", "0");
});
