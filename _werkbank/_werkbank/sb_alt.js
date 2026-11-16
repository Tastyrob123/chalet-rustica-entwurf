// Werkbank Chalet Rustica (09.11.2026): Aufnahmen der heutigen Seite chalet-rustica.ch aus dem Spiegel (nur gelesen, nichts online abgerufen).
// Spiegel: ~/Desktop/Website-Projekte/Familie Zurbriggen/_quelle/chalet-rustica/spiegel/, ausgeliefert vom Kette-Server 8978 (Pfad /haus/…).
//   node _werkbank/sb_alt.js  →  _werkbank/heute/alt-rechner.jpg (Frameset 1440 × 900), alt-handy.jpg (dasselbe am Handy 390 × 844, ohne Handy-Fassung),
//                                 alt-rustica.jpg (Seite «Rustica» mit «NEU RENOVIERT!!!»), alt-rustica-voll.png (die ganze Seite, für die Unterlagen), alt-skript.jpg (das eingeschleuste Skript im Quelltext der Startseite)
// Die Startseite des Spiegels leitet ins Frameset; das eingeschleuste Skript greift nur, wenn der Besucher von Instagram kommt (hier nie).
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const Q = path.join(process.env.HOME, 'Desktop/Website-Projekte/Familie Zurbriggen/_quelle/chalet-rustica/spiegel');
const B = 'http://localhost:8978/haus/Familie%20Zurbriggen/_quelle/chalet-rustica/spiegel/';
const Z = path.join(__dirname, 'heute'); fs.mkdirSync(Z, { recursive: true });
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
(async () => {
  const b = await chromium.launch({ headless: true });
  const r = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
  await r.goto(B + 'intro_und_frameset/framesetstart.htm', { waitUntil: 'load' }); await r.waitForTimeout(2500);
  await r.screenshot({ path: path.join(Z, 'alt-rechner.jpg'), quality: 88 });
  await r.goto(B + 'rustica/rustica.htm', { waitUntil: 'load' }); await r.waitForTimeout(1500);
  const y = await r.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/NEU RENOVIERT/.test(n.textContent)) { const g = n.parentElement.getBoundingClientRect(); return g.top + scrollY; } return 0; });
  await r.evaluate(v => scrollTo(0, Math.max(0, v - 260)), y); await r.waitForTimeout(600);
  await r.screenshot({ path: path.join(Z, 'alt-rustica.jpg'), quality: 88 });
  await r.setViewportSize({ width: 1000, height: 900 }); await r.evaluate(() => scrollTo(0, 0)); await r.waitForTimeout(400);
  await r.screenshot({ path: path.join(Z, 'alt-rustica-voll.png'), fullPage: true });   // ganze Seite «Rustica» 1000 px breit (×2), Quelle der heutigen Blätter (sb_karten.py)
  await r.setViewportSize({ width: 1440, height: 900 });
  // Quelltext der Startseite, so wie er auf dem Server liegt (die ersten Zeilen), als Blatt aufgenommen
  const quell = fs.readFileSync(path.join(Q, 'index.html'), 'latin1').split('\n').slice(0, 14).join('\n');
  await r.setViewportSize({ width: 1100, height: 620 });
  await r.setContent(`<html><body style="margin:0;background:#1e1813;font:500 21px/1.55 Menlo,monospace;color:#e9dfcf">
    <div style="padding:34px 44px"><div style="font:400 14px/1 Menlo,monospace;letter-spacing:.14em;color:#a9865a;margin-bottom:22px">CHALET-RUSTICA.CH · INDEX.HTML · ZEILE 1–14 (QUELLTEXT)</div>
    <pre style="margin:0;white-space:pre-wrap">${esc(quell).replace(/(&lt;script>[\s\S]*?&lt;\/script>)/, '<span style="background:rgba(217,191,143,.22);box-shadow:0 0 0 8px rgba(217,191,143,.22);border-radius:2px;color:#fff">$1</span>')}</pre></div></body></html>`);
  await r.waitForTimeout(300);
  await r.screenshot({ path: path.join(Z, 'alt-skript.jpg'), quality: 90 });
  const h = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })).newPage();
  await h.goto(B + 'intro_und_frameset/framesetstart.htm', { waitUntil: 'load' }); await h.waitForTimeout(2500);
  await h.screenshot({ path: path.join(Z, 'alt-handy.jpg'), quality: 88 });
  await b.close(); console.log('heute: alt-rechner, alt-handy, alt-rustica, alt-skript');
})();
