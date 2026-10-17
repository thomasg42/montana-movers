# Cursor prompt — Montana Movers website build

Written 2026-10-17 by Lane 1 Claude Code. Paste everything below the line into Cursor.

---

You are Lane 3 (Cursor). Build the new Montana Movers website. Montana Movers is Kyle Robinson's moving company in Bozeman, MT, and an active Forever Gold AI client. Why it matters: this site becomes Kyle's main source of moving leads and FGA's next portfolio piece. It has to look premium, rank locally, never lose a lead, and never print a claim Kyle has not made.

WHAT THOMAS ASKED FOR (2026-10-17)
The hero is a video: a garage full of boxes and household stuff everywhere. As the visitor scrolls, the video moves forward inside the hero. The video ends by showing the brand name and what Montana Movers does. When the video is done, the page scrolls on to the rest of the site. Same look as our latest site, Bridger Bayworks. SEO ready.

READ FIRST, IN ORDER
1. `AGENTS.md`, `.cursor/rules/lane3-trust-protocol.mdc`, `FGA-AIOS/organization/00-FILE-PLACEMENT-RULES.md`.
2. Cross-lane check: the newest entries in `FGA-AIOS/model-routing/session-handoff.md` and today's `wiki/conversations/<date>.md`. If another lane has touched `FGA-AIOS/clients/montana-movers/website/`, stop and tell Thomas what you found before building.
3. `wiki/builds/local-business-website-seo-blueprint.md` and `wiki/builds/bridger-bayworks-diy-garage-website.md`.
4. The site you copy: `FGA-AIOS/clients/bridger-bayworks/website/` (`README.md`, `HERO-SLOT.md`, `site.config.mjs`, `build.mjs`, `src/`, `tests/`, `tools/`, `deploy-preview.sh`). Open `review/2026-10-04-1440-home-top.png` and `review/2026-10-04-390-home-top.png`. That is the look.
5. Montana Movers: `FGA-AIOS/clients/montana-movers/00-START-HERE.md`, `context/three-ps.md`, and `context/product-facts.md`. product-facts is the claims gate: every word the site prints must trace to it. Logo files: `marketing/meta-ads/v2-identity-simple/source/assets/`.
6. The hero brief: `FGA-AIOS/clients/montana-movers/marketing/website-hero-video/00-SHOT-BRIEF.md` (beats, timings, asset names). Codex makes the clip separately. You never generate imagery.

A. STRUCTURE
Copy Bridger's zero-dependency generator into `FGA-AIOS/clients/montana-movers/website/` and rebrand it. Do not copy Bridger's `docs/`, `review/`, photos, hero clip or logo. Every fact lives in `site.config.mjs` and traces to product-facts. Services are a config list with a status per item; the build renders only PUBLIC/STATED items, and an UNCONFIRMED item gets no page, no link and no schema. `launched: false` (noindex + robots Disallow) until Kyle confirms the domain and facts. Never edit `docs/` by hand.

B. LOOK
Keep Bridger's design system as is: Barlow Condensed 800 uppercase display, Barlow body, dark header with logo left, nav, yellow CTA; full-bleed hero with text over the clip under a light tint (never a solid side panel); paper sections, photo cards, CTA band, footer, sticky phone bar (Call / Text / Free estimate). Swap the palette to Kyle's logo colors: graphite from the card, Montana sky blue from the state fill and phone text, white. Keep Bridger's yellow CTA; it also matches the gold CTA in Kyle's v2 ads. Starting tokens, refine by sampling the logo, every text pair WCAG AA:
`--graphite-900 #16191E  --graphite-800 #1F242B  --graphite-700 #2B3139  --sky #7FB6E8  --sky-600 #2F6FAE  --sky-200 #DCEBF8  --paper #F2F0EA  --white #FBFAF7  --ink #1D232B  --ink-soft #4B5563  --yellow #F2C230  --yellow-600 #E0AE16`
Logo: the only file is a photo of Kyle's business card (`montana-movers-logo-source.png`; cleaned crop `montana-movers-logo-card.png`). It is unreadable at header size, so the header uses a text wordmark "MONTANA MOVERS" over "Bozeman, MT" beside a simple Montana state outline icon (Thomas's own branding direction from June). Show the real card at a readable size in About and the footer. Never redraw or "improve" Kyle's logo.

C. HERO, THE SIGNATURE MOVE: "OUT OF THE MESS"
- Story revised by Thomas on 2026-10-17. The "Current revision" at the top of the shot brief wins over anything older, including earlier copies of this prompt.
- The clip (from Codex): 16:9, silent, one 12 s source (Codex may also make a 10 s retime; read the duration from the file, never hardcode it). It opens in a clean but packed garage and pans to the open door, travels out, the ramp lowers and the belongings move intact into the white truck and stack neatly, the ramp folds up and the door closes, then the truck drives away while the camera rises above the house to a Montana river and mountains. The end frame keeps clean space for the brand. It scrubs with scroll and never autoplays.
- Port Bridger's scrubber (`bootHeroScrub` in `src/assets/site.js` plus the `.hero` CSS): offscreen muted video drawn to a canvas, poster first, loads only when reduced motion and Save-Data are off, scroll track live from first paint. Do not write a second scrubber.
- Track length is one CSS variable (start at 260svh desktop, 220svh phones). Scroll progress 0 to 0.85 plays the whole clip; 0.85 to 1.0 holds the last frame so the brand reveal sits still and the buttons are easy to hit. Then the pin releases and the page scrolls on normally. Never auto-scroll, snap or lock the page.
- Captions are real HTML over the clip, text from config, timed as fractions of the clip so any duration works. Draft wording, claims-safe; Thomas can change it in config. Never imply an inspection, a guarantee or an arrival the clip doesn't show.
  - Clip 0 to 30% (clutter): "Moving day looks like this." (display style, a `<p>`, not a heading), with a small scroll cue.
  - 30 to 60% (neat loading): "We'll take it from here."
  - 60 to 80% (ramp up, door shut): "Loaded and ready to roll."
  - 80 to 100% (departure, river reveal): "On to the new place."
  - Brand reveal, fading in near the clip's end and holding: the page's only `<h1>`: "Montana Movers" + "Moving company in Bozeman, MT"; tagline "We move anywhere, anytime."; what we do, built from the confirmed services: "Home moves · Apartment moves · Office moves · Long-distance moves"; buttons "Get a free estimate" (yellow, to `free-estimate/`) and "Call 406-589-3496" (`tel:+14065893496`).
  - Desktop: captions lower left over a light tint, Bridger style; the brand reveal in the clean space the end frame keeps for it. Phones: captions low over a bottom-up scrim; the brand reveal's h1 and tagline in that clean space, its buttons low and clear of the sticky bar. Keep the departing truck visible in the center phone crop. If a screenshot shows text covering the truck, move the text.
- The header (wordmark, phone, Free estimate) shows from first paint, so a visitor who never scrolls still knows who this is. Add a "Skip intro" link to the first section after the hero.
- Fallbacks: a synchronous head script adds `js-motion` only when motion is allowed and Save-Data is off. Without it (reduced motion, no JS, Save-Data) the hero is one screen tall, shows the END still with the brand reveal fully visible, and has no track. If the clip never loads while the visitor is still at the top, drop to that static hero (Bridger's logic). The h1 is always in the DOM and never `display:none` or `visibility:hidden`.
- Asset names (Codex delivers them to `marketing/website-hero-video/web/`; copy them into `src/assets/hero/`): `mm-hero-scrub-16x9.mp4`; `mm-hero-scrub-9x16.mp4` (center crop, picked in JS with `matchMedia('(orientation: portrait)')`); `mm-hero-start-16x9.webp|jpg` and `mm-hero-start-9x16.webp|jpg` (first frame = poster = LCP image: preload with `fetchpriority="high"`, set width and height); `mm-hero-end-16x9.webp|jpg` and `mm-hero-end-9x16.webp|jpg` (last frame: static hero and social image base).
- Until Codex's files exist: write `tools/make-test-clip.sh` (ffmpeg) that makes a 12 s 1920x1080 test clip, its 9:16 crop and both stills with a large timestamp and "CAPTION 1-4" / "BRAND" markers, saved under `review/test-clip/` and loaded only by a local dev flag. Tune the beat timing with it. A test fails if anything from `review/` or any test-clip file reaches `docs/`.
- Poster alt text describes the scene. Never caption the clip as Kyle's truck, crew or a customer's home.

D. PAGES AND SEO
Bridger's per-page SEO contract: unique title of 60 characters or less, description 110 to 160, canonical, Open Graph + Twitter card, one h1, JSON-LD that parses, breadcrumbs on inner pages.
- `/` moving company in Bozeman, MT. Title: "Montana Movers | Moving Company in Bozeman, MT".
- `/home-moving/` home movers in Bozeman.
- `/apartment-moving/` apartment movers in Bozeman.
- `/office-moving/` office and commercial movers in Bozeman.
- `/long-distance-moving/` long-distance moves from Bozeman, anywhere in Montana. Never say out-of-state or interstate: that needs Kyle's USDOT/MC numbers first.
- `/how-it-works/` steps + FAQ with FAQPage schema; answers only from product-facts.
- `/about/` Kyle, the real logo card, the tagline. No invented history.
- `/free-estimate/` the conversion page.
- `/404.html`.
No pages for packing, storage, labor-only or individual towns: all UNCONFIRMED. Say "Bozeman and nearby towns", never a town list.
The first section after the hero opens with a visible h2 that says what Montana Movers does in Bozeman and nearby towns (from config). The hero h1 is transparent until the reveal, so this keeps the core keywords visible to Google and to anyone who skips the intro.
JSON-LD: `MovingCompany` with name, url, telephone `+1-406-589-3496`, logo, image (end still), slogan, `address` with only addressLocality Bozeman, addressRegion MT, addressCountry US (no street; service-area business until Kyle says otherwise), `areaServed` Bozeman (City) + Montana (State), `hasOfferCatalog` with the four services. `Service` schema on each service page. No hours, prices, ratings or reviews (none confirmed). sitemap.xml and robots.txt follow `launched`. Social image 1200x630 made from the end still with the wordmark drawn by your code as real text.
Performance: the start poster is the LCP (200 KB WebP or less); the clip loads after first paint; fonts preconnect + swap; images WebP with width and height. If you can run Lighthouse, target mobile Performance 90+, SEO 100, Accessibility 95+.
Other images: frames from the hero clip and `marketing/meta-ads/v2-identity-simple/source/assets/04-anywhere-anytime.png` (truck on a Montana highway, no people). Do not use the v2 images that show people as if they were Kyle's crew or customers. Leave clearly marked slots for Kyle's real crew and truck photos.
Copy: short, plain, local. No em or en dashes. No "best", "#1", "most trusted", guarantees, insurance, licensing, damage-free, on-time, response times, crew size, years, prices, reviews or testimonials. Wording that makes a promise goes into `review/00-CURRENT-copy-for-kyle.md` for Kyle's OK, not onto the site.
Never reuse anything from the June 2026 demo in the `thomasg42/montana-movers` repo: its phone number, prices, reviews and testimonials were invented (list in product-facts, "Never publish").

E. LEAD PATH
Every page ends in a path to Kyle: a free-estimate link plus `tel:` and `sms:` links on every page (test-enforced) and the sticky bar. Form on `/free-estimate/`: name (required), phone (required), email, move date, moving from, moving to, move type (the confirmed services + "Not sure"), details, honeypot. Service pages prefill the move type (`free-estimate/?type=office`). `leadEndpoint` stays empty: a valid submit shows "Last step: send it to Kyle" with a prefilled text to 406-589-3496 and a call button, so nothing is silently dropped (Bridger's pattern). When an endpoint is set, POST JSON with Bridger's failure handling: only `r.ok` shows thanks; an error keeps every value and offers the text.
Speed-to-lead connects at go-live (Thomas, 2026-10-17). The webhook in the client records (`https://tggai.app.n8n.cloud/webhook/montana-movers-speed-to-lead`) is NOT registered: on 2026-10-17 no Montana Movers workflow existed in n8n, so it gets built first. Do not wire anything. Keep the endpoint config ready; at go-live Thomas approves, then the blocking `tools/site-qa/site-qa.mjs` gate runs. Draft a consent line for that call (call/text, including automated calls) in the copy-for-Kyle file, marked DRAFT.

F. TESTS
Port Bridger's suite and adapt it. Add:
- Hero: one h1, inside the hero, containing "Montana Movers" and "Bozeman"; captions 1 to 4 and the brand reveal present; no `autoplay`; video `muted playsinline`; poster is the start still; the static fallback shows the end still with the brand reveal.
- Claims: `docs/` contains no "555", "UNCONFIRMED", "$", star ratings, "guarantee", "insured", "licensed", "background", "#1", "best", "most trusted", "interstate" or "out-of-state", and the only phone number is 406-589-3496.
- Services rendered equal the confirmed config items.
- SEO contract per page; sitemap/robots versus `launched`; a path to Kyle on every page; form behaviour in the DOM shim; `docs/` never hand-edited; no test clip in `docs/`.

G. VERIFY BEFORE YOU REPORT
`node build.mjs && node --test tests/site.test.mjs`, all green. Run `tools/site-qa/site-qa.mjs` against a local build. The backend happy path is expected to fail while `leadEndpoint` is empty: report it, don't hide it. Screenshots at 390x844 and 1440x900 at scroll progress 0, 0.5 and 1.0, plus reduced motion. Check keyboard tab order through the hero, back navigation, and no horizontal scroll. Save screenshots and results in `website/review/`.

H. PUBLISHING IS THOMAS'S CALL
Prepare `deploy-preview.sh` from Bridger's, for `thomasg42/montana-movers`. That repo exists and still holds the June 2026 demo (fake 555 phone number, invented prices, fake reviews and testimonials). Thomas paused it on 2026-10-17: GitHub Pages is off and the URL returns 404. He wants it gone for good once the new site ships, so do not tag or archive it. The first deploy replaces its files and turns Pages back on from `main:/docs` (Bridger's script already enables Pages when it is off), using a deploy clone outside FGA-Brain at `~/Documents/montana-movers-site`. Do not push or run it until Thomas says publish. When it goes live, add the URL to `FGA-AIOS/command-center/registry.json` in the same piece of work (read `FGA-AIOS/command-center/README.md`; new business bubble `montana-movers`; note "noindex preview, replaces June 2026 demo").

I. DOCS
`website/README.md` (how it's built + launch checklist, like Bridger's), `website/HERO-SLOT.md` (hero status and tuning), `website/review/00-CURRENT-build-report.md`. Update the current-work list in `FGA-AIOS/clients/montana-movers/00-START-HERE.md` (newest first), add a handoff entry at the top of `FGA-AIOS/model-routing/session-handoff.md`, and log today's `wiki/conversations/<date>.md`.

STOP AND ASK THOMAS ONLY FOR: pushing or publishing, wiring the lead endpoint, any wording that is not in product-facts, and buying or connecting a domain.

DONE = the site builds from `site.config.mjs`, all tests pass, site-qa ran and is reported, screenshots at both widths and three scroll points are in `review/`, the hero runs on the test clip and switches to Codex's files by dropping them into `src/assets/hero/`, nothing is published, and the handoff is written.
REPORT: files changed, the test pass/fail lines, the site-qa summary, screenshot paths, and the open items for Kyle. Claim only what you verified on disk.
