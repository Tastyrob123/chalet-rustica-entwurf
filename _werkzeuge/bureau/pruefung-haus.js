/* pruefung-haus.js · Prüfseite im Rahmen des Chalet Rustica Saas-Almagell (09.11.2026; Vorlage: Schaufenster des Schwesterhauses, Wild Side, Culinarium, Vorbild Schäfli): Name des Werkzeugs aus der einen Stelle, «Zum Werkzeug» führt in dieses Werkzeug, nicht in den Stamm. */
(function () {
  var z = document.getElementById('wsp-zurueck'); if (z) z.href = '/_werkzeuge/bureau/';
  var n = window.WO_HAUS && WO_HAUS.namen && WO_HAUS.namen.website;
  /* welt.js des Stamms füllt [data-werkzeug] erst nach dem Laden mit seinem Weltnamen («Le Bureau»): der Name des Hauses wird danach noch einmal gesetzt */
  function setze() { if (n) { document.querySelectorAll('[data-werkzeug]').forEach(function (e) { if (e.textContent !== n) e.textContent = n; }); document.title = 'Prüfung · ' + n + ' · ' + WO_HAUS.name; } }
  setze(); document.addEventListener('DOMContentLoaded', setze); window.addEventListener('load', function () { setze(); setTimeout(setze, 200); });
})();
/* Freie Wochen (09.11.2026, Beispiel R20; Vorlage: Termin-Ansicht des Schwesterhauses, Termine des Culinarium): eigener Teil der Prüfung (Wohnungen aus
   _web/inhalt/daten.py, Beispiel gültig, Stelle der Seite «Die Wohnungen», Speicher, Sicherung) und die Lexikon-Einträge der Stichworte aus termine.py und
   termine-ansicht.js. Das Lexikon des Stamms bleibt unverändert; diese Einträge stehen darunter mit eigener Kennung lex-<stichwort> und öffnen sich,
   wenn «Was tun?» dorthin führt. */
(function () {
  var LEX = [
    { id: 'termine-quelle', titel: 'Die Wohnungen des Hauses sind nicht lesbar', sehen: 'Die Ansicht «Freie Wochen» startet nicht, oder hier steht «Freie Wochen (Beispiel)» rot.',
      grund: 'Die Namen der Wohnungen kommen aus _werkzeuge/_web/inhalt/daten.py › WOHNUNGEN. Die Datei fehlt, ist unlesbar oder nennt keine Wohnung mehr.',
      tun: 'Nichts ist verloren: Entwurf und veröffentlichte freie Wochen liegen im Speicher des Werkzeugs. Den Spiegel neu bauen lassen (python3 _werkzeuge/_web_bau.py), dann diese Seite neu laden.' },
    { id: 'termine-stelle', titel: 'Die Seite «Die Wohnungen» hat keinen Platz mehr für die freien Wochen', sehen: 'Hier steht «Stelle auf der Seite Die Wohnungen» rot, oder die Vorschau zeigt keinen Abschnitt «Freie Wochen».',
      grund: 'Die Seite «Die Wohnungen» wurde umgebaut; der Abschnitt «Im Preis inbegriffen», vor dem die freien Wochen stehen, sieht anders aus.', tun: 'Die Seite bleibt, wie sie gebaut ist. Die Stelle in termine.py nachführen lassen, dann diese Seite neu laden.' },
    { id: 'termine-speicher', titel: 'Der Speicher der freien Wochen ist beschädigt', sehen: 'Meldung «SPEICHER · Die Datei der freien Wochen und ihre Sicherung sind beide unlesbar».',
      grund: 'Die Datei _werkzeuge/bureau/_daten/termine.json und ihre Sicherung termine.json.gut sind beide kaputt (zum Beispiel von Hand geändert).',
      tun: 'Die Website bleibt, wie sie ist. Die Datei aus einer Sicherung des Rechners zurückholen oder beide Dateien entfernen: dann gilt wieder die Beispielliste.' },
    { id: 'termin-wohnung', titel: 'Diese Wohnung gibt es nicht', sehen: 'Meldung «WOHNUNG · Bitte eine der Wohnungen des Hauses wählen».',
      grund: 'Bei einer Woche ist keine oder eine unbekannte Wohnung gewählt.', tun: 'Almagellerhorn, Portjengrat oder Weissmies wählen, dann speichern.' },
    { id: 'termin-datum', titel: 'Diesen Tag gibt es nicht', sehen: 'Meldung «DATUM · Der erste (letzte) Tag fehlt oder diesen Tag gibt es nicht», die Karte zeigt «Den ersten Tag gibt es nicht».',
      grund: 'Tag und Monat passen nicht zusammen, zum Beispiel der 31. November.', tun: 'Tag, Monat und Jahr neu wählen, dann speichern.' },
    { id: 'termin-folge', titel: 'Der letzte Tag liegt vor dem ersten', sehen: 'Meldung «FOLGE · Der letzte Tag liegt nach dem ersten».',
      grund: 'Beim Verschieben wurde nur der erste Tag geändert, der letzte steht noch davor.', tun: 'Den letzten Tag nach dem ersten wählen, dann speichern.' },
    { id: 'termin-lang', titel: 'Die freie Zeit ist zu lang', sehen: 'Meldung «LÄNGE · Eine freie Zeit am Stück dauert hier höchstens 28 Tage».',
      grund: 'Zwischen erstem und letztem Tag liegen mehr als vier Wochen; vermutlich ist ein Monat verwählt.', tun: 'Den letzten Tag prüfen oder die Zeit in Wochen teilen, dann speichern.' },
    { id: 'termin-doppelt', titel: 'Zwei freie Wochen derselben Wohnung überschneiden sich', sehen: 'Meldung «DOPPELT · Zwei freie Wochen der Wohnung … überschneiden sich».',
      grund: 'Eine Woche wurde zweimal angelegt oder in die Tage einer anderen derselben Wohnung verschoben.', tun: 'Bei einer der beiden die Tage ändern, oder sie mit «Wieder entfernen» herausnehmen.' },
    { id: 'termin-viele', titel: 'Zu viele freie Wochen', sehen: 'Meldung «FREIE WOCHEN · Höchstens 24 freie Wochen stehen gleichzeitig auf der Seite».',
      grund: 'Die Liste auf der Seite bleibt so lesbar.', tun: 'Vergangene Wochen «Aus der Liste nehmen», dann speichern.' },
    { id: 'termin-falsch', titel: 'Eine freie Woche ist unvollständig', sehen: 'Meldung «FREIE WOCHE · …» mit Kennung oder Liste.',
      grund: 'Die Anfrage kam nicht aus dem Werkzeug oder wurde unterwegs verändert.', tun: 'Die Seite neu laden und die Eingabe wiederholen. Bleibt es, den Wortlaut der Meldung Ihrem Ansprechpartner schicken.' },
    { id: 'fassung-unbekannt', titel: 'Diese frühere Fassung gibt es nicht mehr', sehen: 'Meldung «FASSUNG · Diese frühere Fassung gibt es nicht».',
      grund: 'Die Liste der früheren Fassungen hält die letzten 60; ältere fallen heraus.', tun: 'Die Seite neu laden und eine Fassung aus der Liste wählen, oder die Beispielliste.' },
    { id: 'netz', titel: 'Der Server antwortet nicht', sehen: 'Meldung «NETZ · Der Server des Werkzeugs antwortet nicht».',
      grund: 'Die Verbindung ist weg oder der Server des Werkzeugs läuft nicht.', tun: 'Ihre Eingaben bleiben stehen. Verbindung prüfen, dann noch einmal «Speichern». Läuft der Server nicht: python3 _werkzeuge/bureau/serve.py 9522 im Hausordner.' }
  ];
  function el(tag, attrs, kinder) { var e = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); (kinder || []).forEach(function (k) { e.append(k); }); return e; }
  var lex = document.querySelector('[aria-labelledby="wsp-t4"]');
  if (!lex) return;
  var teil = el('section', { class: 'wsp-teil', 'aria-labelledby': 'wsp-t-termine', 'data-cu-pruefung': 'termine' }, [
    el('div', {}, [el('p', { class: 'kap' }, [el('span', {}, ['Viertens'])]), el('h2', { class: 't-zwischen', id: 'wsp-t-termine' }, ['Freie Wochen'])]),
    el('div', { class: 'platte wsp-punkte', id: 'cu-termine-punkte' }, [el('p', { class: 'wsp-wartet' }, ['Wird geprüft …'])])]);
  lex.parentNode.insertBefore(teil, lex);
  var ort = el('div', { class: 'wsp-lexikon', id: 'cu-lexikon' });
  lex.append(el('p', { class: 'kap', style: 'margin-top:28px' }, [el('span', {}, ['Freie Wochen'])]), ort);
  LEX.forEach(function (l) {
    ort.append(el('details', { class: 'platte wsp-lex', id: 'lex-' + l.id }, [el('summary', {}, [l.titel]),
      el('dl', {}, [el('dt', { class: 'angabe' }, ['Sehen']), el('dd', {}, [l.sehen]), el('dt', { class: 'angabe' }, ['Grund']), el('dd', {}, [l.grund]), el('dt', { class: 'angabe' }, ['Tun']), el('dd', {}, [l.tun])])]));
  });
  function oeffne() {
    var e = location.hash.indexOf('#lex-') === 0 && document.getElementById(location.hash.slice(1));
    if (e && ort.contains(e)) { e.open = true; setTimeout(function () { e.scrollIntoView({ block: 'start' }); }, 0); }
  }
  window.addEventListener('hashchange', oeffne); oeffne();
  ['/_werkzeuge/bureau/api/termine/pruefung'].forEach(function (adr, nr) { fetch(adr, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    var p = document.getElementById('cu-termine-punkte'), w = p.querySelector('.wsp-wartet'); if (w) w.remove();
    (d.punkte || []).forEach(function (x) {
      p.append(el('div', { class: 'wsp-punkt', 'data-gut': x.gut ? 'ja' : 'nein', 'data-punkt': nr ? 'gaeste' : 'termine', style: 'order:' + nr }, [
        el('span', { class: 'wsp-punkt__z' }, [x.gut ? '✓' : '–']), el('span', { class: 'wsp-punkt__t' }, [x.titel]),
        el('span', { class: 'wsp-punkt__x' }, [x.text + ' ', !x.gut && x.stichwort ? el('a', { href: '#lex-' + x.stichwort }, ['Was tun?']) : ''])]));
    });
  }).catch(function () { var p = document.getElementById('cu-termine-punkte'); p.textContent = 'Der Server des Werkzeugs antwortet nicht (Stichwort netz).'; }); });
})();
