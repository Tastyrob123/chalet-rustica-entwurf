/* Besucher · Chalet Rustica Saas-Almagell: Zählung auf der Website (09.11.2026). Quelle dieser Datei; auf der
   Website läge sie als assets/js/messung.js, auf jeder Seite vor </body> als <script src="assets/js/messung.js?v=…" defer></script>.
   NICHT eingebaut: die Website gehört dem Chat «Bau: Chalet Rustica One-Pager», und eingeschaltet wird erst auf Roberts Wort. Hier nur die Quelle.
   Vorbild: messung.js «Besucher» des Schwesterhauses (dort aus dem Stamm), Ereignisse des Chalets.

   Je Seite geht eine Zeile an /api/registre (lokal der Server «Besucher», online die Funktion api/registre.py, gleiche Adresse):
       r1 <seitenaufruf> <datei> <sprache> <geraet> <sekunden> <ereignisse|-> <herkunft|->
   einmal beim Öffnen (0 Sekunden), bei jedem gezählten Klick und beim Verlassen (Sekunden, in denen die Seite sichtbar war).
   Ohne Cookies und ohne Kennung im Gerät: «seitenaufruf» ist eine Zufallsfolge, die nur in dieser Variablen lebt und mit der Seite endet.
   Dass die Seiten eines Besuchs zusammenfinden, Land und Ort bestimmt der Server aus der Verbindung (registre.py); die Adresse speichert er nicht.
   «herkunft» ist nur der Name der Website, von der der Gast kam (zum Beispiel www.google.ch), nie die ganze Adresse.
   «sprache» ist die Sprache des Browsers (die Website gibt es nur deutsch), sonst «xx».
   Nicht gezählt: automatische Browser (Prüfläufe), Seiten im Rahmen, die Werkzeuge und die Werkbank, Varianten und Entwürfe (v-*, auftakt-*, stil-*,
   *wahl*) und Geräte mit der Marke «rustica-nicht-zaehlen» im localStorage (das Einzige, was je im Gerät steht).
   Das Chalet hat kein Buchungssystem: Gäste schreiben eine Anfrage (Fenster aus assets/js/anfrage.js, Formular auf «Kontakt») oder rufen an.
   Gezählt wird nur, dass der Gast diesen Schritt macht, nie ein Inhalt (kein Name, keine E-Mail, keine Daten der Reise).

   Ereignisse (Schlüssel wie in allen Häusern, Bedeutung beim Chalet):
     fenster  Anfrage-Fenster geöffnet: Klick auf einen Verweis mit data-anfrage («Anfrage», «Anfrage senden», «… anfragen»)
     buchung  Anfrage abgeschickt: Formular .anf__form (im Fenster oder auf «Kontakt») vollständig ausgefüllt abgeschickt
     booking  Eine Wohnung angefragt: data-anfrage="Wohnung …" («Almagellerhorn anfragen», «Anfragen» bei einer Wohnung)
     tisch    Massage bei Heidi angefragt: data-anfrage="Massage bei Heidi" («Massage anfragen»)
     anfrage  Preise angefragt: data-anfrage="Preis- oder Reservationsanfrage" («Preise anfragen»)
     anruf    Angerufen: tel:+41279571055 («Anrufen» oder die Nummer)
     mail     E-Mail-Adresse angeklickt: mailto: ohne Anfrage-Fenster
     chat     Foto einer Wohnung gross angesehen: Knopf mit data-gross (Bildwand der Wohnungsseiten); die Website hat keinen Gäste-Chat
     route    weiter zu den Häusern der Familie (Verweise im Fuss und oben in der Ecke, die die Website verlassen) */
(function () {
  'use strict';
  var n = navigator, d = document, w = window;
  if (w.__registre || !n.sendBeacon || n.webdriver || w.self !== w.top) return;
  try { if (w.localStorage.getItem('rustica-nicht-zaehlen') === '1') return; } catch (e) { /* privat: zählt normal */ }
  var teile = location.pathname.split('/'), datei = teile.pop() || 'index.html';
  if (/^(_werkzeuge|werkzeuge|werkbank|_werkbank|maison|marke|reception|registre|imprimerie|_qa|_sicherung|_alt|_varianten|wahl)$/.test(teile[1] || '')) return;   /* Werkzeuge und Werkbank zählen nie */
  if (!/^[a-z0-9-]{1,60}\.html$/.test(datei) || /^(v-|auftakt-|stil-)|wahl|varianten|^vorschau|^404/.test(datei)) return;
  w.__registre = 1;
  var SPRACHEN = ' de en fr it nl es pt zh ja ko ar ';
  var sp = String(n.language || 'de').slice(0, 2).toLowerCase();
  if (SPRACHEN.indexOf(' ' + sp + ' ') < 0) sp = 'xx';
  var breit = function (px) { return !!(w.matchMedia && w.matchMedia('(max-width:' + px + 'px)').matches); };
  var geraet = breit(700) ? 'handy' : breit(1060) ? 'tablet' : 'rechner';
  var her = '-';
  try { var r = d.referrer ? new URL(d.referrer).hostname.toLowerCase() : ''; if (r && r !== location.hostname && /^[a-z0-9.-]{3,60}$/.test(r)) her = r; } catch (e) {}
  var HAUS_TEL = /^tel:\+?(41279571055|0279571055)$/;
  var pv, war, liste, sichtbar, seit, gesendet;
  function neu() {
    pv = (Math.random().toString(36) + '000000').slice(2, 8);
    war = {}; liste = []; sichtbar = 0; gesendet = '';
    seit = d.visibilityState === 'hidden' ? 0 : Date.now();
    sende();
  }
  function sek() { return Math.min(1800, Math.round((sichtbar + (seit ? Date.now() - seit : 0)) / 1000)); }
  function sende() {
    var zeile = 'r1 ' + pv + ' ' + datei + ' ' + sp + ' ' + geraet + ' ' + sek() + ' ' + (liste.length ? liste.join(',') : '-') + ' ' + her;
    if (zeile === gesendet) return;
    gesendet = zeile;
    try { n.sendBeacon('/api/registre', zeile); } catch (e) {}   /* wartet auf keine Antwort */
  }
  function zaehle(was) {
    if (war[was]) return;
    war[was] = 1; liste.push(was);
    sende();
  }
  function weg() { if (seit) { sichtbar += Date.now() - seit; seit = 0; } sende(); }
  neu();
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') weg(); else if (!seit) seit = Date.now(); });
  w.addEventListener('pagehide', weg);
  w.addEventListener('pageshow', function (e) { if (e.persisted) neu(); });   /* zurück aus dem Seitenspeicher des Browsers: neuer Aufruf */

  /* Anfrage abgeschickt: das Formular des Hauses (anfrage.js), nur wenn alle Pflichtfelder ausgefüllt sind; der Inhalt bleibt im Formular */
  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.matches || !f.matches('form.anf__form')) return;
    try { if (f.checkValidity && !f.checkValidity()) return; } catch (x) {}
    zaehle('buchung');
  }, true);

  d.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (t.closest('[data-gross]')) { zaehle('chat'); return; }
    var a = t.closest('a[href]'); if (!a) return;
    var h = (a.getAttribute('href') || '').replace(/\s/g, '');
    if (a.hasAttribute('data-anfrage')) {
      var anliegen = a.getAttribute('data-anfrage') || '';
      zaehle('fenster');
      if (/^Wohnung /.test(anliegen)) zaehle('booking');
      else if (/Massage/.test(anliegen)) zaehle('tisch');
      else if (/Preis/.test(anliegen)) zaehle('anfrage');
      return;
    }
    if (/^tel:/i.test(h)) { if (HAUS_TEL.test(h)) zaehle('anruf'); }
    else if (/^mailto:/i.test(h)) zaehle('mail');
    else if (a.host && a.host !== location.host && a.closest('footer, .leiste__ecke')) zaehle('route');   /* host mit Port: lokal liegen die Häuser der Familie auf einem anderen Port */
  }, true);
})();
