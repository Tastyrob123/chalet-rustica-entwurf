/* kleid/rustica.js · Hauswerte für oberflaeche.js (Chalet Rustica Saas-Almagell: drei Ferienwohnungen am Bach, Gastgeber Heidi und Damian Andenmatten-Zurbriggen; 09.11.2026).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf in Holz tief (#33261C) mit dem R als leiser Tapete, Raum hell wie Putz (#F4EEE3).
   Liegt unter _werkzeuge/oberflaeche/ und wird von den Werkzeug-Servern unter /assets/oberflaeche/ ausgeliefert (einziger Schreiber: die Stube, Helfer «stube»).
   Fotos und Schriften kommen aus der Website (/assets/img/<schlüssel>-<s|m|l|x>.webp, /assets/fonts/), Zeichen aus /assets/oberflaeche/kleid/rustica-marke.svg#wm. */
window.WO_HAUS = { kurz: 'rustica', name: 'Chalet Rustica', voll: 'Chalet Rustica Saas-Almagell', ort: 'Saas-Almagell', welt: 'hotel', rahmen: 'buehne', anrede: 'Sie',   /* Sie-Ansprache wie die Website */
  /* Aussenfoto des Startbilds: das Chalet tief verschneit (Website: haus.html, Auftakt-Bildwand). Stufen -s/-m/-l/-x sind Namen im Spiegel _werkzeuge/_web
     (_web_bau.py wählt je Stufe die grösste vorhandene Breite der Website, nie hochgerechnet); oberflaeche.js baut daraus srcset. */
  foto: '/assets/img/haus-winter-l.webp', fotoKlein: '/assets/img/haus-winter-m.webp', fotoFarbe: '#33261C',
  fotoStufen: { s: 700, m: 700, l: 1100, x: 1600 }, fotoAlt: 'Das Chalet Rustica tief verschneit',
  /* Je Werkzeug ein eigenes Foto im Startbild, nur aus dem Bildregister (_web/inhalt/bilder.py), nie ein Porträt */
  fotoJe: { website: ['haus-winter', 'Das Chalet Rustica tief verschneit'], karten: ['n5-kueche', 'Wohnung Weissmies: Küche mit Kochinsel'],
    gaeste: ['n2-balkon', 'Wohnung Portjengrat: Sitzecke mit Tür zum Südbalkon'], marke: ['haus-sommer', 'Das Chalet Rustica im Sommer mit Geranien an jedem Balkon'],
    besuche: ['dorf', 'Blick von oben ins Tal auf das Dorf'], druck: ['n5-wohn', 'Wohnung Weissmies: Aufenthaltsraum mit rotem Sofa und Holzboden'] },
  /* Zeichen: das gotische R der Website (website/assets/zeichen/r.svg, Schrift Grenze Gotisch nur im Namen) */
  zeichen: '/assets/oberflaeche/kleid/rustica-zeichen.svg', zeichenMass: 0.89, wortmarke: '/assets/oberflaeche/kleid/rustica-marke.svg#wm', wortmarkeMass: 0.89,
  /* Namen der sieben Werkzeuge: die EINE Stelle (Arbeitsnamen bis Robert wählt); Dateien, Schlüssel und Adressen bleiben. */
  namen: { zentrale: 'Kontrollpanel', website: 'Website bearbeiten', karten: 'Karten & Preislisten', gaeste: 'Anfragen & Chat', marke: 'Markenbuch', besuche: 'Besucher', druck: 'Drucksachen & Feed' },
  saetze: { zentrale: 'Hier beginnt alles: ein Blick auf alle Werkzeuge und ihren Stand.',
    website: 'Die Website selbst pflegen: Texte, Fotos, Wohnungen, Hinweise.',
    karten: 'Die Mappe in jeder Wohnung schreiben: Ausstattung, Inbegriffenes, Hausregeln, Anreise. Daraus entstehen Blätter und PDF.',
    gaeste: 'Anfragen der Gäste zu Wohnungen, Daten, Anreise und Massage, mit Antwortentwurf.',
    marke: 'Zeichen, Fotos, Farben und Schriften des Hauses an einem Ort.',
    besuche: 'Wer die Website besucht: woher, wann, welche Wohnungen, wer anfragen geht.',
    druck: 'Aushänge, Karten und Beiträge in der Sprache des Hauses entwerfen.' },
  wege: { zentrale: '/_werkzeuge/maison/', website: '/_werkzeuge/bureau/', karten: '/_werkzeuge/carte/', gaeste: '/_werkzeuge/reception/', marke: '/_werkzeuge/livre/', besuche: '/_werkzeuge/registre/', druck: '/_werkzeuge/imprimerie/' },
  /* Prüfserver je Werkzeug (Ports 9521–9529, frei geprüft 09.11.2026); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9521, website: 9522, karten: 9523, gaeste: 9524, marke: 9525, besuche: 9526, druck: 9527, werkbank: 9528, website_lokal: 9529 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fund im Stamm 28.10.2026: der Knopf zur Zentrale öffnete /_werkzeuge/maison/ auf dem eigenen Port ohne Stand-Wege; Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  if (!/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge (29.10.2026): bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : '/assets/oberflaeche/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (Kriterium 37, 30.10.2026). WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch (Silbentrennung, sehr lange Wörter), bleibt der Titel unberührt.
   Hier im Kleid (ohne defer), damit der Titel des Startbilds schon vor dem ersten Bild geteilt ist; bewegung.js nutzt dieselbe Funktion für die Zwischentitel. */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;   /* verborgen: später, wenn er zu sehen ist */
  el.setAttribute('data-wo-zl', '');
  var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
  while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
  if (!ts.length) return false;
  ts.forEach(function (t) {
    var f = document.createDocumentFragment();
    t.data.split(/(\s+)/).forEach(function (s) {
      if (!s) return;
      if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
      var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
    });
    t.parentNode.replaceChild(f, t);
  });
  if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return false; }
  var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  el.querySelectorAll('.wo-w').forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
  el.classList.add('wo-zl');
  return true;
};
/* Der Titel des Startbilds: geteilt, sobald er im Dokument steht (vor dem ersten Bild, der Auftritt beginnt erst nach 0,18 s) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }   /* läuft schon: bleibt ein Block, nie zurückspringen */
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
