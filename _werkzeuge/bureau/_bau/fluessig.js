/* Flüssig (Auftrag, Prüfen 3): Startansicht bei 6-fach gedrosselter CPU scrollen, Bilder je Sekunde und längster Hänger messen.
     node _werkzeuge/bureau/_bau/fluessig.js /_werkzeuge/bureau/ [anzahl=6] */
const { chromium } = require('/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const ADR = process.argv[2] || '/_werkzeuge/bureau/', N = +(process.argv[3] || 6);
(async () => {
  const b = await chromium.launch();
  for (let i = 0; i < N; i++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('rundgang-rustica-bureau', '1'); } catch (e) {} });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await p.goto(ADR, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    const r = await p.evaluate(async () => {
      const zeiten = []; let letzte = performance.now(), los = true;
      const tick = t => { zeiten.push(t - letzte); letzte = t; if (los) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      const ende = document.documentElement.scrollHeight - innerHeight, start = performance.now(), dauer = 4000;
      await new Promise(fertig => { const s = () => { const f = Math.min(1, (performance.now() - start) / dauer); scrollTo(0, ende * f); if (f < 1) requestAnimationFrame(s); else fertig(); }; requestAnimationFrame(s); });
      los = false; const ges = performance.now() - start;
      return { fps: Math.round(zeiten.length / (ges / 1000)), max: Math.round(Math.max(...zeiten.slice(1))), ueber100: zeiten.filter(z => z > 100).length };
    });
    console.log(`Lauf ${i + 1}: ${r.fps} Bilder/s, längstes Bild ${r.max} ms, Bilder über 100 ms: ${r.ueber100}`);
    await ctx.close();
  }
  await b.close();
})();
