#!/usr/bin/env python3
"""Turns already-generated wallpapers into a square thumbnail + laptop-mockup
covers -- using plain image compositing (Pillow), no extra AI calls needed.

Usage:
    python compose_assets.py output/odyssey

Expects:
    output/<slug>/01_*.jpg ... 06_*.jpg  (the 6 generated wallpapers)
    output/<slug>/cover.jpg              (a laptop-mockup template photo,
                                           e.g. one you sent back from Leonardo)

Produces:
    output/<slug>/thumbnail.jpg          (square, from wallpaper 1)
    output/<slug>/cover_1.jpg .. cover_3.jpg
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

# Screen corners (top-left, top-right, bottom-right, bottom-left) calibrated
# against the laptop-mockup template the user sent for the Odyssey cover.
# If you use a different mockup photo, re-calibrate these four points.
SCREEN_QUAD = [(295, 51), (935, 37), (935, 433), (295, 447)]


def find_coeffs(dest_quad, source_rect):
    """Solve the 8 perspective-transform coefficients PIL needs to map
    `source_rect` (the full wallpaper image bounds) onto `dest_quad` (the
    screen area in the template)."""
    matrix = []
    for (x, y), (X, Y) in zip(dest_quad, source_rect):
        matrix.append([X, Y, 1, 0, 0, 0, -x * X, -x * Y])
        matrix.append([0, 0, 0, X, Y, 1, -y * X, -y * Y])
    A = [row for row in matrix]
    b = [c for corner in dest_quad for c in corner]
    # Least-squares solve via a small Gaussian elimination (no numpy dependency).
    n = 8
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(A[r][col]))
        A[col], A[pivot] = A[pivot], A[col]
        b[col], b[pivot] = b[pivot], b[col]
        for r in range(col + 1, n):
            factor = A[r][col] / A[col][col]
            for c in range(col, n):
                A[r][c] -= factor * A[col][c]
            b[r] -= factor * b[col]
    x = [0] * n
    for i in reversed(range(n)):
        x[i] = (b[i] - sum(A[i][j] * x[j] for j in range(i + 1, n))) / A[i][i]
    return x


def make_square_thumbnail(wallpaper_path: Path, out_path: Path, size: int = 1024) -> None:
    img = Image.open(wallpaper_path).convert("RGB")
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img.crop((left, top, left + side, top + side)).resize((size, size)).save(out_path, quality=92)


def make_cover_mockup(
    wallpaper_path: Path, template_path: Path, out_path: Path, quad=SCREEN_QUAD
) -> None:
    template = Image.open(template_path).convert("RGB")
    wallpaper = Image.open(wallpaper_path).convert("RGB")

    # Crop the wallpaper to the screen quad's bounding-box aspect ratio first,
    # so the warp below doesn't stretch it oddly.
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    box_w, box_h = max(xs) - min(xs), max(ys) - min(ys)
    target_ratio = box_w / box_h
    w, h = wallpaper.size
    src_ratio = w / h
    if src_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        wallpaper = wallpaper.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        wallpaper = wallpaper.crop((0, top, w, top + new_h))

    w, h = wallpaper.size
    coeffs = find_coeffs(quad, [(0, 0), (w, 0), (w, h), (0, h)])
    warped = wallpaper.transform(template.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    mask = Image.new("L", template.size, 0)
    from PIL import ImageDraw

    ImageDraw.Draw(mask).polygon(quad, fill=255)

    result = template.copy()
    result.paste(warped, (0, 0), mask)
    result.save(out_path, quality=92)


DEFAULT_TEMPLATE = Path(__file__).parent / "templates" / "laptop_mockup.jpg"


def build_assets(collection_dir: Path, template: Path = DEFAULT_TEMPLATE) -> None:
    wallpapers = sorted(collection_dir.glob("0*.jpg")) + sorted(collection_dir.glob("0*.png"))
    if not wallpapers:
        raise FileNotFoundError(f"No wallpapers (0*.jpg) found in {collection_dir}")
    if not template.exists():
        raise FileNotFoundError(f"No template found at {template}")

    make_square_thumbnail(wallpapers[0], collection_dir / "thumbnail.jpg")
    print(f"saved -> {collection_dir / 'thumbnail.jpg'}")

    picks = [wallpapers[i % len(wallpapers)] for i in (0, min(3, len(wallpapers) - 1), -1)]
    for i, wp in enumerate(picks, start=1):
        out = collection_dir / f"cover_{i}.jpg"
        make_cover_mockup(wp, template, out)
        print(f"saved -> {out} (from {wp.name})")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build thumbnail + cover mockups from generated wallpapers.")
    parser.add_argument("collection_dir", help="e.g. output/odyssey")
    parser.add_argument("--template", default=str(DEFAULT_TEMPLATE), help="Laptop-mockup template photo")
    args = parser.parse_args()

    try:
        build_assets(Path(args.collection_dir), Path(args.template))
    except FileNotFoundError as e:
        print(str(e), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
