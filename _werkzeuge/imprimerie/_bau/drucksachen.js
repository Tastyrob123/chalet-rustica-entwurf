/* Drucksachen & Feed · Chalet Rustica Saas-Almagell: die fertigen Drucksachen des Hauses als PDF (3 mm Beschnitt, Schriften eingebettet) und Vorschaubild,
   gesetzt mit dem Werkzeug selbst (DS.dokument, DS.pdf, DS.png) aus dem Katalog des Hauses (katalog.js). Dazu Druckprüfung und Stilprüfung je Stück.
   Aufruf (Server :9527 läuft):  NODE_PATH=$(npm root -g) node _bau/drucksachen.js   → haeuser/rustica/drucksachen/ + LISTE.md */
const { chromium } = require('playwright');   // NODE_PATH=/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules
const fs = require('fs'), path = require('path');
const ZIEL = path.join(__dirname, '..', 'haeuser', 'rustica', 'drucksachen');
const STUECKE = [
  ['willkommen-almagellerhorn', 'willkommen', 'Willkommen · Almagellerhorn', 'Willkommenskarte A5 in der Wohnung Almagellerhorn'],
  ['willkommen-portjengrat', 'willkommen', 'Willkommen · Portjengrat', 'Willkommenskarte A5 in der Wohnung Portjengrat'],
  ['willkommen-weissmies', 'willkommen', 'Willkommen · Weissmies', 'Willkommenskarte A5 in der Wohnung Weissmies'],
  ['gruss-der-gastgeber', 'willkommen', 'Gruss der Gastgeber', 'Aufsteller A6: Heidi und Damian'],
  ['im-preis-inbegriffen', 'willkommen', 'Im Preis inbegriffen', 'Karte A5: Bettwäsche, Tücher, Heizung, Warmwasser und Strom, Endreinigung, Kurtaxe'],
  ['wohnung-almagellerhorn', 'wohnung', 'Ihre Wohnung · Almagellerhorn', 'Blatt A5 für die Mappe: Raum für Raum, Wortlaut der Website'],
  ['wohnung-portjengrat', 'wohnung', 'Ihre Wohnung · Portjengrat', 'Blatt A5 für die Mappe: Raum für Raum, Wortlaut der Website'],
  ['wohnung-weissmies', 'wohnung', 'Ihre Wohnung · Weissmies', 'Blatt A5 für die Mappe: Raum für Raum, Wortlaut der Website'],
  ['wohnungen-im-vergleich', 'wohnung', 'Welche Wohnung passt zu Ihnen?', 'Karte A4: die drei Wohnungen mit Lage und Zahlen'],
  ['hausregeln', 'haus', 'Hausregeln', 'Aushang A4: Nichtraucherhaus, ohne Haustiere, Waschküche'],
  ['nichtraucherhaus', 'haus', 'Nichtraucherhaus', 'Aushang A5 beim Hauseingang'],
  ['ohne-haustiere', 'haus', 'Ohne Haustiere', 'Aushang A5 beim Hauseingang'],
  ['waschkueche', 'haus', 'Die Waschküche', 'Aushang A4 an der Tür der Waschküche'],
  ['haus-am-bach', 'haus', 'Drei Wohnungen, ein Haus am Bach', 'Aushang A4 mit Foto beim Hauseingang'],
  ['tief-verschneit', 'haus', 'Tief verschneit, warm drinnen', 'Aushang A5 mit Foto: Heizung, Warmwasser und Strom inbegriffen'],
  ['rund-ums-haus', 'umgebung', 'Rund ums Haus', 'Karte A4: im Dorf, zum Sport, für Kinder, alles zu Fuss'],
  ['saastal-vier-doerfer', 'umgebung', 'Das Saastal, vier Dörfer', 'Karte A4: Saas-Fee, Saas-Grund, Saas-Almagell, Saas-Balen'],
  ['wege-in-die-seitentaeler', 'umgebung', 'Wege in die Seitentäler', 'Blatt A5 mit Foto: Saas-Almagell im Sommer'],
  ['anreise', 'anreise', 'Anreise', 'Karte A5 zum Verschicken: Zug, Auto, Flugzeug'],
  ['unterwegs-ins-tal', 'anreise', 'Unterwegs ins Tal', 'Übersicht A5: Zeiten mit Zug und Flugzeug'],
  ['vor-ihrer-anreise', 'anreise', 'Vor Ihrer Anreise', 'Blatt A5 zum Verschicken: mit dem Zug bis Visp'],
  ['massage-bei-heidi', 'heidi', 'Massage bei Heidi', 'Flyer A5 mit Foto: Heidis Praxis'],
  ['massage-aushang', 'heidi', 'Massage · Aushang', 'Aushang A4 beim Hauseingang'],
  ['heidis-jahre', 'heidi', 'Heidis Jahre', 'Übersicht A4: von den ersten Weltcupeinsätzen bis zur medizinischen Masseurin'],
  ['visitenkarte', 'karten', 'Visitenkarte', 'Visitenkarte 90 × 55 mm, vorne und hinten'],
  ['briefpapier', 'karten', 'Briefpapier', 'Briefbogen A4: Zeichen und Name oben, Gastgeber und Kontakt unten'],
  ['grusskarte', 'gruesse', 'Grusskarte', 'Grusskarte quadratisch 148 mm'],
  ['ansichtskarte-chalet-im-winter', 'gruesse', 'Ansichtskarte · Chalet im Winter', 'Ansichtskarte A6 quer, vorne Foto, hinten Platz für den Gruss'],
  ['ansichtskarte-saas-almagell', 'gruesse', 'Ansichtskarte · Saas-Almagell', 'Ansichtskarte A6 quer, vorne Foto, hinten Platz für den Gruss'],
  ['flyer-chalet-rustica', 'flyer', 'Chalet Rustica · Flyer', 'Flyer A5, vorne Foto, hinten die Angaben'],
  ['flyer-weissmies', 'flyer', 'Flyer · Weissmies', 'Blatt A5 mit Foto der Wohnung Weissmies'],
  ['instagram-mitten-im-dorf', 'instagram', 'Beitrag · Mitten im Dorf', 'Instagram-Beitrag 4:5'],
  ['instagram-tief-verschneit', 'instagram', 'Beitrag · Tief verschneit', 'Instagram-Beitrag 4:5'],
  ['instagram-mattmark', 'instagram', 'Beitrag · Mattmark', 'Instagram-Beitrag 4:5'],
  ['instagram-heidi', 'instagram', 'Beitrag · Heidi', 'Instagram-Beitrag 4:5'],
  ['story-langlauf', 'newsletter', 'Story: Langlauf', 'Instagram-Story 9:16'],
  ['hinweis-bitte-nicht-rauchen', 'hinweise', 'Nichtraucherhaus', 'Hinweiskarte A6 in der Wohnung'],
];
(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('ds-rustica-willkommen', '1'); } catch (e) {} });
  await p.goto('/_werkzeuge/imprimerie/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.DS && DS.M && window.DSStudio && DS.pdf, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const zeilen = [];
  for (const [k, abt, n, was] of STUECKE) {
    const r = await p.evaluate(async ({ abt, n }) => {
      const K = window.DSKATALOG, x = (abt === 'hinweise' ? K.HINWEISE : abt === 'newsletter' ? K.NEWSLETTER : K.ABTEILUNGEN.find(a => a.k === abt).vorlagen).find(v => v.n === n);
      if (!x) return { fehlt: true };
      const seiten = [{ vorlage: x.vorlage, ton: x.ton, inhalt: x.inhalt, stil: x.stil }];
      if (x.rueck) seiten.push({ vorlage: x.rueck.vorlage, ton: x.ton, inhalt: x.rueck.inhalt });
      const doc = DS.dokument(DS.M, { name: 'Chalet Rustica · ' + n, format: x.format, seiten });
      const pr = (DS.pruefe(DS.M, doc) || []).filter(h => h.stufe === 'rot').map(h => h.text);
      const { bytes } = await DS.pdf(DS.M, doc, { marken: false });
      const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); };
      const bilder = [];
      for (let i = 0; i < seiten.length; i++) { const bl = await DS.png(DS.M, doc, i, 1200), bm = await createImageBitmap(bl), cv = document.createElement('canvas'); cv.width = bm.width; cv.height = bm.height; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(bm, 0, 0); const jp = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .86)); bilder.push(b64(new Uint8Array(await jp.arrayBuffer()))); }
      return { pdf: b64(bytes), bilder, rot: pr, format: DS.FORMATE[x.format].name, seiten: seiten.length };
    }, { abt, n });
    if (r.fehlt) { console.log('FEHLT', n); continue; }
    fs.writeFileSync(path.join(ZIEL, k + '.pdf'), Buffer.from(r.pdf, 'base64'));
    r.bilder.forEach((bi, i) => fs.writeFileSync(path.join(ZIEL, k + (i ? '-' + (i + 1) : '') + '.jpg'), Buffer.from(bi, 'base64')));
    zeilen.push({ k, n, was, format: r.format, seiten: r.seiten, rot: r.rot });
    console.log(k, r.format, r.seiten, 'Seite(n)', r.rot.length ? 'ROT: ' + r.rot.join(' | ') : 'ohne roten Befund');
  }
  zeilen.forEach(x => { x.pdf = x.k + '.pdf'; x.vorschau = Array.from({ length: x.seiten }, (_, i) => x.k + (i ? '-' + (i + 1) : '') + '.jpg'); });
  fs.writeFileSync(path.join(ZIEL, 'liste.json'), JSON.stringify(zeilen, null, 1));
  const md = ['# Drucksachen · Chalet Rustica Saas-Almagell', '', 'Gesetzt mit «Drucksachen & Feed» (`_werkzeuge/imprimerie/`, Aufruf `node _bau/drucksachen.js`), Inhalte nur aus der Website des Chalets und den Hauswerten (`_werkzeuge/_web/inhalt/daten.py`, gelesen von `bau_vorlagen.py`). Keine Preise, keine erfundenen Zeiten, kein WLAN-Code: das Haus veröffentlicht sie nicht.',
    'PDF mit 3 mm Beschnitt und eingebetteten Schriften (Fraunces, Instrument Sans, DM Mono; Grenze Gotisch nur im Namen auf dem Briefpapier), Vorschaubild 1200 px breit (JPG). Druckprüfung je Stück: ' + (zeilen.every(x => !x.rot.length) ? 'ohne roten Befund.' : 'siehe liste.json.'), '',
    '| Datei | Drucksache | Was | Format | Seiten | Vorschau |', '|---|---|---|---|---|---|',
    ...zeilen.map(x => `| \`${x.pdf}\` | ${x.n} | ${x.was} | ${x.format} | ${x.seiten} | ${x.vorschau.map(v => '`' + v + '`').join(', ')} |`), '',
    'Hinweis: Die Strasse nennt die Website nicht: Adresse «CH-3905 Saas-Almagell». Die Namen der Wohnungen (Almagellerhorn, Portjengrat, Weissmies) sind von der Familie noch zu bestätigen. Instagram oder andere Kanäle veröffentlicht das Haus nicht: die Beiträge tragen neutral «Chalet Rustica · Saas-Almagell».'];
  fs.writeFileSync(path.join(ZIEL, 'LISTE.md'), md.join('\n') + '\n');
  if (fehler.length) console.log('Seitenfehler:', fehler.join('\n'));
  await b.close();
})();
