# 4Rocks website

Plain static site. No framework, no bundler, no backend. Deployed to
Netlify by pushing to this repo's connected GitLab remote — Netlify
auto-deploys on every push.

## Editing content

Everything that changes regularly (upcoming concerts, videos, gallery
photos, setlist, band members, contact info) lives in one file:

    public/content.js

It's plain JSON assigned to a `CONTENT` variable, with a comment above
each section explaining what it controls. Edit it directly. Keep it
valid JSON while you do: double-quoted keys/strings, no trailing
commas, no `//` comments inside the `{ ... }` object itself (comments
above/below the object, like the ones already there, are fine).

Adding a new concert always needs `lat` and `lng` for the venue — right
click the location in Google Maps and copy the coordinates at the top
of the context menu, or paste the address into
https://www.openstreetmap.org and read the coordinates from the URL.

Adding a new gallery photo: drop the original, full-resolution file
into `images-source/gallery/`, then add a matching entry to
`galleryImages` in `content.js` pointing at
`images/gallery/optimized/<same-filename>.webp`. The build step
(described below) generates that optimized file automatically on the
next push. It also generates the map thumbnail for the new concert
automatically. You never touch `public/images/maps/` or
`public/images/gallery/optimized/` by hand.

## How the build works

`build.py` runs automatically before every Netlify deploy (configured
in `netlify.toml`). It does two things:

1. Reads the concerts in `public/content.js` and downloads a small map
   thumbnail (from OpenStreetMap's free static map service, no API key)
   for any concert whose thumbnail doesn't already exist in
   `public/images/maps/`.
2. Reads every photo in `images-source/gallery/` and creates an
   optimized WebP copy in `public/images/gallery/optimized/` for any
   photo that doesn't have one yet.

Both steps skip anything already generated, and delete generated files
that no longer match anything in `content.js` / `images-source/gallery/`
(so removing a concert or a photo cleans up after itself on the next
push). This keeps builds fast and keeps you well inside Netlify's free
build-minutes allowance.

If the map service is briefly slow or unreachable during a build, that
one thumbnail is skipped with a warning instead of failing the deploy.
The page itself never fetches maps live — visitors only ever see the
pre-generated image (or the graceful text-only fallback if a concert is
ever missing coordinates).

### Running it locally

    pip install -r requirements.txt
    python3 build.py

Then open `public/index.html` directly in a browser — no local server
needed, since `content.js` is loaded as a normal `<script>` tag rather
than fetched.

## Repo layout

    public/                     -> what Netlify publishes
      index.html
      style.css
      content.js
      app.js
      Pressetext_4Rocks.pdf
      images/
        favicon.png, favicon-512.png, apple-touch-icon.png  -> site icons
        hero.webp               -> hero background photo
        band/                   -> band member photos (committed as-is)
        videos/                 -> YouTube thumbnail posters
        maps/                   -> generated map thumbnails (build.py)
        gallery/optimized/      -> generated optimized photos (build.py)
    images-source/gallery/      -> original, full-resolution gallery photos
                                    (not published, kept for history/backup
                                    and as the input to build.py)
    build.py                    -> the build script described above
    requirements.txt            -> Python dependencies (Pillow, requests)
    netlify.toml                -> tells Netlify how to build and what to publish
