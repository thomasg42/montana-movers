import { chromium } from '/Users/tg2.0/site-qa/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch();
const results=[];
for(const width of [390,1440]) {
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.route('https://fonts.gstatic.com/**',r=>r.abort());
 // This review is read-only; block every outbound POST, including the estimate webhook.
 await page.route('**/*',r=>r.request().method()==='POST' || /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort():r.continue());
 for(const slug of ['','home-moving/','apartment-moving/','office-moving/','long-distance-moving/','how-it-works/','about/','free-estimate/']) {
  await page.goto('http://127.0.0.1:8765/'+slug,{waitUntil:'load'});
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(im=>{im.loading='eager';return im.decode().catch(()=>{});})));
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));
  results.push({width,slug,...result});
  if(['','about/','home-moving/','long-distance-moving/','free-estimate/'].includes(slug))await page.screenshot({path:`review/imagery-${width}-${slug.replace('/','') || 'home'}.png`,fullPage:true});
 }
 await page.goto('http://127.0.0.1:8765/home-moving/', {waitUntil:'domcontentloaded'});
 if(width===390)await page.locator('.nav-toggle').click();
 await page.locator('a[href*="about/"]').first().click();await page.goBack({waitUntil:'domcontentloaded'});
 results.push({width,backNavigation:page.url().endsWith('/home-moving/')});
 await page.keyboard.press('Tab');results.push({width,keyboardFocus:await page.evaluate(()=>document.activeElement!==document.body)});
 await context.close();
}
await browser.close();
writeFileSync('review/imagery-browser-qa.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results));
if(results.some(r=>r.overflow||r.broken?.length||r.backNavigation===false||r.keyboardFocus===false))process.exitCode=1;
