"""Turns a short keyword (e.g. "rolex blau", "trading", "diamonds") into
5-6 varied image prompts that all share the same painted luxury style.

This is deliberately a plain template system (no extra LLM call needed)
so it stays fast, free to run, and fully deterministic.
"""

import random
from dataclasses import dataclass

from style import STYLE_DNA, WALLPAPER_SIZES, build_negative_prompt

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
        "keywords": ["poker", "casino", "cards", "karten"],
        "subject": "a poker table with chips, cash, cards and a martini glass",
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
            "a bold luxury perfume bottle with a striking gold Medusa-head emblem, "
            "faceted glass catching dramatic light, a heavy gold cap"
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


def build_prompt_variations(keyword: str, count: int = 6) -> list[PromptVariant]:
    """Build `count` varied prompts for one keyword.

    Mix of: close-up product shot, lifestyle flat-lay, hand/wrist
    composition, dark atmospheric scene, symbolic/abstract shot, and one
    motivational quote text-overlay wallpaper.
    """
    category = _match_category(keyword)
    color = _match_color(keyword)
    subject = category["subject"] if category else keyword

    color_clause = f", dominant accent color: {color}" if color else ""
    w, h = WALLPAPER_SIZES["phone"]

    scene_templates = [
        (
            "macro close-up",
            f"extreme close-up painterly study of {subject}, dramatic single light "
            f"source, fine details suggested through loose expressive brushwork rather "
            f"than sharp precise detail{color_clause}, {STYLE_DNA}",
        ),
        (
            "lifestyle flat-lay",
            f"top-down flat-lay arrangement of {subject} surrounded by cash, poker chips "
            f"and jewelry on a dark reflective table{color_clause}, {STYLE_DNA}",
        ),
        (
            "hand composition",
            f"a tanned hand holding {subject}, cinematic side lighting, dark background"
            f"{color_clause}, {STYLE_DNA}",
        ),
        (
            "atmospheric scene",
            f"{subject} in a dark moody atmospheric scene with golden rim lighting and "
            f"soft bokeh{color_clause}, {STYLE_DNA}",
        ),
        (
            "symbolic abstract",
            f"symbolic abstract composition built around {subject}, dramatic top-down "
            f"lighting, deep shadows{color_clause}, {STYLE_DNA}",
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
    quote = random.choice(QUOTES)
    quote_prompt = (
        f'a vintage aged newspaper background with the words "{quote}" painted on top '
        f"in thick dripping oil paint typography, {subject} faintly visible in the "
        f"textured background{color_clause}, {STYLE_DNA}"
    )
    variants.append(
        PromptVariant(
            label="quote overlay",
            prompt=quote_prompt,
            negative_prompt=build_negative_prompt(allow_text=True),
            width=w,
            height=h,
        )
    )

    return variants[:count]
