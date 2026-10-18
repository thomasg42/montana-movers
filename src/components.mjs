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
    ['Tell Kyle what’s on your mind', 'Where are you headed? What are you moving? Share the date and details you have so far.'],
    ['Ask for your free estimate', 'Send your move details to Kyle so he can put an estimate together.'],
    ['Talk through the next step', 'Discuss your move with Kyle before making your plan.'],
  ];
}

export function stepsList(ctx, steps = howSteps()) {
  return `<ol class="flow">${steps.map(([t, d], i) =>
    `<li class="reveal" style="--i:${i}"><span class="flow-n">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>`;
}

export function faqs(ctx) {
  const { SITE } = ctx;
  const line = ctx.serviceLine;
  return [
    ['What does Montana Movers do?', `Montana Movers is a moving company in ${SITE.areaPhrase}. ${line}.`],
    ['Where do you work from?', `${SITE.city}, ${SITE.region}. ${SITE.areaPhrase}.`],
    ['Do you offer a free estimate?', `Yes. Send the move details or call ${SITE.phone.display}.`],
    ['Can I talk to someone about my move?', `Yes. Call or text Kyle Robinson at ${SITE.phone.display}. Tell him what you have in mind.`],
    ['What is the tagline?', SITE.tagline],
  ];
}
