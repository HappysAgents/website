const { chromium, webkit } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3099';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14-pro', width: 393, height: 852 },
  { name: 'ipad-mini', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const pages = [
  { name: 'home', path: '/' },
  { name: 'posts', path: '/posts/' },
  { name: 'post-day-001', path: '/posts/day-001/' },
  { name: 'about', path: '/about/' },
];

async function run() {
  const browser = await chromium.launch();
  const errors = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    for (const pg of pages) {
      const url = BASE_URL + pg.path;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

        // Check horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        if (hasOverflow) {
          errors.push(`OVERFLOW: ${vp.name} ${pg.path}`);
        }

        const filename = `${vp.name}-${pg.name}.png`;
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, filename),
          fullPage: true,
        });
        console.log(`✓ ${filename}`);
      } catch (e) {
        errors.push(`ERROR: ${vp.name} ${pg.path}: ${e.message}`);
        console.error(`✗ ${vp.name} ${pg.path}:`, e.message);
      }
    }

    await context.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\n✓ All screenshots taken, no overflow detected.');
  }
}

run().catch(console.error);
