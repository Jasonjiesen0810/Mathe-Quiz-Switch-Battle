"""Shared visual style DNA for the luxury wallpaper brand.

Every generated image should be recognizable as the same "brand" even
though the subject changes. This module centralizes the style keywords
so both prompt building and future style tweaks happen in one place.
"""

# IMPORTANT: keep this purely affirmative (describe what the image IS).
# Negated phrases inside a positive prompt ("not photorealistic", "no
# glass reflections") tend to backfire on diffusion models -- the model
# still picks up "photorealistic"/"glass reflections" as a strong signal
# despite the "not"/"no" in front of it. All exclusions belong in
# NEGATIVE_BASE only, never woven into STYLE_DNA/FRAME_STYLE.
#
# Style terms are also front-loaded (painting technique first, subject
# second) since earlier tokens carry more weight in most of these models.
STYLE_DNA = (
    "a thick impasto oil painting made entirely with a palette knife, heavy raised "
    "ridges of wet paint, coarse canvas weave visible beneath the paint, aggressive "
    "gestural knife strokes sculpting every form and surface with paint, dramatic "
    "chiaroscuro lighting, deep black shadows carved through with golden impasto "
    "highlights, a rich palette of black, gold, burgundy and cream, one unified "
    "hand-painted technique across the whole canvas, museum-quality brushwork, "
    "fine art gallery piece"
)

# Rotated in for variety so backgrounds don't all look the same.
BACKGROUND_TEXTURES = [
    "a rustic cracked cream plaster wall texture",
    "a raw textured linen canvas surface",
    "a dark aged leather surface with visible grain",
    "a weathered dark stone surface",
]

# Framed as "a crop from an existing painting" rather than "a photo of an
# arranged object" -- this shifts the model's whole frame of reference
# toward painting instead of product photography.
FRAME_STYLE = (
    "a candid cropped detail from a larger painting, asymmetric off-center framing, "
    "part of the subject running past the edge of the canvas as if caught mid-scene"
)

NEGATIVE_BASE = (
    "photorealistic, photo, photograph, product photography, advertisement, "
    "commercial photography, studio lighting, softbox, centered hero shot, isolated "
    "on plain background, 3d render, cgi, ray tracing, hyperrealistic, glossy, "
    "polished, shiny, mirror reflections, transparent glass, digital illustration, "
    "vector art, clean lines, sharp focus, smooth digital painting, airbrushed, flat "
    "lighting, low quality, blurry, out of focus, watermark, signature, cartoon, "
    "anime, extra limbs, deformed hands, sharp legible tiny text, readable engraving, "
    "legible brand wordmark, readable label typography, detailed logo text, warped "
    "text, gibberish text, misspelled logo, distorted lettering"
)

# Aspect ratios used for wallpapers. Leonardo requires both dimensions to
# be multiples of 8 -- these are all standard resolutions that satisfy that.
WALLPAPER_SIZES = {
    "phone": (1080, 1920),     # 9:16, standard phone resolution
    "square": (1024, 1024),    # for Instagram feed posts / previews
    "desktop": (1920, 1080),   # 16:9, Full HD desktop/laptop screens
}


def build_negative_prompt(allow_text: bool) -> str:
    """Text-overlay wallpapers need "text" allowed; scene shots should avoid it."""
    if allow_text:
        return NEGATIVE_BASE
    return NEGATIVE_BASE + ", text, typography, letters, words"
