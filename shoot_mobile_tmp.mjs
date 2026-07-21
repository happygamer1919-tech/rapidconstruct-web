import { chromium } from "playwright";
const OUT = "/private/tmp/claude-501/-Users-sm33xy-Projects-rapidconstruct-web/972a29ae-5034-4c37-b51c-f328e2f17177/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("http://localhost:3800/", { waitUntil: "networkidle", timeout: 60000 });
await page.addStyleTag({ content: "* { user-select: none !important; } main *:not(canvas) { pointer-events: none !important; } canvas { pointer-events: auto !important; }" });
await page.touchscreen.tap(330, 560);
await page.evaluate(() => window.scrollBy(0, 40));
await page.waitForTimeout(15000);
const cx = 330, cy = 560;
async function drag(dx, dy) {
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 20; i++) await page.mouse.move(cx + dx*i/20, cy + dy*i/20);
  await page.mouse.up(); await page.waitForTimeout(600);
}
await page.screenshot({ path: `${OUT}/fix_mobile1_front.png` });
await drag(-50, 150);
await page.screenshot({ path: `${OUT}/fix_mobile2_frontleft.png` });
await drag(-120, 0); await drag(-120, 0);
await page.screenshot({ path: `${OUT}/fix_mobile3_rearleft.png` });
await drag(-120, 0); await drag(-120, 0);
await page.screenshot({ path: `${OUT}/fix_mobile4_rear.png` });
console.log("mobile errors:", errors.length ? errors : "none");
await browser.close();
