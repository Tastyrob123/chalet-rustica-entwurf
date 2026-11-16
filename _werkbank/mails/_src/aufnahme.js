// Mails des Chalet Rustica Saas-Almagell (09.11.2026, Bauart aus der Werkbank Wellness & Spa): das gotische R und der Namenszug als PNG für die Mails
// und der obere Teil jeder Mail als Bild für die Werkbank, doppelte Dichte.
// node mails/_src/aufnahme.js   (Server 9528 läuft; vorher python3 mails/_src/bau.py)  → mails/img/zeichen.png, mails/img/logo.png, _werkbank/ansichten/Mails/NN.jpg
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const ROOT = path.join(__dirname, '..', '..'), B = 'http://127.0.0.1:' + (process.env.WB_PORT || 9528) + '/';
const HAUS = path.join(ROOT, '..', '..');
const liste = JSON.parse(fs.readFileSync(path.join(__dirname, 'werkbank.json'), 'utf8'));
(async () => {
  const b = await chromium.launch({ headless: true });
  try {
    const z = await b.newPage({ viewport: { width: 400, height: 540 }, deviceScaleFactor: 1 });
    // Das gotische R in Stroh (Kleid des Hauses: _werkzeuge/oberflaeche/kleid/rustica-zeichen.svg), als PNG für die Mails (Mailprogramme zeigen kein SVG)
    const x = fs.readFileSync(path.join(HAUS, '_werkzeuge/oberflaeche/kleid/rustica-zeichen.svg'), 'utf8').replace(/fill="#[0-9A-Fa-f]{6}"/, 'fill="#D9BF8F"');
    await z.setContent('<body style="margin:0;background:transparent"><div id="z" style="width:200px">' + x.replace('<svg ', '<svg style="display:block;width:200px;height:auto" ') + '</div></body>');
    fs.mkdirSync(path.join(ROOT, 'mails/img'), { recursive: true });
    await (await z.$('#z')).screenshot({ path: path.join(ROOT, 'mails/img/zeichen.png'), omitBackground: true });
    // Namenszug: «Rustica» in Grenze Gotisch wie in der Leiste der Website, darunter Chalet · Saas-Almagell in DM Mono, auf Holz zu lesen
    const gg = fs.readFileSync(path.join(HAUS, '_werkzeuge/_web/assets/fonts/GrenzeGotisch-latin-var.woff2')).toString('base64');
    const dm = fs.readFileSync(path.join(HAUS, '_werkzeuge/_web/assets/fonts/DMMono-normal-400.woff2')).toString('base64');
    await z.setViewportSize({ width: 900, height: 600 });
    await z.setContent(`<style>@font-face{font-family:G;src:url(data:font/woff2;base64,${gg}) format('woff2');font-weight:100 900}
      @font-face{font-family:M;src:url(data:font/woff2;base64,${dm}) format('woff2')}</style>
      <body style="margin:0;background:transparent"><div id="w" style="width:600px;padding:10px 0 14px;text-align:center">
      <div style="font:500 150px/1 G;color:#F4EEE3;letter-spacing:.01em">Rustica</div>
      <div style="margin-top:22px;font:400 26px/1 M;letter-spacing:.32em;text-transform:uppercase;color:#D9BF8F">Chalet · Saas-Almagell</div></div></body>`);
    await z.evaluate(() => document.fonts.ready); await z.waitForTimeout(300);
    await (await z.$('#w')).screenshot({ path: path.join(ROOT, 'mails/img/logo.png'), omitBackground: true });
    await z.close();
    const ziel = path.join(ROOT, '_werkbank/ansichten/Mails'); fs.mkdirSync(ziel, { recursive: true });
    const nrn = new Set(liste.map(l => l[0] + '.jpg'));
    for (const f of fs.readdirSync(ziel)) if (/^\d+\.jpg$/.test(f) && !nrn.has(f)) fs.unlinkSync(path.join(ziel, f));   // Aufnahmen früherer Fassungen weg
    for (const [nr, ordner] of liste) {
      const p = await b.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 });
      await p.goto(B + 'mails/' + ordner + '/index.html', { waitUntil: 'load' }); await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(ziel, nr + '.jpg'), quality: 88, clip: { x: 0, y: 0, width: 640, height: 940 }, fullPage: true });
      console.log('Mail', nr, ordner); await p.close();
    }
  } finally { await b.close(); }
})();
