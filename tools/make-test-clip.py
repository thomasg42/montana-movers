#!/usr/bin/env python3
"""12s test clip with timestamps and BEAT 1/2/3. review/test-clip/ only. No libfreetype needed."""
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'review' / 'test-clip'
FPS = 24
DURATION = 12
W, H = 1920, 1080


def font(size):
    for p in (
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/Library/Fonts/Arial Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def beat_for(t):
    # video 0-12s maps from scroll 0-0.88
    if t < 3.82:
        return 1
    if t < 8.45:
        return 2
    return 3


def frame(t):
    p = t / DURATION
    sky = (int(40 + 80 * p), int(60 + 70 * p), int(70 + 110 * p))
    im = Image.new('RGB', (W, H), sky)
    d = ImageDraw.Draw(im)
    door_w = int(280 + 700 * p)
    door_x = (W - door_w) // 2
    d.rectangle((door_x, int(180 - 40 * p), door_x + door_w, 980), fill=(240, 210, 150))
    if p > 0.45:
        tw = 280
        tx = (W - tw) // 2
        d.rectangle((tx, 420, tx + tw, 980), fill=(245, 245, 245))
    d.text((48, 40), f't={t:04.1f}s', font=font(72), fill=(255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0))
    d.text((48, 140), f'BEAT {beat_for(t)}', font=font(96), fill=(242, 194, 48), stroke_width=4, stroke_fill=(0, 0, 0))
    return im


def encode(frames_dir, dest, w, h):
    subprocess.run([
        'ffmpeg', '-y', '-framerate', str(FPS), '-i', str(frames_dir / 'f%03d.jpg'),
        '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p',
        '-profile:v', 'baseline', '-level', '3.1', '-g', '1', '-keyint_min', '1',
        '-sc_threshold', '0', '-bf', '0', '-vsync', 'cfr', '-fflags', '+genpts',
        '-movflags', '+faststart', '-s', f'{w}x{h}', str(dest),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def stills(src_mp4, stamp, dest_jpg):
    subprocess.run(['ffmpeg', '-y', '-i', str(src_mp4), '-ss', stamp, '-frames:v', '1', str(dest_jpg)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        wide = tmp / 'wide'
        tall = tmp / 'tall'
        wide.mkdir(); tall.mkdir()
        n = FPS * DURATION
        for i in range(n):
            t = i / FPS
            im = frame(t)
            im.save(wide / f'f{i:03d}.jpg', 'JPEG', quality=82)
            im.crop((656, 0, 1264, 1080)).resize((1080, 1920)).save(tall / f'f{i:03d}.jpg', 'JPEG', quality=82)
        encode(wide, OUT / 'mm-hero-scrub-16x9.mp4', 1920, 1080)
        encode(tall, OUT / 'mm-hero-scrub-9x16.mp4', 1080, 1920)

    stills(OUT / 'mm-hero-scrub-16x9.mp4', '0', OUT / 'mm-hero-start-16x9.jpg')
    stills(OUT / 'mm-hero-scrub-16x9.mp4', '11.8', OUT / 'mm-hero-end-16x9.jpg')
    stills(OUT / 'mm-hero-scrub-9x16.mp4', '0', OUT / 'mm-hero-start-9x16.jpg')
    stills(OUT / 'mm-hero-scrub-9x16.mp4', '11.8', OUT / 'mm-hero-end-9x16.jpg')
    for stem in ('mm-hero-start-16x9', 'mm-hero-end-16x9', 'mm-hero-start-9x16', 'mm-hero-end-9x16'):
        subprocess.run(['cwebp', '-q', '78', str(OUT / f'{stem}.jpg'), '-o', str(OUT / f'{stem}.webp')],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print('Test clip written to', OUT)


if __name__ == '__main__':
    main()
