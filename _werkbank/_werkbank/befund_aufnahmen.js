const { chromium } = require('/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const [name, opt] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }]]) {
    const c = await b.newContext(opt); const p = await c.newPage();
    await p.goto('https://www.chalet-rustica.ch/intro_und_frameset/framesetstart.htm', { waitUntil: 'networkidle' });
    const frames = p.frames().map(f => [f.name(), f.url()]); console.log(name, JSON.stringify(frames));
    // Hauptrahmen auf die Seite Chalet Rustica stellen
    const left = p.frames().find(f => f.name() === 'leftFrame');
    await left.click('img[name="Image3"]'); await p.waitForTimeout(4000);
    const main = p.frames().find(f => f.name() === 'mainFrame'); console.log('main', main.url(), left.url());
    await p.screenshot({ path: `${OUT}/${name}-rustica-0.png` });
    if (main) { await main.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${name}-rustica-1.png` });
      await main.evaluate(() => window.scrollTo(0, 1100)); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${name}-rustica-2.png` }); 
      const h = await main.evaluate(() => document.documentElement.scrollHeight); console.log('hoehe', h);}
    await c.close();
  }
  // Quelltext der Startseite (eingeschleustes Skript) als Ansicht
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
  await p.goto('view-source:https://www.chalet-rustica.ch/').catch(e => console.log('vs', e.message));
  await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/d-quelltext.png` });
  await b.close();
})();
