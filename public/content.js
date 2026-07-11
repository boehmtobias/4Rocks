// content.js
// -----------------------------------------------------------------------
// This file is plain, strict JSON assigned to one global variable. Edit
// the values below to update the live website — nothing else needs to
// change. index.html loads this as a normal script and reads CONTENT.
//
// Keep the object itself valid JSON: double-quoted keys and strings
// only, no trailing commas, no functions. Comments (like the section
// notes below) are fine as long as each one sits on its own line —
// build.py strips whole-comment lines before parsing, since JSON itself
// has no comment syntax. Never put a comment after real content on the
// same line, and never use /* */ block comments.
// If you are unsure whether an edit is still valid, paste the object
// (the part between the outer { and }) into a JSON validator after
// removing the // lines.
// -----------------------------------------------------------------------
const CONTENT = {

  // ---------------------------------------------------------------------
  // KOMMENDE AUFTRITTE
  // Every entry needs "lat" and "lng" (latitude/longitude of the venue),
  // always. That's what the little map thumbnail is generated from during
  // the Netlify build. To get coordinates: right-click the venue in
  // Google Maps and copy the numbers shown at the top of the menu, or
  // paste the address into https://www.openstreetmap.org and read the
  // coordinates from the URL.
  //
  // Concerts in the past are detected automatically (by comparing "date"
  // to today) and shown faded with a "Vergangen" tag rather than being
  // deleted, so you don't have to remove old entries by hand.
  // ---------------------------------------------------------------------
  "concerts": [
    {
      "date": "2026-06-20",
      "title": "Konzert bei Treff am Brunnen",
      "venue": "Marienstraße, Marpingen",
      "mapLink": "https://maps.app.goo.gl/CrD4NShHysS1m4gq6",
      "lat": 49.45165754787445,
      "lng": 7.055258332979755
    },
    {
      "date": "2026-08-16",
      "title": "Konzert vor der alten Schmiede, Start 19 Uhr",
      "venue": "Alsweilerstraße, Marpingen",
      "mapLink": "https://maps.app.goo.gl/RCygcfth9XgSMWzK9",
      "lat": 49.45189418247456,
      "lng": 7.056893756439192
    },
    {
      "date": "2026-09-26",
      "title": "Konzert bei Jochems Kneipe, Start 20 Uhr",
      "venue": "Saarbrücker Str., Riegelsberg",
      "mapLink": "https://maps.app.goo.gl/j2FQ6xpyGk12p9fCA",
      "lat": 49.31823699503666,
      "lng": 6.940415770528488
    },
    {
      "date": "2026-10-02",
      "title": "Konzert bei La Comodita, Start 18 Uhr",
      "venue": "Riegelsberghalle, Riegelsberg",
      "mapLink": "https://maps.app.goo.gl/2Bst6KSYbPG1uUkP8",
      "lat": 49.307656073968566,
      "lng": 6.937373323679641
    }
  ],

  // ---------------------------------------------------------------------
  // VIDEO HIGHLIGHTS
  // "poster" is the still image shown before someone taps play (kept
  // local instead of hotlinking YouTube, so it loads fast). "youtubeUrl"
  // can be either a youtu.be/... or a youtube.com/watch?v=... link.
  // ---------------------------------------------------------------------
  "videoHighlights": [
    {
      "youtubeUrl": "https://youtu.be/2HWzYArtK6Q",
      "title": "4Rocks in Riegelsberghalle",
      "date": "2026-01-30",
      "poster": "https://img.youtube.com/vi/2HWzYArtK6Q/hqdefault.jpg"
    },
    {
      "youtubeUrl": "https://youtu.be/GAzY8XZ5xKw",
      "title": "4Rocks private Nikolausparty in Heusweiler",
      "date": "2025-12-05",
      "poster": "images/videos/2025-12-05.jpg"
    },
    {
      "youtubeUrl": "https://youtu.be/yKNTCw-XIKM",
      "title": "4Rocks bei Don Lilllo in Heusweiler",
      "date": "2025-07-12",
      "poster": "images/videos/2025-07-12.jpg"
    },
    {
      "youtubeUrl": "https://youtu.be/DnpwciXBYjw",
      "title": "4Rocks bei der 750-Jahre-Feier in Heusweiler",
      "date": "2024-06-28",
      "poster": "images/videos/2024-06-28.jpg"
    }
  ],

  // ---------------------------------------------------------------------
  // GALERIE
  // "src" points at the optimized file the build script generates from
  // images-source/gallery/. "caption" shows under the thumbnail and in
  // the lightbox title; "description" is the longer lightbox text. Both
  // are also used as the image's alt text.
  // ---------------------------------------------------------------------
  "galleryImages": [
    { "src": "images/gallery/optimized/2026-01-30_1.webp", "caption": "Konzert bei La Comodita in der Riegelsberghalle, 30.01.2026", "description": "Die Band live auf der Bühne in der Riegelsberghalle." },
    { "src": "images/gallery/optimized/2026-01-30_2.webp", "caption": "Konzert bei La Comodita in der Riegelsberghalle, 30.01.2026", "description": "Die Band live auf der Bühne in der Riegelsberghalle." },
    { "src": "images/gallery/optimized/2026-01-30_3.webp", "caption": "Konzert bei La Comodita in der Riegelsberghalle, 30.01.2026", "description": "Die Band live auf der Bühne in der Riegelsberghalle." },
    { "src": "images/gallery/optimized/2026-01-30_4.webp", "caption": "Konzert bei La Comodita in der Riegelsberghalle, 30.01.2026", "description": "Die Band live auf der Bühne in der Riegelsberghalle." },
    { "src": "images/gallery/optimized/2026-01-30_5.webp", "caption": "Konzert bei La Comodita in der Riegelsberghalle, 30.01.2026", "description": "Die Band live auf der Bühne in der Riegelsberghalle." },

    { "src": "images/gallery/optimized/2025-12-05_1.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_2.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_3.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_4.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_5.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_6.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },
    { "src": "images/gallery/optimized/2025-12-05_7.webp", "caption": "Private Nikolausparty in Heusweiler, 05.12.2025", "description": "Die Band bei einer privaten Nikolausfeier in Heusweiler." },

    { "src": "images/gallery/optimized/2023-06-24_1.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Die Band kurz vor dem Auftritt beim Dorffest in Obersalbach." },
    { "src": "images/gallery/optimized/2023-06-24_2.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Dankesgeste ans Publikum zum Abschluss des Auftritts." },
    { "src": "images/gallery/optimized/2023-06-24_3.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Die Band während des Auftritts auf der Bühne." },
    { "src": "images/gallery/optimized/2023-06-24_4.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Die Band kurz vor dem Auftritt beim Dorffest in Obersalbach." },
    { "src": "images/gallery/optimized/2023-06-24_5.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Die Band während des Auftritts auf der Bühne." },
    { "src": "images/gallery/optimized/2023-06-24_6.webp", "caption": "Open Air Dorffest Obersalbach, 24.06.2023", "description": "Die Band während des Auftritts auf der Bühne." },

    { "src": "images/gallery/optimized/2023-07-23_1.webp", "caption": "Privatauftritt, 23.07.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-07-23_2.webp", "caption": "Privatauftritt, 23.07.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-07-23_3.webp", "caption": "Privatauftritt, 23.07.2023", "description": "Die Band bei einem privaten Auftritt." },

    { "src": "images/gallery/optimized/2023-09-02_1.webp", "caption": "Privatauftritt, 02.09.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-09-02_2.webp", "caption": "Privatauftritt, 02.09.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-09-02_3.webp", "caption": "Privatauftritt, 02.09.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-09-02_4.webp", "caption": "Privatauftritt, 02.09.2023", "description": "Die Band bei einem privaten Auftritt." },
    { "src": "images/gallery/optimized/2023-09-02_5.webp", "caption": "Privatauftritt, 02.09.2023", "description": "Die Band bei einem privaten Auftritt." }
  ],

  // ---------------------------------------------------------------------
  // AKTUELLE SETLISTE
  // Grouped into a few loose categories just to break up the list
  // visually. "backgroundImage" is optional per category — leave it out
  // (or set to an empty string) and that category just gets the plain
  // styled background, nothing breaks.
  // ---------------------------------------------------------------------
  "setlist": [
    {
      "category": "Rock Klassiker",
      "backgroundImage": "",
      "songs": [
        { "title": "Pretty Women", "artist": "Van Halen" },
        { "title": "Crazy Little Thing Called Love", "artist": "Queen" },
        { "title": "Far, far away", "artist": "Slade" },
        { "title": "Gimme All Your Loving", "artist": "ZZ Top" },
        { "title": "Tush", "artist": "ZZ Top" },
        { "title": "Another Brick in The Wall", "artist": "Pink Floyd" },
        { "title": "Wish You Were Here", "artist": "Pink Floyd" },
        { "title": "Jumping Jack Flash", "artist": "Rolling Stones" },
        { "title": "Radar Love", "artist": "Golden Earring" },
        { "title": "Caroline", "artist": "Status Quo" },
        { "title": "Marmor, Stein und Eisen bricht", "artist": "Drafi Deutscher" },
        { "title": "Hang On Sloopy", "artist": "The McCoys" },
        { "title": "Wonderful Tonight", "artist": "Eric Clapton" },
        { "title": "Dreadlock Holiday", "artist": "10CC" },
        { "title": "All Right Now", "artist": "Free" },
        { "title": "Lucky Man", "artist": "Emerson Lake and Palmer" },
        { "title": "The Letter", "artist": "The Box Tops" }
      ]
    },
    {
      "category": "80er",
      "backgroundImage": "",
      "songs": [
        { "title": "Es geht voran", "artist": "Fehlfarben" },
        { "title": "Carbonara", "artist": "Spliff" },
        { "title": "Goldener Reiter", "artist": "Joachim Witt" },
        { "title": "König von Deutschland", "artist": "Rio Reiser" },
        { "title": "99 Red Balloons", "artist": "Nena" },
        { "title": "Run To You", "artist": "Bryan Adams" },
        { "title": "Word Up", "artist": "Gun" },
        { "title": "Here I Go Again", "artist": "Whitesnake" },
        { "title": "White Wedding", "artist": "Billy Idol" },
        { "title": "Kayleigh", "artist": "Marillion" },
        { "title": "Don't You Forget About Me", "artist": "Simple Minds" },
        { "title": "Billie Jean", "artist": "Bates" }
      ]
    },
    {
      "category": "Modern Rock & Rock auf Deutsch",
      "backgroundImage": "",
      "songs": [
        { "title": "Royal Republic", "artist": "Venus" },
        { "title": "Entre dos tierras", "artist": "Heroes del Silencio" },
        { "title": "Wannsee", "artist": "Die Toten Hosen" },
        { "title": "Superstitious", "artist": "Phil X" },
        { "title": "Tage wie diese", "artist": "Die Toten Hosen" },
        { "title": "Sex on Fire", "artist": "Kings Of Leon" },
        { "title": "Altes Fieber", "artist": "Die Toten Hosen" },
        { "title": "Smells Like Teen Spirit", "artist": "Nirvana" },
        { "title": "Zombie", "artist": "Cranberries" },
        { "title": "Es geht mir gut", "artist": "Westernhagen" }
      ]
    }
  ],

  // ---------------------------------------------------------------------
  // BAND UND KONTAKT
  // ---------------------------------------------------------------------
  "bandMembers": [
    { "name": "Enrico Tinebra", "role": "Gesang", "photo": "images/band/enrico.jpg" },
    { "name": "Georg Wagner", "role": "Schlagzeug", "photo": "images/band/georg.jpg" },
    { "name": "Heiner Monzel", "role": "Gitarre", "photo": "images/band/heiner.jpg" },
    { "name": "Stephan Mayer", "role": "Gitarre", "photo": "images/band/stephan.jpg" },
    { "name": "Markus Böhm", "role": "Bass", "photo": "images/band/markus.jpg" }
  ],

  "contact": {
    "email": "musiker@public-files.de",
    "phones": [
      { "name": "Heiner", "number": "0172 688 9940" },
      { "name": "Markus", "number": "0151 5804 8794" }
    ],
    "instagram": { "handle": "@4Rocks_saarland", "url": "https://www.instagram.com/4Rocks_saarland/" }
  }
};
