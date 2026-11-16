/* Chalet Rustica · Hereinschweben wie beim Grand Beau-Rivage (Vorlage: Wellnesshotel Zurbriggen, schweben-rivage.js; Robert 09.11.2026:
   «dieses Besondere mit dem Zoom-Effekt und dem Reinfliegen von den Bildern»).
   Jedes Bild fliegt in seinem eigenen ruhigen Tempo an seinen Platz (1,6 s, langes Auslaufen) und setzt sich dabei aus 1,13 auf 1,04;
   danach gleitet das Foto beim Scrollen sacht im Rahmen. Blätter, Tafeln, Listen und Knöpfe fliegen denselben Weg mit.
   Der Flug startet, sobald ein Stück unten ins Fenster kommt (12 % vorher). Nicht im Auftakt, nicht im Kopf einer Seite, nicht im Fenster.
   Nur translate und scale, deckend von Anfang an. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]ruhig/.test(location.search) || !('IntersectionObserver' in window)) return;
  var D = document;
  D.documentElement.classList.add('schwebt');
  var TEXT = '.blatt, .tafel-holz, .se-zahl, .liste, .knoepfe, dl, ol, .se-strecke, .se-erfolg';
  var alle = [], gl = [];
  function frei(el) { return !el.closest('.auftakt, [data-erst], .bruch, .vz:not(.f0), .leiste, .menue, dialog'); }
  var abschnitte = [].slice.call(D.querySelectorAll('main > section'));
  abschnitte.forEach(function (S) {
    [].forEach.call(S.querySelectorAll('figure'), function (f) {
      if (!frei(f) || f.parentElement.closest('figure') || f.closest('.rv-t')) return;
      f.classList.add('rv-b'); f._mit = []; alle.push(f);
      var im = f.querySelectorAll('img'); if (im.length === 1) { im[0].classList.add('rv-f'); gl.push({ im: im[0], f: f, da: false }); }
    });
    [].forEach.call(S.querySelectorAll(TEXT), function (t) {
      if (!frei(t) || t.closest('figure, button, .rv-b') || t.parentElement.closest('.rv-t') || t.matches('[data-r=text], [data-zeilen]') || t.closest('[data-r=text]')) return;
      if (t.closest('a') && !t.matches('.knoepfe')) return;
      t.classList.add('rv-t'); alle.push(t);
    });
  });
  function los(el) { el.classList.add('rv-da'); }
  /* Was beim Laden schon über dem Fenster liegt (Rücksprung), steht sofort ohne Flug */
  alle.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('rv-sofort', 'rv-da'); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { [].forEach.call(D.querySelectorAll('.rv-sofort'), function (x) { x.classList.remove('rv-sofort'); }); }); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { los(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
  alle.forEach(function (el) { if (!el.classList.contains('rv-da')) io.observe(el); });

  /* Gleiten: das Foto wandert beim Scrollen sacht in seinem Rahmen (höchstens 2 % der Rahmenhöhe, passt in die Ruhe-Vergrösserung 1,04) */
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
