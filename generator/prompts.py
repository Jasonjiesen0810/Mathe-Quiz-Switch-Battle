"""Turns a short keyword (e.g. "rolex blau", "trading", "diamonds") into
5-6 varied image prompts that all share the same painted luxury style.

This is deliberately a plain template system (no extra LLM call needed)
so it stays fast, free to run, and fully deterministic.
"""

import random
from dataclasses import dataclass

from style import BACKGROUND_TEXTURES, FRAME_STYLE, STYLE_DNA, WALLPAPER_SIZES, build_negative_prompt

# Extra objects mixed into the "collage" composition alongside the main
# subject -- kept generic/textless like the main CATEGORIES subjects.
COMPANION_PROPS = [
    "a matte black sports car silhouette",
    "a crystal champagne coupe with rising bubbles",
    "a folded leather designer wallet",
    "a pair of aviator sunglasses",
    "a loosely banded stack of cash",
    "a lit cigar with curling smoke",
    "a strand of pearls",
    "a vintage travel postage stamp",
]

# Motivational / "rich life" quotes for the text-overlay wallpaper variant.
# Keep these generic and original -- do not copy exact wording from any
# specific artist/brand's copyrighted artwork.
QUOTES = [
    "MOM, I MADE IT.",
    "BUY THE DREAM.",
    "NEVER SATISFIED.",
    "BUILT NOT GIVEN.",
    "STAY DANGEROUS.",
    "NO DAYS OFF.",
    "RICH MINDSET.",
    "OWN YOUR EMPIRE.",
]

# Subject-category templates. Each keyword is matched (loosely) against
# these buckets to pick fitting scene compositions. Brand names are used
# only as a style cue for the object's look (e.g. "a luxury diver watch
# in the style of Rolex"), never as an exact logo reproduction request,
# to keep generated art in a legally safer zone for resale.
CATEGORIES = {
    "watch": {
        "keywords": ["rolex", "uhr", "watch", "patek", "audemars", "richard mille"],
        "subject": "a gold and steel luxury diver's wristwatch",
    },
    "car": {
        "keywords": ["auto", "car", "lamborghini", "ferrari", "porsche", "bentley", "rennwagen"],
        "subject": "a sleek luxury supercar",
    },
    "jewelry": {
        "keywords": ["diamant", "diamond", "schmuck", "jewelry", "kette", "chain", "ring"],
        "subject": "scattered diamonds and a gold chain necklace",
    },
    "cash": {
        "keywords": ["geld", "cash", "money", "dollar", "euro", "bank"],
        "subject": "stacks of banded cash and gold coins",
    },
    "trading": {
        "keywords": ["trading", "stocks", "aktien", "forex", "crypto", "bitcoin"],
        "subject": "a trading desk with candlestick charts, cash and a laptop",
    },
    "poker": {
        "keywords": [
            "poker", "casino", "cards", "karten", "chips", "martini", "vegas",
            "pokernacht",
        ],
        "subject": (
            "a hand in the foreground holding two pocket ace playing cards close to "
            "the camera, a round poker table with a gold rim, tall stacks of black "
            "and gold poker chips, thick bundles of banded cash, two crystal martini "
            "glasses with olives, a loose diamond bracelet and necklace beside a gold "
            "luxury wristwatch, a fanned hand of face-up playing cards, a blurred "
            "dark-suited figure seated in the background, the glow of Las Vegas Strip "
            "neon signs visible through a window behind the table"
        ),
    },
    "fashion": {
        "keywords": ["marke", "brand", "fashion", "designer", "suit", "anzug"],
        "subject": "a tailored designer suit with fine fabric texture",
    },
    "perfume": {
        # Large simple glass/liquid forms with no fine engraved detail -- the AI
        # renders these far more reliably than dense micro-detail like watch dials.
        "keywords": ["parfum", "parfüm", "perfume", "versace", "duft", "cologne", "fragrance"],
        "subject": (
            "a bold luxury perfume bottle painted in thick angular strokes of deep "
            "color, a striking raised gold Medusa-head emblem built from thick paint, "
            "a heavy gold cap sculpted from impasto ridges"
        ),
    },
    "odyssey": {
        # VALIDATED (full 6-image set confirmed good): mythological Greek warrior
        # theme, tied to public-domain Homeric mythology rather than any specific
        # film's branding/actor likenesses -- keeps it legally safer for resale.
        "keywords": [
            "odyssey", "odysseus", "griechisch", "greek", "mythologie", "mythology",
            "sparta", "spartan", "trojan", "troja", "krieger", "warrior",
        ],
        "subject": (
            "a battle-scarred Greek warrior in a bronze plumed helmet and armor, "
            "gripping a sword, a weathered dark-suited figure braced against a storm, "
            "a wooden warship with torn sails battling violent waves in the background"
        ),
    },
    "monaco": {
        "keywords": [
            "monaco", "monte carlo", "riviera", "cote d'azur", "cannes", "yacht",
        ],
        "subject": (
            "a sleek white luxury yacht anchored in a glittering Mediterranean "
            "harbor, palm trees swaying against pastel Belle Epoque architecture, "
            "steep coastal mountains rising behind the marina"
        ),
    },
}

COLOR_WORDS = {
    "blau": "deep royal blue",
    "blue": "deep royal blue",
    "rot": "deep burgundy red",
    "red": "deep burgundy red",
    "gold": "polished gold",
    "schwarz": "matte black",
    "black": "matte black",
    "gruen": "emerald green",
    "grün": "emerald green",
    "green": "emerald green",
    "silber": "polished silver",
    "silver": "polished silver",
    "weiss": "ivory white",
    "weiß": "ivory white",
    "white": "ivory white",
}


@dataclass
class PromptVariant:
    label: str
    prompt: str
    negative_prompt: str
    width: int
    height: int


def _match_category(keyword: str):
    words = keyword.lower().split()
    for cat in CATEGORIES.values():
        if any(kw in words or kw in keyword.lower() for kw in cat["keywords"]):
            return cat
    return None


def _match_color(keyword: str) -> str | None:
    words = keyword.lower().split()
    for w in words:
        if w in COLOR_WORDS:
            return COLOR_WORDS[w]
    return None


def build_prompt_variations(
    keyword: str, count: int = 6, quote: str | None = None, format: str = "phone"
) -> list[PromptVariant]:
    """Build `count` varied prompts for one keyword.

    Mix of: close-up product shot, lifestyle flat-lay, hand/wrist
    composition, dark atmospheric scene, symbolic/abstract shot, and one
    quote wallpaper.

    `quote`: pass a specific quote (e.g. "NO RISK, NO STORY.") to get an
    atmospheric scene built *around* that quote instead of the default
    vintage-newspaper text-overlay style -- use this when the quote should
    feel like part of a whole mood/scene rather than a separate clipping
    pasted over the subject.

    `format`: one of the keys in style.WALLPAPER_SIZES ("phone", "square",
    "desktop") -- controls the output aspect ratio/resolution.
    """
    category = _match_category(keyword)
    color = _match_color(keyword)
    subject = category["subject"] if category else keyword

    color_clause = f", dominant accent color: {color}" if color else ""
    w, h = WALLPAPER_SIZES[format]
    bg = random.choice(BACKGROUND_TEXTURES)

    props = random.sample(COMPANION_PROPS, k=2)
    collage_items = f"{subject}, {props[0]} and {props[1]}"

    # A subject that already contains its own hand (e.g. the poker category's
    # "a hand ... holding two pocket ace playing cards") would otherwise get
    # a second, unrelated hand+prop bolted on -- use it directly instead.
    if "hand" in subject.lower():
        hand_composition_prompt = (
            f"{STYLE_DNA}, {FRAME_STYLE}, {subject}, cinematic side lighting"
            f"{color_clause}"
        )
    else:
        hand_composition_prompt = (
            f"{STYLE_DNA}, {FRAME_STYLE}, a tanned hand holding "
            f"{random.choice(COMPANION_PROPS)}, {subject} visible blurred in the "
            f"background, cinematic side lighting{color_clause}"
        )

    # Style/technique comes FIRST in every prompt (earlier tokens carry more
    # weight), the concrete subject comes after.
    scene_templates = [
        (
            "macro close-up",
            f"{STYLE_DNA}, {FRAME_STYLE}, an extreme close-up painterly study of "
            f"{subject}, dramatic single light source, fine details suggested through "
            f"loose expressive knife strokes rather than sharp precise detail"
            f"{color_clause}",
        ),
        (
            "collage",
            f"{STYLE_DNA}, a flat-lay collage of {collage_items}, each object "
            f"individually painted as a die-cut cutout with a thick raised paint "
            f"border like a sticker, slightly overlapping, arranged on {bg}"
            f"{color_clause}",
        ),
        (
            "hand composition",
            hand_composition_prompt,
        ),
        (
            "atmospheric scene",
            f"{STYLE_DNA}, {FRAME_STYLE}, {subject} in a dark moody atmospheric scene "
            f"with golden rim lighting and soft bokeh{color_clause}",
        ),
        (
            "symbolic abstract",
            f"{STYLE_DNA}, {FRAME_STYLE}, a symbolic abstract composition built around "
            f"{subject}, dramatic top-down lighting, deep shadows{color_clause}",
        ),
    ]

    random.shuffle(scene_templates)
    variants: list[PromptVariant] = []

    for label, prompt in scene_templates[: max(count - 1, 1)]:
        variants.append(
            PromptVariant(
                label=label,
                prompt=prompt,
                negative_prompt=build_negative_prompt(allow_text=False),
                width=w,
                height=h,
            )
        )

    # Always add one text-overlay "quote" wallpaper as the signature format.
    if quote:
        # VALIDATED FORMULA (confirmed against a real generation, "ferrari rot" /
        # "NO RISK, NO HISTORY" -- see git history around this line): a whole
        # cinematic atmosphere built around the subject, with the quote painted
        # directly into the scene rather than pasted on as a separate clipping.
        # Do not simplify this back toward a single centered "product" shot.
        quote_prompt = (
            f"{STYLE_DNA}, a cinematic atmospheric night scene built around {subject}, "
            f"wet reflective ground catching golden and red light, dramatic rim "
            f'lighting, the words "{quote.upper()}" painted large across the scene in '
            f"thick dripping oil paint typography as if part of the painted "
            f"atmosphere itself, moody fog suggesting motion and speed{color_clause}"
        )
        label = "atmosphere quote"
    else:
        quote_text = random.choice(QUOTES)
        quote_prompt = (
            f'{STYLE_DNA}, a vintage aged newspaper background with the words '
            f'"{quote_text}" painted on top in thick dripping oil paint typography, '
            f"{subject} faintly visible in the textured background{color_clause}"
        )
        label = "quote overlay"

    variants.append(
        PromptVariant(
            label=label,
            prompt=quote_prompt,
            negative_prompt=build_negative_prompt(allow_text=True),
            width=w,
            height=h,
        )
    )

    return variants[:count]
