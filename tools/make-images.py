#!/usr/bin/env python3
"""Build logo copy, placeholder hero stills, OG card, icons, and photo slots. No redraw of Kyle's card."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src' / 'assets'
HERO = ASSETS / 'hero'
BRAND = ASSETS / 'brand'
PHOTOS = ASSETS / 'photos'
CLIENT = ROOT.parent
CARD = CLIENT / 'marketing/meta-ads/v2-identity-simple/source/assets/montana-movers-logo-card.png'
TRUCK = CLIENT / 'marketing/meta-ads/v2-identity-simple/source/assets/04-anywhere-anytime.png'

GRAPHITE = (22, 25, 30)
GRAPHITE_800 = (31, 36, 43)
SKY = (127, 182, 232)
SKY_600 = (47, 111, 174)
WHITE = (251, 250, 247)
YELLOW = (242, 194, 48)


def font(size, bold=True):
    candidates = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/Library/Fonts/Arial Bold.ttf' if bold else '/Library/Fonts/Arial.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def gradient(size, top, bottom):
    w, h = size
    im = Image.new('RGB', size, top)
    px = im.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return im


def save_still(im, stem):
    jpg = HERO / f'{stem}.jpg'
    webp = HERO / f'{stem}.webp'
    im.save(jpg, 'JPEG', quality=82, optimize=True)
    subprocess.run(['cwebp', '-q', '78', str(jpg), '-o', str(webp)], check=True, stdout=subprocess.DEVNULL)


def make_hero_placeholders():
    HERO.mkdir(parents=True, exist_ok=True)
    start = gradient((1920, 1080), (28, 24, 20), (210, 170, 110))
    # doorway glow, no letters
    glow = Image.new('L', (1920, 1080), 0)
    g = ImageDraw.Draw(glow)
    g.rectangle((760, 220, 1160, 900), fill=220)
    glow = glow.filter(ImageFilter.GaussianBlur(48))
    light = Image.new('RGB', (1920, 1080), (255, 220, 160))
    start = Image.composite(light, start, glow)
    save_still(start, 'mm-hero-start-16x9')
    save_still(start.crop((600, 0, 1320, 1080)).resize((1080, 1920), Image.Resampling.LANCZOS), 'mm-hero-start-9x16')

    end = gradient((1920, 1080), (80, 140, 200), (40, 70, 50))
    d = ImageDraw.Draw(end)
    d.rectangle((720, 430, 1200, 980), fill=(245, 245, 245))  # truck box, unbranded
    d.rectangle((700, 980, 1220, 1040), fill=(60, 60, 60))
    save_still(end, 'mm-hero-end-16x9')
    save_still(end.crop((600, 0, 1320, 1080)).resize((1080, 1920), Image.Resampling.LANCZOS), 'mm-hero-end-9x16')


def make_og():
    end = Image.open(HERO / 'mm-hero-end-16x9.jpg').convert('RGB')
    og = end.resize((1200, 675), Image.Resampling.LANCZOS).crop((0, 0, 1200, 630))
    overlay = Image.new('RGBA', og.size, (22, 25, 30, 110))
    og = og.convert('RGBA')
    og.alpha_composite(overlay)
    draw = ImageDraw.Draw(og)
    draw.text((60, 200), 'MONTANA MOVERS', font=font(72), fill=WHITE)
    draw.text((60, 290), 'Bozeman, MT', font=font(36, bold=False), fill=SKY)
    draw.text((60, 360), 'We move anywhere, anytime.', font=font(28, bold=False), fill=WHITE)
    out = ASSETS / 'og-image.png'
    og.convert('RGB').save(out, 'PNG')


def make_icons():
    # State-outline tile. Not Kyle's card.
    for name, size in (('apple-touch-icon.png', 180), ('favicon.png', 64)):
        im = Image.new('RGB', (size, size), GRAPHITE_800)
        draw = ImageDraw.Draw(im)
        pad = size * 0.14
        # simple Montana-ish hex
        pts = [
            (pad, size * 0.32),
            (size * 0.82, pad),
            (size - pad, size * 0.34),
            (size - pad, size * 0.78),
            (size * 0.72, size - pad),
            (size * 0.28, size * 0.78),
        ]
        draw.polygon(pts, fill=SKY)
        im.save(ASSETS / name, 'PNG')


def make_slots():
    PHOTOS.mkdir(parents=True, exist_ok=True)
    for stem, label in (('photo-slot-crew', 'CREW PHOTO'), ('photo-slot-truck', 'TRUCK PHOTO')):
        im = Image.new('RGB', (1200, 800), (220, 232, 242))
        draw = ImageDraw.Draw(im)
        draw.rectangle((40, 40, 1160, 760), outline=SKY_600, width=6)
        draw.text((80, 340), label, font=font(56), fill=GRAPHITE)
        draw.text((80, 420), 'Waiting on Kyle', font=font(28, bold=False), fill=SKY_600)
        webp = PHOTOS / f'{stem}.webp'
        im.save(webp, 'WEBP', quality=80)


def copy_brand():
    BRAND.mkdir(parents=True, exist_ok=True)
    shutil.copy2(CARD, BRAND / 'montana-movers-logo-card.png')
    src = Image.open(TRUCK).convert('RGB')
    src.save(PHOTOS / 'anywhere-anytime.webp', 'WEBP', quality=78)


if __name__ == '__main__':
    if not CARD.is_file() or not TRUCK.is_file():
        raise SystemExit('Missing logo card or 04-anywhere-anytime.png')
    make_hero_placeholders()
    make_og()
    make_icons()
    make_slots()
    copy_brand()
    for p in [HERO / 'mm-hero-start-16x9.webp', ASSETS / 'og-image.png', BRAND / 'montana-movers-logo-card.png']:
        print(p.name, p.stat().st_size)
