/* Kopf, Fuss und Trenner der Mails als PNG (kein Mailprogramm zeigt SVG zuverlässig): das gotische R in Stroh (kleid/rustica-marke.svg),
   im Kopf daneben der Name «Chalet Rustica» in Grenze Gotisch (Schriftdatei der Website, nur der Name, als Bild), Trenner als Strohlinie.
   NODE_PATH=/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules node _bau/mail_marken.js */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const Z = path.join(__dirname, '..', 'haeuser', 'rustica', 'mail');
const roh = fs.readFileSync(path.join(__dirname, '..', '..', 'oberflaeche', 'kleid', 'rustica-marke.svg'), 'utf8');
const vb = (roh.match(/<symbol id="wm" viewBox="([^"]*)"/) || [, '0 0 66 74.2'])[1];
const svg = roh.replace(/<symbol id="wm" viewBox="[^"]*">/, '').replace('</symbol>', '').replace(/fill="currentColor"/g, 'fill="#D9BF8F"').replace('<svg ', `<svg viewBox="${vb}" `);
const schrift = 'data:font/woff2;base64,' + fs.readFileSync(path.join(__dirname, '..', '..', '_web', 'assets', 'fonts', 'GrenzeGotisch-latin-var.woff2')).toString('base64');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
  const shot = async (html, w, h, f) => { await p.setViewportSize({ width: w, height: h }); await p.setContent(`<style>@font-face{font-family:G;src:url(${schrift}) format('woff2');font-weight:100 900}html,body{margin:0;background:transparent}svg{display:block}</style>${html}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({ path: path.join(Z, f), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }); };
  const logo = h => svg.replace('<svg ', `<svg style="height:${h}px;width:auto" `);
  await shot(`<div style="width:278px;height:64px;display:flex;align-items:center;justify-content:center;gap:14px">${logo(46)}<span style="width:1px;height:38px;background:rgba(217,191,143,.5)"></span><span style="font:400 31px/1 G;color:#F4EEE3;white-space:nowrap">Chalet Rustica</span></div>`, 278, 64, '_kopf.png');
  await shot(`<div style="width:48px;height:59px;display:grid;place-items:center">${logo(46)}</div>`, 48, 59, '_fuss.png');
  await shot(`<div style="width:190px;height:30px;position:relative"><i style="position:absolute;left:20px;right:20px;top:14.5px;height:1px;background:#D9BF8F"></i></div>`, 190, 30, '_trenner.png');
  await b.close();
  console.log('Kopf, Fuss, Trenner fertig');
})();
