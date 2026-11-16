/* Bedienen wie die Familie (Chalet Rustica, 09.11.2026), unsichtbar mit Chromium NUR auf einem Wegwerf-Server:
     WERKZEUGE_DATEN=<wegwerf> BUREAU_PRUEFLAUF=1 python3 _werkzeuge/bureau/serve.py 19522
     node _werkzeuge/bureau/_bau/bedienen.js 19522 <ausgabeordner>
   Ablauf: Bereich «Das Haus» → Text IN DER SEITE anklicken → ändern → Strg+S → Quittung → Vorher/nachher → Rückgängig → noch einmal ändern und speichern →
   freie Woche dazu → Veröffentlichen-Fenster → veröffentlichen → Frühere Fassungen. Danach Probe-Kopie mit beschreibung.py --neu zurücksetzen. */
const path = require('path');
const { chromium } = require('/Users/robertreff/Desktop/Website-Projekte/_Befund-Vorschlaege/node_modules/playwright');
const PORT = process.argv[2] || '19522';
const AUS = process.argv[3] || '/tmp';
const BASIS = `http://127.0.0.1:${PORT}/_werkzeuge/bureau/`;
const ZUSATZ = ' Heidi und Damian freuen sich auf Sie.';

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('rundgang-rustica-bureau', '1'); } catch (e) {} });
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', e => fehler.push('Skript: ' + e.message.split('\n')[0]));
  p.on('console', m => { if (m.type() === 'error') fehler.push('Konsole: ' + m.text().slice(0, 160)); });
  let n = 0;
  const bild = async (name) => { await p.waitForTimeout(900); await p.screenshot({ path: path.join(AUS, `${String(++n).padStart(2, '0')}-${name}.png`) }); console.log('Bild', name); };
  const geh = async (a) => { await p.goto(BASIS + (a ? '?ansicht=' + a : ''), { waitUntil: 'load' }); await p.waitForTimeout(2800); };
  const ok = (bed, was) => { console.log((bed ? 'OK   ' : 'FEHLT') + ' ' + was); if (!bed) fehler.push('Ablauf: ' + was); };

  // 1. Text in der Seite anklicken
  await geh('b:haus');
  const fr = p.frameLocator('iframe[data-ws-frame]').first();
  const ziel = fr.locator('[data-ws-e]').filter({ hasText: /Bach/ }).first();
  await ziel.scrollIntoViewIfNeeded(); await ziel.click(); await p.waitForTimeout(1500);
  const feld = p.locator('#ws-mitte .ws-text[contenteditable=true]:visible').first();
  ok(await feld.count() > 0, 'Klick in die Seite öffnet das Textfeld');
  const vorher = (await feld.innerText()).trim();
  console.log('     Text:', vorher.slice(0, 90));
  await bild('text-angeklickt');
  await feld.click(); await p.keyboard.press('End'); await p.keyboard.type(ZUSATZ); await p.waitForTimeout(600);
  const imRahmen = await fr.locator('[data-ws-e]').filter({ hasText: 'Heidi und Damian freuen sich' }).count();
  ok(imRahmen > 0, 'Seite rechts schreibt beim Tippen mit');
  await bild('getippt');
  await p.keyboard.press('Control+s'); await p.waitForTimeout(1500);
  const quit = p.locator('.ws-quittung, [data-ws-quittung]').first();
  ok(await quit.count() > 0, 'Quittung nach Strg+S');
  await bild('quittung');
  // 2. Vorher/nachher
  const vn = p.getByRole('button', { name: 'Vorher/nachher ansehen' }).first();
  if (await vn.count()) { await vn.click(); await p.waitForTimeout(2500); ok(/entwurf/.test(p.url()) || await p.locator('#ws-mitte[data-ws-ansicht="entwurf"]').count() > 0, 'Vorher/nachher öffnet «Entwurf & Vergleich»'); await bild('vorher-nachher'); }
  else ok(false, 'Knopf «Vorher/nachher ansehen» in der Quittung');
  // 3. Rückgängig: noch einmal ändern, dann in der Quittung «Rückgängig»
  await geh('b:haus');
  await fr.locator('[data-ws-e]').filter({ hasText: /Bach/ }).first().click(); await p.waitForTimeout(1200);
  const f2 = p.locator('#ws-mitte .ws-text[contenteditable=true]:visible').first();
  await f2.click(); await p.keyboard.press('End'); await p.keyboard.type(' Probe.'); await p.keyboard.press('Control+s'); await p.waitForTimeout(1500);
  const rg = p.getByRole('button', { name: 'Rückgängig' }).first();
  if (await rg.count()) { await rg.click(); await p.waitForTimeout(1800); await bild('rueckgaengig'); }
  else ok(false, 'Knopf «Rückgängig» in der Quittung');
  const stand1 = await p.evaluate(async () => (await (await fetch('/api/x/website/stand/rustica', { cache: 'no-store' })).json()));
  const t1 = JSON.stringify(stand1.aenderungen || []);
  ok(!/Probe\./.test(t1) && /freuen sich auf Sie/.test(t1), 'Rückgängig nimmt nur die zweite Änderung zurück (Entwurf: ' + (stand1.aenderungen || []).length + ' Änderung)');
  // 4. Freie Woche dazu
  await geh('e:termine');
  await p.locator('[data-cu-neu]').click(); await p.waitForTimeout(800);
  await p.keyboard.press('Control+s'); await p.waitForTimeout(1500);
  const lage = await p.evaluate(async () => (await (await fetch('/_werkzeuge/bureau/api/termine', { cache: 'no-store' })).json()));
  ok(lage.wartet && lage.entwurf && lage.entwurf.length === 5, 'Neue freie Woche gespeichert (Entwurf mit 5 Wochen)');
  await bild('freie-woche-neu');
  const vs = p.locator('.cu-vs'); await vs.scrollIntoViewIfNeeded(); await p.waitForTimeout(2500); await bild('freie-wochen-vorschau');
  // 5. Veröffentlichen-Fenster
  await geh('entwurf');
  await p.locator('#ws-raus').first().click(); await p.waitForTimeout(1200);
  ok(await p.locator('#ws-notiz').count() > 0, 'Veröffentlichen-Fenster mit Notiz');
  await p.fill('#ws-notiz', 'Probe Schaufenster'); await bild('veroeffentlichen-fenster');
  await p.getByRole('button', { name: 'Jetzt veröffentlichen' }).click(); await p.waitForTimeout(2500);
  await bild('veroeffentlicht');
  const stand2 = await p.evaluate(async () => (await (await fetch('/api/x/website/stand/rustica', { cache: 'no-store' })).json()));
  ok(!(stand2.aenderungen || []).length && stand2.zuletzt, 'Nach dem Veröffentlichen wartet nichts mehr, «zuletzt» gesetzt');
  const online = await p.evaluate(async () => { const h = await (await fetch('/werkzeuge/website/_probe/rustica/online/haus.html', { cache: 'no-store' })).text(); const w = await (await fetch('/werkzeuge/website/_probe/rustica/online/wohnungen.html', { cache: 'no-store' })).text(); return [h.includes('freuen sich auf Sie'), w.includes('se-frei')]; });
  ok(online[0], 'Probe-Kopie online: Text auf «Das Haus» geändert');
  ok(online[1], 'Probe-Kopie online: eigene freie Wochen auf «Die Wohnungen»');
  // 6. Frühere Fassungen
  await geh('verlauf'); await bild('fruehere-fassungen');
  ok(await p.locator('#ws-mitte').getByText('Probe Schaufenster').count() > 0, 'Frühere Fassungen zeigen die Notiz');

  console.log(fehler.length ? 'Fehler:\n  ' + [...new Set(fehler)].join('\n  ') : 'keine Fehler');
  await b.close();
})();
