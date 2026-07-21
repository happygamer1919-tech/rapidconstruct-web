import { chromium } from "playwright";
import fs from "fs";

const OUT = "/private/tmp/claude-501/-Users-sm33xy-Projects-rapidconstruct-web/972a29ae-5034-4c37-b51c-f328e2f17177/scratchpad";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3800/", { waitUntil: "networkidle", timeout: 60000 });
await page.keyboard.press("Tab");          // arm useInteracted
await page.mouse.wheel(0, 60);             // arm via scroll, stay at hero
await page.waitForSelector("canvas", { timeout: 30000 });
await page.waitForTimeout(13000);          // let the build finish + settle

const c = await page.locator("canvas").first().boundingBox();
// drag over the house itself (right side) — the hero text overlay swallows drags at center-left
const cx = c.x + c.width * 0.72, cy = c.y + c.height * 0.5;

async function drag(dx, dy) {
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const steps = 25;
  for (let i = 1; i <= steps; i++) await page.mouse.move(cx + (dx * i) / steps, cy + (dy * i) / steps);
  await page.mouse.up();
  await page.waitForTimeout(700);
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: c });
  console.log("shot:", name);
}

// 1. street front — the hero default
await shot("angle1_front");
// 2. raised front-left: drag down to saturate polar at the raised clamp, slight left swing
await drag(-90, 150);
await shot("angle2_frontleft_raised");
// 3. raised front-right: swing across the front
await drag(185, 0);
await shot("angle3_frontright_raised");
// 4. rear raised: continue around the back
await drag(310, 0);
await shot("angle4_rear_raised");
// 5. rear 3/4: quarter more
await drag(105, 0);
await shot("angle5_rear34_raised");

console.log("console errors:", errors.length ? errors : "none");
await browser.close();
