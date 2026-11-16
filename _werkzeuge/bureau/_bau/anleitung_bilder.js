/* Bildschirme der Anleitung des Schaufensters (Chalet Rustica, 09.11.2026; Vorlage: dieselbe Datei des Suitenhotels Zurbriggen), unsichtbar aufgenommen
   mit Chromium auf einem Wegwerf-Server mit frischem Speicher:
     WERKZEUGE_DATEN=<leerer wegwerf-ordner> BUREAU_PRUEFLAUF=1 python3 _werkzeuge/bureau/serve.py 19522
     node _werkzeuge/bureau/_bau/anleitung_bilder.js 19522
   Schreibt anleitung/<name>.webp (1440 × 900). Danach: python3 _werkzeuge/bureau/beschreibung.py --neu (Probe-Kopie wie gebaut). */
const path = require('path');
const os = require('os');
const { chromium } = require('/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const PORT = process.argv[2] || '19522';
const AUS = path.join(__dirname, '..', 'anleitung');
const BASIS = `http://127.0.0.1:${PORT}/_werkzeuge/bureau/`;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', e => fehler.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('rundgang-rustica-bureau', '1'); } catch (e) {} });
  const bild = async (name) => {
    await p.waitForTimeout(900);
    const png = path.join(os.tmpdir(), `rustica-anl-${name}.png`);
    await p.screenshot({ path: png });
    require('child_process').execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(png)}).save(${JSON.stringify(path.join(AUS, name + '.webp'))}, 'WEBP', quality=82)`]);
    console.log('Bild', name);
  };
  const geh = async (ansicht) => { await p.goto(BASIS + (ansicht ? '?ansicht=' + ansicht : ''), { waitUntil: 'load' }); await p.waitForTimeout(2800); };
  const bach = async () => {   // die Stelle «Drei Wohnungen, ein Haus am Bach.» auf der Seite «Das Haus»: in der Seite anklicken
    const z = p.frameLocator('iframe[data-ws-frame]').first().locator('[data-ws-e]').filter({ hasText: /Bach/ }).first();
    for (let i = 0; i < 4; i++) {   // die Vorschau lädt nach dem Rollen manchmal neu: so lange anklicken, bis das Feld offen ist
      await p.waitForTimeout(1200); await z.scrollIntoViewIfNeeded(); await z.click(); await p.waitForTimeout(1500);
      if (await p.locator('#ws-mitte .ws-text[contenteditable=true]:visible').count()) return;
    }
    throw new Error('Das Feld öffnet sich nicht');
  };

  await geh(''); await bild('uebersicht');
  await geh('haus:zimmer'); await p.evaluate(() => window.scrollTo(0, 300)); await bild('zimmer');
  await geh('e:termine'); await p.evaluate(() => window.scrollTo(0, 330)); await bild('termine');
  await geh('b:haus'); await bach(); await bild('bereich');

  // Foto tauschen: das erste Foto der Stellenliste
  await geh('b:wohnungen');
  const foto = p.locator('#ws-mitte .ws-foto').first();
  if (await foto.count()) { await foto.click(); await p.waitForTimeout(1800); await bild('foto'); await p.keyboard.press('Escape'); }
  else console.log('kein Foto-Knopf gefunden');

  await geh('angaben'); await bild('angaben');
  await geh('google'); await bild('google');

  // Entwurf: eine Änderung im Wegwerf-Speicher, dann «Entwurf & Vergleich»
  await geh('b:haus'); await bach();
  const feld = p.locator('#ws-mitte .ws-text[contenteditable=true]:visible').first();
  await feld.click(); await p.keyboard.press('End');
  await p.keyboard.type(' Mit Südbalkon für jede Wohnung.');
  await p.keyboard.press('Control+s'); await p.waitForTimeout(1500);
  await geh('entwurf'); await bild('entwurf');
  await geh('verlauf'); await bild('verlauf');

  console.log(fehler.length ? 'Fehler:\n' + fehler.join('\n') : 'keine Skriptfehler');
  await b.close();
})();
