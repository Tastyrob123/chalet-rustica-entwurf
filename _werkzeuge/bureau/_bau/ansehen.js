/* Zustandsbilder des Schaufensters (Chalet Rustica, 09.11.2026), unsichtbar mit Chromium auf einem Wegwerf-Server aufgenommen:
     WERKZEUGE_DATEN=<wegwerf> BUREAU_PRUEFLAUF=1 python3 _werkzeuge/bureau/serve.py 19522
     node _werkzeuge/bureau/_bau/ansehen.js 19522 <ausgabeordner> [1440,390]
   Nimmt jede Ansicht bei den genannten Breiten auf (ganze Seite) und meldet Skriptfehler, fehlende Dateien und Überlauf. Schreibt nichts in den Speicher. */
const path = require('path');
const { chromium } = require('/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const PORT = process.argv[2] || '19522';
const AUS = process.argv[3] || '/tmp';
const BREITEN = (process.argv[4] || '1440,390').split(',').map(Number);
const BASIS = `http://127.0.0.1:${PORT}/_werkzeuge/bureau/`;
const MAX = +(process.env.MAX || 3);
const NUR = process.env.NUR ? process.env.NUR.split(',') : null;
const ANSICHTEN = ['', 'e:termine', 'haus:zimmer', 'b:start', 'b:wohnungen', 'zahlen', 'angaben', 'google', 'hinweis', 'entwurf', 'verlauf'];

(async () => {
  const b = await chromium.launch();
  for (const w of BREITEN) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('rundgang-rustica-bureau', '1'); } catch (e) {} });
    const p = await ctx.newPage();
    const fehler = [];
    p.on('pageerror', e => fehler.push('Skript: ' + e.message.split('\n')[0]));
    p.on('console', m => { if (m.type() === 'error') fehler.push('Konsole: ' + m.text().slice(0, 160)); });
    p.on('response', r => { if (r.status() >= 400) fehler.push(r.status() + ' ' + r.url()); });
    for (const a of (NUR || ANSICHTEN)) {
      await p.goto(BASIS + (a ? '?ansicht=' + a : ''), { waitUntil: 'load' });
      await p.waitForTimeout(2600);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(700);
      const ueber = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const name = (a || 'start').replace(/:/g, '-') + '-' + w;
      const hoch = await p.evaluate(() => document.documentElement.scrollHeight), n = Math.min(MAX, Math.ceil(hoch / 900));
      for (let i = 0; i < n; i++) {   /* Bildschirm für Bildschirm (ganze Seite verschiebt feste Leisten und den Rand) */
        await p.evaluate(y => window.scrollTo(0, y), i * 820); await p.waitForTimeout(900);
        await p.screenshot({ path: path.join(AUS, name + '-' + i + '.png') });
      }
      console.log(name, ueber > 0 ? 'ÜBERLAUF ' + ueber + ' px' : 'ok');
    }
    console.log(w, fehler.length ? 'Fehler:\n  ' + [...new Set(fehler)].join('\n  ') : 'keine Fehler');
    await ctx.close();
  }
  await b.close();
})();
