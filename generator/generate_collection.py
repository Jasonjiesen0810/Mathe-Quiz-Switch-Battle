#!/usr/bin/env python3
"""One command, one full Gumroad-ready collection.

Runs: 6 wallpapers -> square thumbnail -> 3 laptop-mockup covers -> ZIP ->
a draft description.txt. Everything except the actual Leonardo image calls
is done locally with Pillow (no extra API cost).

Usage:
    python generate_collection.py "odyssey" --name "ODYSSEY" --price 1 \\
        --quote "The sea forgives no one."

Requires LEONARDO_API_KEY in .env (see README.md) and a real internet
connection to cloud.leonardo.ai -- this will NOT work from a network-
restricted sandbox, only from a normal machine.
"""

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

import compose_assets
import package_for_gumroad
from generate import generate_images, slugify
from leonardo_client import LeonardoClient, LeonardoError

DESCRIPTION_TEMPLATE = """\
{name}{format_suffix}

{mood_line}

WHAT'S INCLUDED:
- {count} unique {format_label} wallpapers
- {resolution_label}, high resolution
- Instant download after purchase
- Personal use license (see included license.txt)

PERFECT FOR:
- {format_use_case}
- Anyone who wants their screen to feel like a scene from a painting, not
  a stock photo

Note: Each piece is individually composed -- no filters, no repeats, no
generic "AI art" look.

---
Price: {price}
"""

FORMAT_INFO = {
    "phone": {
        "label": "phone",
        "resolution": "9:16 portrait",
        "use_case": "Phone lock screen and home screen setups",
    },
    "desktop": {
        "label": "desktop",
        "resolution": "16:9 widescreen",
        "use_case": "Desktop and laptop wallpaper setups",
    },
    "square": {
        "label": "square",
        "resolution": "1:1 square",
        "use_case": "Social media posts and profile art",
    },
}


def write_description(
    out_path: Path, name: str, keyword: str, count: int, format: str, price: str
) -> None:
    info = FORMAT_INFO[format]
    text = DESCRIPTION_TEMPLATE.format(
        name=name.upper(),
        format_suffix=f" -- {info['label'].upper()} WALLPAPER COLLECTION",
        mood_line=(
            f"[TODO: write a 1-2 sentence mood line for \"{keyword}\" -- "
            f"ask Claude to punch this up, this is just a placeholder]"
        ),
        count=count,
        format_label=info["label"],
        resolution_label=info["resolution"],
        format_use_case=info["use_case"],
        price=price,
    )
    out_path.write_text(text)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a full Gumroad-ready wallpaper collection.")
    parser.add_argument("keyword", help='e.g. "odyssey", "rolex blau"')
    parser.add_argument("--name", default=None, help="Product name (default: keyword, uppercased)")
    parser.add_argument("--price", default="1", help='Price, e.g. "1" for 1 EUR/USD (default 1)')
    parser.add_argument("--count", type=int, default=6)
    parser.add_argument("--quote", default=None, help='Custom quote, e.g. "No Risk, No Story."')
    parser.add_argument("--format", default="desktop", choices=["phone", "square", "desktop"])
    parser.add_argument("--template", default=str(compose_assets.DEFAULT_TEMPLATE))
    args = parser.parse_args()

    load_dotenv()

    try:
        client = LeonardoClient()
    except LeonardoError as e:
        print(f"Setup error: {e}", file=sys.stderr)
        return 1

    name = args.name or args.keyword.upper()

    print(f"=== {name} ===")
    run_dir = generate_images(
        args.keyword, count=args.count, quote=args.quote, format=args.format, client=client
    )

    print("\n-- building thumbnail + covers --")
    try:
        compose_assets.build_assets(run_dir, Path(args.template))
    except FileNotFoundError as e:
        print(f"  skipped ({e})", file=sys.stderr)

    print("\n-- packaging for Gumroad --")
    try:
        zip_path = package_for_gumroad.package(run_dir)
        print(f"saved -> {zip_path}")
    except FileNotFoundError as e:
        print(f"  skipped ({e})", file=sys.stderr)
        zip_path = None

    desc_path = run_dir / "description.txt"
    write_description(desc_path, name, args.keyword, args.count, args.format, args.price)
    print(f"saved -> {desc_path} (draft -- ask Claude to write the real mood line)")

    print(f"\n=== {name} done ===")
    print(f"Folder: {run_dir}")
    print(f"Suggested name: {name}")
    print(f"Suggested price: {args.price}")
    print("Upload checklist: 0*.jpg (in the zip), thumbnail.jpg, cover_1/2/3.jpg, description.txt")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
