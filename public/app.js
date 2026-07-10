(function () {
  "use strict";
  var C = (typeof CONTENT !== "undefined") ? CONTENT : {};

  /* ---------- helpers ---------- */
  function el(tag, attrs, html) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function formatDateLong(iso) {
    var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
    if (!y || !m || !d) return iso;
    return d + ". " + months[m - 1] + " " + y;
  }

  function formatDateShort(iso) {
    var parts = String(iso).split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "." + parts[1] + "." + parts[0];
  }

  // Must produce the exact same filename as build.py's map_filename().
  function coordToken(v) {
    var sign = v < 0 ? "n" : "p";
    return sign + Math.abs(v).toFixed(5).replace(".", "_");
  }
  function mapFilename(lat, lng) {
    return coordToken(lat) + "_" + coordToken(lng) + ".png";
  }

  function isPastDate(iso) {
    var today = new Date();
    var todayIso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    return String(iso) < todayIso;
  }

  /* ---------- Kommende Auftritte ---------- */
  function renderConcerts() {
    var grid = document.getElementById("concert-grid");
    var all = (C.concerts || []).slice();
    var upcoming = all.filter(function (c) { return !isPastDate(c.date); })
        .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    var past = all.filter(function (c) { return isPastDate(c.date); })
        .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var concerts = upcoming.concat(past);

    if (!concerts.length) {
      grid.appendChild(el("p", { class: "concert-empty" },
          "Aktuell sind keine neuen Auftritte geplant. Schaut bald wieder vorbei!"));
      return;
    }

    if (!upcoming.length) {
      grid.appendChild(el("p", { class: "concert-empty" },
          "Aktuell sind keine neuen Auftritte geplant. Schaut bald wieder vorbei!"));
    }

    concerts.forEach(function (c) {
      var past = isPastDate(c.date);
      var card = el("article", { class: "concert-card" + (past ? " is-past" : "") });
      var hasCoords = typeof c.lat === "number" && typeof c.lng === "number";

      if (hasCoords) {
        var mapLink = el("a", {
          class: "concert-map-link",
          href: c.mapLink || "#",
          target: "_blank",
          rel: "noopener",
          "aria-label": "Route zu " + (c.venue || c.title) + " anzeigen (\u00f6ffnet in neuem Tab)"
        });
        var img = el("img", {
          src: "images/maps/" + mapFilename(c.lat, c.lng),
          alt: "Kartenausschnitt: " + (c.venue || c.title),
          loading: "lazy"
        });
        var placeholder = el("div", { class: "concert-map-placeholder" },
            '<span class="pin" aria-hidden="true"></span><small>Kartenvorschau</small>');
        placeholder.style.display = "none";
        img.addEventListener("error", function () {
          img.style.display = "none";
          placeholder.style.display = "flex";
        });
        mapLink.appendChild(img);
        mapLink.appendChild(placeholder);
        card.appendChild(mapLink);
      }

      var body = el("div", { class: "concert-body" });
      var dateRow = el("div", { class: "concert-date-row" });
      dateRow.appendChild(el("time", { class: "concert-date", datetime: c.date }, formatDateLong(c.date)));
      if (past) dateRow.appendChild(el("span", { class: "concert-past-tag" }, "Vergangen"));
      body.appendChild(dateRow);
      var title = el("h3", { class: "concert-title" });
      title.textContent = c.title || "";
      body.appendChild(title);
      var venue = el("p", { class: "concert-venue" });
      venue.textContent = c.venue || "";
      body.appendChild(venue);

      if (c.mapLink) {
        var route = el("a", { class: "concert-route", href: c.mapLink, target: "_blank", rel: "noopener" }, "Route anzeigen \u2192");
        body.appendChild(route);
      } else if (!hasCoords) {
        body.appendChild(el("p", { class: "concert-venue" }, "Kein Kartenlink hinterlegt."));
      }

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ---------- Video Highlights ---------- */
  function renderVideos() {
    var grid = document.getElementById("video-grid");
    var videos = C.videoHighlights || [];

    videos.forEach(function (v) {
      var card = el("div", { class: "video-card" });
      var frame = el("a", {
        class: "video-frame",
        href: v.youtubeUrl || "#",
        target: "_blank",
        rel: "noopener",
        "aria-label": "Video auf YouTube ansehen: " + (v.title || "")
      });

      if (v.poster) {
        frame.appendChild(el("img", { src: v.poster, alt: v.title || "", loading: "lazy" }));
      }
      frame.appendChild(el("span", { class: "video-play", "aria-hidden": "true" }));
      card.appendChild(frame);

      var meta = el("div", { class: "video-meta" });
      meta.appendChild(el("p", { class: "video-meta-title" }, v.title || ""));
      meta.appendChild(el("p", { class: "video-meta-date" }, formatDateShort(v.date)));
      card.appendChild(meta);

      grid.appendChild(card);
    });
  }

  /* ---------- Galerie + Lightbox ---------- */
  var galleryImages = C.galleryImages || [];
  var lightboxIndex = -1;
  var lastFocusedEl = null;

  function renderGallery() {
    var grid = document.getElementById("gallery-grid");

    if (!galleryImages.length) {
      grid.appendChild(el("p", { class: "gallery-empty" }, "Noch keine Fotos hinterlegt."));
      return;
    }

    galleryImages.forEach(function (img, i) {
      var btn = el("button", {
        class: "gallery-item",
        type: "button",
        "aria-label": "Bild vergr\u00f6\u00dfern: " + (img.caption || "")
      });
      btn.appendChild(el("img", { src: img.src, alt: img.caption || "", loading: "lazy" }));
      btn.addEventListener("click", function () { openLightbox(i, btn); });
      grid.appendChild(btn);
    });
  }

  function openLightbox(index, triggerEl) {
    lightboxIndex = index;
    lastFocusedEl = triggerEl || document.activeElement;
    updateLightbox();
    var box = document.getElementById("lightbox");
    box.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lightbox-close").focus();
    document.addEventListener("keydown", onLightboxKeydown);
  }

  function closeLightbox() {
    var box = document.getElementById("lightbox");
    box.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onLightboxKeydown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") lastFocusedEl.focus();
  }

  function updateLightbox() {
    var item = galleryImages[lightboxIndex];
    if (!item) return;
    var imgEl = document.getElementById("lightbox-img");
    imgEl.src = item.src;
    imgEl.alt = item.caption || "";
    document.getElementById("lightbox-caption-title").textContent = item.caption || "";
    document.getElementById("lightbox-caption-desc").textContent = item.description || "";
  }

  function showNext() {
    if (!galleryImages.length) return;
    lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
    updateLightbox();
  }
  function showPrev() {
    if (!galleryImages.length) return;
    lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox();
  }

  function onLightboxKeydown(e) {
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showNext();
    else if (e.key === "ArrowLeft") showPrev();
  }

  function initLightboxControls() {
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    document.getElementById("lightbox-next").addEventListener("click", showNext);
    document.getElementById("lightbox-prev").addEventListener("click", showPrev);
    var box = document.getElementById("lightbox");
    box.addEventListener("click", function (e) {
      if (e.target === box) closeLightbox();
    });

    // Touch swipe
    var touchStartX = null;
    box.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? showNext() : showPrev(); }
      touchStartX = null;
    }, { passive: true });
  }

  /* ---------- Aktuelle Setliste ---------- */
  function renderSetlist() {
    var wrap = document.getElementById("setlist-groups");
    var groups = C.setlist || [];

    groups.forEach(function (group, i) {
      var hasImage = !!(group.backgroundImage && group.backgroundImage.trim());
      var section = el("section", {
        class: "setlist-group",
        "data-variant": String(i % 3),
        "data-has-image": hasImage ? "true" : "false"
      });
      if (hasImage) {
        section.style.backgroundImage = "url('" + group.backgroundImage + "')";
      }

      var inner = el("div", { class: "setlist-group-inner" });
      var head = el("div", { class: "setlist-group-head" });
      var h3 = el("h3", { class: "setlist-group-title" });
      h3.textContent = group.category || "";
      head.appendChild(h3);
      var count = (group.songs || []).length;
      head.appendChild(el("span", { class: "setlist-group-count" }, count + (count === 1 ? " Song" : " Songs")));
      inner.appendChild(head);

      var list = el("ul");
      (group.songs || []).forEach(function (song) {
        var li = el("li", { class: "setlist-song" });
        var t = el("span", { class: "setlist-song-title" });
        t.textContent = song.title || "";
        var a = el("span", { class: "setlist-song-artist" });
        a.textContent = song.artist || "";
        li.appendChild(t);
        li.appendChild(a);
        list.appendChild(li);
      });
      inner.appendChild(list);
      section.appendChild(inner);
      wrap.appendChild(section);
    });
  }

  /* ---------- Band und Kontakt ---------- */
  function renderBand() {
    var grid = document.getElementById("band-grid");
    (C.bandMembers || []).forEach(function (member) {
      var card = el("div", { class: "band-card" });
      var photo = el("div", { class: "band-photo" });
      photo.appendChild(el("img", { src: member.photo, alt: member.name || "", loading: "lazy" }));
      card.appendChild(photo);
      var name = el("p", { class: "band-name" });
      name.textContent = member.name || "";
      var role = el("p", { class: "band-role" });
      role.textContent = member.role || "";
      card.appendChild(name);
      card.appendChild(role);
      grid.appendChild(card);
    });
  }

  function renderContact() {
    var list = document.getElementById("contact-list");
    var contact = C.contact || {};

    if (contact.email) {
      var row = el("div", { class: "contact-row" });
      row.appendChild(el("span", { class: "label" }, "E-Mail"));
      var a = el("a", { href: "mailto:" + contact.email });
      a.textContent = contact.email;
      row.appendChild(a);
      list.appendChild(row);
    }

    (contact.phones || []).forEach(function (p) {
      var row = el("div", { class: "contact-row" });
      row.appendChild(el("span", { class: "label" }, p.name || "Telefon"));
      var a = el("a", { href: "tel:" + String(p.number || "").replace(/\s+/g, "") });
      a.textContent = p.number || "";
      row.appendChild(a);
      list.appendChild(row);
    });

    if (contact.instagram && contact.instagram.url) {
      var igRow = el("div", { class: "contact-row" });
      igRow.appendChild(el("span", { class: "label" }, "Instagram"));
      var igLink = el("a", { href: contact.instagram.url, target: "_blank", rel: "noopener" });
      igLink.textContent = contact.instagram.handle || contact.instagram.url;
      igRow.appendChild(igLink);
      list.appendChild(igRow);
    }
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    var hero = document.querySelector(".hero");
    if (!btn || !hero) return;
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          btn.classList.toggle("is-visible", !entry.isIntersecting);
        });
      }, { threshold: 0 });
      observer.observe(hero);
    } else {
      btn.classList.add("is-visible");
    }
  }

  /* ---------- boot ---------- */
  renderConcerts();
  renderVideos();
  renderGallery();
  renderSetlist();
  renderBand();
  renderContact();
  initLightboxControls();
  initBackToTop();
  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
