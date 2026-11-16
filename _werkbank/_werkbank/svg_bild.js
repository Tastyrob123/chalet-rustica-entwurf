// SVG als PNG (Cloud: kein QuickLook, kein rsvg). Chalet Rustica, 09.11.2026.
//   node _werkbank/svg_bild.js <datei.svg> <ziel.png> <kante px> [grund #hex|none] [anteil 0..1]
// Zeichnet das SVG mittig auf eine quadratische Fläche der Kante, das Zeichen nimmt «anteil» der Kante ein (Profilbild, Vorschau in den Dateien).
const path = require('path'), fs = require('fs');
let PW; try { PW = require('playwright'); } catch (e) { PW = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright')); }
(async () => {
  const [q, z, k = '640', grund = 'none', anteil = '.56'] = process.argv.slice(2);
  const svg = fs.readFileSync(q, 'utf8'), kante = +k;
  const b = await PW.chromium.launch(); const p = await b.newPage({ viewport: { width: kante, height: kante } });
  await p.setContent(`<body style="margin:0;background:${grund === 'none' ? 'transparent' : grund}"><div style="width:${kante}px;height:${kante}px;display:grid;place-items:center">
    <img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:${kante * +anteil}px;height:${kante * +anteil}px;object-fit:contain"></div></body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: z, omitBackground: grund === 'none' });
  await b.close();
})();
