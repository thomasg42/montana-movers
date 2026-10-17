#!/usr/bin/env python3
"""Draws the Montana Movers hero TEST clip and writes raw RGB frames to stdout for ffmpeg.

Not art. A wireframe of the "Out of the mess" move (garage, open door, truck under a sky
band) with a big timestamp and the beat the site should be showing at that moment, so the
scroll timing and the text placement can be tuned before Codex's real clip exists.
Run it through tools/make-test-clip.sh, which reads the beat timing from site.config.mjs.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, SECONDS = 1920, 1080, 24, 12
FRAMES = FPS * SECONDS
FONTS = Path(__file__).resolve().parent / 'fonts'

hero = json.loads(sys.argv[1])
CLIP_END = hero['clipEnd']
BEATS = hero['beats']

U = np.broadcast_to(np.linspace(0.0, 1.0, W, dtype=np.float32)[None, :], (H, W))
V = np.broadcast_to(np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None], (H, W))


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)


SKY_TOP, SKY_LOW = rgb('#3E78C2'), rgb('#EED8AA')
RIDGE, VALLEY, DRIVE, RAMP = rgb('#6E7684'), rgb('#9A8957'), rgb('#A7A39B'), rgb('#8C8E91')
TRUCK, CARGO, BOX, BLANKET = rgb('#F4F3EE'), rgb('#3A332D'), rgb('#B08455'), rgb('#3F6FA8')
SIDE_WALL, WALL, FLOOR, BIN = rgb('#3B312A'), rgb('#4E4137'), rgb('#5F564E'), rgb('#4F6E8E')

# Perspective: u per metre and v per metre at the depth of the garage door (rel = 1).
MU = 0.0306
MV = MU * W / H
EYE = 1.5  # camera height in metres; the horizon sits at v = 0.5


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 2


def outdoor(cam):
    """Sky in the top third, mountains, valley, driveway, the truck centered from behind."""
    img = np.empty((H, W, 3), dtype=np.float32)
    t = np.clip(V / 0.47, 0, 1)[..., None]
    img[:] = SKY_TOP * (1 - t) + SKY_LOW * t
    ridge = 0.43 - 0.06 * np.abs(np.sin(U * 7.0 + 0.4)) - 0.025 * np.abs(np.sin(U * 19.0 + 1.1))
    img[V > ridge] = RIDGE
    img[V > 0.53] = VALLEY
    img[(V > 0.53) & (np.abs(U - 0.5) < 0.10 + 0.55 * (V - 0.53))] = DRIVE

    tw = 0.12 + 0.13 * cam              # truck width, share of the frame width
    th = tw * 1.25 * W / H              # a 2.4 m wide, 3 m tall box, in frame heights
    bottom = 0.80 + 0.06 * cam
    top = bottom - th
    img[(np.abs(U - 0.5) < tw / 2) & (V > top) & (V < bottom)] = TRUCK

    cx0, cx1 = 0.5 - tw * 0.40, 0.5 + tw * 0.40
    cy0, cy1 = top + th * 0.08, bottom - th * 0.04

    def cargo(fx0, fx1, fy0, fy1):
        return ((U > cx0 + (cx1 - cx0) * fx0) & (U < cx0 + (cx1 - cx0) * fx1)
                & (V > cy0 + (cy1 - cy0) * fy0) & (V < cy0 + (cy1 - cy0) * fy1))

    img[cargo(0, 1, 0, 1)] = CARGO
    img[cargo(0.05, 0.45, 0.55, 0.98)] = BOX
    img[cargo(0.08, 0.40, 0.22, 0.52)] = BOX * 0.9
    img[cargo(0.52, 0.95, 0.40, 0.98)] = BLANKET
    img[cargo(0.55, 0.92, 0.10, 0.37)] = BOX * 0.8
    img[(V >= bottom) & (V < bottom + 0.07) & (np.abs(U - 0.5) < tw * 0.30 + (V - bottom) * 0.6)] = RAMP
    return img


# Box stacks and bins along both garage walls: (depth as a share of the garage, x in metres
# from the centre line, width m, height m, colour). The camera glides from depth 0 to the door at 1.
STACKS = [
    (0.28, 2.6, 0.8, 1.4, BOX), (0.40, 2.9, 0.6, 0.7, BIN), (0.52, 2.5, 0.9, 1.7, BOX),
    (0.64, 2.8, 0.7, 1.0, BOX * 0.85), (0.76, 2.6, 0.8, 1.2, BIN), (0.86, 2.9, 0.6, 1.5, BOX * 0.9),
]


def garage(g, outside):
    """Inside the garage, gliding toward the open door. The door fills the frame near g = 0.94."""
    img = np.empty((H, W, 3), dtype=np.float32)
    img[:] = SIDE_WALL
    rd = max(1.0 - g, 0.03)
    floor_v = 0.5 + EYE * MV / rd
    img[(np.abs(U - 0.5) < 3.2 * MU / rd) & (V > 0.5 - 1.1 * MV / rd)] = WALL
    img[V > floor_v] = FLOOR
    door = (np.abs(U - 0.5) < 2.45 * MU / rd) & (V > 0.5 - 0.6 * MV / rd) & (V < floor_v)
    img[door] = outside[door]
    for side in (-1, 1):
        for depth, x, w, h, col in sorted(STACKS, key=lambda s: -s[0]):
            rel = depth + (0.05 if side > 0 else 0.0) - g
            if rel < 0.04:
                continue
            xc = 0.5 + side * x * MU / rel
            bot = 0.5 + EYE * MV / rel
            img[(np.abs(U - xc) < w / 2 * MU / rel) & (V < bot) & (V > bot - h * MV / rel)] = col
    return img


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


F_BIG, F_BEAT = font('BarlowCondensed-ExtraBold.ttf', 170), font('BarlowCondensed-ExtraBold.ttf', 72)
F_MID, F_SMALL = font('BarlowCondensed-SemiBold.ttf', 46), font('BarlowCondensed-SemiBold.ttf', 32)

PHONE_W = (int(H * 9 / 16 / 2)) * 2
PHONE_X0 = (W - PHONE_W) // 2


def beat_label(p):
    for i, b in enumerate(BEATS, start=1):
        if b['from'] <= p <= b['to']:
            last = i == len(BEATS)
            return f'BEAT {i}', f"scroll {round(b['from'] * 100)} to {round(b['to'] * 100)}%" + (' (holds)' if last else '')
    return 'BETWEEN BEATS', 'text fades'


def phase(t):
    if t < 4:
        return 'INSIDE THE GARAGE'
    if t < 8:
        return 'THROUGH THE DOOR'
    if t < 10.5:
        return 'OUTSIDE, SLOWING'
    return 'HOLD ON THE END FRAME'


def dashed(d, xy0, xy1, fill, width=3, dash=22):
    (x0, y0), (x1, y1) = xy0, xy1
    length = max(abs(x1 - x0), abs(y1 - y0))
    for s in range(0, int(length), dash * 2):
        e = min(s + dash, length)
        f0, f1 = s / length, e / length
        d.line([(x0 + (x1 - x0) * f0, y0 + (y1 - y0) * f0), (x0 + (x1 - x0) * f1, y0 + (y1 - y0) * f1)], fill=fill, width=width)


def centered(d, y, text, fnt, fill, stroke=4):
    d.text((W / 2, y), text, font=fnt, fill=fill, anchor='mm', stroke_width=stroke, stroke_fill=(20, 22, 26))


def frame(i):
    t = i / FPS
    p = t / SECONDS * CLIP_END
    g = clamp(t / 5.6)
    cam = ease_out((t - 3.0) / 7.5)
    out = outdoor(cam)
    img = garage(g, out) if g < 0.97 else out
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB')
    d = ImageDraw.Draw(im)

    guide = (255, 236, 160)
    dashed(d, (0, H / 3), (W, H / 3), guide)
    d.text((PHONE_X0 + 14, H / 3 - 12), 'TOP THIRD = SKY BAND', font=F_SMALL, fill=guide, anchor='ls', stroke_width=3, stroke_fill=(20, 22, 26))
    for x in (W / 3, 2 * W / 3):
        dashed(d, (x, H / 3), (x, H), guide, width=2)
    for x in (PHONE_X0, PHONE_X0 + PHONE_W):
        dashed(d, (x, 0), (x, H), (150, 200, 240), width=2, dash=10)
    d.text((W / 3 - 14, H - 26), 'MIDDLE THIRD', font=F_SMALL, fill=guide, anchor='rs', stroke_width=3, stroke_fill=(20, 22, 26))
    d.text((PHONE_X0 - 14, 60), 'PHONE CROP', font=F_SMALL, fill=(150, 200, 240), anchor='rs', stroke_width=3, stroke_fill=(20, 22, 26))

    centered(d, 34, 'TEST CLIP  ·  NOT FOR PUBLISHING', F_SMALL, (150, 200, 240), 3)
    title, sub = beat_label(p)
    centered(d, H * 0.47, title, F_BEAT, (242, 194, 48), 5)
    centered(d, H * 0.47 + 58, sub, F_SMALL, (255, 255, 255), 3)
    centered(d, H * 0.64, f'{t:05.2f} s', F_BIG, (255, 255, 255), 6)
    centered(d, H * 0.64 + 104, f'scroll {p * 100:4.1f}%  ·  frame {i + 1}/{FRAMES}', F_MID, (255, 255, 255), 4)
    centered(d, H - 70, phase(t), F_MID, (242, 194, 48), 4)
    return im.tobytes()


def main():
    out = sys.stdout.buffer
    try:
        for i in range(FRAMES):
            out.write(frame(i))
        out.flush()
    except BrokenPipeError:
        sys.exit(1)


if __name__ == '__main__':
    main()
