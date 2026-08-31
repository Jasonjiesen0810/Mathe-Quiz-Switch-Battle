#!/usr/bin/env python3
"""CLI entrypoint: keyword in, 5-6 wallpaper images out.

Usage:
    python generate.py "rolex blau"
    python generate.py "trading" --count 5
    python generate.py "ferrari rot" --quote "No Risk, No Story."
"""

import argparse
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

from leonardo_client import LeonardoClient, LeonardoError
from prompts import build_prompt_variations

OUTPUT_DIR = Path(__file__).parent / "output"


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "wallpaper"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate luxury wallpaper images from a keyword.")
    parser.add_argument("keyword", help='e.g. "rolex blau", "trading", "diamonds"')
    parser.add_argument("--count", type=int, default=6, help="Number of images to generate (default 6)")
    parser.add_argument(
        "--quote",
        default=None,
        help='Custom quote to build an atmospheric scene around, e.g. "No Risk, No Story."',
    )
    parser.add_argument(
        "--format",
        default="phone",
        choices=["phone", "square", "desktop"],
        help="Output aspect ratio (default phone)",
    )
    args = parser.parse_args()

    load_dotenv()

    try:
        client = LeonardoClient()
    except LeonardoError as e:
        print(f"Setup error: {e}", file=sys.stderr)
        return 1

    variants = build_prompt_variations(
        args.keyword, count=args.count, quote=args.quote, format=args.format
    )

    run_dir = OUTPUT_DIR / slugify(args.keyword)
    run_dir.mkdir(parents=True, exist_ok=True)

    print(f'Generating {len(variants)} images for "{args.keyword}" -> {run_dir}')

    for i, variant in enumerate(variants, start=1):
        print(f"  [{i}/{len(variants)}] {variant.label} ...", end=" ", flush=True)
        try:
            urls = client.generate(
                prompt=variant.prompt,
                negative_prompt=variant.negative_prompt,
                width=variant.width,
                height=variant.height,
                num_images=1,
            )
        except LeonardoError as e:
            print(f"FAILED ({e})")
            continue

        for j, url in enumerate(urls):
            suffix = f"_{j+1}" if len(urls) > 1 else ""
            out_path = run_dir / f"{i:02d}_{slugify(variant.label)}{suffix}.jpg"
            LeonardoClient.download(url, str(out_path))
            print(f"saved -> {out_path.name}")

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
