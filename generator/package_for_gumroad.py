#!/usr/bin/env python3
"""Packages a generated wallpaper set into a ready-to-upload Gumroad ZIP.

Usage:
    python package_for_gumroad.py "rolex blau"

Looks for images in output/<slug>/, adds a license.txt, and writes
output/<slug>/<slug>-wallpaper-pack.zip -- just drag that file into a new
Gumroad product.
"""

import argparse
import re
import zipfile
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"

LICENSE_TEXT = """\
LUXURY WALLPAPER PACK -- PERSONAL USE LICENSE

Thank you for your purchase!

You MAY:
- Use these wallpapers on your own personal phone/desktop
- Share screenshots of your device using this wallpaper on social media
  (please tag/credit us if you can!)

You MAY NOT:
- Resell, redistribute, or repackage these image files
- Claim the artwork as your own
- Use the files for commercial merchandise (print-on-demand, etc.)
  without separate written permission

Questions? Reach out via the Gumroad message button.
"""


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "wallpaper"


def main() -> int:
    parser = argparse.ArgumentParser(description="Zip a generated wallpaper set for Gumroad upload.")
    parser.add_argument("keyword", help='the keyword used with generate.py, e.g. "rolex blau"')
    args = parser.parse_args()

    slug = slugify(args.keyword)
    src_dir = OUTPUT_DIR / slug
    if not src_dir.exists():
        print(f"No output found at {src_dir}. Run generate.py first.")
        return 1

    images = sorted(src_dir.glob("*.jpg")) + sorted(src_dir.glob("*.png"))
    if not images:
        print(f"No images found in {src_dir}.")
        return 1

    zip_path = src_dir / f"{slug}-wallpaper-pack.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, img in enumerate(images, start=1):
            zf.write(img, arcname=f"wallpaper_{i:02d}{img.suffix}")
        zf.writestr("license.txt", LICENSE_TEXT)

    print(f"Packed {len(images)} images -> {zip_path}")
    print("Drag this ZIP into a new Gumroad product to upload.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
