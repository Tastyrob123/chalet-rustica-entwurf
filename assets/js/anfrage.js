/* Chalet Rustica · Anfrage-Fenster (Regel «Anfragen im Fenster, nie mailto»; Felder wie im Formular von chalet-rustica.ch/kontakt).
   Jeder Verweis mit data-anfrage öffnet dieses Fenster auf der Seite; data-anfrage="Wohnung Almagellerhorn" wählt das Anliegen vor.
   Designstudie: Es wird nichts verschickt, das Fenster sagt es sichtbar. Ohne Skript bleibt der mailto-Verweis als Rückfall.
   Listen und Kalender klappen über auswahl.js als Karte im Stil des Hauses auf, nie als Auswahl des Browsers. */
(function () {
  'use strict';
  var D = document, dlg, form;
  var ANLIEGEN = ['Eine freie Wohnung', 'Wohnung Almagellerhorn', 'Wohnung Portjengrat', 'Wohnung Weissmies', 'Preis- oder Reservationsanfrage', 'Massage bei Heidi'];
  function zahlen(von, bis) { var s = ''; for (var i = von; i <= bis; i++) s += '<option>' + i + '</option>'; return s; }
  function heute(plus) { var t = new Date(); t.setDate(t.getDate() + plus); return t.toISOString().slice(0, 10); }
  // Felder wie im Formular von chalet-rustica.ch/kontakt; dieselben im Fenster und direkt auf der Kontaktseite
  function felder(t) {
    return '<form class="anf__form" novalidate>' + t +
        '<div class="anf__felder">' +
          '<label class="ganz"><span>Ihr Anliegen</span><select name="anliegen">' + ANLIEGEN.map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label>' +
          '<label><span>Ankunft *</span><input type="date" name="an" required min="' + heute(1) + '"></label>' +
          '<label><span>Abreise *</span><input type="date" name="ab" required min="' + heute(2) + '"></label>' +
          '<label><span>Erwachsene</span><select name="erwachsene">' + zahlen(1, 6).replace('<option>2</option>', '<option selected>2</option>') + '</select></label>' +
          '<label><span>Kinder (bis 10 J.)</span><select name="kinder">' + zahlen(0, 4) + '</select></label>' +
          '<label><span>Name *</span><input name="name" autocomplete="family-name" required></label>' +
          '<label><span>Vorname</span><input name="vorname" autocomplete="given-name"></label>' +
          '<label><span>E-Mail *</span><input type="email" name="email" autocomplete="email" required></label>' +
          '<label><span>Telefon</span><input type="tel" name="tel" autocomplete="tel"></label>' +
          '<label class="ganz"><span>Anregungen oder ganz spezielle Wünsche</span><textarea name="wuensche"></textarea></label>' +
        '</div>' +
        '<p class="anf__hinweis">Die mit einem Stern * versehenen Felder müssen ausgefüllt werden. Designstudie: Diese Anfrage wird nicht verschickt.</p>' +
        '<p class="anf__fehler" role="alert" hidden></p>' +
        '<div class="knoepfe"><button class="knopf knopf--holz" type="submit">Anfrage senden<i><svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg></i></button></div>' +
      '</form>';
  }
  var DANKE = '<h2 class="dlg__titel">Vielen Dank für Ihre Anfrage.</h2><p class="dlg__satz">Wir werden in den nächsten Tagen mit Ihnen Kontakt aufnehmen. Es grüsst Sie herzlich die Familie Andenmatten-Zurbriggen.</p>' +
    '<p class="leise">Designstudie von Tasty Studios: Diese Anfrage wurde nicht verschickt.</p>';
  function pruefe(f, form, hülle) {
    var e = form.elements, fehlt = [];
    if (!e.an.value) fehlt.push('Ankunft'); if (!e.ab.value) fehlt.push('Abreise');
    else if (e.an.value && e.ab.value <= e.an.value) fehlt.push('Abreise nach der Ankunft');
    if (!e.name.value.trim()) fehlt.push('Name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.email.value.trim())) fehlt.push('E-Mail');
    var m = form.querySelector('.anf__fehler');
    if (fehlt.length) { m.textContent = 'Bitte noch ausfüllen: ' + fehlt.join(', ') + '.'; m.hidden = false; return; }
    m.hidden = true; hülle.classList.add('anf--danke');
  }
  function baue() {
    dlg = D.body.appendChild(D.createElement('dialog'));
    dlg.className = 'anf'; dlg.setAttribute('aria-labelledby', 'anf-titel');
    dlg.innerHTML = '<div class="blatt"><button class="dlg__zu" type="button" aria-label="Schliessen">×</button>' +
      felder('<h2 class="dlg__titel" id="anf-titel">Ihre Anfrage</h2><p class="dlg__satz">Möchten Sie Ihren nächsten Urlaub im Chalet Rustica verbringen oder sich von Heidi verwöhnen lassen? Hier können Sie mit der Familie Andenmatten-Zurbriggen Kontakt aufnehmen.</p>') +
      '<div class="anf__danke" role="status">' + DANKE + '<div class="knoepfe"><button class="knopf knopf--linie" type="button" data-zu>Schliessen<i><svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></i></button></div></div>' +
    '</div>';
    form = dlg.querySelector('form');
    dlg.querySelector('.dlg__zu').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('[data-zu]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); pruefe(null, form, dlg); });
  }
  // Kontaktseite: das Formular steht direkt auf der Seite
  [].forEach.call(D.querySelectorAll('[data-anfrage-inline]'), function (h) {
    h.classList.add('anf', 'anf--inline');
    h.innerHTML = felder('') + '<div class="anf__danke" role="status">' + DANKE + '</div>';
    var f = h.querySelector('form');
    f.addEventListener('submit', function (e) { e.preventDefault(); pruefe(null, f, h); });
  });
  function oeffne(anliegen) {
    if (!dlg) baue();
    dlg.classList.remove('anf--danke');
    var s = form.elements.anliegen;
    if (anliegen && ANLIEGEN.indexOf(anliegen) >= 0 && s.value !== anliegen) { s.value = anliegen; s.dispatchEvent(new Event('change', { bubbles: true })); }
    dlg.showModal();
  }
  D.addEventListener('click', function (e) {
    var a = e.target.closest('[data-anfrage]'); if (!a) return;
    e.preventDefault(); oeffne(a.getAttribute('data-anfrage'));
  });
})();
