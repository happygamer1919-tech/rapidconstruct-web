import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-sm33xy-Projects-rapidconstruct-web/972a29ae-5034-4c37-b51c-f328e2f17177/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.goto("http://localhost:3800/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.addStyleTag({ content: "* { user-select: none !important; } main *:not(canvas) { pointer-events: none !important; } canvas { pointer-events: auto !important; }" });
await page.touchscreen.tap(330, 560);
await page.evaluate(() => window.scrollBy(0, 40));
await page.waitForTimeout(14000);
const cx = 330, cy = 560;
async function drag(dx, dy) {
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 20; i++) await page.mouse.move(cx + dx*i/20, cy + dy*i/20);
  await page.mouse.up(); await page.waitForTimeout(500);
}
await drag(-50, 150);
await drag(-120, 0); await drag(-120, 0); await drag(-120, 0); await drag(-120, 0);
await page.screenshot({ path: `${OUT}/fix_mobile4_rear.png` });
console.log("rear shot done");
await browser.close();
process.exit(0);
