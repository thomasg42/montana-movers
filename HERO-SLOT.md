# Home hero slot — Out of the mess

**Status 2026-10-17 (Lane 3 Cursor): site wired, clip not in.** The home hero is a Bridger/GMM scroll scrubber: offscreen muted video, frames drawn to a canvas, never autoplays. Beats 1-3 are real HTML. Default `docs/` ships start and end stills only. The beat-marked test clip lives in `review/test-clip/` and is copied into an output only with `node build.mjs --out review/preview --test-clip`.

Lane 2 Codex owns the Higgsfield take. Do not drop a failed take into `src/assets/hero/`. When Thomas accepts a take, put these files in `src/assets/hero/` and rebuild:

| File | Role |
|---|---|
| `mm-hero-scrub-16x9.mp4` | 12 s silent 16:9, keyframe every 3 frames or denser |
| `mm-hero-scrub-9x16.mp4` | Center 9:16 crop of the same take |
| `mm-hero-start-16x9.jpg` + `.webp` | Page poster. First thing every visitor sees. |
| `mm-hero-start-9x16.jpg` + `.webp` | Portrait poster |
| `mm-hero-end-16x9.jpg` + `.webp` | Last frame, reduced-motion hero, social-preview base |
| `mm-hero-end-9x16.jpg` + `.webp` | Portrait end still |

Then `node build.mjs && node --test tests/site.test.mjs`. Bump `assetVersion` in `site.config.mjs`.

## Behaviour

- `.hero` is the scroll track (`--hero-scrub`: 260svh desktop, 220svh phone).
- Scroll 0-0.88 maps to video 0-12 s. The last 12% holds the end frame so the brand reveal is easy to hit.
- Beat 1 (0-28%): "Moving day looks like this."
- Beat 2 (32-58%): "We'll take it from here."
- Beat 3 (62% to end): h1, tagline, services, Get a free estimate, Call 406-589-3496.
- Desktop: beats 1-2 lower left. Beat 3 centered in the sky band (top third).
- Phone: beats 1-2 low over a bottom scrim. Beat 3 brand in the sky band, buttons above the sticky bar.
- Reduced motion / Save-Data / failed load: end still + beat 3. The h1 stays in the DOM.
- Header wordmark is visible from first paint.

## Truth rules

The garage and truck are illustrative. Never caption them as Kyle's truck, crew, or a customer's home. Copy already says that on the road photo and in the image alts.

## Encode when the real take lands

```
ffmpeg -i SOURCE.mp4 -an -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -profile:v high -g 3 -keyint_min 3 -sc_threshold 0 -bf 0 -movflags +faststart mm-hero-scrub-16x9.mp4
```

A one-keyframe file will not scrub. The decoder video sits in the same box as the canvas at opacity 0 (not a 1px clip). Headless Chromium still held `currentTime` at 0 in this session; HTML beats mapped to scroll anyway. Live Safari/Chrome check once the accepted take is in.

## Codex work next door (do not overwrite)

`../marketing/website-hero-video/` is Lane 2. Take `9c19f549-2b99-44e4-930b-f613fc6e8e71` QA-failed (door morph, rushed load, moving hold). A take-2 revision is quoted above the remaining cap. Leave those files alone. This folder consumes only an accepted, encoded export.
