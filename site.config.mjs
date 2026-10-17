// Single source of truth for every fact the site prints. Edit here, then `node build.mjs`.
// Status of each fact lives in ../context/product-facts.md. Never add an UNCONFIRMED fact.

export const SITE = {
  name: 'Montana Movers',
  shortName: 'Montana Movers',
  owner: 'Kyle Robinson',
  tagline: 'We move anywhere, anytime.',

  // Preview URL until Kyle picks a domain. launched: false keeps every page noindex.
  url: 'https://thomasg42.github.io/montana-movers',
  customDomain: '',
  launched: false,

  phone: { display: '406-589-3496', e164: '+14065893496', schema: '+1-406-589-3496' },
  city: 'Bozeman',
  region: 'MT',
  country: 'US',
  areaPhrase: 'Bozeman and nearby towns',

  // Empty on purpose. Wiring the n8n speed-to-lead webhook needs Thomas first.
  // Intended later: https://tggai.app.n8n.cloud/webhook/montana-movers-speed-to-lead
  leadEndpoint: '',

  updated: '2026-10-17',
  assetVersion: '20261017-preview',

  hero: {
    duration: 12,
    holdFrom: 0.88,
    trackDesktop: '260svh',
    trackPhone: '220svh',
    posterAlt: 'Packed two-car garage with a clear path to an open door. Illustrative scene, not a customer home.',
    endAlt: 'A plain white moving truck on a driveway under Montana mountains and open sky. Illustrative scene, not Kyle\'s truck.',
  },

  // Only PUBLIC and STATED items get a page, a link, or schema. UNCONFIRMED is ignored.
  services: [
    {
      id: 'home',
      status: 'STATED',
      slug: 'home-moving',
      name: 'Home moves',
      short: 'Home moves',
      nav: 'Home',
      title: 'Home Movers in Bozeman, MT | Montana Movers',
      description: 'Home movers in Bozeman, MT. Montana Movers handles residential moves in Bozeman and nearby towns. Get a free estimate or call 406-589-3496.',
      h1: 'Home Movers in Bozeman, MT',
      lead: 'A house full of boxes is a home move. Tell us where you are going and when. We will send a free estimate.',
      kicker: 'Residential moving',
    },
    {
      id: 'apartment',
      status: 'STATED',
      slug: 'apartment-moving',
      name: 'Apartment moves',
      short: 'Apartment moves',
      nav: 'Apartment',
      title: 'Apartment Movers in Bozeman, MT | Montana Movers',
      description: 'Apartment movers in Bozeman, MT. Stairs, tight halls, a new lease date. Get a free estimate from Montana Movers or call 406-589-3496.',
      h1: 'Apartment Movers in Bozeman, MT',
      lead: 'Stairs, tight halls, and a date on the lease. Tell us the building and the day. We will send a free estimate.',
      kicker: 'Apartment moving',
    },
    {
      id: 'office',
      status: 'STATED',
      slug: 'office-moving',
      name: 'Office moves',
      short: 'Office moves',
      nav: 'Office',
      title: 'Office Movers in Bozeman, MT | Montana Movers',
      description: 'Office and commercial movers in Bozeman, MT. Desks, files, and a work week that cannot wait. Get a free estimate or call 406-589-3496.',
      h1: 'Office Movers in Bozeman, MT',
      lead: 'Desks, files, and a work week that has to keep moving. Tell us the offices and the day. We will send a free estimate.',
      kicker: 'Office and commercial',
    },
    {
      id: 'long-distance',
      status: 'STATED',
      slug: 'long-distance-moving',
      name: 'Long-distance moves',
      short: 'Long-distance moves',
      nav: 'Long distance',
      title: 'Long-Distance Moves from Bozeman | Montana Movers',
      description: 'Long-distance moves from Bozeman to anywhere in Montana. Montana Movers. Get a free estimate or call 406-589-3496 to talk through the trip.',
      h1: 'Long-Distance Moves from Bozeman',
      lead: 'A move from Bozeman to another town in Montana. Tell us both ends and the day. We will send a free estimate.',
      kicker: 'Across Montana',
    },
    { id: 'packing', status: 'UNCONFIRMED', slug: 'packing', name: 'Packing' },
    { id: 'storage', status: 'UNCONFIRMED', slug: 'storage', name: 'Storage' },
    { id: 'labor', status: 'UNCONFIRMED', slug: 'labor-only', name: 'Labor only' },
  ],
};

export const LIVE_STATUSES = new Set(['PUBLIC', 'STATED']);

export function liveServices(site = SITE) {
  return site.services.filter((s) => LIVE_STATUSES.has(s.status) && s.slug && s.title);
}

export function serviceLine(site = SITE) {
  return liveServices(site).map((s) => s.short).join(' · ');
}
