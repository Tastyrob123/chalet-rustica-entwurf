// Wortlaut der Website des Chalet Rustica, wie ein Gast ihn sieht (09.11.2026): innerText jeder Seite, headless, nur lesen.
// Quelle für _bau/rustica_wissen.py. Aufruf aus dem Hausordner: node _werkzeuge/reception/_bau/website_text.js [basis, Standard http://127.0.0.1:9524]
// (der Server des Gästebuchs liefert die Website unter / aus, nur lesend)
const path = require('path'), fs = require('fs');
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/Users/robertreff/Aussen-Pruefung/node_modules/playwright'); } })();
const BASIS = process.argv[2] || '';
const SEITEN = ['index', 'haus', 'wohnungen', 'wohnung-almagellerhorn', 'wohnung-portjengrat', 'wohnung-weissmies', 'saas-almagell', 'heidi', 'kontakt'];   // die neun Seiten des Chalets (daten.py › SEITEN)
const ZIEL = path.join(__dirname, 'website-text');
(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  for (const f of fs.readdirSync(ZIEL)) if (f.endsWith('.txt') && !SEITEN.includes(f.slice(0, -4))) fs.unlinkSync(path.join(ZIEL, f));
  const br = await chromium.launch({ headless: true });
  const c = await br.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await c.route(/^(mailto|tel|sms):/, r => r.abort());
  await c.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());   // nichts aus dem Netz (Karten, Filme)
  const p = await c.newPage();
  for (const s of SEITEN) {
    await p.goto(`${BASIS}/${s}.html`, { waitUntil: 'load' });
    await p.waitForTimeout(500);
    const t = await p.evaluate(() => {
      document.querySelectorAll('body *').forEach(e => e.style.setProperty('text-transform', 'none', 'important'));
      document.querySelectorAll('script,noscript,style,svg,[hidden],[aria-hidden="true"],select,input,textarea,.studie,[data-studie]').forEach(e => e.remove());
      document.querySelectorAll('main h1, main h2, section h1, section h2, header h1').forEach(h => { const t = (h.getAttribute('aria-label') || h.innerText).replace(/\s+/g, ' ').trim(); if (t) h.textContent = '## ' + t; });
      return document.body.innerText;
    });
    const zeilen = []; const da = new Set();
    for (let z of t.split('\n')) { z = z.replace(/\s+/g, ' ').trim(); if (!z || da.has(z)) continue; da.add(z); zeilen.push(z); }
    fs.writeFileSync(path.join(ZIEL, s + '.txt'), `Quelle: ${s}.html (Website Chalet Rustica Saas-Almagell)\nAbgerufen: ${new Date().toISOString().slice(0, 10)}\n\n` + zeilen.join('\n') + '\n');
    console.log(s, zeilen.length, 'Zeilen');
  }
  await br.close();
})();
