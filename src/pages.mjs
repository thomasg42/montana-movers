// Every page. Facts from ../site.config.mjs. Claims must trace to ../../context/product-facts.md.
// Only live services (PUBLIC / STATED) get a page. Every page ends in a path to Kyle.

import {
  crumbs, pageHero, ctaBand, businessSchema, breadcrumbSchema, serviceSchema,
  faqSchema, faqList, logoCard,
} from './layout.mjs';
import { liveServices } from '../site.config.mjs';
import { serviceCards, stepsList, photoSlot, faqs, howSteps } from './components.mjs';

function heroMedia(ctx) {
  const startAlt = ctx.SITE.hero.posterAlt;
  const endAlt = ctx.SITE.hero.endAlt;
  const poster = (kind) => `
    <picture class="hero-poster hero-poster-${kind}">
      <source media="(orientation: portrait)" type="image/webp" srcset="${ctx.asset('hero/mm-hero-' + kind + '-9x16.webp')}">
      <source media="(orientation: portrait)" type="image/jpeg" srcset="${ctx.asset('hero/mm-hero-' + kind + '-9x16.jpg')}">
      <source type="image/webp" srcset="${ctx.asset('hero/mm-hero-' + kind + '-16x9.webp')}">
      <img src="${ctx.asset('hero/mm-hero-' + kind + '-16x9.jpg')}" alt="${kind === 'start' ? startAlt : endAlt}" width="${kind === 'start' ? 1920 : 1920}" height="${kind === 'start' ? 1080 : 1080}" ${kind === 'start' ? 'fetchpriority="high"' : ''} decoding="async">
    </picture>`;
  const videoAttrs = ctx.hasHeroVideo
    ? ` data-src-16x9="${ctx.asset('hero/mm-hero-scrub-16x9.mp4')}" data-src-9x16="${ctx.asset('hero/mm-hero-scrub-9x16.mp4')}"`
    : '';
  return `<div class="hero-media" aria-hidden="true">
    ${poster('start')}
    ${poster('end')}
    <canvas class="hero-canvas" data-hero-canvas></canvas>
    <video class="hero-video" data-hero-video poster="${ctx.asset('hero/mm-hero-start-16x9.jpg')}" muted playsinline preload="none" disablepictureinpicture tabindex="-1"${videoAttrs}></video>
  </div>`;
}

const home = {
  slug: '',
  title: 'Montana Movers | Moving Company in Bozeman, MT',
  description: 'Montana Movers is a moving company in Bozeman, MT. Home, apartment, office, and long-distance moves. Get a free estimate or call 406-589-3946.',
  bodyClass: 'page-home',
  schema: (ctx) => [
    businessSchema(ctx),
    { '@context': 'https://schema.org', '@type': 'WebSite', name: ctx.SITE.name, url: ctx.abs(''), publisher: { '@id': ctx.abs('#business') } },
  ],
  body: (ctx) => {
    const { SITE } = ctx;
    const f = faqs(ctx);
    return `
<section class="hero" data-hero-slot="out-of-the-mess" aria-labelledby="hero-title">
  ${heroMedia(ctx)}
  <div class="hero-inner">
    <a class="skip-intro" href="#what-we-do">Skip intro</a>
    <div class="hero-beat hero-beat-1" data-beat="1">
      <p class="hero-line">Moving day looks like this.</p>
      <p class="scroll-cue">Scroll</p>
    </div>
    <div class="hero-beat hero-beat-2" data-beat="2">
      <p class="hero-line">We'll take it from here.</p>
    </div>
    <div class="hero-beat hero-beat-3 is-on" data-beat="3">
      <div class="hero-reveal-copy">
        <h1 id="hero-title">Montana Movers <span class="hero-sub">Moving company in Bozeman, MT</span></h1>
        <p class="hero-tagline">${SITE.tagline}</p>
        <p class="hero-what">${ctx.serviceLine}</p>
      </div>
      <div class="hero-reveal-actions btn-row">
        <a class="btn btn-yellow btn-lg" href="${ctx.estimate()}"><span>Get a free estimate</span></a>
        <a class="btn btn-ghost-light" href="${ctx.tel}">${ctx.icon('phone')}<span>Call ${SITE.phone.display}</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section section-paper" id="what-we-do" aria-labelledby="do-title">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="kicker">${SITE.tagline}</p>
      <h2 id="do-title">Moving in Bozeman and nearby towns? Let’s talk.</h2>
      <p class="section-lead">Moving in Bozeman or nearby? Tell Kyle what you’re moving, where you’re headed, and what you need help figuring out.</p>
    </div>
    ${serviceCards(ctx)}
  </div>
</section>

<section class="section section-white" aria-labelledby="steps-title">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="kicker">Start with a conversation</p>
      <h2 id="steps-title">Sometimes you need an expert’s advice.</h2>
    </div>
    <p class="section-lead advice-intro">You don’t have to figure out every detail before you call. Talk your move through with Kyle, or send what you know for a free estimate.</p>
    ${stepsList(ctx)}
    <p class="center reveal"><a class="text-link" href="${ctx.link('how-it-works')}">More on how it works${ctx.icon('arrow')}</a></p>
  </div>
</section>

<section class="section section-paper" aria-labelledby="road-title">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">Where are you headed?</p>
      <h2 id="road-title">Anywhere, anytime</h2>
      <p class="section-lead">A new place brings plenty of questions. Tell Kyle where you’re starting and where you want to go. Start there.</p>
      <div class="btn-row">
        <a class="btn btn-sky" href="${ctx.estimate()}"><span>Get a free estimate</span></a>
      </div>
    </div>
    <figure class="road-photo reveal">
      <img src="${ctx.asset('photos/highway-truck-4x5.webp')}" alt="A white box truck on a Montana highway with mountains ahead. Illustrative. Not Kyle's truck." width="1200" height="1500" loading="lazy">
      <figcaption>Illustrative. Not Kyle's truck or a customer's job.</figcaption>
    </figure>
  </div>
</section>

<section class="section section-white" aria-labelledby="faq-title">
  <div class="wrap narrow">
    <div class="section-head reveal">
      <p class="kicker">You might be wondering</p>
      <h2 id="faq-title">A few answers before you call.</h2>
    </div>
    ${faqList(f.slice(0, 3), 1)}
    <p class="center reveal"><a class="text-link" href="${ctx.link('how-it-works')}#faq">More answers${ctx.icon('arrow')}</a></p>
  </div>
</section>

${ctaBand(ctx)}`;
  },
};

function servicePage(svc) {
  return {
    slug: svc.slug,
    crumb: svc.name,
    title: svc.title,
    description: svc.description,
    bodyClass: 'page-inner',
    schema: (ctx) => [
      serviceSchema(ctx, { name: svc.name, serviceType: svc.name, description: svc.lead }),
      breadcrumbSchema(ctx, svc.name),
    ],
    body: (ctx) => {
      const f = faqs(ctx);
      return `${crumbs(ctx, svc.name)}
${pageHero(ctx, {
  kicker: svc.kicker,
  h1: svc.h1,
  lead: svc.lead,
  cta: 'Get a free estimate',
  ctaParams: { type: svc.id },
})}
<section class="section section-paper">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">${ctx.SITE.areaPhrase}</p>
      <h2>Let’s talk about your move.</h2>
      <p class="section-lead">${svc.lead}</p>
      <ul class="ticks">
        <li>${ctx.icon('check')}<span>${ctx.SITE.city}, ${ctx.SITE.region}</span></li>
        <li>${ctx.icon('check')}<span>${ctx.SITE.areaPhrase}</span></li>
        <li>${ctx.icon('check')}<span>Free estimate</span></li>
        <li>${ctx.icon('check')}<span>${ctx.SITE.tagline}</span></li>
      </ul>
    </div>
    <div class="price-card reveal">
      <p class="kicker">Talk to Kyle</p>
      <p class="price-big">${ctx.SITE.phone.display}</p>
      <a class="btn btn-yellow btn-block" href="${ctx.estimate({ type: svc.id })}"><span>Get a free estimate</span></a>
      <a class="btn btn-outline btn-block" href="${ctx.tel}">${ctx.icon('phone')}<span>Call Kyle</span></a>
    </div>
  </div>
</section>
<section class="section section-white">
  <div class="wrap">
    <div class="section-head reveal"><h2>What are you moving?</h2></div>
    ${serviceCards(ctx)}
  </div>
</section>
<section class="section section-paper">
  <div class="wrap narrow">
    <div class="section-head reveal"><h2>${svc.name} questions</h2></div>
    ${faqList([f[0], f[2], f[3]])}
  </div>
</section>
${ctaBand(ctx, { params: { type: svc.id } })}`;
    },
  };
}

const how = {
  slug: 'how-it-works',
  crumb: 'How it works',
  title: 'How a Move Works | Montana Movers, Bozeman MT',
  description: 'How a move with Montana Movers works in Bozeman, MT. Tell Kyle the plan, get a free estimate, then move. Call 406-589-3946 or send the form.',
  bodyClass: 'page-inner',
  schema: (ctx) => [faqSchema(faqs(ctx)), breadcrumbSchema(ctx, 'How it works')],
  body: (ctx) => {
    const f = faqs(ctx);
    return `${crumbs(ctx, 'How it works')}
${pageHero(ctx, {
  kicker: 'Simple steps',
  h1: 'How a Move Works',
  lead: 'Got a date, an address, or just a few questions? Start by telling Kyle what you know.',
})}
<section class="section section-paper">
  <div class="wrap">
    <div class="section-head reveal">
      <p class="kicker">One conversation at a time</p>
      <h2>Here’s where to start.</h2>
    </div>
    ${stepsList(ctx, howSteps())}
  </div>
</section>
<section class="section section-white" id="faq">
  <div class="wrap narrow">
    <div class="section-head reveal">
      <p class="kicker">Your questions, answered</p>
      <h2>Questions</h2>
    </div>
    ${faqList(f, 1)}
  </div>
</section>
${ctaBand(ctx)}`;
  },
};

const about = {
  slug: 'about',
  crumb: 'About',
  title: 'About Montana Movers | Moving Company, Bozeman MT',
  description: 'About Montana Movers, Kyle Robinson\'s moving company in Bozeman, MT. We move anywhere, anytime. Get a free estimate or call 406-589-3946.',
  bodyClass: 'page-inner',
  schema: (ctx) => [
    { '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Montana Movers', url: ctx.abs('about/'), about: { '@id': ctx.abs('#business') } },
    breadcrumbSchema(ctx, 'About'),
  ],
  body: (ctx) => {
    const { SITE } = ctx;
    return `${crumbs(ctx, 'About')}
${pageHero(ctx, {
  kicker: SITE.tagline,
  h1: 'Kyle Robinson. Montana Movers.',
  lead: `Moving in ${SITE.areaPhrase}? Talk to Kyle about your date, your destination, and the questions on your mind.`,
})}

<section class="section section-white">
  <div class="wrap split">
    <div class="reveal">
      <p class="kicker">A look at moving day</p>
      <h2>From boxes to open roads.</h2>
      <p class="section-lead">These scenes illustrate moving day. Photos of Kyle’s actual truck and crew have not been supplied yet.</p>
    </div>
    <div class="stack">
      ${photoSlot(ctx, { kind: 'crew', note: 'Waiting on a photo Kyle took.' })}
      ${photoSlot(ctx, { kind: 'truck', note: 'Waiting on a photo of the actual truck.' })}
    </div>
  </div>
</section>
${ctaBand(ctx, { title: 'Talk to Kyle.' })}`;
  },
};

const estimate = {
  slug: 'free-estimate',
  crumb: 'Free estimate',
  title: 'Free Moving Estimate | Montana Movers, Bozeman',
  description: 'Get a free moving estimate from Montana Movers in Bozeman, MT. Tell Kyle the date and both addresses, or call 406-589-3946.',
  bodyClass: 'page-inner page-estimate',
  schema: (ctx) => [
    businessSchema(ctx),
    { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Free estimate', url: ctx.abs('free-estimate/'), about: { '@id': ctx.abs('#business') } },
    breadcrumbSchema(ctx, 'Free estimate'),
  ],
  body: (ctx) => {
    const { SITE, esc } = ctx;
    const endpoint = SITE.leadEndpoint;
    const typeOptions = [
      ...ctx.services.map((s) => `<option value="${s.id}">${s.name}</option>`),
      '<option value="unsure">Not sure</option>',
    ].join('');
    return `${crumbs(ctx, 'Free estimate')}
<section class="reserve-hero">
  <div class="wrap">
    <p class="kicker">Free estimate</p>
    <h1>Get a Free Estimate</h1>
    <p class="lead">Tell Kyle what you know so far. Your name and phone are enough to start; add your date and addresses if you have them.</p>
  </div>
</section>
<section class="section section-paper section-tight">
  <div class="wrap reserve-grid">
    <div class="form-card">
      <form id="estimate-form" class="reserve-form" method="post"${endpoint ? ` action="${esc(endpoint)}"` : ''} novalidate data-endpoint="${esc(endpoint)}">
        <div class="hp" aria-hidden="true"><label for="f-company">Company</label><input id="f-company" type="text" name="company" tabindex="-1" autocomplete="off"></div>
        <div class="field">
          <label for="f-name">Name <b aria-hidden="true">*</b></label>
          <input id="f-name" type="text" name="name" required maxlength="80" autocomplete="name">
        </div>
        <div class="field">
          <label for="f-phone">Phone <b aria-hidden="true">*</b></label>
          <input id="f-phone" type="tel" name="phone" required maxlength="20" pattern="[0-9\\s\\(\\)\\.\\+\\-]{10,20}" inputmode="tel" autocomplete="tel" aria-describedby="f-phone-hint">
          <small id="f-phone-hint">Kyle calls or texts this number.</small>
        </div>
        <div class="field">
          <label for="f-email">Email <span class="opt">(optional)</span></label>
          <input id="f-email" type="email" name="email" maxlength="120" autocomplete="email">
        </div>
        <div class="field">
          <label for="f-date">Move date <span class="opt">(optional)</span></label>
          <input id="f-date" type="date" name="date">
        </div>
        <div class="field">
          <label for="f-from">Moving from <span class="opt">(optional)</span></label>
          <input id="f-from" type="text" name="movingFrom" maxlength="120" autocomplete="off">
        </div>
        <div class="field">
          <label for="f-to">Moving to <span class="opt">(optional)</span></label>
          <input id="f-to" type="text" name="movingTo" maxlength="120" autocomplete="off">
        </div>
        <div class="field full">
          <label for="f-type">Move type</label>
          <select id="f-type" name="type">
            <option value="">Choose one</option>
            ${typeOptions}
          </select>
        </div>
        <div class="field full">
          <label for="f-details">Details <span class="opt">(optional)</span></label>
          <textarea id="f-details" name="details" maxlength="2000" rows="5" placeholder="Stairs, a piano, a date that cannot move."></textarea>
        </div>
        <div class="field full">
          <button class="btn btn-yellow btn-lg btn-block" type="submit"><span>Send to Kyle</span></button>
        </div>
      </form>
      <noscript><p class="panel panel-warn">This form needs JavaScript. Call or text Kyle at <a href="${ctx.tel}">${SITE.phone.display}</a>.</p></noscript>
      <div class="panel panel-ok" id="form-thanks" hidden tabindex="-1">
        <h2>Sent. Kyle has it.</h2>
        <p>Need him sooner? Call or text <a href="${ctx.tel}">${SITE.phone.display}</a>.</p>
      </div>
      <div class="panel panel-handoff" id="form-handoff" hidden tabindex="-1">
        <h2>Last step: send it to Kyle</h2>
        <p>Your request is written up. Tap one to send it.</p>
        <div class="btn-row">
          <a class="btn btn-yellow btn-lg" id="handoff-sms" href="${ctx.sms}">${ctx.icon('chat')}<span>Text it to Kyle</span></a>
          <a class="btn btn-outline btn-lg" id="handoff-tel" href="${ctx.tel}">${ctx.icon('phone')}<span>Call ${SITE.phone.display}</span></a>
        </div>
        <p class="fine">Your details are still in the form above.</p>
      </div>
      <div class="panel panel-error" id="form-error" hidden role="alert" tabindex="-1">
        <h2>That did not send.</h2>
        <p>Your details are still in the form. Try again, or <a id="error-sms" href="${ctx.sms}">text Kyle</a> or call <a href="${ctx.tel}">${SITE.phone.display}</a>.</p>
      </div>
    </div>
    <aside class="reserve-side">
      <figure class="estimate-photo"><img src="${ctx.asset('photos/montana-road.webp')}" alt="Illustrative truck on a Montana mountain road. Not Kyle’s truck." width="1200" height="800" loading="lazy"><figcaption>Illustrative scene.</figcaption></figure>
      <div class="side-card">
        <h2 class="side-h">Got a question first?</h2>
        <a class="side-link" href="${ctx.tel}">${ctx.icon('phone')}<span><b>Call Kyle</b>${SITE.phone.display}</span></a>
        <a class="side-link" href="${ctx.sms}">${ctx.icon('chat')}<span><b>Text Kyle</b>${SITE.phone.display}</span></a>
      </div>
      <div class="side-card">
        <h2 class="side-h">What are you moving?</h2>
        <ul class="link-list">
          ${ctx.services.map((s) => `<li><a href="${ctx.link(s.slug)}">${ctx.icon('truck')}<span>${s.name}</span></a></li>`).join('')}
        </ul>
      </div>
    </aside>
  </div>
</section>`;
  },
};

const notFound = {
  slug: '404',
  file: '404.html',
  noindex: true,
  inSitemap: false,
  title: 'Page Not Found | Montana Movers',
  description: 'That page is not here. Head back to Montana Movers in Bozeman, MT, or get a free estimate. Call 406-589-3946 and Kyle will pick it up from there.',
  bodyClass: 'page-inner',
  body: (ctx) => `<section class="page-hero page-hero-short">
  <div class="wrap page-hero-inner">
    <p class="kicker kicker-light">404</p>
    <h1>Wrong turn.</h1>
    <p class="lead">That page is not here. The movers still are.</p>
    <div class="btn-row">
      <a class="btn btn-yellow btn-lg" href="${ctx.estimate()}"><span>Get a free estimate</span></a>
      <a class="btn btn-ghost-light btn-lg" href="${ctx.link('')}"><span>Home</span></a>
    </div>
  </div>
</section>`,
};

const servicePages = liveServices().map(servicePage);

export const PAGES = [home, ...servicePages, how, about, estimate, notFound];
