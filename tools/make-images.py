#!/usr/bin/env python3
"""Rebuild share cards and editorial crops from retained illustrative scenes.
Never overwrite hero footage, brand originals, or hero stills with placeholders.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, subprocess, shutil
ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src/assets'
REVIEW = ROOT / 'review'
CONFIG = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import {SITE} from './site.config.mjs'; console.log(JSON.stringify(SITE))"], cwd=ROOT))
def font(size, condensed=False):
    name = 'BarlowCondensed-ExtraBold.ttf' if condensed else 'Barlow-SemiBold.ttf'
    return ImageFont.truetype(str(ROOT / 'tools/fonts' / name), size)
def crop(src, size):
    return ImageOps.fit(Image.open(ASSETS / src).convert('RGB'), size, method=Image.Resampling.LANCZOS)
def make_og():
    REVIEW.mkdir(exist_ok=True)
    for variant in (1, 2, 3):
        src = 'hero/mm-hero-end-16x9.jpg' if variant != 3 else 'photos/highway-truck-16x9.jpg'
        im = crop(src, (1200,630)).convert('RGBA')
        # A soft light wash over the sky. No panel or placeholder box.
        wash = Image.new('RGBA', im.size)
        d = ImageDraw.Draw(wash)
        for y in range(630):
            alpha = int((220 if variant == 2 else 195) * max(0,1-y/390))
            d.line((0,y,1200,y),fill=(251,250,247,alpha))
        im.alpha_composite(wash);d=ImageDraw.Draw(im)
        ink=(22,25,30)
        headline = CONFIG['name'].upper()
        sub = f"{CONFIG['city']}, {CONFIG['region']} · {CONFIG['tagline']}"
        cta = f"Free estimate · {CONFIG['phone']['display']}"
        def centered(y,text,f,fill):
            width=d.textlength(text,font=f)
            assert width <= 1000, (text,width)
            d.text(((1200-width)/2,y),text,font=f,fill=fill)
        centered(65,headline,font(106,True),ink)
        centered(185,sub,font(34),ink)
        w=d.textlength(cta,font(38))+64
        d.rounded_rectangle(((1200-w)/2,475,(1200+w)/2,553),radius=39,
                            fill=(242,194,48) if variant != 2 else (220,235,248))
        centered(488,cta,font(38),ink)
        im.convert('RGB').save(REVIEW/f'og-variant-{variant}.png',optimize=True)
    shutil.copy2(REVIEW/'og-variant-1.png',ASSETS/'og-image.png')
    Image.open(ASSETS/'og-image.png').save(ASSETS/'og-image.jpg',quality=91,optimize=True)
def make_editorial():
    scenes = {'moving-day':'hero/mm-hero-start-16x9.jpg',
              'montana-arrival':'hero/mm-hero-end-16x9.jpg',
              'montana-road':'photos/highway-truck-16x9.jpg'}
    for name,src in scenes.items():
        crop(src,(1200,800)).save(ASSETS/'photos'/f'{name}.webp',quality=88)
if __name__ == '__main__':
    make_og()
    make_editorial()
    print('Three share-card variants and three editorial crops rebuilt; hero and brand originals preserved.')
