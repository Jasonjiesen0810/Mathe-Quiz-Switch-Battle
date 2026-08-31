"""Shared visual style DNA for the luxury wallpaper brand.

Every generated image should be recognizable as the same "brand" even
though the subject changes. This module centralizes the style keywords
so both prompt building and future style tweaks happen in one place.
"""

STYLE_DNA = (
    "thick impasto oil painting, extremely visible palette knife and brush strokes "
    "covering the entire canvas including every object in the scene, the main subject "
    "itself painted with the same rough knife-textured brushwork as the background "
    "(no photorealistic or CGI-rendered object pasted into a painted scene), matte "
    "paint surfaces instead of mirror-like reflections, textured canvas surface, "
    "dramatic chiaroscuro lighting, warm golden highlights carved by light against "
    "deep black shadows, rich luxurious color palette of black, gold, burgundy and "
    "cream, painterly fine art, loose confident brushwork, editorial quality, "
    "hand-painted texture, fine art gallery piece"
)

NEGATIVE_BASE = (
    "photorealistic, photo, product photography, 3d render, cgi, ray tracing, "
    "hyperrealistic, glossy mirror reflections, smooth digital painting, airbrushed, "
    "flat lighting, low quality, blurry, out of focus, watermark, signature, cartoon, "
    "anime, extra limbs, deformed hands, sharp legible tiny text, readable engraving, "
    "warped text, gibberish text, misspelled logo, distorted lettering"
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
