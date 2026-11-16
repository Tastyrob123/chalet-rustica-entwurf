/* Chalet Rustica · Hereinschweben wie beim Grand Beau-Rivage (Vorlage: Wellnesshotel Zurbriggen, schweben-rivage.js; Robert 09.11.2026:
   «dieses Besondere mit dem Zoom-Effekt und dem Reinfliegen von den Bildern»).
   Stand Gilles Varone (gv.js, 09.11.2026): Jedes Bild fliegt in seinem eigenen ruhigen Tempo an seinen Platz (1,6 s, langes Auslaufen).
   Das Foto darin zoomt erst, wenn es selbst ins Bild kommt (1,15 auf 1,04 in 2,6 s), damit man das Heranzoomen sieht;
   danach gleitet es beim Scrollen sacht im Rahmen, auf der Scroll-Zeitachse (rustica.css), das Skript nur als Rückfall.
   Lauftexte rollen zeilenweise aus dem Schlitz wie die Überschriften, ebenfalls erst im Bild.
   Blätter, Tafeln, Listen und Knöpfe fliegen denselben Weg mit.
   Der Flug startet, sobald ein Stück unten ins Fenster kommt (12 % vorher). Nicht im Auftakt, nicht im Kopf einer Seite, nicht im Fenster.
   Nur translate, scale und transform, deckend von Anfang an. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]ruhig/.test(location.search) || !('IntersectionObserver' in window)) return;
  var D = document;
  D.documentElement.classList.add('schwebt');
  var TEXT = '.blatt, .tafel-holz, .se-zahl, .liste, .knoepfe, dl, ol, .se-strecke, .se-erfolg';
  var RASTER = '.hn2, .he15, .hv-sch, .hv-erf, .wa-w, .wn-zahlen, .se-vgl__reihen, .hr8, .se-erfolg, .se-strecke__halte, .tu5, .wege, .sn2, .wi1__o, .xw7, .se-drei, .se-inkl__l, .aw6__l';
  var alle = [], gl = [], fotos = [], laeufe = [];
  function frei(el) { return !el.closest('.auftakt, [data-erst], .bruch, .vz:not(.f0), .leiste, .menue, dialog'); }
  var abschnitte = [].slice.call(D.querySelectorAll('main > section'));
  abschnitte.forEach(function (S) {
    [].forEach.call(S.querySelectorAll('figure'), function (f) {
      if (!frei(f) || f.parentElement.closest('figure') || f.closest('.rv-t')) return;
      f.classList.add('rv-b'); alle.push(f);
      var im = f.querySelectorAll('img'); if (im.length === 1) { im[0].classList.add('rv-f'); fotos.push(f); gl.push({ im: im[0], f: f, da: false }); }
    });
    /* Raster: jedes Stück fliegt einzeln, nicht der Block (Robert 13.11.2026) */
    [].forEach.call(S.querySelectorAll(RASTER), function (g) {
      if (!frei(g) || g.closest('.rv-t')) return;
      [].forEach.call(g.children, function (k, i) {
        if (k.classList.contains('rv-t') || k.classList.contains('rv-b')) return;
        k.classList.add('rv-t', 'rv-n'); k.style.setProperty('--rvn', i); alle.push(k);
      });
    });
    [].forEach.call(S.querySelectorAll(TEXT), function (t) {
      if (!frei(t) || t.closest('figure, button, .rv-b') || t.parentElement.closest('.rv-t') || t.matches('[data-r=text], [data-zeilen]') || t.closest('[data-r=text]')) return;
      if (t.closest('a') && !t.matches('.knoepfe')) return;
      t.classList.add('rv-t'); alle.push(t);
    });
    /* Lauftexte: reine Textabsätze ab 30 Zeichen, sichtbar, ohne eigenen Auftritt darüber */
    [].forEach.call(S.querySelectorAll('p'), function (p) {
      if (!frei(p) || p.children.length || p.textContent.trim().length < 30 || !p.getClientRects().length) return;
      if (p.closest('figure, a, button, label, form, .rv-t, .rv-b, [data-zeilen], [data-staffel], [data-flaeche], [data-zug]')) return;
      var o = p.parentElement && p.parentElement.closest('[data-r]'); if (o) return;
      p.removeAttribute('data-r'); p.classList.add('rv-z'); laeufe.push(p);
    });
  });

  /* ---------- Lauftexte in echte Zeilen teilen (nach der Schrift, neu bei anderer Breite) ---------- */
  function zeilen(el) {
    if (!el.dataset.roh) el.dataset.roh = el.textContent.trim();
    var w = el.dataset.roh.split(/\s+/);
    el.innerHTML = w.map(function (x) { return '<span class="wd">' + x + '</span>'; }).join(' ');
    var reihen = [], oben = null;
    [].forEach.call(el.querySelectorAll('.wd'), function (s) {
      var t = Math.round(s.offsetTop);
      if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; }
      reihen[reihen.length - 1].push(s.textContent);
    });
    el.innerHTML = reihen.map(function (r, i) { return '<span class="zl"><span style="--z:' + i + '">' + r.join(' ') + '</span></span>'; }).join('');
  }
  function alleZeilen() { laeufe.forEach(zeilen); }
  alleZeilen();
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(alleZeilen);
  var breite = innerWidth;
  addEventListener('resize', function () { if (innerWidth !== breite) { breite = innerWidth; alleZeilen(); } }, { passive: true });

  /* Was beim Laden schon über dem Fenster liegt (Rücksprung), steht sofort ohne Flug */
  alle.concat(laeufe).forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('rv-sofort', 'rv-da', 'rv-zo'); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { [].forEach.call(D.querySelectorAll('.rv-sofort'), function (x) { x.classList.remove('rv-sofort'); }); }); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { e.target.classList.add('rv-da'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
  alle.forEach(function (el) { if (!el.classList.contains('rv-da')) io.observe(el); });
  /* Fotos und Lauftexte starten erst, wenn sie selbst ins Bild kommen: man sieht das Heranzoomen und das Hereinrollen */
  var spaet = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { e.target.classList.add(e.target.matches('.rv-z') ? 'rv-da' : 'rv-zo'); spaet.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
  fotos.concat(laeufe).forEach(function (el) { if (!el.classList.contains('rv-sofort')) spaet.observe(el); });

  /* Gleiten: das Foto wandert beim Scrollen sacht in seinem Rahmen (höchstens 2 % der Rahmenhöhe, passt in die Ruhe-Vergrösserung 1,04).
     Wo der Browser es kann, auf der Scroll-Zeitachse (rustica.css «Gleiten»), sonst per Skript */
  if (window.CSS && CSS.supports('animation-timeline: view()')) { gl.forEach(function (g) { g.f.classList.add('rv-gl'); }); return; }
  var vh = innerHeight, offen = 0;
  var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { gl.forEach(function (g) { if (g.f === e.target) g.da = e.isIntersecting; }); }); }, { rootMargin: '10% 0px 10% 0px' });
  gl.forEach(function (g) { gio.observe(g.f); });
  function gleite() {
    offen = 0;
    for (var i = 0; i < gl.length; i++) {
      var g = gl[i]; if (!g.da) continue;
      var r = g.f.getBoundingClientRect(), q = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      q = q < -1 ? -1 : q > 1 ? 1 : q;
      g.im.style.translate = '0 ' + (q * r.height * .02).toFixed(1) + 'px';
    }
  }
  addEventListener('scroll', function () { if (!offen) offen = requestAnimationFrame(gleite); }, { passive: true });
  addEventListener('resize', function () { vh = innerHeight; gleite(); }, { passive: true });
  gleite();
})();
