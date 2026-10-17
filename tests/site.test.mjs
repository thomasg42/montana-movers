// Run: node --test tests/site.test.mjs  (from website/)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import { SITE, liveServices } from '../site.config.mjs';
import { PAGES } from '../src/pages.mjs';
import { makeCtx, renderPage } from '../src/layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(here, '..');
const DOCS = join(WEB, 'docs');
const require = createRequire(import.meta.url);
const Core = require('../src/assets/mm-core.js');

function loadLinkedom() {
  for (const p of ['linkedom', resolve(WEB, '../../../../cortana-ui/node_modules/linkedom')]) {
    try { return require(p); } catch { /* try next */ }
  }
  return null;
}
const linkedom = loadLinkedom();
const parse = (html) => linkedom.parseHTML(html);

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const htmlFiles = walk(DOCS).filter((p) => p.endsWith('.html'));
const pages = htmlFiles.map((file) => {
  const html = readFileSync(file, 'utf8');
  return { file, rel: relative(DOCS, file), html, document: linkedom ? parse(html).document : null };
});
const visibleText = (document) => {
  const body = document.querySelector('body').cloneNode(true);
  body.querySelectorAll('script, style, svg').forEach((n) => n.remove());
  return body.textContent;
};

test('linkedom is available (DOM checks need it)', () => assert.ok(linkedom, 'linkedom not found; keep cortana-ui/node_modules'));

test('docs/ is exactly what build.mjs produces (nobody hand-edited the output)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'mm-build-'));
  try {
    execFileSync(process.execPath, [join(WEB, 'build.mjs'), '--out', tmp], { stdio: 'pipe' });
    const a = walk(tmp).map((p) => relative(tmp, p)).sort();
    const b = walk(DOCS).map((p) => relative(DOCS, p)).sort();
    assert.deepEqual(b, a, 'file list differs; run node build.mjs');
    for (const f of a) assert.ok(readFileSync(join(tmp, f)).equals(readFileSync(join(DOCS, f))), `${f} is stale; run node build.mjs`);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('docs/ never contains review/ or test-clip files', () => {
  const rels = walk(DOCS).map((p) => relative(DOCS, p));
  for (const r of rels) {
    assert.ok(!/review|test-clip/i.test(r), r);
  }
  const html = pages.map((p) => p.html).join('\n');
  assert.ok(!/review\/test-clip|BEAT 1|TEST CLIP/i.test(html), 'test-clip markers leaked into HTML');
});

test('every page: one h1, title <= 60, description 110-160, canonical, og image, valid JSON-LD', () => {
  const titles = new Set(), descs = new Set();
  for (const p of pages) {
    const d = p.document;
    assert.equal(d.querySelectorAll('h1').length, 1, `${p.rel}: needs exactly one h1`);
    const title = d.querySelector('title').textContent;
    assert.ok(title.length <= 60, `${p.rel}: title ${title.length} chars: ${title}`);
    const desc = d.querySelector('meta[name="description"]').getAttribute('content');
    assert.ok(desc.length >= 110 && desc.length <= 160, `${p.rel}: description ${desc.length} chars: ${desc}`);
    assert.ok(!titles.has(title), `${p.rel}: duplicate title`); titles.add(title);
    assert.ok(!descs.has(desc), `${p.rel}: duplicate description`); descs.add(desc);
    const canon = d.querySelector('link[rel="canonical"]').getAttribute('href');
    assert.ok(canon.startsWith(SITE.url), `${p.rel}: canonical ${canon}`);
    assert.ok(d.querySelector('meta[property="og:image"]'), `${p.rel}: og:image`);
    assert.equal(d.querySelector('html').getAttribute('lang'), 'en-US');
    d.querySelectorAll('script[type="application/ld+json"]').forEach((s) => assert.doesNotThrow(() => JSON.parse(s.textContent), `${p.rel}: bad JSON-LD`));
    const robots = d.querySelector('meta[name="robots"]');
    if (!SITE.launched || p.rel === '404.html') assert.ok(robots && /noindex/.test(robots.getAttribute('content')), `${p.rel}: preview must be noindex`);
    else assert.ok(!robots, `${p.rel}: launched page must be indexable`);
  }
});

test('home page carries MovingCompany schema with the confirmed NAP only', () => {
  const d = pages.find((p) => p.rel === 'index.html').document;
  const ld = [...d.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent));
  const biz = ld.find((o) => o['@type'] === 'MovingCompany');
  assert.ok(biz);
  assert.equal(biz.telephone, '+1-406-589-3496');
  assert.equal(biz.address.addressLocality, 'Bozeman');
  assert.equal(biz.address.addressRegion, 'MT');
  assert.ok(!biz.address.streetAddress, 'no street until Kyle confirms one');
  assert.ok(!('openingHoursSpecification' in biz));
  assert.ok(!('aggregateRating' in biz));
  const names = biz.hasOfferCatalog.itemListElement.map((o) => o.itemOffered.name);
  assert.deepEqual(names, liveServices().map((s) => s.name));
});

test('rendered service pages match the confirmed config items', () => {
  const live = liveServices();
  assert.ok(live.length >= 1);
  for (const s of live) {
    assert.ok(pages.some((p) => p.rel === `${s.slug}/index.html`), `missing ${s.slug}`);
  }
  for (const blocked of SITE.services.filter((s) => s.status === 'UNCONFIRMED')) {
    assert.ok(!pages.some((p) => p.rel === `${blocked.slug}/index.html`), `UNCONFIRMED ${blocked.id} leaked a page`);
    for (const p of pages) {
      const hrefs = [...p.document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
      assert.ok(!hrefs.some((h) => h && h.includes(`/${blocked.slug}/`)), `${p.rel} links to UNCONFIRMED ${blocked.slug}`);
    }
  }
});

test('every internal link and asset resolves to a built file', () => {
  const base = SITE.url.replace(/\/$/, '') + '/';
  for (const p of pages) {
    const refs = [...p.document.querySelectorAll('a[href], link[href], script[src], img[src], source[srcset], video[data-src-16x9], video[data-src-9x16], video[poster]')]
      .flatMap((n) => ['href', 'src', 'srcset', 'data-src-16x9', 'data-src-9x16', 'poster'].map((a) => {
        const v = n.getAttribute(a);
        return v ? { attr: a, ref: v } : null;
      }).filter(Boolean));
    for (const item of refs) {
      if (/^(tel:|sms:|mailto:|#|https?:)/.test(item.ref)) continue;
      const parts = (item.attr === 'srcset' ? item.ref.split(',') : [item.ref]).map((s) => s.trim().split(' ')[0]);
      for (let one of parts) {
        const isAbs = one.startsWith(base);
        if (isAbs) one = one.slice(base.length) || './';
        else if (/^https?:/.test(one)) continue;
        const clean = one.split('#')[0].split('?')[0];
        if (!clean) continue;
        let target = isAbs || p.rel === '404.html' ? join(DOCS, clean) : resolve(dirname(p.file), clean);
        if (clean.endsWith('/') || clean === '.' || clean === './') target = join(target, 'index.html');
        assert.ok(existsSync(target), `${p.rel}: broken link ${one}`);
      }
    }
  }
});

test('every page gives a path to Kyle: free-estimate, call, and text', () => {
  for (const p of pages) {
    const hrefs = [...p.document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    assert.ok(hrefs.some((h) => /free-estimate\/(\?|$)/.test(h)), `${p.rel}: no free-estimate link`);
    assert.ok(hrefs.includes('tel:+14065893496'), `${p.rel}: no call link`);
    assert.ok(hrefs.some((h) => h.startsWith('sms:+14065893496')), `${p.rel}: no text link`);
    for (const h of hrefs.filter((x) => x.startsWith('tel:'))) assert.equal(h, 'tel:+14065893496');
  }
});

test('copy rules: no em or en dashes anywhere a visitor reads', () => {
  for (const p of pages) {
    const text = visibleText(p.document) + p.document.querySelector('title').textContent
      + p.document.querySelector('meta[name="description"]').getAttribute('content');
    assert.ok(!/[—–]/.test(text), `${p.rel}: contains an em/en dash`);
  }
});

test('claims gate: no fabricated demo copy, no UNCONFIRMED words, only Kyle\'s phone', () => {
  const banned = /\b(555|UNCONFIRMED|guarantee|insured|licensed|background|#1|best|most trusted|interstate|out-of-state|out of state)\b/i;
  for (const p of pages) {
    const t = visibleText(p.document) + ' ' + p.document.querySelector('title').textContent
      + ' ' + p.document.querySelector('meta[name="description"]').getAttribute('content');
    assert.ok(!banned.test(t), `${p.rel}: banned claim in ${t.match(banned)}`);
    assert.ok(!/\$/.test(t), `${p.rel}: dollar sign`);
    assert.ok(!/★|⭐|\b(stars?|reviews)\b/.test(t.toLowerCase()), `${p.rel}: rating copy`);
    const phones = t.match(/\b\d{3}[-.)\s]+\d{3}[-.\s]?\d{4}\b/g) || [];
    for (const ph of phones) {
      const digits = ph.replace(/\D/g, '');
      assert.ok(digits === '4065893496' || digits === '14065893496', `${p.rel}: unexpected phone ${ph}`);
    }
  }
});

test('sitemap lists every indexable page; robots follows launched', () => {
  const sm = readFileSync(join(DOCS, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, PAGES.filter((p) => p.inSitemap !== false && !p.noindex).length);
  assert.ok(!locs.some((l) => l.includes('404')));
  const robots = readFileSync(join(DOCS, 'robots.txt'), 'utf8');
  if (!SITE.launched) assert.match(robots, /Disallow: \//);
  else assert.match(robots, /Sitemap:/);
});

test('hero: one h1 inside the hero, beats 1-3, no autoplay, muted playsinline, start poster, static end still', () => {
  const d = pages.find((p) => p.rel === 'index.html').document;
  const hero = d.querySelector('[data-hero-slot="out-of-the-mess"]');
  assert.ok(hero);
  const h1 = hero.querySelector('h1');
  assert.ok(h1);
  assert.equal(d.querySelectorAll('h1').length, 1);
  assert.match(h1.textContent, /Montana Movers/);
  assert.match(h1.textContent, /Bozeman/);
  assert.ok(hero.querySelector('[data-beat="1"]'));
  assert.ok(hero.querySelector('[data-beat="2"]'));
  assert.ok(hero.querySelector('[data-beat="3"]'));
  assert.match(hero.querySelector('[data-beat="1"]').textContent, /Moving day looks like this/);
  const v = hero.querySelector('video[data-hero-video]');
  assert.ok(v);
  assert.ok(!v.hasAttribute('autoplay'));
  for (const a of ['muted', 'playsinline']) assert.ok(v.hasAttribute(a), a);
  assert.match(v.getAttribute('poster') || '', /mm-hero-start-16x9/);
  assert.ok(hero.querySelector('.hero-poster-start img[src*="mm-hero-start"]'));
  assert.ok(hero.querySelector('.hero-poster-end img[src*="mm-hero-end"]'));
  const css = readFileSync(join(WEB, 'src/assets/site.css'), 'utf8');
  assert.match(css, /html:not\(\.js-motion\) \.hero-beat-3/);
  assert.match(css, /\.hero-poster-end \{ opacity: 1/);
  const style = h1.getAttribute('style') || '';
  assert.ok(!/display:\s*none|visibility:\s*hidden/.test(style));
  assert.ok(!/display:\s*none/.test(d.querySelector('[data-beat="3"]').outerHTML));
});

test('home first section after the hero keeps the keywords visible', () => {
  const d = pages.find((p) => p.rel === 'index.html').document;
  const h2 = d.querySelector('#what-we-do h2');
  assert.ok(h2);
  assert.match(h2.textContent, /Bozeman and nearby towns/);
  assert.ok(d.querySelector('a.skip-intro[href="#what-we-do"]'));
});

test('free-estimate form contract', () => {
  const d = pages.find((p) => p.rel === 'free-estimate/index.html').document;
  const form = d.querySelector('form#estimate-form');
  assert.ok(form);
  for (const n of ['name', 'phone']) assert.ok(form.querySelector(`[name="${n}"]`).hasAttribute('required'), `${n} required`);
  for (const n of ['name', 'phone', 'email', 'details']) assert.ok(form.querySelector(`[name="${n}"]`).getAttribute('maxlength'), `${n} maxlength`);
  const pat = form.querySelector('[name="phone"]').getAttribute('pattern');
  assert.doesNotThrow(() => new RegExp(`^(?:${pat})$`, 'v'));
  assert.ok(new RegExp(`^(?:${pat})$`, 'v').test('406-589-3496'));
  assert.ok(!new RegExp(`^(?:${pat})$`, 'v').test('abc'));
  assert.ok(form.querySelector('.hp input[name="company"]'), 'honeypot');
  assert.equal(form.querySelector('button').getAttribute('type'), 'submit');
  if (!SITE.leadEndpoint) assert.ok(!form.hasAttribute('action'), 'no endpoint: form must not post anywhere');
  else assert.equal(form.getAttribute('action'), SITE.leadEndpoint);
  const types = [...form.querySelectorAll('[name="type"] option')].map((o) => o.value).filter(Boolean);
  assert.deepEqual(types.sort(), [...liveServices().map((s) => s.id), 'unsure'].sort());
});

test('validation refuses empty name/phone and bad email', () => {
  const ok = { name: 'Sam', phone: '406-589-3496', email: '' };
  assert.deepEqual(Core.validate(ok), {});
  assert.ok(Core.validate({ ...ok, phone: 'abc' }).phone);
  assert.ok(Core.validate({ ...ok, email: 'not-an-email' }).email);
  assert.deepEqual(Object.keys(Core.validate({})).sort(), ['name', 'phone']);
});

test('the message Kyle receives has the move facts', () => {
  const m = Core.message({ name: ' Sam ', phone: '406-589-3496', type: 'office', movingFrom: 'Bozeman', movingTo: 'Butte', details: 'Desks' });
  for (const s of ['Sam', '406-589-3496', 'Office moves', 'Bozeman', 'Butte', 'Desks']) assert.ok(m.includes(s), s);
  assert.ok(Core.smsHref('+14065893496', m).startsWith('sms:+14065893496?&body='));
});

function bootForm({ search = '', endpoint = '', fetchImpl } = {}) {
  let html = readFileSync(join(DOCS, 'free-estimate/index.html'), 'utf8');
  if (endpoint) html = html.replace('data-endpoint=""', `data-endpoint="${endpoint}"`);
  const { window, document } = parse(html);
  const form = document.getElementById('estimate-form');
  form.elements = { namedItem: (n) => form.querySelector(`[name="${n}"]`) };
  form.querySelectorAll('select').forEach((sel) => {
    let v = '';
    Object.defineProperty(sel, 'value', { get: () => v, set: (x) => { v = String(x); } });
  });
  const proto = Object.getPrototypeOf(document.body);
  if (!proto.scrollIntoView) proto.scrollIntoView = () => {};
  const calls = [];
  const ctx = vm.createContext({
    window, document, console, URLSearchParams, Date, JSON, Object, Math, Promise, String, parseInt, isFinite,
    requestAnimationFrame: (f) => f(0),
    fetch: (url, opts) => { calls.push({ url, opts }); return fetchImpl ? fetchImpl(url, opts) : Promise.resolve({ ok: true, status: 200 }); },
  });
  window.location = { search, href: 'https://example.test/free-estimate/' + search };
  window.matchMedia = () => ({ matches: false });
  window.scrollY = 0;
  window.addEventListener = window.addEventListener || (() => {});
  window.MM_CONFIG = JSON.parse(readFileSync(join(DOCS, 'assets/config.js'), 'utf8').match(/MM_CONFIG = (.*);/)[1]);
  window.MMCore = Core;
  vm.runInContext(readFileSync(join(DOCS, 'assets/site.js'), 'utf8'), ctx);
  const fill = (vals) => Object.entries(vals).forEach(([k, v]) => {
    const el = form.querySelector(`[name="${k}"]`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v;
  });
  const submit = () => form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  return { document, form, fill, submit, calls };
}
const GOOD = { name: 'QA Probe', phone: '406-589-3496', details: 'Office desks' };
const tick = () => new Promise((r) => setTimeout(r, 0));

test('form: prefills move type from a service page link', () => {
  const { form } = bootForm({ search: '?type=office' });
  assert.equal(form.querySelector('[name="type"]').value, 'office');
});

test('form: empty submit shows errors and sends nothing', () => {
  const b = bootForm();
  b.submit();
  assert.equal(b.calls.length, 0);
  assert.ok(b.document.querySelectorAll('.field.is-invalid').length >= 2);
  assert.equal(b.document.getElementById('form-handoff').hidden, true);
});

test('form: no endpoint hands the visitor a prefilled text to Kyle', () => {
  const b = bootForm();
  b.fill(GOOD);
  b.submit();
  assert.equal(b.calls.length, 0);
  assert.equal(b.document.getElementById('form-handoff').hidden, false);
  const sms = b.document.getElementById('handoff-sms').getAttribute('href');
  assert.ok(sms.startsWith('sms:+14065893496?&body=') && decodeURIComponent(sms).includes('QA Probe'));
  assert.equal(b.form.querySelector('[name="name"]').value, 'QA Probe');
});

test('form: with an endpoint, success shows thanks; double submit posts once', async () => {
  const b = bootForm({ endpoint: 'https://hooks.example.test/mm' });
  b.fill(GOOD);
  b.submit(); b.submit();
  await tick();
  assert.equal(b.calls.length, 1);
  assert.equal(JSON.parse(b.calls[0].opts.body).name, 'QA Probe');
  assert.equal(b.document.getElementById('form-thanks').hidden, false);
});

test('form: a 500 from the backend shows the error and keeps every value', async () => {
  const b = bootForm({ endpoint: 'https://hooks.example.test/mm', fetchImpl: () => Promise.resolve({ ok: false, status: 500 }) });
  b.fill(GOOD);
  b.submit();
  await tick(); await tick();
  assert.equal(b.document.getElementById('form-thanks').hidden, true);
  assert.equal(b.document.getElementById('form-error').hidden, false);
  assert.equal(b.form.querySelector('[name="details"]').value, 'Office desks');
  assert.equal(b.form.querySelector('button[type="submit"]').disabled, false);
});

test('form: honeypot filled = quiet fake success, nothing posted', async () => {
  const b = bootForm({ endpoint: 'https://hooks.example.test/mm' });
  b.fill({ ...GOOD, company: 'spam co' });
  b.submit();
  await tick();
  assert.equal(b.calls.length, 0);
});
