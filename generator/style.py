"""Shared visual style DNA for the luxury wallpaper brand.

Every generated image should be recognizable as the same "brand" even
though the subject changes. This module centralizes the style keywords
so both prompt building and future style tweaks happen in one place.
"""

STYLE_DNA = (
    "thick impasto oil painting, extremely visible palette knife and brush strokes, "
    "textured canvas surface, dramatic chiaroscuro lighting, warm golden highlights "
    "carved by light against deep black shadows, rich luxurious color palette of "
    "black, gold, burgundy and cream, painterly fine art, editorial quality, "
    "hand-painted texture, high detail"
)

NEGATIVE_BASE = (
    "photorealistic, photo, 3d render, smooth digital painting, flat lighting, "
    "low quality, blurry, out of focus, watermark, signature, cartoon, anime, "
    "extra limbs, deformed hands"
)

# Aspect ratios used for phone wallpapers (Leonardo needs explicit pixel sizes).
WALLPAPER_SIZES = {
    "phone": (1024, 1820),   # ~9:16, close to common phone screens
    "square": (1024, 1024),  # for Instagram feed posts / previews
}


def build_negative_prompt(allow_text: bool) -> str:
    """Text-overlay wallpapers need "text" allowed; scene shots should avoid it."""
    if allow_text:
        return NEGATIVE_BASE
    return NEGATIVE_BASE + ", text, typography, letters, words"
