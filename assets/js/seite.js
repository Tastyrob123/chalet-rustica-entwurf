/* Chalet Rustica · Unterseiten: ein Klick auf ein Bild der Wohnung zeigt es gross, mit Pfeilen zum Blättern. */
(function () {
  'use strict';
  var D = document, alle = [].slice.call(D.querySelectorAll('[data-gross]')), knoepfe = alle;
  if (!alle.length) return;
  // nur die sichtbaren Bilder blättern (versteckte Fassungen tragen dieselben Bilder)
  function sichtbar() { return alle.filter(function (k) { return k.offsetParent !== null; }); }
  var dlg = D.body.appendChild(D.createElement('dialog')), jetzt = 0;
  dlg.className = 'se-lupe'; dlg.setAttribute('aria-label', 'Bild gross');
  dlg.innerHTML = '<img class="se-lupe__bild" alt=""><div class="se-lupe__leiste"><p class="se-lupe__text" aria-live="polite"></p>' +
    '<div class="se-lupe__knoepfe"><button type="button" data-s="-1" aria-label="Voriges Bild">‹</button><button type="button" data-s="1" aria-label="Nächstes Bild">›</button>' +
    '<button type="button" data-zu aria-label="Schliessen">×</button></div></div>';
  var bild = dlg.querySelector('img'), text = dlg.querySelector('.se-lupe__text');
  function zeige(i) {
    jetzt = (i + knoepfe.length) % knoepfe.length;
    var k = knoepfe[jetzt], q = k.querySelector('img');
    bild.srcset = q.srcset; bild.sizes = '(max-width:760px) 100vw, 1240px'; bild.src = q.src; bild.alt = q.alt;
    text.textContent = k.dataset.text;
  }
  alle.forEach(function (k) { k.addEventListener('click', function () { knoepfe = sichtbar(); zeige(Math.max(0, knoepfe.indexOf(k))); dlg.showModal(); }); });
  dlg.addEventListener('click', function (e) {
    var s = e.target.closest('[data-s]');
    if (s) return zeige(jetzt + Number(s.dataset.s));
    if (e.target.closest('[data-zu]') || e.target === dlg) dlg.close();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') zeige(jetzt + 1);
    if (e.key === 'ArrowLeft') zeige(jetzt - 1);
  });
})();
