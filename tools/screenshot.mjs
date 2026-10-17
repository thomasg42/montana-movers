#!/usr/bin/env node
import { chromium } from '/Users/tg2.0/site-qa/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '../review');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

async function setProgress(page, p) {
  await page.evaluate((progress) => {
    const hero = document.querySelector('.hero');
    const media = document.querySelector('.hero-media');
    if (!hero || !media) return;
    const top = parseFloat(getComputedStyle(media).top) || 0;
    const scrollable = hero.offsetHeight - media.offsetHeight;
    window.scrollTo(0, Math.max(0, scrollable * progress));
  }, p);
  await page.waitForFunction((progress) => {
    const hero = document.querySelector('.hero');
    const video = document.querySelector('[data-hero-video]');
    if (!hero) return false;
    const shown = parseFloat(getComputedStyle(hero).getPropertyValue('--hero-p') || '0');
    if (Math.abs(shown - progress) > 0.05) return false;
    if (!video || !isFinite(video.duration) || video.duration <= 0) return true;
    if (progress <= 0) return video.currentTime < 0.35;
    const holdFrom = 0.88;
    const vp = progress >= holdFrom ? 1 : progress / holdFrom;
    const wanted = vp * Math.max(0, video.duration - 0.04);
    return Math.abs(video.currentTime - wanted) < 0.6;
  }, p, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(200);
}

const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.waitForSelector('.hero-canvas.is-ready, .hero.is-static', { timeout: 8000 }).catch(() => {});
  for (const p of [0, 0.5, 1]) {
    await setProgress(page, p);
    const name = `review/${new Date().toISOString().slice(0, 10)}-${vp.name}-home-p${String(p).replace('.', '')}.png`;
    const dest = join(OUT, `${vp.name}-home-p${String(p).replace('.', '')}.png`);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(dest);
  }
  // keyboard tab through hero
  await page.keyboard.press('Home');
  const order = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => {
      const el = document.activeElement;
      return (el && (el.innerText || el.getAttribute('aria-label') || el.tagName) || '').toString().slice(0, 40);
    }));
  }
  console.log(`tab-${vp.name}`, order.join(' > '));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`overflow-${vp.name}`, overflow);
  await ctx.close();

  const reduced = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'reduce',
  });
  const rp = await reduced.newPage();
  await rp.goto(BASE, { waitUntil: 'networkidle' });
  await rp.waitForTimeout(400);
  const dest = join(OUT, `${vp.name}-home-reduced.png`);
  await rp.screenshot({ path: dest, fullPage: false });
  console.log(dest);
  await reduced.close();
}
await browser.close();
