// Page sections. Service cards render only live (PUBLIC / STATED) items from config.

export function serviceCards(ctx) {
  const scenes = { home: 'moving-day', apartment: 'moving-day', office: 'montana-arrival', 'long-distance': 'montana-road' };
  const icons = { home: 'home', apartment: 'building', office: 'box', 'long-distance': 'road' };
  return `<div class="cards">${ctx.services.map((s, i) => `
    <a class="card service-card reveal" style="--i:${i}" href="${ctx.link(s.slug)}">
      <img class="service-card-photo" src="${ctx.asset(`photos/${scenes[s.id]}.webp`)}" alt="" width="1200" height="800" loading="lazy">
      <span class="card-ico">${ctx.icon(icons[s.id] || 'truck')}</span>
      <h3>${s.name}</h3>
      <p>${s.lead}</p>
      <span class="card-foot"><span class="card-more">Learn more${ctx.icon('arrow')}</span></span>
    </a>`).join('')}
  </div>`;
}

export function howSteps() {
  return [
    ['Tell us the move', 'Where you are starting, where you are going, and the day.'],
    ['Get a free estimate', 'Kyle gets the request and sends an estimate.'],
    ['Move day', 'Montana Movers does the move.'],
  ];
}

export function stepsList(ctx, steps = howSteps()) {
  return `<ol class="flow">${steps.map(([t, d], i) =>
    `<li class="reveal" style="--i:${i}"><span class="flow-n">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;
}

export function photoSlot(ctx, { kind, note }) {
  const src = kind === 'truck' ? 'photos/montana-road.webp' : 'photos/moving-day.webp';
  const label = kind === 'truck' ? 'Illustrative mountain-road moving scene. Not Kyle’s truck.' : 'Illustrative moving-day scene. Not a customer home.';
  return `<figure class="photo-slot">
    <img src="${ctx.asset(src)}" alt="${label}" width="1200" height="800" loading="lazy">
    <figcaption>${label}</figcaption>
  </figure>`;
}

export function faqs(ctx) {
  const { SITE } = ctx;
  const line = ctx.serviceLine;
  return [
    ['What does Montana Movers do?', `Montana Movers is a moving company in ${SITE.areaPhrase}. ${line}.`],
    ['Where do you work from?', `${SITE.city}, ${SITE.region}. ${SITE.areaPhrase}.`],
    ['Do you offer a free estimate?', `Yes. Send the move details or call ${SITE.phone.display}.`],
    ['Who should I talk to?', `Kyle Robinson. Call or text ${SITE.phone.display}.`],
    ['What is the tagline?', SITE.tagline],
  ];
}
