# Montana Movers — website

Multi-page SEO site for Kyle Robinson's moving company in Bozeman, MT. Copied from the Bridger Bayworks generator and rebranded. Built on `wiki/builds/local-business-website-seo-blueprint.md`.

- **Preview (when Thomas publishes):** https://thomasg42.github.io/montana-movers/ (noindex until `launched: true`)
- **Repo:** `thomasg42/montana-movers`, intended Pages source `main` → `/docs`
- **Deploy:** `bash deploy-preview.sh` from Thomas's Terminal only, and only when he says publish. The script tags the live June 2026 demo `june-2026-demo` first.

Nothing is published from this folder yet.

## How it is built

Zero-dependency Node generator. Every fact lives in `site.config.mjs` and must trace to `../context/product-facts.md`.

```
site.config.mjs     name, phone, tagline, city, services with status, launch flag, lead endpoint
build.mjs           writes docs/ (`node build.mjs`; `--test-clip` loads review/test-clip into OUT)
src/layout.mjs      head SEO, wordmark header, footer with the real logo card, MovingCompany JSON-LD
src/components.mjs  service cards, steps, FAQ, photo slots
src/pages.mjs       home, four live services, how-it-works, about, free-estimate, 404
src/assets/         site.css, site.js (Bridger scrubber), mm-core.js, hero stills, card, photos
tests/site.test.mjs node --test tests/site.test.mjs
tools/make-images.py placeholder stills, OG wordmark, icons, photo slots
tools/make-test-clip.sh  12s beat-marked clip under review/test-clip/ only
docs/               GENERATED. Never edit by hand.
HERO-SLOT.md        hero status and tuning
```

Edit, then `node build.mjs && node --test tests/site.test.mjs`.

Services are a config list. The build renders only PUBLIC or STATED items. An UNCONFIRMED item gets no page, no link, and no schema.

`launched: false` until Kyle confirms the domain and the facts. Every page is noindex and robots.txt Disallows.

## Pages

| URL | Purpose |
|---|---|
| `/` | Moving company in Bozeman, MT. Scroll-scrubbed "Out of the mess" hero. |
| `/home-moving/` | Home movers in Bozeman |
| `/apartment-moving/` | Apartment movers in Bozeman |
| `/office-moving/` | Office and commercial movers in Bozeman |
| `/long-distance-moving/` | Long-distance moves from Bozeman, anywhere in Montana |
| `/how-it-works/` | Steps + FAQ (FAQPage schema) |
| `/about/` | Kyle, the real logo card, the tagline |
| `/free-estimate/` | Conversion page |
| `/404.html` | Wrong turn |

No pages for packing, storage, labor-only, or individual towns. Those are UNCONFIRMED. Copy says "Bozeman and nearby towns", never a town list. Never say out-of-state or interstate.

## Signature move

**Out of the mess.** The visitor's scroll scrubs a 12 s silent clip: packed garage, out the door, to a loaded unbranded truck under Montana mountains. Beats 1 and 2 sit over the mess. Beat 3 holds the last frame with the h1, tagline, services, and buttons. Then the pin releases and the page scrolls on. Never autoplays. See `HERO-SLOT.md`.

## Lead path

`leadEndpoint` is empty on purpose. A valid submit shows "Last step: send it to Kyle" with a prefilled text to 406-589-3496 and a call button. The intended n8n webhook is `https://tggai.app.n8n.cloud/webhook/montana-movers-speed-to-lead`. Do not wire it until Thomas approves. It places a real automated call.

Every page has a free-estimate link plus `tel:` and `sms:` links, and a sticky Call / Text / Free estimate bar.

## Launch checklist (Thomas + Kyle)

1. Kyle confirms city, nearby-town wording, and the four services.
2. Kyle OKs the copy in `review/00-CURRENT-copy-for-kyle.md`.
3. Domain: set `url` and `customDomain` in `site.config.mjs`.
4. Thomas approves wiring `leadEndpoint`, then run `tools/site-qa/site-qa.mjs` against a local build. Zero FAILs on the happy path.
5. Drop Codex's hero files into `src/assets/hero/` and rebuild.
6. `launched: true`. Bump `assetVersion`.
7. Thomas runs `deploy-preview.sh`. Then add the live URL to `FGA-AIOS/command-center/registry.json` (bubble `montana-movers`, note: noindex preview, replaces June 2026 demo) in that same piece of work.
8. Take down or replace the June 2026 demo if it is still the Pages root.

## Verification (2026-10-17, Lane 3 Cursor)

- 22/22 site tests pass.
- site-qa against `http://127.0.0.1:8080/` and `/free-estimate/`: 24 PASS, 2 SKIP (no form on home), 2 FAIL (backend happy path, expected while `leadEndpoint` is empty).
- Screenshots in `review/` at 390 and 1440, scroll 0 / 0.5 / 1.0, plus reduced motion.
- Nothing published.
