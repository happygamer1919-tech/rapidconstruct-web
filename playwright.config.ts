import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for RapidConstruct CI smoke tests (RC-007).
 *
 * The webServer does a real production build + start, so the smoke suite
 * exercises the same output CI and Vercel ship. Locally it reuses an already
 * running server; on CI it always builds fresh and never reuses.
 */
const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Never let a stray `test.only` pass silently on CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["list"]]
    : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // Production build + start can be slow on a cold CI runner.
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
