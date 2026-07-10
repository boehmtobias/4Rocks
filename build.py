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

import io
import json
import math
import re
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageOps
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
MAP_WIDTH = 480
MAP_HEIGHT = 360
MAP_TIMEOUT_SECONDS = 15
MAP_PIN_COLOR = (255, 90, 31)  # matches --accent in style.css
TILE_SIZE = 256
# OSM's tile usage policy requires a descriptive User-Agent identifying
# the app — see https://operations.osmfoundation.org/policies/tiles/
TILE_USER_AGENT = "4RocksWebsiteBuild/1.0 (static map thumbnails; band website build script)"

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


def download(url, timeout, headers=None):
    if requests is not None:
        response = requests.get(url, timeout=timeout, headers=headers or {})
        response.raise_for_status()
        return response.content
    # Fallback if the `requests` package isn't available for some reason.
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as response:  # noqa: S310
        return response.read()


def latlng_to_global_pixel(lat, lng, zoom):
    """Standard slippy-map projection: returns the (x, y) pixel position
    of a lat/lng in the single giant image formed by all tiles at this
    zoom level laid edge to edge (tile (0,0)'s top-left is pixel (0,0))."""
    lat_rad = math.radians(lat)
    n = 2 ** zoom
    x = (lng + 180.0) / 360.0 * n * TILE_SIZE
    y = (
        (1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi)
        / 2.0
        * n
        * TILE_SIZE
    )
    return x, y


def compose_map_image(lat, lng, zoom, width, height, timeout):
    """Build a width x height map thumbnail centered on lat/lng by
    stitching together whichever OSM tiles cover that area, then
    drawing a pin at the exact center. Raises on any tile download
    failure so the caller can skip this one thumbnail gracefully."""
    center_x, center_y = latlng_to_global_pixel(lat, lng, zoom)
    left = center_x - width / 2
    top = center_y - height / 2

    tile_x_min = math.floor(left / TILE_SIZE)
    tile_x_max = math.floor((left + width - 1) / TILE_SIZE)
    tile_y_min = math.floor(top / TILE_SIZE)
    tile_y_max = math.floor((top + height - 1) / TILE_SIZE)

    sheet_w = (tile_x_max - tile_x_min + 1) * TILE_SIZE
    sheet_h = (tile_y_max - tile_y_min + 1) * TILE_SIZE
    sheet = Image.new("RGB", (sheet_w, sheet_h), (230, 226, 219))

    n = 2 ** zoom
    for tx in range(tile_x_min, tile_x_max + 1):
        for ty in range(tile_y_min, tile_y_max + 1):
            wrapped_tx = tx % n  # wrap around the date line
            tile_url = f"https://tile.openstreetmap.org/{zoom}/{wrapped_tx}/{ty}.png"
            tile_bytes = download(tile_url, timeout, headers={"User-Agent": TILE_USER_AGENT})
            with Image.open(io.BytesIO(tile_bytes)) as tile_img:
                sheet.paste(tile_img.convert("RGB"), ((tx - tile_x_min) * TILE_SIZE, (ty - tile_y_min) * TILE_SIZE))

    crop_left = round(left - tile_x_min * TILE_SIZE)
    crop_top = round(top - tile_y_min * TILE_SIZE)
    result = sheet.crop((crop_left, crop_top, crop_left + width, crop_top + height))

    # Simple pin: a filled circle with a white ring, centered exactly on
    # the coordinate (matches the site's --accent color).
    draw = ImageDraw.Draw(result)
    cx, cy = width / 2, height / 2
    r = 8
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=MAP_PIN_COLOR, outline=(255, 255, 255), width=3)

    return result


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

        print(f"[maps] composing {filename} ...")
        try:
            image = compose_map_image(lat, lng, MAP_ZOOM, MAP_WIDTH, MAP_HEIGHT, MAP_TIMEOUT_SECONDS)
            image.save(target, "PNG")
            print(f"[maps] saved {filename}")
        except Exception as exc:  # noqa: BLE001 — a flaky tile server must not fail the build
            print(f"[maps] WARNING: skipping {filename}, could not build it ({exc})")

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
