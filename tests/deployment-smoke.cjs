'use strict';
// Checks the real public deployment; no game source is replaced or instrumented.
// PLAYWRIGHT_PATH may point to an external test-only installation.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const url = process.env.GAME_URL || 'https://after-hours-snake-xi.vercel.app/';
const out = path.join(__dirname, '../artifacts/ui');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const errors = [], passed = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.on('pageerror', error => errors.push(String(error)));
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.match(await page.title(), /AFTER HOURS/);
    assert(await page.locator('#overlay').isVisible());
    for (const asset of ['style.css', 'game.js']) {
      const response = await page.request.get(new URL(asset, url).href);
      assert.equal(response.status(), 200);
    }
    passed.push('Anonymous HTTPS access and browser assets return HTTP 200');
    await page.locator('[data-name="Electric cyan"]').click();
    assert.equal(await page.locator('#color-name').innerText(), 'ELECTRIC CYAN');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--snake')), '#53e5ee');
    await page.locator('#color-picker').fill('#f34abc');
    assert.equal(await page.locator('#color-name').innerText(), 'CUSTOM COLOR');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#color-picker').inputValue(), '#f34abc');
    passed.push('Preset and custom colors update immediately and survive reload');
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.locator('#start').click();
    assert(await page.locator('#overlay').isHidden());
    const initial = await page.evaluate(() => ({ ...snake[0] }));
    await page.clock.runFor(250);
    const moved = await page.evaluate(() => ({ ...snake[0] }));
    assert(moved.x > initial.x);
    await page.keyboard.press('ArrowUp');
    await page.clock.runFor(120);
    assert((await page.evaluate(() => snake[0].y)) < moved.y);
    await page.locator('#pause').click();
    assert.equal(await page.evaluate(() => state), 'paused');
    const paused = await page.evaluate(() => JSON.stringify(snake));
    await page.clock.runFor(300);
    assert.equal(await page.evaluate(() => JSON.stringify(snake)), paused);
    await page.locator('#start').click();
    assert.equal(await page.evaluate(() => state), 'playing');
    await page.clock.runFor(3000);
    assert.equal(await page.evaluate(() => state), 'over');
    assert(await page.locator('#overlay').isVisible());
    await page.locator('#restart').click();
    assert.equal(await page.evaluate(() => state), 'playing');
    await page.locator('#pause').click();
    passed.push('Start, animated movement, keyboard turn, pause, resume, wall collision, and restart');
    for (const width of [320, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1100 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    }
    passed.push('No page overflow at 320, 390, 768, 1440, and 1920 pixels');
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({ path: path.join(out, 'production-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.locator('.touch-controls').isVisible());
    await page.locator('#restart').click();
    await page.locator('[data-dir="up"]').dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch' });
    await page.clock.runFor(120);
    assert.equal(await page.evaluate(() => direction.y), -1);
    await page.locator('#pause').click();
    await page.screenshot({ path: path.join(out, 'production-mobile.png'), fullPage: true });
    passed.push('Mobile directional control changes the snake direction');
    assert.deepEqual(errors, []);
    const result = { date: new Date().toISOString(), url, passed, errors };
    fs.writeFileSync(path.join(out, 'deployment-smoke-results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
