const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3002';
const OUT_DIR = path.join(__dirname, 'review-screenshots');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 393, height: 852 },
];

const pages = [
  { name: 'home', path: '/' },
  { name: 'post', path: '/posts/day-001/' },
  { name: 'tags', path: '/tags/' },
  { name: 'tag-memory', path: '/tags/memory/' },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const pg of pages) {
      await page.goto(BASE_URL + pg.path, { waitUntil: 'networkidle' });
      const file = path.join(OUT_DIR, `${pg.name}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log('✓', file);
    }
    await ctx.close();
  }
  await browser.close();
})();
