/* Chalet Rustica · Fassungen zum Durchklicken (Vorlage Familienseite Zurbriggen, varianten/fassungen.js; Robert 08.11.2026): je Abschnitt 15 Fassungen, 0 = heutiger Stand.
   data-standard = die von Robert gewählte Fassung, die die Seite ohne Auswahl zeigt.
   Leiste unten zeigt den Abschnitt in der Bildmitte; ‹ › oder Pfeiltasten wechseln. Stand bleibt in der Adresse (?f=auftakt.3-familie.5)
   und im Browser gespeichert, damit Robert Nummern nennen kann. */
(function () {
  // ?stand: die Seite ohne Leiste und ohne gemerkte Auswahl, nur der eingebaute Stand (Robert 08.11.2026)
  if (/[?&]stand(&|=|$)/.test(location.search)) return;
  var d = document;
  var NAME = { heidi: 'Heidi', };
  var secs = [].slice.call(d.querySelectorAll('[data-abschnitt]'));
  var liste = {}, stand = {};
  try { stand = JSON.parse(localStorage.getItem('rustica-fassungen-1') || '{}'); } catch (e) {}
  var q = (location.search.match(/[?&]f=([^&]+)/) || [])[1];
  if (q) { stand = {}; decodeURIComponent(q).split('-').forEach(function (t) { var m = t.match(/^([a-z-]+?)\.(\d+)$/); if (m) stand[m[1]] = +m[2]; }); }
  // Abschnittsnamen mit Bindestrich (monte-moro) in der Adresse: monte-moro.3 → Trennung über bekannte Namen
  if (q) { stand = {}; var rest = decodeURIComponent(q); Object.keys(NAME).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
    var re = new RegExp('(^|-)' + k.replace('-', '\\-') + '\\.(\\d+)'); var m = rest.match(re); if (m) { stand[k] = +m[2]; rest = rest.replace(m[0], ''); } }); }

  var css = d.createElement('style');
  css.textContent = '.fassungen{position:fixed;z-index:60;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:6px;border-radius:18px;background:rgba(39,29,22,.95);color:#F4F2EC;box-shadow:0 18px 40px -16px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08);font:400 14px/1.25 "Instrument Sans",system-ui,sans-serif;max-width:calc(100% - 24px)}' +
    '.fassungen button{flex:0 0 auto;width:46px;height:46px;border:0;border-radius:13px;background:#2a292f;color:#fff;font-size:24px;line-height:1;cursor:pointer}' +
    '.fassungen button:hover{background:#5A4632}' +
    '.fassungen__mitte{min-width:240px;max-width:420px;padding:0 10px;text-align:center}' +
    '.fassungen__wo{font:400 10.5px/1.2 "DM Mono",monospace;letter-spacing:.16em;text-transform:uppercase;color:#a9a7ae}' +
    '.fassungen__nr{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.fassungen__nr b{font-weight:600;color:#fff;margin-right:6px}' +
    '@media(max-width:760px){.fassungen{bottom:10px}.fassungen__mitte{min-width:0;max-width:62vw}.fassungen button{width:42px;height:42px}}';
  d.head.appendChild(css);
  var leiste = d.createElement('div');
  leiste.className = 'fassungen';
  leiste.innerHTML = '<button type="button" data-schritt="-1" aria-label="Vorherige Fassung">‹</button><div class="fassungen__mitte"><div class="fassungen__wo"></div><div class="fassungen__nr"></div></div><button type="button" data-schritt="1" aria-label="Nächste Fassung">›</button>';
  d.body.appendChild(leiste);
  var wo = leiste.querySelector('.fassungen__wo'), nr = leiste.querySelector('.fassungen__nr');
  var aktiv = null;

  function anzahl(k) { return (liste[k] || []).length; }
  function name(k, v) { if (!v) { var s0 = d.querySelector('[data-abschnitt="' + k + '"]'); return s0 && +(s0.dataset.standard || 0) ? 'erster Entwurf' : 'heutiger Stand'; } var f = (liste[k] || []).filter(function (x) { return x.n === v; })[0]; return f ? f.name : ''; }
  function zeigeLeiste() {
    if (!aktiv) return;
    var k = aktiv.dataset.abschnitt, v = +aktiv.dataset.v || 0;
    wo.textContent = NAME[k] || k;
    nr.innerHTML = '<b>' + v + ' / ' + anzahl(k) + '</b>' + name(k, v);
    nr.title = name(k, v);
  }
  function merken() {
    try { localStorage.setItem('rustica-fassungen-1', JSON.stringify(stand)); } catch (e) {}
    var t = Object.keys(stand).filter(function (k) { var s = d.querySelector('[data-abschnitt="' + k + '"]'); return s && stand[k] !== +(s.dataset.standard || 0); }).map(function (k) { return k + '.' + stand[k]; }).join('-');
    history.replaceState(null, '', location.pathname + (t ? '?f=' + t : '') + location.hash);
  }
  function setze(sec, v, neu) {
    var k = sec.dataset.abschnitt, oben = sec.getBoundingClientRect().top;
    sec.dataset.v = v; stand[k] = v;
    if (neu && window.RU) window.RU.neu(sec);
    var nachher = sec.getBoundingClientRect().top;
    if (neu && Math.abs(nachher - oben) > 1) scrollBy(0, nachher - oben);
  }
  function schritt(r) {
    if (!aktiv) return;
    var k = aktiv.dataset.abschnitt, n = anzahl(k); if (!n) return;
    var v = ((+aktiv.dataset.v || 0) + r + n + 1) % (n + 1);
    setze(aktiv, v, true); merken(); zeigeLeiste();
  }
  leiste.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) schritt(+b.dataset.schritt); });
  addEventListener('keydown', function (e) {
    if (/input|textarea|select/i.test((e.target.tagName || ''))) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); schritt(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); schritt(-1); }
  });
  function finde() {
    var m = innerHeight * 0.5, best = null;
    secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= m && r.bottom > m) best = s; });
    // ausserhalb der Abschnitte mit Fassungen (z. B. im Fuss, der seit 08.11.2026 fest steht) verschwindet die Leiste
    leiste.style.display = best ? '' : 'none';
    if (!best) { aktiv = null; return; }
    if (best !== aktiv) { aktiv = best; zeigeLeiste(); }
  }
  var t = 0;
  addEventListener('scroll', function () { if (!t) t = requestAnimationFrame(function () { t = 0; finde(); }); }, { passive: true });
  addEventListener('resize', finde);

  // gespeicherten Stand sofort setzen (vor den Auftritten), Namen danach laden
  secs.forEach(function (s) { var v = stand[s.dataset.abschnitt]; if (v !== undefined && v !== +s.dataset.v) setze(s, v, false); });
  Promise.all(secs.map(function (s) {
    var k = s.dataset.abschnitt;
    return fetch('fassungen/' + k + '.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
      .then(function (j) { liste[k] = j || []; if ((stand[k] || 0) > anzahl(k)) setze(s, 0, false); });
  })).then(function () { finde(); zeigeLeiste(); merken(); });
  finde();
})();
