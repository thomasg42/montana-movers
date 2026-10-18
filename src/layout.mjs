// Shared shell: <head> SEO, header wordmark, footer with real logo card, CTA band, JSON-LD.
// Copy rule: no em dashes, short sentences, every path leads to Kyle. Facts from site.config.mjs.

import { liveServices, serviceLine } from '../site.config.mjs';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function makeCtx(SITE, slug, opts = {}) {
  const base = SITE.url.replace(/\/$/, '');
  const depth = slug ? slug.split('/').filter(Boolean).length : 0;
  const root = opts.absolute ? `${base}/` : (depth ? '../'.repeat(depth) : './');
  const services = liveServices(SITE);
  return {
    SITE, slug, root, esc, services,
    serviceLine: serviceLine(SITE),
    hasHeroVideo: !!opts.hasHeroVideo,
    abs: (path = '') => `${base}/${path}`,
    link: (s) => (s ? `${root}${s}/` : root),
    estimate: (params) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return `${root}free-estimate/${q}`;
    },
    tel: `tel:${SITE.phone.e164}`,
    sms: `sms:${SITE.phone.e164}`,
    asset: (p) => `${root}assets/${p}?v=${SITE.assetVersion}`,
    assetBare: (p) => `${root}assets/${p}`,
    icon: (name, cls = 'ico') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`,
  };
}

// Simple Montana outline. Header icon only. Kyle's card is never redrawn.
export const stateMark = `<svg class="brand-state" viewBox="0 0 48 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.4 8.8 39.2 3.6l5.2 6.2v15.4l-6.4 3.6-9.2-.6-6.8-3.4L10.6 26 2.6 20.4Z"/></svg>`;

// Kyle's own logo: the "Montana Movers" mark cropped from his business card (phone and tagline removed).
export const brandWordmark = (ctx) =>
  `<img class="brand-logo" src="${ctx.asset('brand/montana-movers-logo.jpg')}" alt="Montana Movers" width="400" height="288" decoding="async">`;

export const logoCard = (ctx, { width = 400, height = 288, cls = 'logo-card' } = {}) =>
  `<img class="${cls}" src="${ctx.asset('brand/montana-movers-logo.jpg')}" alt="Montana Movers logo" width="${width}" height="${height}" loading="lazy" decoding="async">`;

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 16.5V7.5h11v9M13 10.5h4.5l3 3v3H13"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20H3z"/><path d="M9.5 20v-6h5v6"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><path d="M4 20V6h10v14M14 10h6v10"/><path d="M7 9.5h4M7 13h4M7 16.5h4M16.5 13.5h2M16.5 16.5h2"/></symbol>
<symbol id="i-road" viewBox="0 0 24 24"><path d="M9 3 5 21M15 3l4 18M12 6v3M12 12v3M12 18v2"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M3.5 8 12 4l8.5 4L12 12z"/><path d="M3.5 8v8L12 20V12M20.5 8v8L12 20"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 3.5h3.5l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5z"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-4.5 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M4.5 12.5l4.5 4.5 10.5-10.5"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/></symbol>
</defs></svg>`;

function head(ctx, page, schema) {
  const { SITE, esc } = ctx;
  const url = ctx.abs(page.file || (page.slug ? `${page.slug}/` : ''));
  const noindex = page.noindex || !SITE.launched;
  const ogImage = ctx.abs('assets/og-image.png') + '?v=' + encodeURIComponent(SITE.assetVersion);
  const ld = schema.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const start16 = ctx.assetBare('hero/mm-hero-start-16x9.webp');
  const preload = page.slug === ''
    ? `<link rel="preload" as="image" href="${start16}" fetchpriority="high" imagesrcset="${ctx.assetBare('hero/mm-hero-start-9x16.webp')} 1080w, ${start16} 1920w" imagesizes="100vw">\n`
    : '';
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<meta name="theme-color" content="#16191E">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="${ctx.asset('favicon.png')}" type="image/png">
<link rel="apple-touch-icon" href="${ctx.root}assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,800;1,800&family=Barlow:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${ctx.asset('site.css')}">
${preload}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(`${SITE.name}. ${SITE.city}, ${SITE.region}. ${SITE.tagline} Free estimate: ${SITE.phone.display}. Illustrative white truck and mountain landscape.`)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="geo.region" content="US-MT">
<meta name="geo.placename" content="${esc(SITE.city)}">
${ld}
<script>
(function(){
  document.documentElement.classList.add('js');
  var motion = false, save = false;
  try { motion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches; } catch (e) {}
  try { save = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}
  if (motion && !save) document.documentElement.classList.add('js-motion');
  setTimeout(function(){ if (!window.__mmReady) document.documentElement.classList.remove('js'); }, 3000);
})();
</script>
</head>`;
}

function header(ctx) {
  const { SITE } = ctx;
  const items = ctx.services.map((s) =>
    `<li><a href="${ctx.link(s.slug)}"${ctx.slug === s.slug ? ' aria-current="page"' : ''}>${s.nav}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="${ctx.link('')}" aria-label="${SITE.name}, home">
      ${brandWordmark(ctx)}
    </a>
    <nav class="nav" aria-label="Main">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"><span class="bars" aria-hidden="true"></span><span class="nav-toggle-label">Menu</span></button>
      <ul id="nav-menu" class="nav-menu">
        ${items}
        <li><a href="${ctx.link('how-it-works')}"${ctx.slug === 'how-it-works' ? ' aria-current="page"' : ''}>How it works</a></li>
        <li><a href="${ctx.link('about')}"${ctx.slug === 'about' ? ' aria-current="page"' : ''}>About</a></li>
        <li class="nav-cta"><a class="btn btn-yellow" href="${ctx.estimate()}"${ctx.slug === 'free-estimate' ? ' aria-current="page"' : ''}><span>Free estimate</span></a></li>
      </ul>
    </nav>
    <a class="header-phone" href="${ctx.tel}">${ctx.icon('phone')}<span>${SITE.phone.display}</span></a>
  </div>
</header>`;
}

export function crumbs(ctx, name) {
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol><li><a href="${ctx.link('')}">Home</a></li><li aria-current="page">${name}</li></ol></nav>`;
}

export function pageHero(ctx, { kicker, h1, lead, cta = 'Get a free estimate', ctaParams, photo }) {
  photo ||= { src: ctx.slug === 'long-distance-moving' ? 'photos/montana-road.webp' : ctx.slug === 'about' ? 'photos/montana-arrival.webp' : 'photos/moving-day.webp', alt: ctx.slug === 'long-distance-moving' ? 'Illustrative moving truck on a mountain road; not Kyle’s truck.' : ctx.slug === 'about' ? 'Illustrative truck beneath Montana mountains; not Kyle’s truck.' : 'Illustrative boxes ready for moving day; not a customer home.', w: 1200, h: 800, caption: 'Illustrative scene.' };
  const pic = photo
    ? `<figure class="page-hero-photo-frame"><img src="${ctx.asset(photo.src)}" alt="${photo.alt}" width="${photo.w}" height="${photo.h}" fetchpriority="high"><figcaption>${photo.caption}</figcaption></figure>`
    : '';
  return `<section class="page-hero${photo ? ' page-hero-photo' : ''}">
  <div class="wrap page-hero-inner">
    <div class="page-hero-copy">
      <p class="kicker kicker-light">${kicker}</p>
      <h1>${h1}</h1><p class="lead">${lead}</p>
      <div class="btn-row">
        <a class="btn btn-yellow btn-lg" href="${ctx.estimate(ctaParams)}"><span>${cta}</span></a>
        <a class="btn btn-ghost-light" href="${ctx.tel}">${ctx.icon('phone')}<span>Call ${ctx.SITE.phone.display}</span></a>
      </div>
    </div>
    ${pic}
  </div>
</section>`;
}

export function ctaBand(ctx, { title = 'Ready to move?', text, params } = {}) {
  const t = text || 'Tell Kyle where you are starting, where you are going, and when. He will send a free estimate.';
  return `<section class="cta-band" aria-labelledby="cta-title">
  <div class="wrap cta-inner reveal">
    <p class="kicker kicker-light">Talk to Kyle</p>
    <h2 id="cta-title">${title}</h2>
    <p>${t}</p>
    <div class="btn-row">
      <a class="btn btn-yellow btn-lg" href="${ctx.estimate(params)}"><span>Get a free estimate</span></a>
      <a class="btn btn-ghost-light btn-lg" href="${ctx.tel}">${ctx.icon('phone')}<span>Call ${ctx.SITE.phone.display}</span></a>
      <a class="btn btn-ghost-light btn-lg" href="${ctx.sms}">${ctx.icon('chat')}<span>Text Kyle</span></a>
    </div>
  </div>
</section>`;
}

function footer(ctx) {
  const { SITE } = ctx;
  const year = SITE.updated.slice(0, 4);
  const serviceLinks = ctx.services.map((s) => `<li><a href="${ctx.link(s.slug)}">${s.name}</a></li>`).join('');
  return `<footer class="site-footer">
  <div class="footer-body">
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <a class="brand brand-footer" href="${ctx.link('')}" aria-label="${SITE.name}, home">${brandWordmark(ctx)}</a>
        <p class="footer-tagline">${SITE.tagline}</p>
      </div>
      <div>
        <h2 class="footer-h">Moves</h2>
        <ul>
          ${serviceLinks}
          <li><a href="${ctx.link('how-it-works')}">How it works</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-h">Talk to Kyle</h2>
        <ul>
          <li><a href="${ctx.estimate()}">Free estimate</a></li>
          <li><a href="${ctx.tel}">${ctx.icon('phone')}<span>${SITE.phone.display}</span></a></li>
          <li><a href="${ctx.sms}">${ctx.icon('chat')}<span>Text Kyle</span></a></li>
          <li><a href="${ctx.link('about')}">About</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-h">Where</h2>
        <p class="footer-where">${ctx.icon('pin')}<span>${SITE.areaPhrase}</span></p>
        <p class="footer-where">${SITE.city}, ${SITE.region}</p>
      </div>
    </div>
    <div class="wrap legal">
      <span>&copy; ${year} ${SITE.name}</span>
      <span>${SITE.tagline}</span>
    </div>
  </div>
</footer>
<div class="mobile-bar" aria-label="Contact Kyle">
  <a href="${ctx.tel}">${ctx.icon('phone')}<span>Call</span></a>
  <a href="${ctx.sms}">${ctx.icon('chat')}<span>Text</span></a>
  <a class="mb-primary" href="${ctx.estimate()}"><span>Free estimate</span></a>
</div>`;
}

export function businessId(ctx) { return ctx.abs('#business'); }

export function businessSchema(ctx) {
  const { SITE } = ctx;
  return {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    '@id': businessId(ctx),
    name: SITE.name,
    url: ctx.abs(''),
    telephone: SITE.phone.schema,
    logo: ctx.abs('assets/brand/montana-movers-logo.jpg'),
    image: ctx.abs('assets/hero/mm-hero-end-16x9.jpg'),
    slogan: SITE.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    areaServed: [
      { '@type': 'City', name: SITE.city },
      { '@type': 'State', name: 'Montana' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Moving services',
      itemListElement: ctx.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: ctx.abs(`${s.slug}/`) },
      })),
    },
  };
}

export function breadcrumbSchema(ctx, name) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ctx.abs('') },
      { '@type': 'ListItem', position: 2, name, item: ctx.abs(`${ctx.slug}/`) },
    ],
  };
}

export function serviceSchema(ctx, { name, serviceType, description }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    url: ctx.abs(`${ctx.slug}/`),
    provider: { '@id': businessId(ctx) },
    areaServed: [
      { '@type': 'City', name: ctx.SITE.city },
      { '@type': 'State', name: 'Montana' },
    ],
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') },
    })),
  };
}

export function faqList(faqs, open = 0) {
  return `<div class="faq">${faqs.map(([q, a], i) =>
    `<details class="faq-item reveal"${i < open ? ' open' : ''}><summary><h3>${q}</h3></summary><div class="faq-a"><p>${a}</p></div></details>`).join('')}</div>`;
}

export function renderPage(ctx, page) {
  const schema = typeof page.schema === 'function' ? page.schema(ctx) : [];
  const body = page.body(ctx);
  return `${head(ctx, page, schema)}
<body class="${page.bodyClass || ''}">
<!-- Generated by website/build.mjs from website/src/. Edit the source, not this file. -->
${sprite}
${header(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
<script src="${ctx.asset('config.js')}"></script>
<script src="${ctx.asset('mm-core.js')}"></script>
<script src="${ctx.asset('site.js')}" defer></script>
</body>
</html>
`;
}
