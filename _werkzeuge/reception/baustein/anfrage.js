/* Anschluss der Anfragen der Website an das Gästebuch · Chalet Rustica, Saas-Almagell (09.11.2026, Master Werkzeug-Bau E12/E24/E33, Aufbau wie der Baustein der Vorlage
   Wellness & Spa Pirmin Zurbriggen). Die Website hat schon ihr eigenes Anfrage-Fenster (website/assets/js/anfrage.js: «Anfrage senden», «… anfragen» bei jeder Wohnung,
   «Massage anfragen» bei Heidi, das Formular auf der Kontaktseite; Felder wie chalet-rustica.ch/kontakt: Ihr Anliegen, Ankunft, Abreise, Erwachsene, Kinder bis 10 J.,
   Name, Vorname, E-Mail, Telefon, Wünsche). Als Designstudie verschickt es nichts. Dieser Baustein hängt sich an das Absenden dieses Fensters: ist alles ausgefüllt,
   geht die Anfrage in den Eingang des Gästebuchs, mit Art (Wohnung oder Massage bei Heidi), Anliegen und der Seite, von der sie kam; danach zeigt das Fenster seinen
   eigenen Dank. Fehlt etwas, prüft das Fenster der Website wie bisher. Geht etwas schief, bleibt alles Eingegebene stehen, und das Fenster nennt Telefon und E-Mail.
   Ohne den Baustein bleibt die Website, wie sie ist. Nie mailto, nie ein Mailprogramm.
   Einbinden (Website-Chat, nicht von Hand): <script src="assets/js/anfrage-gaestebuch.js?v={V}" defer></script> nach assets/js/anfrage.js auf jeder Seite.
   Ziel: /_werkzeuge/reception/api/formular (anders mit <script … data-api="/_werkzeuge/reception/api/formular"> oder window.WS_ANFRAGE_API). */
(function () {
  'use strict';
  var D = document, skript = D.currentScript;
  var API = window.WS_ANFRAGE_API || (skript && skript.getAttribute('data-api')) || '/_werkzeuge/reception/api/formular';
  var WEGE = 'Telefon +41 27 957 10 55 oder info@chalet-rustica.ch';
  var seiteName = function () { var t = (D.title || '').split(/ · | \| | — /)[0].trim(); return /^Chalet Rustica$/.test(t) ? 'Startseite' : t; };
  var tag = function (iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); };
  D.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.classList || !f.classList.contains('anf__form')) return;
    var el = f.elements, w = function (n) { return el[n] ? String(el[n].value || '').trim() : ''; };
    // nur vollständige Anfragen übernehmen; sonst meldet das Fenster der Website selbst, was fehlt
    if (!w('an') || !w('ab') || w('ab') <= w('an') || !w('name') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(w('email'))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var huelle = f.closest('.anf') || f.parentNode, m = f.querySelector('.anf__fehler'), k = f.querySelector('[type="submit"]');
    var anliegen = w('anliegen') || 'Eine freie Wohnung', massage = /Massage/.test(anliegen);
    var erw = parseInt(w('erwachsene'), 10) || 0, kin = parseInt(w('kinder'), 10) || 0;
    var zeilen = ['Ihr Anliegen: ' + anliegen, 'Ankunft: ' + tag(w('an')), 'Abreise: ' + tag(w('ab')), 'Erwachsene: ' + erw, 'Kinder (bis 10 J.): ' + kin];
    if (w('tel')) zeilen.push('Telefon: ' + w('tel'));
    if (w('wuensche')) zeilen.push('Wünsche: ' + w('wuensche'));
    if (k) k.disabled = true;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      art: massage ? 'massage' : 'wohnung', formular: massage ? 'massage' : (huelle.classList.contains('anf--inline') ? 'allgemein' : 'wohnung'),
      name: (w('vorname') ? w('vorname') + ' ' : '') + w('name'), kontakt: w('email'), datum: tag(w('an')) + ' bis ' + tag(w('ab')), personen: erw + kin || '',
      platz: anliegen, allergene: [], anliegen: (w('wuensche') || anliegen).slice(0, 300), nachricht: zeilen.join('\n'),
      seite: location.pathname + location.hash, seite_name: seiteName(), sprache: (D.documentElement.lang || 'de').slice(0, 2), website: '' }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(String((r.j && r.j.fehler) || '').replace(/^[A-ZÄÖÜ-]+ · /, '') || 'Ihre Anfrage kam nicht an.');
        if (m) m.hidden = true;
        var leise = huelle.querySelector('.anf__danke .leise'); if (leise) leise.textContent = 'Ihre Anfrage liegt bei Heidi und Damian; sie melden sich persönlich bei Ihnen.';
        huelle.classList.add('anf--danke'); if (k) k.disabled = false;
      })
      .catch(function (err) {
        if (m) { m.hidden = false; m.textContent = (err && err.message && !/fetch|network|load/i.test(err.message) ? err.message : 'Ihre Anfrage kam nicht an.') + ' Bitte gleich noch einmal versuchen, oder direkt: ' + WEGE + '.'; }
        if (k) k.disabled = false;
      });
  }, true);
})();
