#!/usr/bin/env python3
"""Genera el set Neo Pixel Cozy v1 en PNG nativo.

Cada capa de avatar es un PNG-32 de 96×128 con el mismo origen.
Los píxeles usan alpha 0 o 255 (sin antialias). Las mascotas son 48×48.
Los escenarios son 320×180 y, si hace falta, se escalan ×2 con vecino más cercano.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "neo_pixel_cozy" / "v1"
W, H = 96, 128
RIG_IDS = ("humanoid_standard", "humanoid_wide", "humanoid_tall", "humanoid_seated")

def C(hex_color: str) -> tuple:
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

PLUM = C("#2B1741")
VIOLET = C("#693CA1")
LILAC = C("#BA92EB")
CREAM = C("#FFF4DD")
MINT = C("#78CAA8")
MINT_D = C("#3E8F72")
GOLD = C("#FFC95D")
GOLD_D = C("#E09A2E")
ROSE = C("#ED87B0")
ROSE_D = C("#C45B86")
SLATE = C("#555267")
SLATE_D = C("#3A3848")
WHITE = C("#FFFFFF")
INK = C("#1A1028")
NIGHT = C("#24143A")

SKINS = {
    "warm": (C("#F6C7A1"), C("#E09A6A"), C("#FFD8B8")),
    "olive": (C("#C6A36A"), C("#8C6A32"), C("#E0C48A")),
    "dark": (C("#6E4030"), C("#4A2618"), C("#8B5340")),
    "demon": (C("#A33B55"), C("#6E2036"), C("#D36A84")),
    "alien": (C("#6ED4C8"), C("#2E8F86"), C("#B6F3EC")),
}


class Pix:
    def __init__(self, w: int, h: int):
        self.w = w
        self.h = h
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.px = self.im.load()
        self.mark: list[tuple[int, int]] = []

    def set(self, x: int, y: int, color: tuple):
        if 0 <= x < self.w and 0 <= y < self.h and color[3]:
            self.px[x, y] = color
            self.mark.append((x, y))

    def rect(self, x0, y0, x1, y1, color):
        if x0 > x1:
            x0, x1 = x1, x0
        if y0 > y1:
            y0, y1 = y1, y0
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, color)

    def disc(self, cx, cy, r, color):
        r2 = r * r
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                    self.set(x, y, color)

    def round_rect(self, x0, y0, x1, y1, color, r=4):
        r = max(1, min(r, (x1 - x0) // 2, (y1 - y0) // 2))
        self.rect(x0 + r, y0, x1 - r, y1, color)
        self.rect(x0, y0 + r, x1, y1 - r, color)
        self.disc(x0 + r, y0 + r, r, color)
        self.disc(x1 - r, y0 + r, r, color)
        self.disc(x0 + r, y1 - r, r, color)
        self.disc(x1 - r, y1 - r, r, color)

    def ellipse(self, cx, cy, rx, ry, color):
        if rx < 1 or ry < 1:
            self.set(cx, cy, color)
            return
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                if (x - cx) ** 2 * ry * ry + (y - cy) ** 2 * rx * rx <= rx * rx * ry * ry:
                    self.set(x, y, color)

    def limb(self, x0, y0, x1, y1, radius, color, stop=1.0):
        steps = max(abs(x1 - x0), abs(y1 - y0), 1)
        last = max(1, int(steps * stop))
        for i in range(last + 1):
            t = i / steps
            self.disc(round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t), radius, color)

    def shade(self, base, shadow, highlight=None):
        pts = [(x, y) for x, y in self.mark if self.px[x, y][:3] == base[:3]]
        self.mark = []
        if not pts:
            return
        minx = min(p[0] for p in pts)
        maxx = max(p[0] for p in pts)
        miny = min(p[1] for p in pts)
        maxy = max(p[1] for p in pts)
        for x, y in pts:
            nx = (x - minx) / max(1, maxx - minx)
            ny = (y - miny) / max(1, maxy - miny)
            if ny > 0.62 or nx > 0.78:
                self.px[x, y] = shadow
            elif highlight and ny < 0.28 and nx < 0.38:
                self.px[x, y] = highlight

    def wipe_below(self, y_cut):
        for y in range(y_cut, self.h):
            for x in range(self.w):
                self.px[x, y] = (0, 0, 0, 0)
        self.mark = []

    def outline(self, color=PLUM):
        src = self.im.copy().load()
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y][3]:
                    continue
                if any(
                    0 <= x + ox < self.w and 0 <= y + oy < self.h and src[x + ox, y + oy][3]
                    for ox in (-1, 0, 1)
                    for oy in (-1, 0, 1)
                    if ox or oy
                ):
                    self.px[x, y] = color

    def image(self) -> Image.Image:
        return self.im


def save(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "PNG")


def hard_alpha(im: Image.Image) -> Image.Image:
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255 if a >= 128 else 0)
    return im


# Anclas compartidas. La ropa se dibuja contra estas cajas, no se recoloca en runtime.
RIGS = {
    "humanoid_standard": {
        "head": (45, 38), "hrx": 14, "hry": 13,
        "face": (43, 39),
        "torso": (32, 54, 60, 84),
        "arm_f": (34, 60, 18, 84),
        "arm_b": (58, 58, 78, 74),
        "leg_f": (34, 82, 46, 116),
        "leg_b": (48, 84, 60, 114),
        "foot_f": (30, 110, 48, 117),
        "foot_b": (48, 108, 64, 114),
        "seated": False,
        "anchors": {
            "head": [45, 38], "face": [43, 39], "neck": [45, 50],
            "torso": [46, 68], "hips": [46, 86], "hand": [18, 84],
            "feet": [42, 116], "companion": [16, 116], "ground": [48, 118],
        },
    },
    "humanoid_wide": {
        "head": (48, 36), "hrx": 15, "hry": 14,
        "face": (45, 37),
        "torso": (26, 52, 70, 86),
        "arm_f": (30, 60, 12, 86),
        "arm_b": (66, 58, 86, 74),
        "leg_f": (28, 84, 46, 116),
        "leg_b": (48, 86, 70, 114),
        "foot_f": (24, 110, 48, 117),
        "foot_b": (50, 108, 74, 114),
        "seated": False,
        "anchors": {
            "head": [48, 36], "face": [45, 37], "neck": [48, 50],
            "torso": [48, 68], "hips": [48, 88], "hand": [12, 86],
            "feet": [46, 116], "companion": [12, 116], "ground": [48, 118],
        },
    },
    "humanoid_tall": {
        "head": (47, 28), "hrx": 12, "hry": 11,
        "face": (45, 29),
        "torso": (38, 42, 58, 74),
        "arm_f": (40, 48, 18, 78),
        "arm_b": (56, 46, 78, 66),
        "leg_f": (38, 72, 48, 116),
        "leg_b": (48, 74, 58, 114),
        "foot_f": (34, 110, 50, 117),
        "foot_b": (48, 108, 64, 114),
        "seated": False,
        "anchors": {
            "head": [47, 28], "face": [45, 29], "neck": [47, 40],
            "torso": [48, 58], "hips": [47, 76], "hand": [18, 78],
            "feet": [44, 116], "companion": [14, 116], "ground": [48, 118],
        },
    },
    "humanoid_seated": {
        "head": (50, 34), "hrx": 14, "hry": 13,
        "face": (47, 35),
        "torso": (36, 50, 66, 80),
        "arm_f": (38, 58, 22, 76),
        "arm_b": (64, 56, 80, 68),
        "thigh": (34, 76, 72, 90),
        "shin": (54, 86, 70, 108),
        "foot_f": (52, 104, 72, 112),
        "foot_b": (58, 102, 74, 110),
        "seated": True,
        "anchors": {
            "head": [50, 34], "face": [47, 35], "neck": [50, 48],
            "torso": [51, 64], "hips": [52, 82], "hand": [22, 76],
            "feet": [62, 110], "companion": [14, 116], "ground": [48, 118],
        },
    },
}


def draw_body(rig, skin, freckles=False) -> Image.Image:
    c = Pix(W, H)
    base, shadow, hi = skin
    if rig["seated"]:
        c.rect(*rig["thigh"], base)
        c.shade(base, shadow, hi)
        c.rect(*rig["shin"], base)
        c.shade(base, shadow, hi)
        c.rect(*rig["foot_f"], base)
        c.shade(base, shadow, hi)
    else:
        x0, y0, x1, y1 = rig["leg_b"]
        c.rect(x0, y0, x1, y1, base)
        c.shade(base, shadow, hi)
        x0, y0, x1, y1 = rig["leg_f"]
        c.rect(x0, y0, x1, y1, base)
        c.shade(base, shadow, hi)
        c.rect(*rig["foot_b"], base)
        c.shade(base, shadow, hi)
        c.rect(*rig["foot_f"], base)
        c.shade(base, shadow, hi)
    c.limb(*rig["arm_b"], 3, base, stop=0.92)
    c.shade(base, shadow, hi)
    c.limb(*rig["arm_f"], 3, base, stop=0.92)
    c.shade(base, shadow, hi)
    # manos
    c.disc(rig["arm_f"][2], rig["arm_f"][3], 3, base)
    c.disc(rig["arm_b"][2], rig["arm_b"][3], 3, base)
    c.shade(base, shadow, hi)
    tx0, ty0, tx1, ty1 = rig["torso"]
    c.round_rect(tx0, ty0, tx1, ty1, base, 5)
    c.shade(base, shadow, hi)
    hx, hy = rig["head"]
    c.rect(hx - 4, hy + rig["hry"] - 2, hx + 3, ty0 + 2, base)
    c.ellipse(hx, hy, rig["hrx"], rig["hry"], base)
    c.shade(base, shadow, hi)
    # oreja visible (3/4 hacia la izquierda: la oreja izquierda del lienzo queda al frente)
    c.disc(hx - rig["hrx"] + 1, hy + 1, 3, base)
    c.shade(base, shadow, hi)
    # ropa base neutra: camiseta crema y short pizarra, para no dejar el cuerpo en piel desnuda
    c.rect(tx0 + 1, ty0 + 4, tx1 - 1, ty1 - 1, CREAM)
    c.shade(CREAM, C("#E6D3B0"), WHITE)
    if rig["seated"]:
        qx0, qy0, qx1, qy1 = rig["thigh"]
        c.rect(qx0 + 1, qy0, qx1 - 1, qy0 + 8, SLATE)
        c.shade(SLATE, SLATE_D, C("#7A768C"))
    else:
        for key in ("leg_f", "leg_b"):
            x0, y0, x1, y1 = rig[key]
            c.rect(x0, y0, x1, y0 + 8, SLATE)
        c.shade(SLATE, SLATE_D, C("#7A768C"))
    c.outline()
    if freckles:
        fx, fy = rig["face"]
        for ox, oy in ((-8, 4), (-6, 6), (-9, 6), (6, 3), (8, 5)):
            c.set(fx + ox, fy + oy, shadow)
    return c.image()


def eye(c: Pix, x, y, r, lid=False):
    c.disc(x, y, r, WHITE)
    c.disc(x - 1, y, max(1, r - 1), INK)
    c.set(x - r + 1, y - r + 1, WHITE)
    if lid:
        c.rect(x - r, y - r, x + r, y - 1, PLUM)


def draw_face(rig, kind) -> Image.Image:
    c = Pix(W, H)
    cx, cy = rig["face"]
    if kind in ("alegre_tres", "calma_tres", "cansada_tres"):
        for ox, oy, r in ((-6, 1, 2), (4, 0, 2), (-1, -6, 2)):
            eye(c, cx + ox, cy + oy, r, lid=kind.startswith("cansada"))
    else:
        eye(c, cx - 6, cy, 3, lid=kind == "cansada")
        eye(c, cx + 4, cy - 1, 2, lid=kind == "cansada")
    c.set(cx - 2, cy + 4, PLUM)
    c.set(cx - 1, cy + 5, PLUM)
    mouth_y = cy + 8
    if kind in ("alegre", "alegre_tres", "colmillo"):
        c.rect(cx - 5, mouth_y, cx + 3, mouth_y, ROSE_D)
        c.set(cx - 5, mouth_y - 1, ROSE_D)
        c.set(cx + 3, mouth_y - 1, ROSE_D)
        if kind == "colmillo":
            c.rect(cx - 2, mouth_y + 1, cx - 1, mouth_y + 3, WHITE)
            c.set(cx - 2, mouth_y + 3, PLUM)
    elif kind in ("calma", "calma_tres"):
        c.rect(cx - 3, mouth_y, cx + 2, mouth_y, ROSE_D)
    else:
        c.rect(cx - 4, mouth_y, cx + 2, mouth_y, SLATE)
    # sonrojo
    c.set(cx - 10, cy + 3, ROSE)
    c.set(cx + 7, cy + 2, ROSE)
    return c.image()


def draw_hair(rig, kind, color, dark) -> Image.Image:
    c = Pix(W, H)
    hx, hy = rig["head"]
    rx, ry = rig["hrx"], rig["hry"]
    if kind == "bun":
        c.ellipse(hx + 1, hy - 2, rx, ry, color)
        c.wipe_below(hy - 1)
        c.rect(hx - rx + 2, hy - 4, hx + rx - 4, hy - 1, color)
        c.disc(hx + rx - 4, hy - ry + 2, 5, color)
        c.shade(color, dark, None)
    elif kind == "braids":
        c.ellipse(hx, hy - 3, rx, ry - 1, color)
        c.wipe_below(hy - 2)
        c.rect(hx - rx + 3, hy - 5, hx + 2, hy - 1, color)
        for i in range(0, 26, 4):
            c.disc(hx - rx + 2, hy + 6 + i, 2, color)
            c.disc(hx + rx - 3, hy + 8 + i, 2, dark if i % 8 == 0 else color)
        c.shade(color, dark, None)
    elif kind == "spikes":
        c.ellipse(hx, hy - 2, rx - 1, ry - 2, color)
        c.wipe_below(hy - 1)
        for i, hgt in enumerate((4, 6, 3, 5, 3)):
            x = hx - rx + 4 + i * 5
            c.rect(x, hy - ry - hgt + 6, x + 2, hy - ry + 2, color)
        c.shade(color, dark, None)
    elif kind == "bicolor":
        c.ellipse(hx, hy - 1, rx, ry - 1, MINT)
        c.wipe_below(hy)
        for y in range(hy - ry, hy + 1):
            for x in range(hx, hx + rx + 1):
                if c.px[x, y][3]:
                    c.px[x, y] = VIOLET
        c.rect(hx - rx + 2, hy - 3, hx + rx - 3, hy, color)
    elif kind == "tuft":
        c.disc(hx - 2, hy - ry + 2, 3, color)
        c.rect(hx - 4, hy - ry, hx, hy - ry + 5, color)
        c.shade(color, dark, None)
    elif kind == "pigtails":
        c.ellipse(hx, hy - 2, rx, ry - 1, color)
        c.wipe_below(hy - 1)
        c.rect(hx - 4, hy - 6, hx + 2, hy - 1, color)
        c.disc(hx - rx - 1, hy + 2, 4, color)
        c.disc(hx + rx + 1, hy + 1, 4, color)
        c.shade(color, dark, None)
    else:  # short
        c.ellipse(hx, hy - 1, rx, ry - 1, color)
        c.wipe_below(hy - 1)
        c.rect(hx - rx + 2, hy - 5, hx + 4, hy, color)
        c.shade(color, dark, None)
    c.outline()
    return c.image()


def draw_top(rig, kind, main, dark, hi=None) -> Image.Image:
    c = Pix(W, H)
    tx0, ty0, tx1, ty1 = rig["torso"]
    if kind == "overalls":
        c.rect(tx0 + 6, ty0 + 6, tx1 - 6, ty1, main)
        c.rect(tx0 + 8, ty0 + 2, tx0 + 11, ty0 + 8, main)
        c.rect(tx1 - 11, ty0 + 2, tx1 - 8, ty0 + 8, main)
        c.shade(main, dark, hi)
    elif kind == "coat":
        c.rect(tx0 - 1, ty0 + 2, tx1 + 1, ty1 + 10, main)
        c.rect(tx0 + 8, ty0 + 4, tx0 + 11, ty1 + 8, CREAM)
        c.shade(main, dark, hi)
        for y in range(ty0 + 6, ty1 + 8, 4):
            c.set(tx0 + 2, y, GOLD)
            c.set(tx1 - 2, y, GOLD)
    elif kind == "jacket":
        c.rect(tx0, ty0 + 2, tx0 + (tx1 - tx0) // 2 - 1, ty1, main)
        c.rect(tx1 - (tx1 - tx0) // 2 + 1, ty0 + 2, tx1, ty1, main)
        c.shade(main, dark, hi)
        c.rect(tx0 + 3, ty0 + 8, tx0 + 8, ty0 + 14, VIOLET)
        c.rect(tx1 - 8, ty0 + 16, tx1 - 3, ty0 + 22, LILAC)
    elif kind == "raincoat":
        c.round_rect(tx0 - 1, ty0 + 2, tx1 + 1, ty1 + 2, main, 3)
        c.ellipse(rig["head"][0], rig["head"][1] - rig["hry"] + 4, rig["hrx"], 5, main)
        c.shade(main, dark, hi)
    else:
        c.rect(tx0, ty0 + 2, tx1, ty1, main)
        if kind == "hoodie":
            hx, hy = rig["head"]
            c.ellipse(hx, hy + rig["hry"] - 4, rig["hrx"] + 1, 6, main)
            c.wipe_below(hy + 2)
            c.rect(tx0, ty0 + 2, tx1, ty1, main)
        c.shade(main, dark, hi)
    c.limb(*rig["arm_b"], 4, main, stop=0.78)
    c.shade(main, dark, hi)
    c.limb(*rig["arm_f"], 4, main, stop=0.78)
    c.shade(main, dark, hi)
    c.outline()
    return c.image()


def draw_lower(rig, kind, main, dark) -> Image.Image:
    c = Pix(W, H)
    if rig["seated"]:
        x0, y0, x1, y1 = rig["thigh"]
        if kind == "skirt":
            c.rect(x0 - 2, y0, x1 + 2, y0 + 12, main)
        elif kind == "shorts":
            c.rect(x0, y0, x1, y0 + 8, main)
        else:
            c.rect(x0, y0, x1, y1, main)
            sx0, sy0, sx1, sy1 = rig["shin"]
            c.rect(sx0, sy0, sx1, sy1 - 6, main)
        c.shade(main, dark, None)
    else:
        lf = rig["leg_f"]
        lb = rig["leg_b"]
        if kind == "skirt":
            c.rect(lf[0] - 4, lf[1] - 2, lb[2] + 2, lf[1] + 16, main)
        elif kind == "shorts":
            c.rect(*lf[:3], lf[1] + 12, main)
            c.rect(*lb[:3], lb[1] + 12, main)
        else:
            c.rect(lf[0], lf[1], lf[2], lf[3] - 8, main)
            c.rect(lb[0], lb[1], lb[2], lb[3] - 8, main)
        c.shade(main, dark, None)
        if kind == "cargo":
            pocket = (lf[0] + 1, lf[1] + 4, lf[0] + 5, lf[1] + 8)
            c.rect(*pocket, dark)
    c.outline()
    return c.image()


def draw_shoes(rig, main, dark) -> Image.Image:
    c = Pix(W, H)
    for key in ("foot_b", "foot_f"):
        if key not in rig:
            continue
        x0, y0, x1, y1 = rig[key]
        c.ellipse((x0 + x1) // 2, (y0 + y1) // 2 + 1, max(4, (x1 - x0) // 2), max(3, (y1 - y0) // 2), main)
        c.shade(main, dark, WHITE)
    c.outline()
    return c.image()


def draw_horns(rig, kind) -> Image.Image:
    c = Pix(W, H)
    hx, hy = rig["head"]
    if kind == "antenna":
        for ox, hgt in ((-4, 14), (5, 12)):
            x = hx + ox
            top = max(6, hy - rig["hry"] - hgt)
            c.rect(x, top + 3, x + 1, hy - rig["hry"] + 2, LILAC)
            c.disc(x, top + 2, 2, GOLD)
        c.outline()
        return c.image()
    # cuernos asimétricos
    specs = ((-9, 18, -12, C("#F6E2C4")), (8, 11, 7, C("#E7C8A4")))
    for ox, hgt, lean, color in specs:
        x = hx + ox
        top = hy - rig["hry"] + 1
        for i in range(hgt):
            yy = top - i
            if yy < 6:
                break
            curve = (lean * i * i) // max(1, hgt * hgt)
            c.disc(x + curve, yy, 3 if i < 3 else (2 if i < hgt - 3 else 1), color)
    c.outline()
    return c.image()


def draw_hat(rig, kind) -> Image.Image:
    c = Pix(W, H)
    hx, hy = rig["head"]
    rx, ry = rig["hrx"], rig["hry"]
    if kind == "witch":
        brim_y = hy - 4
        c.ellipse(hx, brim_y, rx + 8, 4, VIOLET)
        top = max(6, hy - ry - 16)
        for y in range(top, brim_y):
            t = (y - top) / max(1, brim_y - top)
            hw = max(1, round((rx - 2) * t))
            c.rect(hx - hw, y, hx + hw, y, VIOLET)
        c.shade(VIOLET, C("#4C2878"), LILAC)
        c.set(hx, top + 4, GOLD)
        c.set(hx - 1, top + 5, GOLD)
        c.set(hx + 1, top + 5, GOLD)
        c.set(hx, top + 6, GOLD)
    elif kind == "flower":
        c.ellipse(hx, hy - 6, rx + 2, 4, C("#C47A4A"))
        c.disc(hx - 6, hy - ry, 2, ROSE)
        c.disc(hx - 2, hy - ry - 1, 2, GOLD)
        c.disc(hx + 3, hy - ry, 2, MINT)
        c.set(hx - 2, hy - ry, GOLD_D)
    elif kind == "headphones":
        c.ellipse(hx, hy - 2, rx + 2, ry, MINT)
        c.wipe_below(hy - ry + 6)
        # deja solo la diadema superior
        for y in range(hy - 4, hy + ry):
            for x in range(W):
                c.px[x, y] = (0, 0, 0, 0)
        c.rect(hx - rx - 1, hy - ry + 2, hx + rx + 1, hy - ry + 4, SLATE)
        c.disc(hx - rx, hy, 4, SLATE)
        c.disc(hx + rx, hy - 1, 4, VIOLET)
        c.disc(hx - rx, hy, 2, MINT)
        c.disc(hx + rx, hy - 1, 2, LILAC)
    else:  # moon beret
        c.ellipse(hx + 2, hy - 8, rx, 6, VIOLET)
        c.disc(hx + 6, hy - 12, 2, GOLD)
    c.outline()
    return c.image()


def draw_glasses(rig) -> Image.Image:
    c = Pix(W, H)
    cx, cy = rig["face"]
    for ox in (-6, 4):
        x = cx + ox
        r = 4 if ox < 0 else 3
        for i in range(r):
            for dx, dy in ((-i, -r + 1), (i, -r + 1), (-i, r - 1), (i, r - 1), (-r + 1, -i), (r - 1, -i), (-r + 1, i), (r - 1, i)):
                c.set(x + dx, cy + dy, GOLD_D)
        c.disc(x, cy, r - 2, C("#FFF4DD"))
        # el cristal queda casi vacío: borra el centro para ver los ojos
        c.disc(x, cy, max(1, r - 3), (0, 0, 0, 0))
        # disc with transparent doesn't clear. clear manually
        for y in range(cy - (r - 3), cy + (r - 2)):
            for x2 in range(x - (r - 3), x + (r - 2)):
                if (x2 - x) ** 2 + (y - cy) ** 2 <= (r - 3) ** 2:
                    c.px[x2, y] = (0, 0, 0, 0)
    c.rect(cx - 2, cy, cx + 1, cy, GOLD_D)
    return c.image()


def draw_back(rig, kind) -> Image.Image:
    c = Pix(W, H)
    tx0, ty0, tx1, ty1 = rig["torso"]
    if kind == "cape":
        c.rect(tx0 - 2, ty0 + 4, tx1 + 8, ty0 + 8, VIOLET)
        c.rect(tx1 - 4, ty0 + 6, tx1 + 10, ty1 + 16, VIOLET)
        c.shade(VIOLET, C("#4C2878"), LILAC)
        c.disc(tx1 + 4, ty0 + 20, 2, GOLD)
    elif kind == "botanical":
        c.rect(tx1 - 2, ty0 + 8, tx1 + 10, ty1, MINT)
        c.rect(tx1, ty0 + 4, tx1 + 4, ty0 + 10, MINT_D)
        c.shade(MINT, MINT_D, CREAM)
        c.set(tx1 + 4, ty0 + 14, ROSE)
        c.set(tx1 + 6, ty0 + 18, GOLD)
    else:
        c.rect(tx1 - 2, ty0 + 6, tx1 + 9, ty1 - 2, VIOLET)
        c.rect(tx1, ty0 + 2, tx1 + 3, ty0 + 8, LILAC)
        c.shade(VIOLET, C("#4C2878"), LILAC)
        c.disc(tx1 + 3, ty0 + 14, 2, GOLD)
    c.outline()
    return c.image()


def draw_hand(rig, kind) -> Image.Image:
    c = Pix(W, H)
    x, y = rig["arm_f"][2], rig["arm_f"][3]
    if kind == "book":
        c.rect(x - 8, y - 12, x + 2, y - 2, C("#F4E2B8"))
        c.rect(x - 8, y - 12, x - 6, y - 2, VIOLET)
        c.rect(x - 4, y - 9, x, y - 8, ROSE)
        c.shade(C("#F4E2B8"), C("#D8C49A"), WHITE)
    elif kind == "watering":
        c.rect(x - 8, y - 10, x - 1, y - 2, MINT)
        c.rect(x - 1, y - 8, x + 4, y - 6, MINT_D)
        c.rect(x - 6, y - 14, x - 3, y - 10, CREAM)
        c.set(x + 4, y - 4, MINT)
        c.set(x + 5, y - 2, MINT)
    else:  # bottle
        c.rect(x - 5, y - 14, x - 1, y - 3, C("#8FD0E8"))
        c.rect(x - 4, y - 17, x - 2, y - 14, SLATE)
        c.shade(C("#8FD0E8"), C("#4E98B0"), WHITE)
    c.outline()
    return c.image()


def draw_aura(kind) -> Image.Image:
    c = Pix(W, H)
    if kind == "sparkles":
        spots = ((18, 28), (74, 24), (12, 70), (82, 64), (30, 18), (68, 90), (22, 100))
        for x, y in spots:
            c.set(x, y, GOLD)
            c.set(x - 1, y, CREAM)
            c.set(x + 1, y, CREAM)
            c.set(x, y - 1, CREAM)
            c.set(x, y + 1, CREAM)
    elif kind == "hearts":
        for x, y in ((16, 36), (78, 30), (20, 78), (80, 70), (30, 20)):
            c.set(x, y, ROSE)
            c.set(x + 2, y, ROSE)
            c.set(x + 1, y + 1, ROSE)
            c.set(x, y + 2, ROSE_D)
            c.set(x + 2, y + 2, ROSE_D)
            c.set(x + 1, y + 3, ROSE_D)
    else:
        cx, cy, rx, ry = 48, 112, 28, 5
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                v = (x - cx) ** 2 * ry * ry + (y - cy) ** 2 * rx * rx
                if rx * rx * ry * ry - 80 <= v <= rx * rx * ry * ry:
                    c.set(x, y, GOLD if (x + y) % 2 == 0 else GOLD_D)
    return c.image()


def draw_shadow(rig) -> Image.Image:
    c = Pix(W, H)
    if rig["seated"]:
        c.ellipse(50, 116, 30, 3, C("#2B1741"))
    else:
        c.ellipse(46, 116, 22, 3, C("#2B1741"))
    return c.image()


def draw_chair() -> Image.Image:
    c = Pix(W, H)
    # respaldo y ruedas del rig sentado. El asiento queda bajo los muslos.
    c.rect(30, 52, 35, 92, SLATE)
    c.rect(72, 56, 77, 92, SLATE)
    c.rect(32, 84, 74, 92, VIOLET)
    c.rect(34, 86, 70, 90, LILAC)
    for cx in (30, 74):
        for y in range(88, 118):
            for x in range(cx - 14, cx + 15):
                d = (x - cx) ** 2 + (y - 102) ** 2
                if 12 * 12 <= d <= 14 * 14:
                    c.set(x, y, INK)
                elif d < 5 * 5:
                    c.set(x, y, GOLD)
        c.rect(cx - 1, 90, cx + 1, 114, SLATE_D)
    c.rect(54, 108, 74, 112, SLATE)
    c.disc(70, 114, 2, INK)
    c.outline()
    return c.image()


def draw_guide(rig) -> Image.Image:
    c = Pix(W, H)
    hx, hy = rig["head"]
    c.ellipse(hx, hy, rig["hrx"], rig["hry"], (186, 146, 235, 255))
    tx0, ty0, tx1, ty1 = rig["torso"]
    c.rect(tx0, ty0, tx1, ty1, (255, 244, 221, 255))
    if rig["seated"]:
        c.rect(*rig["thigh"], (120, 202, 168, 255))
    else:
        c.rect(*rig["leg_f"], (120, 202, 168, 255))
        c.rect(*rig["leg_b"], (186, 146, 235, 255))
    for name, (x, y) in rig["anchors"].items():
        c.set(x, y, (255, 80, 80, 255))
        c.set(x - 1, y, (255, 201, 93, 255))
        c.set(x + 1, y, (255, 201, 93, 255))
        c.set(x, y - 1, (255, 201, 93, 255))
        c.set(x, y + 1, (255, 201, 93, 255))
    for x in range(W):
        c.set(x, 118, (43, 23, 65, 255))
        if x % 2 == 0:
            c.set(x, 6, (237, 135, 176, 255))
    return c.image()


def pet_canvas() -> Pix:
    return Pix(48, 48)


def draw_pets() -> dict[str, Image.Image]:
    pets = {}
    # Chispa, salamandra de lava
    c = pet_canvas()
    c.ellipse(26, 30, 14, 7, C("#F08A3C"))
    c.ellipse(14, 28, 5, 4, C("#F08A3C"))
    c.disc(12, 26, 1, INK)
    c.set(11, 25, WHITE)
    c.rect(38, 26, 46, 28, C("#E25822"))
    c.rect(42, 22, 44, 26, GOLD)
    c.set(36, 26, GOLD)
    c.set(30, 28, C("#FFD27A"))
    for x in (20, 26, 32):
        c.rect(x, 36, x + 2, 40, C("#C45A22"))
    c.shade(C("#F08A3C"), C("#C45A22"), GOLD)
    c.outline()
    pets["pet_chispa"] = c.image()

    # Glu, babosa estelar
    c = pet_canvas()
    c.ellipse(24, 30, 14, 10, C("#7EE0C8"))
    c.rect(16, 12, 17, 20, LILAC)
    c.rect(28, 14, 29, 22, LILAC)
    c.disc(16, 11, 2, GOLD)
    c.disc(29, 13, 2, ROSE)
    c.disc(20, 28, 2, INK)
    c.disc(28, 28, 2, INK)
    c.set(19, 27, WHITE)
    c.set(27, 27, WHITE)
    c.rect(20, 33, 28, 33, PLUM)
    c.set(34, 24, WHITE)
    c.shade(C("#7EE0C8"), C("#3AA898"), WHITE)
    c.outline()
    pets["pet_glu"] = c.image()

    # Tinta, cuervo con bufanda
    c = pet_canvas()
    c.ellipse(24, 28, 12, 10, INK)
    c.disc(16, 20, 6, INK)
    c.disc(14, 18, 1, WHITE)
    c.disc(14, 19, 1, INK)
    c.rect(10, 20, 16, 22, GOLD)
    c.rect(20, 24, 36, 34, INK)
    c.rect(18, 30, 30, 33, ROSE)
    c.rect(28, 33, 30, 38, ROSE)
    c.rect(20, 38, 22, 44, INK)
    c.rect(30, 38, 32, 44, INK)
    c.outline()
    pets["pet_tinta"] = c.image()

    # Bip, perro robot de tres patas
    c = pet_canvas()
    c.rect(14, 18, 34, 34, C("#D9DEE8"))
    c.rect(16, 10, 28, 20, C("#EEF2F6"))
    c.rect(30, 8, 32, 16, MINT)
    c.disc(32, 7, 2, GOLD)
    c.rect(18, 14, 21, 16, MINT)
    c.rect(24, 14, 27, 16, MINT)
    c.rect(20, 19, 25, 20, SLATE)
    for x in (16, 24, 32):
        c.rect(x, 34, x + 3, 44, SLATE)
    c.shade(C("#D9DEE8"), C("#A8B0BE"), WHITE)
    c.outline()
    pets["pet_bip"] = c.image()

    # Miga, capibara con sombrero vegetal
    c = pet_canvas()
    c.ellipse(24, 30, 14, 10, C("#A9764E"))
    c.ellipse(16, 28, 7, 6, C("#C4926A"))
    c.disc(12, 26, 1, INK)
    c.set(11, 25, WHITE)
    c.rect(10, 30, 14, 31, C("#8A5A38"))
    c.disc(30, 16, 3, MINT)
    c.rect(22, 16, 28, 20, MINT_D)
    c.set(26, 14, MINT)
    c.rect(18, 38, 21, 44, C("#8A5A38"))
    c.rect(28, 38, 31, 44, C("#8A5A38"))
    c.shade(C("#A9764E"), C("#7A5232"), C("#E0B48A"))
    c.outline()
    pets["pet_miga"] = c.image()

    # Michi, gato de la ficha de módulos (no sustituye a las mascotas canónicas)
    c = pet_canvas()
    c.ellipse(26, 30, 12, 9, CREAM)
    c.disc(16, 22, 5, CREAM)
    c.rect(12, 14, 14, 20, CREAM)
    c.rect(18, 14, 20, 20, CREAM)
    c.disc(14, 21, 1, INK)
    c.set(13, 20, WHITE)
    c.rect(12, 24, 15, 25, ROSE)
    c.rect(34, 28, 44, 30, C("#F0B070"))
    c.rect(20, 26, 24, 30, C("#F0B070"))
    c.rect(22, 38, 25, 44, CREAM)
    c.rect(30, 38, 33, 44, CREAM)
    c.shade(CREAM, C("#E6D3B0"), WHITE)
    c.outline()
    pets["pet_michi"] = c.image()
    return pets


def draw_scenes() -> dict[str, Image.Image]:
    scenes = {}

    def sky(c, top, bot):
        c.rect(0, 0, 319, 179, top)
        c.rect(0, 90, 319, 179, bot)

    c = Pix(320, 180)
    sky(c, NIGHT, C("#3A2158"))
    for i, hgt in enumerate((70, 90, 50, 80, 60, 100, 46)):
        x = 8 + i * 28
        c.rect(x, 100 - hgt, x + 18, 120, C("#1B1230"))
        for wy in range(108 - hgt, 116, 8):
            c.rect(x + 3, wy, x + 6, wy + 3, GOLD if (i + wy) % 2 == 0 else ROSE)
    c.rect(0, 120, 319, 179, C("#2A2438"))
    c.rect(40, 128, 200, 136, SLATE)
    c.rect(210, 124, 250, 150, C("#6E3048"))
    c.rect(0, 0, 319, 8, C("#140C22"))
    for i in range(0, 320, 7):
        c.set(i, 20 + (i * 3) % 50, C("#9EC4FF"))
        c.set(i, 40 + (i * 5) % 40, LILAC)
    scenes["azotea_gimnasio"] = c.image()

    c = Pix(320, 180)
    sky(c, C("#120E28"), C("#1C3A36"))
    for i in range(30):
        c.set((i * 47) % 320, (i * 29) % 80, WHITE if i % 3 else GOLD)
    c.rect(16, 24, 300, 150, C("#16342E"))
    c.rect(24, 32, 292, 142, C("#8FD8C8"))
    for x in range(24, 292, 28):
        c.rect(x, 32, x + 2, 142, C("#2A6A5C"))
    c.rect(24, 80, 292, 82, C("#2A6A5C"))
    for x in (48, 100, 160, 220, 260):
        c.rect(x, 100, x + 16, 140, C("#2F8A52"))
        c.disc(x + 8, 96, 6, MINT)
    c.rect(0, 146, 319, 179, C("#6B4A32"))
    scenes["invernadero_orbital"] = c.image()

    c = Pix(320, 180)
    c.rect(0, 0, 319, 179, C("#3A2748"))
    c.rect(12, 16, 150, 160, C("#5A3E28"))
    for y in range(24, 150, 14):
        c.rect(20, y, 140, y + 8, VIOLET if (y // 14) % 2 == 0 else C("#8C4A3A"))
        c.rect(24, y + 2, 40, y + 6, GOLD)
        c.rect(48, y + 2, 70, y + 6, CREAM)
    c.rect(180, 20, 300, 110, C("#87A8C8"))
    for i in range(0, 40, 4):
        c.rect(190 + i, 28, 192 + i, 100, C("#D0E4F4"))
    c.rect(210, 120, 214, 150, GOLD)
    c.disc(212, 116, 3, GOLD)
    c.rect(0, 150, 319, 179, C("#6B4634"))
    scenes["biblioteca_botica"] = c.image()

    c = Pix(320, 180)
    c.rect(0, 0, 319, 110, C("#F7D9A8"))
    c.rect(0, 110, 319, 179, C("#E7B98A"))
    c.disc(250, 28, 10, GOLD)
    c.rect(20, 70, 70, 120, ROSE)
    c.rect(30, 80, 60, 100, GOLD)
    c.rect(90, 90, 200, 150, MINT)
    c.rect(100, 70, 190, 100, C("#F28B7A"))
    # rampa
    for i in range(8):
        c.rect(210 + i * 8, 130 - i * 4, 250, 150, CREAM)
    c.rect(0, 150, 319, 179, C("#C48A62"))
    c.disc(40, 40, 8, MINT)
    c.rect(36, 48, 44, 80, C("#6B4634"))
    scenes["plaza_solar"] = c.image()

    c = Pix(320, 180)
    c.rect(0, 0, 319, 90, C("#B7D8F2"))
    c.rect(0, 90, 319, 130, MINT)
    c.rect(0, 130, 319, 179, C("#6B8F4E"))
    c.rect(0, 150, 120, 179, C("#6EA4C8"))
    for x in (140, 170, 200, 230):
        c.rect(x, 110, x + 18, 140, C("#8B5A32"))
        c.rect(x + 2, 100, x + 8, 112, MINT_D)
        c.rect(x + 10, 102, x + 16, 114, C("#3E8F52"))
    c.rect(250, 88, 300, 140, C("#C47A4A"))
    c.rect(258, 70, 292, 90, ROSE)
    c.disc(40, 40, 12, GOLD)
    scenes["huerto_ribereno"] = c.image()

    c = Pix(320, 180)
    c.rect(0, 0, 319, 179, C("#F3E2C4"))
    c.rect(20, 20, 120, 90, C("#87A8C8"))
    c.rect(28, 28, 112, 82, C("#D7EEF8"))
    c.rect(150, 100, 280, 150, VIOLET)
    c.rect(160, 80, 270, 110, CREAM)
    c.rect(40, 120, 100, 170, C("#E7A0B4"))
    c.disc(230, 40, 6, GOLD)
    scenes["habitacion_cozy"] = c.image()
    return scenes


def draw_badges() -> dict[str, Image.Image]:
    badges = {}
    c = Pix(32, 32)
    c.disc(16, 18, 8, C("#F08A3C"))
    c.disc(12, 12, 4, GOLD)
    c.disc(20, 11, 3, ROSE)
    c.outline()
    badges["racha"] = c.image()
    c = Pix(32, 32)
    c.rect(16, 4, 20, 14, GOLD)
    c.rect(8, 14, 24, 18, GOLD)
    c.rect(12, 18, 20, 28, GOLD_D)
    c.outline()
    badges["xp"] = c.image()
    c = Pix(32, 32)
    c.disc(16, 16, 10, GOLD)
    c.disc(16, 16, 6, GOLD_D)
    c.rect(14, 10, 17, 22, CREAM)
    c.outline()
    badges["monedas"] = c.image()
    c = Pix(32, 32)
    c.rect(6, 6, 26, 26, MINT)
    c.rect(10, 16, 14, 20, WHITE)
    c.rect(14, 20, 22, 24, WHITE)
    c.outline()
    badges["habito"] = c.image()
    return badges


HAIR = [
    ("hair_brown_bun", "Moño castaño", "bun", "#8A5A32", "#5C3A20", "hair", 0, "common", "🎀", True),
    ("hair_white", "Trenzas canosas", "braids", "#E7E2DA", "#B7B1A8", "hair", 70, "rare", "🤍", False),
    ("hair_dark", "Pelo oscuro corto", "short", "#2B2433", "#16131C", "hair", 0, "common", "🖤", True),
    ("hair_blonde", "Rubio corto", "short", "#E6C36A", "#C49A3A", "hair", 40, "common", "💛", False),
    ("hair_teal", "Flequillo menta", "tuft", "#7DDEC8", "#3E8F72", "hair", 0, "common", "💚", True),
    ("hair_pink", "Coletas rosas", "pigtails", "#F2A0C0", "#C45B86", "hair", 80, "rare", "💗", False),
    ("hair_brasa", "Mechones de brasa", "spikes", "#7A2E48", "#4A1830", "hair", 110, "epic", "🔥", False),
    ("hair_bicolor", "Corto bicolor", "bicolor", "#78CAA8", "#693CA1", "hair", 90, "rare", "🎧", False),
]
TOPS = [
    ("top_hoodie_green", "Sudadera huerto", "hoodie", "#5EAA78", "#3E8F52", "shirt", 80, "common", "🌿", False),
    ("top_hoodie_purple", "Sudadera violeta", "hoodie", "#693CA1", "#4C2878", "shirt", 0, "common", "💜", True),
    ("top_hoodie_blue", "Sudadera azul", "hoodie", "#6AA6D8", "#3E78A8", "shirt", 80, "common", "👕", False),
    ("top_cream", "Suéter crema", "sweater", "#FFF4DD", "#E6D3B0", "shirt", 0, "common", "🤍", True),
    ("top_fire", "Chaqueta burdeos", "jacket", "#8E3048", "#5C1C30", "shirt", 130, "epic", "🔥", False),
    ("top_mint", "Chaqueta menta", "jacket", "#78CAA8", "#3E8F72", "shirt", 90, "rare", "🧥", False),
    ("top_overalls", "Peto de huerto", "overalls", "#3E8F52", "#2C6A3C", "shirt", 70, "common", "🪴", False),
    ("top_coat", "Abrigo de bruja", "coat", "#5B3A78", "#3A2454", "shirt", 120, "epic", "🧙", False),
    ("top_raincoat", "Chubasquero", "raincoat", "#D5E4F2", "#8AA4BE", "shirt", 90, "rare", "👽", False),
]
LOWERS = [
    ("shorts_green", "Shorts de huerto", "shorts", "#3E8F52", "#2C6A3C", "pants", 50, "common", "🩳", False),
    ("shorts_rose", "Shorts rosados", "shorts", "#ED87B0", "#C45B86", "pants", 50, "common", "🩳", False),
    ("jeans", "Vaqueros", "pants", "#4E6E96", "#314864", "pants", 0, "common", "👖", True),
    ("pants_cargo", "Cargo", "cargo", "#6B5B4A", "#463C30", "pants", 70, "common", "👖", False),
    ("skirt_purple", "Falda violeta", "skirt", "#693CA1", "#4C2878", "pants", 0, "common", "💜", True),
    ("skirt_gold", "Falda dorada", "skirt", "#FFC95D", "#E09A2E", "pants", 90, "rare", "✨", False),
]
SHOES = [
    ("shoes_brown", "Botas de campo", "#8A5A32", "#5C3A20", "shoes", 60, "common", "🥾", False),
    ("shoes_purple", "Botas violetas", "#693CA1", "#4C2878", "shoes", 70, "rare", "🥾", False),
    ("shoes_red", "Zapatillas rojas", "#E2584A", "#A83228", "shoes", 50, "common", "👟", False),
    ("shoes_mint", "Zapatillas menta", "#78CAA8", "#3E8F72", "shoes", 0, "common", "👟", True),
    ("shoes_white", "Zapatillas crema", "#FFF4DD", "#E6D3B0", "shoes", 0, "common", "👟", True),
]
HATS = [
    ("hat_witch", "Sombrero de estrella", "witch", "hat", 100, "epic", "🧙", False),
    ("hat_moon", "Boina luna", "moon", "hat", 60, "rare", "🌙", False),
    ("hat_flower", "Sombrero floral", "flower", "hat", 90, "rare", "🌸", False),
    ("hat_headphones", "Auriculares", "headphones", "hat", 80, "rare", "🎧", False),
]
BACKS = [
    ("cape_moon", "Capa violeta", "cape", "backpack", 120, "rare", "🌙", False),
    ("bag_moon", "Mochila luna", "bag", "backpack", 80, "common", "🎒", False),
    ("bag_botanical", "Bolso botánico", "botanical", "backpack", 90, "rare", "🪴", False),
]
HANDS = [
    ("prop_book", "Libreta", "book", "hand", 70, "rare", "📖", False),
    ("prop_watering", "Regadera", "watering", "hand", 60, "common", "💧", False),
    ("prop_bottle", "Botella de agua", "bottle", "hand", 40, "common", "🍼", False),
]
EXPRESSIONS = [
    ("alegre", "Alegre", ["humanoid_standard", "humanoid_wide", "humanoid_tall", "humanoid_seated"]),
    ("calma", "Calma", ["humanoid_standard", "humanoid_wide", "humanoid_tall", "humanoid_seated"]),
    ("cansada", "Cansada", ["humanoid_standard", "humanoid_wide", "humanoid_tall", "humanoid_seated"]),
    ("colmillo", "Colmillo", ["humanoid_standard", "humanoid_wide", "humanoid_seated"]),
    ("alegre_tres", "Tres ojos alegres", ["humanoid_tall"]),
    ("calma_tres", "Tres ojos en calma", ["humanoid_tall"]),
    ("cansada_tres", "Tres ojos cansados", ["humanoid_tall"]),
]
BODIES = [
    ("body_std_warm", "Piel cálida", "humanoid_standard", "warm", False, "Cuerpo medio, piel cálida"),
    ("body_std_dark", "Piel oscura", "humanoid_standard", "dark", False, "Cuerpo medio, tez oscura"),
    ("body_std_olive", "Piel oliva", "humanoid_standard", "olive", False, "Cuerpo medio, piel oliva"),
    ("body_lumo", "Lumo", "humanoid_wide", "warm", True, "Cuerpo amplio, piel cálida con pecas"),
    ("body_mora", "Mora", "humanoid_wide", "dark", False, "Cuerpo amplio, tez oscura"),
    ("body_brasa", "Brasa", "humanoid_wide", "demon", False, "Cuerpo amplio, piel granate"),
    ("body_vek", "Vek", "humanoid_tall", "alien", False, "Cuerpo alto, piel turquesa"),
    ("body_nix", "Nix", "humanoid_seated", "olive", False, "Cuerpo sentado, piel oliva. La silla es otra capa."),
]
PETS_META = [
    ("pet_michi", "Michi", 0, "common", "🐱", True, {"type": "none"}, "Gato de la ficha de módulos."),
    ("pet_miga", "Miga", 80, "rare", "🦫", False, {"type": "none"}, "Capibara de Lumo."),
    ("pet_tinta", "Tinta", 90, "rare", "🐦", False, {"type": "none"}, "Cuervo de Mora, con bufanda."),
    ("pet_glu", "Glu", 70, "rare", "🫧", False, {"type": "none"}, "Babosa estelar de Vek."),
    ("pet_chispa", "Chispa", 0, "legendary", "🦎", False, {"type": "streak", "value": 7}, "Salamandra de Brasa. Se desbloquea con constancia, sin azar."),
    ("pet_bip", "Bip", 140, "epic", "🤖", False, {"type": "level", "value": 2}, "Perro robot de tres patas."),
]
PRESETS = {
    "lumo": {
        "name": "Lumo", "rig": "humanoid_wide", "body": "body_lumo", "expression": "alegre",
        "hair": "hair_brown_bun", "upper": "top_overalls", "lower": "shorts_green",
        "shoes": "shoes_brown", "hand": "prop_watering", "pet": "pet_miga",
        "scene": "huerto_ribereno",
        "note": "Jardinero de cuerpo amplio. Miga espera junto a los pies.",
    },
    "mora": {
        "name": "Mora", "rig": "humanoid_wide", "body": "body_mora", "expression": "calma",
        "hair": "hair_white", "headwear": "hat_witch", "glasses": "glasses_round",
        "upper": "top_coat", "lower": "skirt_purple", "shoes": "shoes_purple",
        "backpack": "cape_moon", "hand": "prop_book", "pet": "pet_tinta",
        "scene": "biblioteca_botica",
        "note": "Bruja adulta, tez oscura, gafas redondas. Tinta lleva bufanda.",
    },
    "brasa": {
        "name": "Brasa", "rig": "humanoid_wide", "body": "body_brasa", "expression": "colmillo",
        "hair": "hair_brasa", "horns": "horns_curl", "upper": "top_fire",
        "lower": "pants_cargo", "shoes": "shoes_red", "pet": "pet_chispa",
        "scene": "azotea_gimnasio",
        "note": "Demonio corpulento, cuernos asimétricos. Chispa es la salamandra.",
    },
    "vek": {
        "name": "Vek", "rig": "humanoid_tall", "body": "body_vek", "expression": "alegre_tres",
        "hair": "hair_teal", "horns": "antenna_lila", "upper": "top_raincoat",
        "lower": "pants_cargo", "shoes": "shoes_mint", "backpack": "bag_botanical",
        "hand": "prop_bottle", "pet": "pet_glu", "scene": "invernadero_orbital",
        "note": "Alien alto, tres ojos y antenas. Glu brilla al lado.",
    },
    "nix": {
        "name": "Nix", "rig": "humanoid_seated", "body": "body_nix", "expression": "calma",
        "hair": "hair_bicolor", "headwear": "hat_headphones", "upper": "top_mint",
        "lower": "pants_cargo", "shoes": "shoes_white", "pet": "pet_bip",
        "scene": "plaza_solar",
        "note": "Cyborg en silla de ruedas del rig sentado. Bip tiene tres patas.",
    },
}
SCENES_META = [
    ("azotea_gimnasio", "Azotea gimnasio"),
    ("invernadero_orbital", "Invernadero orbital"),
    ("biblioteca_botica", "Biblioteca botica"),
    ("plaza_solar", "Plaza solar"),
    ("huerto_ribereno", "Huerto ribereño"),
    ("habitacion_cozy", "Habitación cozy"),
]
SLOT_Z = {
    "hair_front": 30,
    "upper_clothing": 10,
    "lower_clothing": 0,
    "shoes": 5,
    "horns_antennae": 25,
    "headwear": 35,
    "glasses": 38,
    "backpack_back": -20,
    "hand_prop": 40,
    "companion_front": 55,
    "aura_back": -40,
    "face": 15,
    "mobility_equipment": 8,
    "shadow": -35,
    "body_base": -10,
}


def rel(path: Path) -> str:
    return "/" + str(path.relative_to(ROOT / "public")).replace("\\", "/")


def compose(layers: list[Image.Image]) -> Image.Image:
    base = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for layer in layers:
        base.alpha_composite(layer)
    return base


def place_pet(pet: Image.Image, rig) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ax, ay = rig["anchors"]["companion"]
    left = ax - pet.width // 2
    top = ay - pet.height
    canvas.alpha_composite(pet, (left, top))
    return canvas


def shop_tuple(item_id, name, category, price, rarity, icon, free, unlock):
    return {
        "id": item_id,
        "name": name,
        "shopCategory": category,
        "price": price,
        "rarity": rarity,
        "icon": icon,
        "free": free,
        "unlock": unlock,
    }


def main():
    if ASSET.exists():
        shutil.rmtree(ASSET)
    ASSET.mkdir(parents=True)

    bodies = {}
    for bid, _name, rig_id, skin, freckles, _note in BODIES:
        img = draw_body(RIGS[rig_id], SKINS[skin], freckles)
        path = ASSET / "bodies" / f"{bid}.png"
        save(img, path)
        bodies[bid] = img

    guides = {}
    for rig_id, rig in RIGS.items():
        img = draw_guide(rig)
        save(img, ASSET / "rigs" / rig_id / "guide.png")
        guides[rig_id] = img

    shadows = {}
    for rig_id, rig in RIGS.items():
        img = draw_shadow(rig)
        save(img, ASSET / "rigs" / rig_id / "shadow.png")
        shadows[rig_id] = img

    chair = draw_chair()
    save(chair, ASSET / "layers" / "humanoid_seated" / "mobility_equipment" / "wheelchair.png")

    layer_cache = {}

    def put_layer(slot, item_id, painter):
        src = {}
        for rig_id, rig in RIGS.items():
            img = painter(rig)
            path = ASSET / "layers" / rig_id / slot / f"{item_id}.png"
            save(img, path)
            src[rig_id] = rel(path)
            layer_cache[(item_id, rig_id)] = img
        return src

    items = []

    def add_item(item_id, name, slot, src_by_rig, category, price, rarity, icon, free, unlock=None, rigs=None):
        items.append({
            "id": item_id,
            "name": name,
            "slot": slot,
            "src": next(iter(src_by_rig.values())),
            "srcByRig": src_by_rig,
            "fullCanvas": slot != "companion_front",
            "w": 48 if slot == "companion_front" else 96,
            "h": 48 if slot == "companion_front" else 128,
            "anchor": "companion" if slot == "companion_front" else "ground",
            "origin": "bottom" if slot == "companion_front" else "top",
            "z": SLOT_Z[slot],
            "rigs": rigs or list(RIG_IDS),
            "shopCategory": category,
            "price": price,
            "rarity": rarity,
            "unlock": unlock or {"type": "none"},
            "free": free,
            "icon": icon,
        })

    for spec in HAIR:
        iid, name, kind, col, dark, cat, price, rarity, icon, free = spec
        src = put_layer("hair_front", iid, lambda rig, k=kind, c=C(col), d=C(dark): draw_hair(rig, k, c, d))
        add_item(iid, name, "hair_front", src, cat, price, rarity, icon, free, {"type": "level", "value": 2} if rarity == "epic" else {"type": "none"})

    for spec in TOPS:
        iid, name, kind, col, dark, cat, price, rarity, icon, free = spec
        src = put_layer("upper_clothing", iid, lambda rig, k=kind, c=C(col), d=C(dark): draw_top(rig, k, c, d))
        add_item(iid, name, "upper_clothing", src, cat, price, rarity, icon, free, {"type": "level", "value": 2} if rarity == "epic" else {"type": "none"})

    for spec in LOWERS:
        iid, name, kind, col, dark, cat, price, rarity, icon, free = spec
        src = put_layer("lower_clothing", iid, lambda rig, k=kind, c=C(col), d=C(dark): draw_lower(rig, k, c, d))
        add_item(iid, name, "lower_clothing", src, cat, price, rarity, icon, free)

    for spec in SHOES:
        iid, name, col, dark, cat, price, rarity, icon, free = spec
        src = put_layer("shoes", iid, lambda rig, c=C(col), d=C(dark): draw_shoes(rig, c, d))
        add_item(iid, name, "shoes", src, cat, price, rarity, icon, free)

    src = put_layer("horns_antennae", "horns_curl", lambda rig: draw_horns(rig, "curl"))
    add_item("horns_curl", "Cuernos asimétricos", "horns_antennae", src, "horns", 100, "epic", "🌙", False, {"type": "level", "value": 2})
    src = put_layer("horns_antennae", "antenna_lila", lambda rig: draw_horns(rig, "antenna"))
    add_item("antenna_lila", "Antenas", "horns_antennae", src, "horns", 60, "rare", "📡", False)

    for spec in HATS:
        iid, name, kind, cat, price, rarity, icon, free = spec
        src = put_layer("headwear", iid, lambda rig, k=kind: draw_hat(rig, k))
        add_item(iid, name, "headwear", src, cat, price, rarity, icon, free, {"type": "level", "value": 2} if rarity == "epic" else {"type": "none"})

    src = put_layer("glasses", "glasses_round", draw_glasses)
    add_item("glasses_round", "Gafas redondas", "glasses", src, "glasses", 50, "common", "👓", False)

    for spec in BACKS:
        iid, name, kind, cat, price, rarity, icon, free = spec
        src = put_layer("backpack_back", iid, lambda rig, k=kind: draw_back(rig, k))
        add_item(iid, name, "backpack_back", src, cat, price, rarity, icon, free, {"type": "level", "value": 2} if rarity == "epic" else {"type": "none"})

    for spec in HANDS:
        iid, name, kind, cat, price, rarity, icon, free = spec
        src = put_layer("hand_prop", iid, lambda rig, k=kind: draw_hand(rig, k))
        add_item(iid, name, "hand_prop", src, cat, price, rarity, icon, free)

    expressions = []
    for eid, name, rigs in EXPRESSIONS:
        src = {}
        for rig_id in rigs:
            img = draw_face(RIGS[rig_id], eid if eid.endswith("tres") or eid == "colmillo" else eid)
            # draw_face kind names match ids
            path = ASSET / "layers" / rig_id / "face" / f"{eid}.png"
            save(img, path)
            src[rig_id] = rel(path)
            layer_cache[(eid, rig_id)] = img
        expressions.append({
            "id": eid, "name": name, "slot": "face", "src": next(iter(src.values())),
            "srcByRig": src, "fullCanvas": True, "w": 96, "h": 128, "z": 15, "rigs": rigs,
        })

    auras = []
    for eid, name, price, icon in (("sparkles", "Chispas", 40, "✨"), ("hearts", "Corazones", 40, "💗"), ("ring", "Anillo", 30, "⭕")):
        img = draw_aura(eid)
        path = ASSET / "auras" / f"{eid}.png"
        save(img, path)
        layer_cache[(eid, "any")] = img
        auras.append({
            "id": eid, "name": name, "slot": "aura_back", "src": rel(path), "fullCanvas": True,
            "w": 96, "h": 128, "z": -40, "shopCategory": "effect", "price": price, "rarity": "rare",
            "unlock": {"type": "none"}, "free": False, "icon": icon, "rigs": list(RIG_IDS),
        })

    pets = draw_pets()
    for pid, img in pets.items():
        save(img, ASSET / "companions" / f"{pid}.png")
    for pid, name, price, rarity, icon, free, unlock, _note in PETS_META:
        items.append({
            "id": pid, "name": name, "slot": "companion_front",
            "src": rel(ASSET / "companions" / f"{pid}.png"),
            "fullCanvas": False, "w": 48, "h": 48, "anchor": "companion", "origin": "bottom",
            "z": 55, "rigs": list(RIG_IDS), "shopCategory": "pet", "price": price,
            "rarity": rarity, "unlock": unlock, "free": free, "icon": icon,
        })

    scenes_meta = []
    for sid, img in draw_scenes().items():
        small = ASSET / "scenes" / sid / "background_320x180.png"
        big = ASSET / "scenes" / sid / "background_640x360.png"
        save(img, small)
        save(img.resize((640, 360), Image.Resampling.NEAREST), big)
    for sid, name in SCENES_META:
        scenes_meta.append({
            "id": sid, "name": name,
            "src": rel(ASSET / "scenes" / sid / "background_640x360.png"),
            "srcSmall": rel(ASSET / "scenes" / sid / "background_320x180.png"),
        })

    for bid, img in draw_badges().items():
        save(img, ASSET / "ui" / "badges" / f"{bid}_32x32.png")

    # previews de los cinco personajes
    index = {item["id"]: item for item in items}
    aura_index = {a["id"]: a for a in auras}
    exp_index = {e["id"]: e for e in expressions}
    body_index = {b[0]: b for b in BODIES}

    def layer_image(item, rig_id):
        if item["id"] in layer_cache and (item["id"], rig_id) in layer_cache:
            return layer_cache[(item["id"], rig_id)]
        if item["slot"] == "companion_front":
            return place_pet(pets[item["id"]], RIGS[rig_id])
        if item["slot"] == "aura_back":
            return layer_cache[(item["id"], "any")]
        return layer_cache[(item["id"], rig_id)]

    presets_out = {}
    for pid, preset in PRESETS.items():
        rig_id = preset["rig"]
        stack = [( -35, shadows[rig_id] )]
        if preset.get("backpack"):
            stack.append((-20, layer_image(index[preset["backpack"]], rig_id)))
        stack.append((-10, bodies[preset["body"]]))
        if rig_id == "humanoid_seated":
            stack.append((8, chair))
        z_of = {
            "lower": 0, "shoes": 5, "upper": 10, "expression": 15, "horns": 25,
            "hair": 30, "headwear": 35, "glasses": 38, "hand": 40,
        }
        for key, z in z_of.items():
            iid = preset.get(key)
            if not iid:
                continue
            src_item = exp_index[iid] if key == "expression" else index[iid]
            stack.append((z, layer_image(src_item, rig_id)))
        if preset.get("pet"):
            stack.append((55, place_pet(pets[preset["pet"]], RIGS[rig_id])))
        preview = compose([img for _z, img in sorted(stack, key=lambda pair: pair[0])])
        save(preview, ASSET / "avatars" / pid / "preview_96x128.png")
        save(preview.resize((384, 512), Image.Resampling.NEAREST), ASSET / "avatars" / pid / "preview_384x512.png")
        presets_out[pid] = {"id": pid, **preset}

    # lámina de control para revisar a ojo
    sheet = Image.new("RGBA", (96 * 5, 128), (255, 244, 221, 255))
    for i, pid in enumerate(("brasa", "vek", "mora", "nix", "lumo")):
        sheet.alpha_composite(Image.open(ASSET / "avatars" / pid / "preview_96x128.png"), (i * 96, 0))
    sheet.resize((96 * 5 * 4, 128 * 4), Image.Resampling.NEAREST).save("/tmp/npc_preview.png")

    manifest = {
        "version": "1.1.0",
        "style": "neo-pixel-cozy",
        "native": True,
        "canvas": {"width": 96, "height": 128, "groundY": 118, "safeTop": 6, "displayScale": 4},
        "palette": {
            "plum_950": "#2B1741", "violet_700": "#693CA1", "lilac_400": "#BA92EB",
            "cream_100": "#FFF4DD", "mint_400": "#78CAA8", "gold_400": "#FFC95D",
            "rose_400": "#ED87B0", "slate_650": "#555267",
        },
        "layerOrder": [
            "shadow", "aura_back", "backpack_back", "body_base", "mobility_equipment",
            "lower_clothing", "shoes", "upper_clothing", "face", "horns_antennae",
            "hair_front", "headwear", "glasses", "hand_prop", "companion_front",
        ],
        "rigs": {
            rig_id: {"id": rig_id, "anchors": rig["anchors"], "guide": rel(ASSET / "rigs" / rig_id / "guide.png")}
            for rig_id, rig in RIGS.items()
        },
        "bodies": [
            {
                "id": bid, "name": name, "rig": rig_id,
                "src": rel(ASSET / "bodies" / f"{bid}.png"),
                "fullCanvas": True, "z": -10, "note": note,
            }
            for bid, name, rig_id, _skin, _freckles, note in BODIES
        ],
        "mobility": {
            "id": "wheelchair", "name": "Silla de ruedas", "slot": "mobility_equipment",
            "src": rel(ASSET / "layers" / "humanoid_seated" / "mobility_equipment" / "wheelchair.png"),
            "fullCanvas": True, "z": 8, "rigs": ["humanoid_seated"],
            "note": "Pertenece al rig sentado. No se superpone a un cuerpo de pie.",
        },
        "shadows": {
            rig_id: {"src": rel(ASSET / "rigs" / rig_id / "shadow.png"), "fullCanvas": True, "z": -35}
            for rig_id in RIG_IDS
        },
        "expressions": expressions,
        "auras": auras,
        "items": items,
        "scenes": scenes_meta,
        "presets": presets_out,
        "gaps": [
            "No hay fotogramas de idle, celebrate, tired, walk ni blink. Solo la pose maestra.",
            "No hay capa de primer plano parallax en los escenarios.",
            "No hay tatuaje, piercing ni alas en este set. Esas piezas del catálogo viejo quedan fuera en vez de reutilizarse como si fueran canónicas.",
            "Las gafas tapan un anillo, no un cristal semitransparente: el alpha es 0 o 255.",
            "El chubasquero de Vek usa colores sólidos. El canon pide representar lo translúcido sin degradado.",
        ],
    }
    text = json.dumps(manifest, ensure_ascii=False, indent=2)
    (ASSET / "manifest.json").write_text(text + "\n", encoding="utf-8")
    (ROOT / "src" / "avatar" / "neoPixelManifest.json").write_text(text + "\n", encoding="utf-8")
    (ASSET / "palette.json").write_text(json.dumps(manifest["palette"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # comprobaciones
    bad = []
    for path in ASSET.rglob("*.png"):
        im = Image.open(path)
        if im.mode != "RGBA":
            bad.append(f"{path} mode {im.mode}")
        name = path.name
        if name.startswith("background_320"):
            expect = (320, 180)
        elif name.startswith("background_640"):
            expect = (640, 360)
        elif "companions" in path.parts:
            expect = (48, 48)
        elif "badges" in path.parts:
            expect = (32, 32)
        elif name.startswith("preview_384"):
            expect = (384, 512)
        else:
            expect = (96, 128)
        if im.size != expect:
            bad.append(f"{path} size {im.size} != {expect}")
        alphas = set()
        for px in im.getdata():
            alphas.add(px[3])
            if len(alphas) > 3:
                break
        if any(a not in (0, 255) for a in alphas):
            bad.append(f"{path} alpha parcial")
    if bad:
        raise SystemExit("\n".join(bad[:20]))
    print(f"ok {len(list(ASSET.rglob('*.png')))} png")


if __name__ == "__main__":
    main()
