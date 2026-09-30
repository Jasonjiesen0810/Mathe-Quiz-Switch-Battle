#!/usr/bin/env python3
"""Render the Markdown files of a translation project to PDF.

Usage: python3 translations/build_pdf.py translations/01-island-economics

Requires: pip install markdown, plus a Chromium binary (CHROMIUM env var or the
Playwright install under /opt/pw-browsers).
"""
import glob
import os
import subprocess
import sys
import tempfile

import markdown

CSS = """
@page { size: A4; margin: 22mm 20mm 20mm 20mm; }
body { font-family: Georgia, 'Times New Roman', 'WenQuanYi Zen Hei', serif;
       font-size: 11.5pt; line-height: 1.6; color: #1a1a1a; }
h1 { font-size: 22pt; line-height: 1.25; margin: 0 0 8pt; color: #12324a; }
h2 { font-size: 15pt; margin: 20pt 0 6pt; color: #12324a;
     border-bottom: 1px solid #c9d3dc; padding-bottom: 3pt; }
h3 { font-size: 11pt; margin: 20pt 0 4pt; color: #5a7184;
     text-transform: uppercase; letter-spacing: 0.06em; page-break-after: avoid; }
p { margin: 0 0 8pt; orphans: 3; widows: 3; }
blockquote { margin: 10pt 0; padding: 6pt 12pt; background: #f2f5f8;
             border-left: 3px solid #8aa2b6; color: #444; font-size: 10pt; }
blockquote p { margin: 2pt 0; }
hr { border: none; border-top: 1px solid #c9d3dc; margin: 14pt 0; }
table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin: 8pt 0 12pt; }
th, td { border: 1px solid #c9d3dc; padding: 4pt 6pt; vertical-align: top; text-align: left; }
th { background: #e8eef3; }
tr { page-break-inside: avoid; }
code { font-family: 'DejaVu Sans Mono', monospace; font-size: 9pt;
       background: #f2f5f8; padding: 0 2pt; }
"""


def chromium():
    if os.environ.get("CHROMIUM"):
        return os.environ["CHROMIUM"]
    hits = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    if not hits:
        sys.exit("Chromium not found; set CHROMIUM=/path/to/chrome")
    return hits[-1]


def md_to_pdf(md_path):
    with open(md_path, encoding="utf-8") as f:
        text = f.read()
    # Keep single line breaks inside paragraphs (used for short lists of lines).
    body = markdown.markdown(text, extensions=["tables", "nl2br", "sane_lists"])
    title = os.path.splitext(os.path.basename(md_path))[0]
    html = (f"<!doctype html><html><head><meta charset='utf-8'><title>{title}</title>"
            f"<style>{CSS}</style></head><body>{body}</body></html>")
    pdf_path = os.path.splitext(md_path)[0] + ".pdf"
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tmp:
        tmp.write(html)
    try:
        subprocess.run([chromium(), "--headless", "--no-sandbox", "--disable-gpu",
                        "--no-pdf-header-footer", f"--print-to-pdf={os.path.abspath(pdf_path)}",
                        f"file://{tmp.name}"],
                       check=True, capture_output=True)
    finally:
        os.unlink(tmp.name)
    print(pdf_path)


if __name__ == "__main__":
    for folder in sys.argv[1:]:
        for md in sorted(glob.glob(os.path.join(folder, "*.md"))):
            md_to_pdf(md)
