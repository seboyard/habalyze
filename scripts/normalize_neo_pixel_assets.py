#!/usr/bin/env python3
"""Normalize a curated subset of Habalyze Neo Pixel Cozy cut-outs.

The raw pack is not rig-aligned: sizes vary, edges are antialiased, and there
is no shared pivot. This script hardens alpha, scales with nearest-neighbor
into slot boxes, and places body bases on a shared 96×128 canvas so the app
can stack layers. Pieces that are not isolated, aligned, or on-style are
skipped on purpose.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/tmp/pack/asset_pack_v1")
OUT = Path("/workspace/public/assets/neo_pixel_cozy/v1")
MANIFEST_PATH = Path("/workspace/src/avatar/neoPixelManifest.json")

CANVAS = (96, 128)
GROUND_Y = 118
PALETTE = {
    "plum_950": "#2B1741",
    "violet_700": "#693CA1",
    "lilac_400": "#BA92EB",
    "cream_100": "#FFF4DD",
    "mint_400": "#78CAA8",
    "gold_400": "#FFC95D",
    "rose_400": "#ED87B0",
    "slate_650": "#555267",
}

# slot, anchor, origin, max box, z
SLOT_META = {
    "aura_back": ("torso", "center", (96, 128), -40),
    "backpack_back": ("torso", "center", (78, 58), -20),
    "body_base": ("ground", "bottom", (70, 108), -10),
    "mobility_equipment": ("ground", "bottom", (96, 128), -8),
    "lower_clothing": ("hips", "center", (52, 36), 0),
    "shoes": ("feet", "bottom", (48, 22), 5),
    "upper_clothing": ("torso", "center", (58, 42), 10),
    "face": ("face", "center", (36, 18), 15),
    "hair_front": ("head", "center", (62, 46), 30),
    "horns_antennae": ("head", "bottom", (64, 30), 32),
    "headwear": ("head", "bottom", (68, 40), 35),
    "glasses": ("face", "center", (34, 16), 40),
    "hand_prop": ("hand", "bottom", (30, 34), 40),
    "aura_front": ("torso", "center", (96, 128), 50),
    "companion_front": ("companion", "bottom", (40, 40), 55),
}

ITEMS = [
    # hair
    ("hair_brown_bun", "hair_front", "05_modulares_generales/05_modulares_generales_001.png", "Moño castaño", "hair", 0, "common", "🎀", True),
    ("hair_white", "hair_front", "05_modulares_generales/05_modulares_generales_002.png", "Melena blanca", "hair", 70, "rare", "🤍", False),
    ("hair_dark", "hair_front", "05_modulares_generales/05_modulares_generales_003.png", "Pelo oscuro", "hair", 40, "common", "🖤", False),
    ("hair_blonde", "hair_front", "05_modulares_generales/05_modulares_generales_004.png", "Rubio corto", "hair", 40, "common", "💛", False),
    ("hair_teal", "hair_front", "05_modulares_generales/05_modulares_generales_006.png", "Flequillo menta", "hair", 0, "common", "💚", True),
    ("hair_pink", "hair_front", "05_modulares_generales/05_modulares_generales_009.png", "Coletas rosas", "hair", 80, "rare", "💗", False),
    ("hair_violet", "hair_front", "05_modulares_generales/05_modulares_generales_013.png", "Ondas violetas", "hair", 90, "rare", "💜", False),
    ("hair_blue", "hair_front", "05_modulares_generales/05_modulares_generales_021.png", "Colas azules", "hair", 90, "rare", "💙", False),
    ("hair_cat", "hair_front", "05_modulares_generales/05_modulares_generales_019.png", "Pelo con orejas", "hair", 120, "epic", "🐱", False),
    ("hair_brasa", "hair_front", "03_demonio/03_demonio_001.png", "Mechones de brasa", "hair", 110, "epic", "🔥", False),
    # horns / antennae
    ("horns_curl", "horns_antennae", "04_alien/04_alien_007.png", "Cuernos curvos", "hat", 100, "epic", "🌙", False),
    ("horns_gold", "horns_antennae", "05_modulares_generales/05_modulares_generales_049.png", "Cuernos dorados", "hat", 140, "legendary", "✨", False),
    ("antenna_lila", "horns_antennae", "04_alien/04_alien_036.png", "Antena lila", "hat", 60, "rare", "📡", False),
    # tops
    ("top_cream", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_001.png", "Suéter crema", "shirt", 0, "common", "🤍", True),
    ("top_moon", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_004.png", "Top luna", "shirt", 70, "rare", "🌙", False),
    ("top_star", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_007.png", "Top estrella", "shirt", 70, "rare", "⭐", False),
    ("top_hoodie_blue", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_015.png", "Sudadera alien", "shirt", 90, "rare", "👽", False),
    ("top_fire", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_018.png", "Chaqueta de fuego", "shirt", 130, "epic", "🔥", False),
    ("top_hoodie_yellow", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_021.png", "Sudadera sol", "shirt", 80, "common", "🌞", False),
    ("top_hoodie_green", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_022.png", "Sudadera huerto", "shirt", 80, "common", "🌿", False),
    ("top_hoodie_pink", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_023.png", "Sudadera conejo", "shirt", 80, "rare", "🐰", False),
    ("top_hoodie_purple", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_026.png", "Sudadera violeta", "shirt", 0, "common", "💜", True),
    ("top_jacket", "upper_clothing", "02_prendas_y_props/02_prendas_y_props_027.png", "Chaqueta varsity", "shirt", 120, "epic", "🧥", False),
    # bottoms
    ("shorts_rose", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_031.png", "Shorts rosados", "pants", 50, "common", "🩳", False),
    ("shorts_green", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_032.png", "Shorts de huerto", "pants", 50, "common", "🌿", False),
    ("jeans", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_033.png", "Vaqueros", "pants", 0, "common", "👖", True),
    ("pants_moon", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_035.png", "Pantalón luna", "pants", 80, "rare", "🌙", False),
    ("pants_cargo", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_043.png", "Cargo violeta", "pants", 70, "common", "👖", False),
    ("skirt_gold", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_045.png", "Falda dorada", "pants", 90, "rare", "✨", False),
    ("skirt_purple", "lower_clothing", "02_prendas_y_props/02_prendas_y_props_055.png", "Falda violeta", "pants", 0, "common", "💜", True),
    # shoes
    ("shoes_pink", "shoes", "02_prendas_y_props/02_prendas_y_props_087.png", "Botitas rosas", "shoes", 40, "common", "👟", False),
    ("shoes_red", "shoes", "02_prendas_y_props/02_prendas_y_props_089.png", "Zapatillas rojas", "shoes", 50, "common", "👟", False),
    ("shoes_yellow", "shoes", "02_prendas_y_props/02_prendas_y_props_091.png", "Zapatillas sol", "shoes", 50, "common", "👟", False),
    ("shoes_mint", "shoes", "02_prendas_y_props/02_prendas_y_props_092.png", "Zapatillas menta", "shoes", 0, "common", "👟", True),
    ("shoes_brown", "shoes", "02_prendas_y_props/02_prendas_y_props_093.png", "Botas de campo", "shoes", 60, "common", "🥾", False),
    ("shoes_white", "shoes", "02_prendas_y_props/02_prendas_y_props_099.png", "Botas blancas", "shoes", 0, "common", "🥾", True),
    ("shoes_purple", "shoes", "02_prendas_y_props/02_prendas_y_props_098.png", "Botas violetas", "shoes", 70, "rare", "🥾", False),
    # headwear
    ("hat_witch", "headwear", "01_fantasia_bruja/01_fantasia_bruja_001.png", "Sombrero de bruja", "hat", 100, "epic", "🧙", False),
    ("hat_moon", "headwear", "01_fantasia_bruja/01_fantasia_bruja_002.png", "Sombrero luna", "hat", 110, "epic", "🌙", False),
    ("hat_flower", "headwear", "01_fantasia_bruja/01_fantasia_bruja_003.png", "Sombrero floral", "hat", 90, "rare", "🌸", False),
    ("hat_star", "headwear", "01_fantasia_bruja/01_fantasia_bruja_004.png", "Sombrero estrella", "hat", 90, "rare", "⭐", False),
    ("hat_bow", "headwear", "01_fantasia_bruja/01_fantasia_bruja_006.png", "Gorro con lazo", "hat", 60, "common", "🎀", False),
    # back
    ("wings_fairy", "backpack_back", "05_modulares_generales/05_modulares_generales_057.png", "Alas hada", "backpack", 150, "epic", "🦋", False),
    ("wings_bat", "backpack_back", "05_modulares_generales/05_modulares_generales_075.png", "Alas murciélago", "backpack", 140, "epic", "🦇", False),
    ("wings_angel", "backpack_back", "05_modulares_generales/05_modulares_generales_073.png", "Alas claras", "backpack", 140, "epic", "🕊️", False),
    ("cape_moon", "backpack_back", "02_prendas_y_props/02_prendas_y_props_081.png", "Capa luna", "backpack", 120, "rare", "🌙", False),
    ("bag_moon", "backpack_back", "02_prendas_y_props/02_prendas_y_props_108.png", "Mochila luna", "backpack", 80, "common", "🎒", False),
    ("bag_bat", "backpack_back", "02_prendas_y_props/02_prendas_y_props_110.png", "Mochila murciélago", "backpack", 90, "rare", "🎒", False),
    # props
    ("prop_book", "hand_prop", "01_fantasia_bruja/01_fantasia_bruja_155.png", "Libro de hechizos", "hand", 70, "rare", "📖", False),
    ("prop_potion", "hand_prop", "01_fantasia_bruja/01_fantasia_bruja_146.png", "Poción rosa", "hand", 40, "common", "🧪", False),
    ("prop_lantern", "hand_prop", "01_fantasia_bruja/01_fantasia_bruja_096.png", "Farol", "hand", 50, "common", "🏮", False),
    # pets — canon companions are missing; these are the closest isolated creatures
    ("pet_shiba", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_176.png", "Shiba", "pet", 0, "common", "🐶", True),
    ("pet_bunny", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_177.png", "Conejo", "pet", 80, "rare", "🐰", False),
    ("pet_owl", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_181.png", "Búho", "pet", 90, "rare", "🦉", False),
    ("pet_frog", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_182.png", "Rana", "pet", 70, "common", "🐸", False),
    ("pet_dragon", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_172.png", "Dragón pequeño", "pet", 160, "legendary", "🐉", False),
    ("pet_robot", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_173.png", "Robot mascota", "pet", 140, "epic", "🤖", False),
    ("pet_cat", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_162.png", "Gato brujo", "pet", 100, "rare", "🐱", False),
    ("pet_hedgehog", "companion_front", "01_fantasia_bruja/01_fantasia_bruja_185.png", "Erizo", "pet", 80, "rare", "🦔", False),
]

SCENES = [
    ("habitacion_cozy", "Habitación cozy", "07_fondos_completos/01_habitacion_cozy_horizontal_640x360.png"),
    ("azotea_cyberpunk", "Azotea nocturna", "07_fondos_completos/02_azotea_cyberpunk_horizontal_640x360.png"),
    ("bosque_bruja", "Bosque de bruja", "07_fondos_completos/03_bosque_bruja_horizontal_640x360.png"),
    ("planeta_alien", "Planeta alien", "07_fondos_completos/04_planeta_alien_horizontal_640x360.png"),
    ("ruinas_demoniacas", "Ruinas", "07_fondos_completos/05_ruinas_demoniacas_horizontal_640x360.png"),
    ("jardin_soleado", "Jardín soleado", "07_fondos_completos/06_jardin_soleado_horizontal_640x360.png"),
    ("habitacion_submarina", "Cuarto submarino", "07_fondos_completos/07_habitacion_submarina_horizontal_640x360.png"),
    ("observatorio_estelar", "Observatorio", "07_fondos_completos/08_observatorio_estelar_horizontal_640x360.png"),
]

ALL_RIGS = ["humanoid_standard", "humanoid_wide", "humanoid_tall", "humanoid_seated"]


def harden(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    src = im.load()
    dst = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = src[x, y]
            if a >= 128:
                dst[x, y] = (r, g, b, 255)
    return out


def cover_lavender(im: Image.Image) -> Image.Image:
    """Replace the base body's lavender undergarment with the surrounding skin tone."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 128:
                continue
            if b > r + 18 and b > g - 5 and b > 170 and r > 140:
                px[x, y] = (236, 186, 150, 255)
    return im


def tint(im: Image.Image, target, strength: float) -> Image.Image:
    px = im.load()
    tr, tg, tb = target
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (r + g + b) / 3
            if lum < 70:
                continue
            px[x, y] = (
                int(r * (1 - strength) + tr * strength),
                int(g * (1 - strength) + tg * strength),
                int(b * (1 - strength) + tb * strength),
                a,
            )
    return im


def trim(im: Image.Image) -> Image.Image:
    box = im.getbbox()
    return im.crop(box) if box else im


def fit(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    im = trim(im)
    if im.width == 0 or im.height == 0:
        return im
    scale = min(max_w / im.width, max_h / im.height)
    nw = max(1, round(im.width * scale))
    nh = max(1, round(im.height * scale))
    return im.resize((nw, nh), Image.Resampling.NEAREST)


def load_cutout(rel: str) -> Image.Image:
    return harden(Image.open(ROOT / rel))


def paste(canvas: Image.Image, sprite: Image.Image, xy) -> None:
    canvas.alpha_composite(sprite, (int(xy[0]), int(xy[1])))


def draw_wheelchair(canvas: Image.Image, seat_y: int, cx: int) -> None:
    draw = ImageDraw.Draw(canvas)
    plum = (43, 23, 65, 255)
    mint = (120, 202, 168, 255)
    gold = (255, 201, 93, 255)
    # big wheels
    for ox in (-18, 18):
        draw.ellipse((cx + ox - 13, seat_y + 2, cx + ox + 13, seat_y + 28), outline=plum, width=3)
        draw.ellipse((cx + ox - 4, seat_y + 11, cx + ox + 4, seat_y + 19), fill=gold)
    draw.rectangle((cx - 20, seat_y - 2, cx + 20, seat_y + 6), fill=mint, outline=plum)
    draw.rectangle((cx - 22, seat_y - 18, cx - 16, seat_y + 2), fill=plum)
    draw.rectangle((cx + 16, seat_y + 8, cx + 28, seat_y + 12), fill=plum)


def draw_expression(kind: str) -> Image.Image:
    im = Image.new("RGBA", (36, 18), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ink = (43, 23, 65, 255)
    blush = (237, 135, 176, 255)
    if kind == "alegre":
        d.rectangle((6, 2, 10, 8), fill=ink)
        d.rectangle((22, 2, 26, 8), fill=ink)
        d.rectangle((7, 3, 8, 4), fill=(255, 255, 255, 255))
        d.rectangle((23, 3, 24, 4), fill=(255, 255, 255, 255))
        d.rectangle((12, 12, 14, 13), fill=(180, 60, 80, 255))
        d.rectangle((14, 13, 20, 15), fill=(180, 60, 80, 255))
        d.rectangle((20, 12, 22, 13), fill=(180, 60, 80, 255))
        d.rectangle((2, 8, 5, 10), fill=blush)
        d.rectangle((28, 8, 31, 10), fill=blush)
    elif kind == "calma":
        d.rectangle((6, 4, 12, 6), fill=ink)
        d.rectangle((22, 4, 28, 6), fill=ink)
        d.rectangle((14, 13, 22, 15), fill=(180, 60, 80, 255))
    else:  # cansada
        d.rectangle((6, 5, 12, 7), fill=ink)
        d.rectangle((22, 5, 28, 7), fill=ink)
        d.rectangle((12, 14, 16, 15), fill=(120, 70, 90, 255))
        d.rectangle((18, 13, 22, 14), fill=(120, 70, 90, 255))
        d.rectangle((8, 9, 9, 12), fill=(120, 180, 220, 255))
    return im


def draw_aura(kind: str) -> Image.Image:
    im = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if kind == "sparkles":
        color = (255, 201, 93, 255)
        for x, y in ((18, 30), (74, 24), (80, 70), (16, 78), (48, 12)):
            d.rectangle((x, y, x + 2, y + 2), fill=color)
            d.rectangle((x + 1, y - 2, x + 1, y + 4), fill=color)
            d.rectangle((x - 2, y + 1, x + 4, y + 1), fill=color)
    elif kind == "hearts":
        color = (237, 135, 176, 255)
        for x, y in ((20, 36), (70, 28), (64, 80)):
            d.rectangle((x, y, x + 2, y + 2), fill=color)
            d.rectangle((x + 3, y, x + 5, y + 2), fill=color)
            d.rectangle((x + 1, y + 2, x + 4, y + 5), fill=color)
    else:
        color = (186, 146, 235, 255)
        d.ellipse((22, 96, 74, 112), outline=color, width=2)
    return im


def place_body(sprite: Image.Image, target_h: int, widen: float, cut_legs: bool, chair: bool = False) -> tuple[Image.Image, dict]:
    sprite = trim(sprite)
    if cut_legs:
        cut = int(sprite.height * 0.56)
        cropped = sprite.crop((0, 0, sprite.width, cut))
        sprite = trim(cropped)
        target_h = int(target_h * 0.70)
    scale = target_h / sprite.height
    nw = max(1, round(sprite.width * scale * widen))
    nh = target_h
    resized = sprite.resize((nw, nh), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - nw) // 2
    y = GROUND_Y - nh
    paste(canvas, resized, (x, y))
    bbox = resized.getbbox()
    x0, y0, x1, y1 = bbox
    x0 += x
    x1 += x
    y0 += y
    y1 += y
    cx = (x0 + x1) // 2
    height = max(1, y1 - y0)
    anchors = {
        "head": [cx, y0 + int(height * 0.06)],
        "face": [cx, y0 + int(height * 0.22)],
        "torso": [cx, y0 + int(height * 0.48)],
        "hips": [cx, y0 + int(height * 0.66)],
        "hand": [min(CANVAS[0] - 8, x1 + 2), y0 + int(height * 0.50)],
        "feet": [cx, y1 - 2],
        "companion": [max(8, x0 - 8), y1 - 2],
        "ground": [cx, GROUND_Y],
    }
    if cut_legs or chair:
        seat = (y1 - 6) if cut_legs else (y0 + int(height * 0.60))
        draw_wheelchair(canvas, seat, cx)
        if cut_legs:
            anchors["feet"] = [cx, min(CANVAS[1] - 4, y1 + 12)]
            anchors["companion"] = [max(6, x0 - 16), anchors["feet"][1]]
    return canvas, anchors


def main() -> None:
    if not ROOT.exists():
        raise SystemExit(f"Pack not extracted at {ROOT}")
    if OUT.exists():
        for p in OUT.rglob("*"):
            if p.is_file():
                p.unlink()
    (OUT / "items").mkdir(parents=True, exist_ok=True)
    (OUT / "bodies").mkdir(parents=True, exist_ok=True)
    (OUT / "expressions").mkdir(parents=True, exist_ok=True)
    (OUT / "auras").mkdir(parents=True, exist_ok=True)
    (OUT / "scenes").mkdir(parents=True, exist_ok=True)
    (OUT / "previews").mkdir(parents=True, exist_ok=True)

    human = cover_lavender(load_cutout("05_modulares_generales/05_modulares_generales_007.png"))
    alien = load_cutout("04_alien/04_alien_017.png")
    mora = tint(human.copy(), (92, 56, 42), 0.62)
    brasa = tint(human.copy(), (150, 48, 62), 0.55)
    nix_src = tint(human.copy(), (128, 118, 72), 0.35)

    body_specs = {
        "body_lumo": (human, "humanoid_standard", 100, 1.0, False, False, "Lumo", "Piel cálida, cuerpo medio"),
        "body_mora": (mora, "humanoid_wide", 102, 1.16, False, False, "Mora", "Complexión ancha, tez profunda (tintado: no había base oscura nativa)"),
        "body_brasa": (brasa, "humanoid_wide", 104, 1.2, False, False, "Brasa", "Complexión ancha, piel granate (tintado: no había cuerpo demonio)"),
        "body_vek": (alien, "humanoid_tall", 108, 0.92, False, False, "Vek", "Cuerpo alto, piel turquesa"),
        "body_nix": (nix_src, "humanoid_seated", 100, 1.0, False, False, "Nix", "Piel oliva. La silla es una capa aparte porque el pack no traía silla."),
    }

    bodies = []
    rig_anchors = {}
    for body_id, (sprite, rig, th, widen, legs, chair, name, note) in body_specs.items():
        canvas, anchors = place_body(sprite, th, widen, legs, chair)
        rel = f"bodies/{body_id}.png"
        canvas.save(OUT / rel)
        rig_anchors[rig] = anchors
        bodies.append({
            "id": body_id,
            "name": name,
            "rig": rig,
            "src": f"/assets/neo_pixel_cozy/v1/{rel}",
            "note": note,
        })

    chair = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    seat_y = rig_anchors["humanoid_seated"]["hips"][1]
    seat_x = rig_anchors["humanoid_seated"]["hips"][0]
    draw_wheelchair(chair, seat_y, seat_x)
    chair.save(OUT / "bodies" / "wheelchair.png")
    mobility = {
        "id": "wheelchair",
        "name": "Silla de ruedas",
        "slot": "mobility_equipment",
        "src": "/assets/neo_pixel_cozy/v1/bodies/wheelchair.png",
        "fullCanvas": True,
        "z": 12,
        "rigs": ["humanoid_seated"],
        "note": "Dibujada: el pack no incluía una silla alineada al rig.",
    }

    expressions = []
    for expr_id, label in (("alegre", "Alegre"), ("calma", "Calma"), ("cansada", "Cansada")):
        sprite = draw_expression(expr_id)
        rel = f"expressions/{expr_id}.png"
        sprite.save(OUT / rel)
        expressions.append({
            "id": expr_id,
            "name": label,
            "slot": "face",
            "src": f"/assets/neo_pixel_cozy/v1/{rel}",
            "w": sprite.width,
            "h": sprite.height,
            "anchor": "face",
            "origin": "center",
            "z": 15,
        })

    auras = []
    for aura_id, label, price in (("sparkles", "Chispas", 40), ("hearts", "Corazones", 40), ("ring", "Anillo", 30)):
        sprite = draw_aura(aura_id)
        rel = f"auras/{aura_id}.png"
        sprite.save(OUT / rel)
        auras.append({
            "id": aura_id,
            "name": label,
            "slot": "aura_back",
            "src": f"/assets/neo_pixel_cozy/v1/{rel}",
            "w": 96,
            "h": 128,
            "anchor": "ground",
            "origin": "top",
            "z": -40,
            "shopCategory": "effect",
            "price": price,
            "rarity": "rare",
            "unlock": {"type": "none"},
            "free": False,
            "icon": "✨",
            "rigs": ALL_RIGS,
            "fullCanvas": True,
        })

    items = []
    for item_id, slot, src, name, shop_cat, price, rarity, icon, free in ITEMS:
        anchor, origin, box, z = SLOT_META[slot]
        sprite = fit(load_cutout(src), box[0], box[1])
        rel = f"items/{item_id}.png"
        sprite.save(OUT / rel)
        items.append({
            "id": item_id,
            "name": name,
            "slot": slot,
            "src": f"/assets/neo_pixel_cozy/v1/{rel}",
            "w": sprite.width,
            "h": sprite.height,
            "anchor": anchor,
            "origin": origin,
            "z": z,
            "rigs": ALL_RIGS,
            "shopCategory": shop_cat,
            "price": 0 if free else price,
            "rarity": rarity,
            "unlock": {"type": "none"} if free or price < 100 else {"type": "level", "value": 2},
            "free": free,
            "icon": icon,
            "source": src,
        })

    # A couple of streak rewards, still deterministic cosmetics.
    for item in items:
        if item["id"] in {"wings_fairy", "pet_dragon", "horns_gold"}:
            item["unlock"] = {"type": "streak", "value": 7}
            item["price"] = 0

    scenes = []
    for scene_id, name, src in SCENES:
        im = Image.open(ROOT / src).convert("RGB")
        folder = OUT / "scenes" / scene_id
        folder.mkdir(parents=True, exist_ok=True)
        im.save(folder / "background_640x360.png")
        small = im.resize((320, 180), Image.Resampling.NEAREST)
        small.save(folder / "background_320x180.png")
        scenes.append({
            "id": scene_id,
            "name": name,
            "src": f"/assets/neo_pixel_cozy/v1/scenes/{scene_id}/background_640x360.png",
            "srcSmall": f"/assets/neo_pixel_cozy/v1/scenes/{scene_id}/background_320x180.png",
        })

    presets = {
        "lumo": {
            "id": "lumo",
            "name": "Lumo",
            "rig": "humanoid_standard",
            "body": "body_lumo",
            "expression": "alegre",
            "hair": "hair_brown_bun",
            "upper": "top_hoodie_green",
            "lower": "shorts_green",
            "shoes": "shoes_brown",
            "pet": "pet_hedgehog",
            "scene": "jardin_soleado",
            "note": "Jardinero. Miga (capibara) no está en el pack; el erizo es un sustituto.",
        },
        "mora": {
            "id": "mora",
            "name": "Mora",
            "rig": "humanoid_wide",
            "body": "body_mora",
            "expression": "calma",
            "hair": "hair_white",
            "headwear": "hat_moon",
            "upper": "top_cream",
            "lower": "skirt_purple",
            "shoes": "shoes_purple",
            "backpack": "cape_moon",
            "hand": "prop_book",
            "pet": "pet_owl",
            "scene": "bosque_bruja",
            "note": "Bruja. Tinta (cuervo) no está; el búho ocupa el slot de mascota.",
        },
        "brasa": {
            "id": "brasa",
            "name": "Brasa",
            "rig": "humanoid_wide",
            "body": "body_brasa",
            "expression": "alegre",
            "hair": "hair_brasa",
            "horns": "horns_curl",
            "upper": "top_fire",
            "lower": "shorts_rose",
            "shoes": "shoes_red",
            "pet": "pet_dragon",
            "scene": "azotea_cyberpunk",
            "note": "Demonio. Chispa (salamandra) no está; se usa un dragón pequeño.",
        },
        "vek": {
            "id": "vek",
            "name": "Vek",
            "rig": "humanoid_tall",
            "body": "body_vek",
            "expression": "alegre",
            "hair": "hair_teal",
            "horns": "antenna_lila",
            "upper": "top_hoodie_blue",
            "lower": "pants_cargo",
            "shoes": "shoes_mint",
            "pet": "pet_frog",
            "scene": "planeta_alien",
            "note": "Alien. Glu (babosa estelar) no está; la rana es el sustituto.",
        },
        "nix": {
            "id": "nix",
            "name": "Nix",
            "rig": "humanoid_seated",
            "body": "body_nix",
            "expression": "calma",
            "hair": "hair_blonde",
            "upper": "top_hoodie_green",
            "lower": "pants_cargo",
            "shoes": None,
            "pet": "pet_robot",
            "scene": "habitacion_cozy",
            "note": "Cyborg sentado. No había silla, guantes ni plaza solar; la silla está dibujada y Bip es el robot.",
        },
    }

    gaps = [
        "Ningún recorte llega en 96×128 con el mismo origen. Las capas se escalan con vecino más cercano y se colocan con anclas por rig.",
        "Casi todos los PNG traen alpha parcial (antialiasing). Se recorta el alpha por debajo de 128 para evitar halos.",
        "La vista del pack es frontal, no el 3/4 hacia la izquierda que pide el canon.",
        "No hay cuerpo demonio, cuerpo de tez muy oscura, silla de ruedas, bufanda, guantes, tatuaje ni piercing utilizables como capa.",
        "No están las mascotas canónicas Chispa, Glu, Tinta, Bip ni Miga. Hay sustitutos etiquetados en cada preset.",
        "No hay escenario de plaza solar ni de invernadero orbital. Azotea, planeta, bosque y jardín son los fondos completos más cercanos.",
        "Los ojos sueltos del pack son un solo ojo grande, no un par alineado al rig, así que las expresiones se dibujan en píxeles sobre el ancla de la cara.",
        "Los fondos de 640×360 se conservan y además se exporta una versión 320×180 por vecino más cercano.",
    ]

    manifest = {
        "version": "1.0.0",
        "style": "neo-pixel-cozy",
        "canvas": {"width": 96, "height": 128, "groundY": GROUND_Y, "displayScale": 4},
        "palette": PALETTE,
        "layerOrder": [
            "aura_back",
            "backpack_back",
            "body_base",
            "mobility_equipment",
            "lower_clothing",
            "shoes",
            "upper_clothing",
            "face",
            "horns_antennae",
            "hair_front",
            "headwear",
            "glasses",
            "hand_prop",
            "aura_front",
            "companion_front",
        ],
        "rigs": {
            rig: {"id": rig, "anchors": rig_anchors[rig]}
            for rig in rig_anchors
        },
        "bodies": bodies,
        "mobility": mobility,
        "expressions": expressions,
        "auras": auras,
        "items": items,
        "scenes": scenes,
        "presets": presets,
        "gaps": gaps,
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    # QA sheet of the five presets, composed the same way the client will.
    by_id = {item["id"]: item for item in items}
    by_id.update({a["id"]: a for a in auras})
    expr = {e["id"]: e for e in expressions}
    body_img = {b["id"]: b for b in bodies}
    scene_img = {s["id"]: s for s in scenes}

    def blit_item(canvas, item, anchors):
        if item.get("fullCanvas"):
            sprite = Image.open(OUT / item["src"].split("/v1/")[1]).convert("RGBA")
            canvas.alpha_composite(sprite)
            return
        sprite = Image.open(OUT / item["src"].split("/v1/")[1]).convert("RGBA")
        ax, ay = anchors[item["anchor"]]
        w, h = sprite.size
        if item["origin"] == "center":
            xy = (ax - w // 2, ay - h // 2)
        elif item["origin"] == "bottom":
            xy = (ax - w // 2, ay - h)
        else:
            xy = (ax - w // 2, ay)
        canvas.alpha_composite(sprite, xy)

    sheet = Image.new("RGB", (5 * 200, 280), (255, 246, 234))
    for index, preset in enumerate(presets.values()):
        frame = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        anchors = rig_anchors[preset["rig"]]
        order = []
        if preset.get("backpack"):
            order.append(by_id[preset["backpack"]])
        order.append({"src": body_img[preset["body"]]["src"], "fullCanvas": True, "z": -10})
        for key in ("lower", "shoes", "upper", "hair", "horns", "headwear", "hand", "pet"):
            if preset.get(key):
                order.append(by_id[preset[key]])
        order.append(expr[preset["expression"]])
        if preset["rig"] == "humanoid_seated":
            order.append(mobility)
        order.sort(key=lambda it: it.get("z", 0))
        for item in order:
            blit_item(frame, item, anchors)
        scene = Image.open(OUT / scene_img[preset["scene"]]["srcSmall"].split("/v1/")[1]).convert("RGB")
        scene = scene.resize((180, 100), Image.Resampling.NEAREST)
        cell = Image.new("RGB", (190, 270), (255, 246, 234))
        cell.paste(scene, (5, 8))
        avatar = frame.resize((96 * 2, 128 * 2), Image.Resampling.NEAREST)
        cell.paste(avatar, (190 // 2 - avatar.width // 2, 70), avatar)
        sheet.paste(cell, (index * 200 + 5, 4))
    sheet.save(OUT / "previews" / "presets.jpg", quality=90)
    print(f"items {len(items)} bodies {len(bodies)} scenes {len(scenes)}")
    print("preview", OUT / "previews" / "presets.jpg")


if __name__ == "__main__":
    main()
