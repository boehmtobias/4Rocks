#!/usr/bin/env python3
"""
build.py — prepares the two kinds of generated assets the 4Rocks site
needs before Netlify publishes the `public/` folder:

  1. Map thumbnails for every concert in public/content.js that has a
     "lat" and "lng", downloaded once from a free OpenStreetMap static
     map service and cached in public/images/maps/.
  2. Optimized WebP copies of every photo in images-source/gallery/,
     written to public/images/gallery/optimized/.

Both steps are INCREMENTAL: a file is only (re)generated if it does not
already exist, and any generated file that no longer corresponds to an
entry in content.js / images-source is deleted. That keeps re-runs fast
and keeps Netlify's monthly build-minute usage low — a normal push only
processes whatever you actually added or changed.

The map download step needs the internet; if OpenStreetMap's static map
service is slow or unreachable during a Netlify build, that one
thumbnail is skipped with a warning instead of failing the whole build.

How this fits together:
  - netlify.toml tells Netlify to run
      pip install -r requirements.txt && python3 build.py
    before publishing the `public/` folder. That happens automatically
    on every push, no manual steps needed.
  - To test locally before pushing: from the repo root, run
      pip install -r requirements.txt
      python3 build.py
    then open public/index.html directly in a browser (no server
    needed, since content.js is loaded as a normal <script>, not
    fetched).
"""

import json
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run: pip install -r requirements.txt")

try:
    import requests
except ImportError:
    requests = None
    import urllib.request

ROOT = Path(__file__).resolve().parent
CONTENT_JS = ROOT / "public" / "content.js"
MAPS_DIR = ROOT / "public" / "images" / "maps"
GALLERY_SRC_DIR = ROOT / "images-source" / "gallery"
GALLERY_OUT_DIR = ROOT / "public" / "images" / "gallery" / "optimized"

MAP_ZOOM = 15
MAP_SIZE = "480x360"
MAP_TIMEOUT_SECONDS = 15

GALLERY_MAX_DIMENSION = 1600
GALLERY_WEBP_QUALITY = 80

SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def load_content():
    """Pull the JSON object out of `const CONTENT = { ... };` in content.js.

    content.js is allowed to carry `//` documentation comments on their
    own line even inside the object (that's how the shipped file is
    written, for section-by-section explanations) — those lines are
    stripped before parsing, since JSON itself has no comment syntax.
    Only whole-line comments are touched, so `https://...` inside a
    string value elsewhere on the file is never affected.
    """
    text = CONTENT_JS.read_text(encoding="utf-8")
    match = re.search(r"const\s+CONTENT\s*=\s*(\{.*\})\s*;\s*$", text, re.S)
    if not match:
        sys.exit("build.py: could not find `const CONTENT = {...};` in " + str(CONTENT_JS))

    json_text = strip_standalone_comment_lines(match.group(1))
    try:
        return json.loads(json_text)
    except json.JSONDecodeError as exc:
        sys.exit(f"build.py: content.js is not valid JSON inside the CONTENT object: {exc}")


def strip_standalone_comment_lines(text):
    """Remove lines that are only a `//` comment (whitespace then `//`).
    A comment must not share a line with real JSON content, so this can't
    accidentally cut into a string value like a URL."""
    lines = text.split("\n")
    kept = [line for line in lines if not line.strip().startswith("//")]
    return "\n".join(kept)


def coord_to_token(value):
    """49.30765 -> 'p49_30765', -6.9 -> 'n6_90000'. Mirrors the JS version
    in index.html exactly — the filenames must match on both sides."""
    sign = "n" if value < 0 else "p"
    return sign + f"{abs(value):.5f}".replace(".", "_")


def map_filename(lat, lng):
    return f"{coord_to_token(lat)}_{coord_to_token(lng)}.png"


def download(url, timeout):
    if requests is not None:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        return response.content
    # Fallback if the `requests` package isn't available for some reason.
    with urllib.request.urlopen(url, timeout=timeout) as response:  # noqa: S310
        return response.read()


def build_maps(content):
    MAPS_DIR.mkdir(parents=True, exist_ok=True)
    wanted = set()

    for concert in content.get("concerts", []):
        lat, lng = concert.get("lat"), concert.get("lng")
        if lat is None or lng is None:
            # This is the safety net: content without lat/lng just doesn't
            # get a thumbnail, index.html already falls back to a text-only
            # entry for these on its own.
            continue

        filename = map_filename(lat, lng)
        wanted.add(filename)
        target = MAPS_DIR / filename
        if target.exists():
            continue

        url = (
            "https://staticmap.openstreetmap.de/staticmap.php"
            f"?center={lat},{lng}&zoom={MAP_ZOOM}&size={MAP_SIZE}"
            f"&markers={lat},{lng},red-pushpin"
        )
        print(f"[maps] fetching {filename} ...")
        try:
            data = download(url, MAP_TIMEOUT_SECONDS)
            target.write_bytes(data)
            print(f"[maps] saved {filename}")
        except Exception as exc:  # noqa: BLE001 — a flaky map service must not fail the build
            print(f"[maps] WARNING: skipping {filename}, could not download it ({exc})")

    for existing in MAPS_DIR.glob("*.png"):
        if existing.name not in wanted:
            print(f"[maps] removing orphaned {existing.name}")
            existing.unlink()


def build_gallery():
    GALLERY_OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not GALLERY_SRC_DIR.exists():
        print(f"[gallery] {GALLERY_SRC_DIR} does not exist, nothing to optimize")
        return

    wanted = set()
    sources = sorted(
        p for p in GALLERY_SRC_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in SOURCE_EXTENSIONS
    )

    for src in sources:
        out_name = f"{src.stem}.webp"
        wanted.add(out_name)
        target = GALLERY_OUT_DIR / out_name
        if target.exists():
            continue

        print(f"[gallery] optimizing {src.name} -> {out_name}")
        try:
            with Image.open(src) as img:
                img = ImageOps.exif_transpose(img)  # respect phone-camera rotation
                img = img.convert("RGB")
                img.thumbnail((GALLERY_MAX_DIMENSION, GALLERY_MAX_DIMENSION))
                img.save(target, "WEBP", quality=GALLERY_WEBP_QUALITY)
        except Exception as exc:  # noqa: BLE001 — one bad photo shouldn't fail the whole build
            print(f"[gallery] WARNING: could not process {src.name}: {exc}")

    for existing in GALLERY_OUT_DIR.glob("*.webp"):
        if existing.name not in wanted:
            print(f"[gallery] removing orphaned {existing.name}")
            existing.unlink()


def main():
    content = load_content()
    build_maps(content)
    build_gallery()
    print("build.py finished.")


if __name__ == "__main__":
    main()
