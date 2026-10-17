// Page sections. Service cards render only live (PUBLIC / STATED) items from config.

export function serviceCards(ctx) {
  const icons = { home: 'home', apartment: 'building', office: 'box', 'long-distance': 'road' };
  return `<div class="cards">${ctx.services.map((s, i) => `
    <a class="card service-card reveal" style="--i:${i}" href="${ctx.link(s.slug)}">
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
  const src = kind === 'truck' ? 'photos/photo-slot-truck.webp' : 'photos/photo-slot-crew.webp';
  const label = kind === 'truck' ? 'Photo slot: Kyle\'s truck' : 'Photo slot: Kyle\'s crew';
  return `<figure class="photo-slot">
    <img src="${ctx.asset(src)}" alt="${label}. Real photo not supplied yet." width="1200" height="800" loading="lazy">
    <figcaption>${label}. ${note}</figcaption>
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
