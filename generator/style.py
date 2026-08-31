"""Shared visual style DNA for the luxury wallpaper brand.

Every generated image should be recognizable as the same "brand" even
though the subject changes. This module centralizes the style keywords
so both prompt building and future style tweaks happen in one place.
"""

STYLE_DNA = (
    "museum-quality impasto oil painting, palette-knife technique with thick raised "
    "paint ridges you can see the physical texture of, every surface in the frame -- "
    "glass, metal, liquid, fabric, skin -- rendered as thick wet oil paint with visible "
    "knife strokes, not as photographic or CGI material (no transparent glass, no chrome "
    "reflections, no photoreal skin or metal), the whole canvas painted in one consistent "
    "alla-prima technique with no smooth or airbrushed area anywhere, aggressive visible "
    "brushwork texture across 100% of the image, textured canvas surface, dramatic "
    "chiaroscuro lighting, warm golden highlights carved by light against deep black "
    "shadows, rich luxurious color palette of black, gold, burgundy and cream, loose "
    "confident expressive brushwork, fine art gallery piece"
)

NEGATIVE_BASE = (
    "photorealistic, photo, product photography, 3d render, cgi, ray tracing, "
    "hyperrealistic, glossy mirror reflections, transparent glass, smooth digital "
    "painting, airbrushed, flat lighting, low quality, blurry, out of focus, watermark, "
    "signature, cartoon, anime, extra limbs, deformed hands, sharp legible tiny text, "
    "readable engraving, legible brand wordmark, readable label typography, detailed "
    "logo text, warped text, gibberish text, misspelled logo, distorted lettering"
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
