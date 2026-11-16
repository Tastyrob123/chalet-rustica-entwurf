/* Chalet Rustica · Bewegung (Machart der Familienseite Zurbriggen, einstieg/site/main.js).
   Nur transform und opacity, nativer Scroll, nichts an die Scroll-Geschwindigkeit geknüpft. */
(function () {
  var d = document, H = d.documentElement;
  var ruhig = /[?&]ruhig/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ruhig) H.classList.add('ruhig');

  /* ---------- Titel in echte Zeilen teilen (für den Auftritt aus dem Schlitz) ---------- */
  function zeilen(el) {
    if (!el.dataset.roh) el.dataset.roh = el.innerHTML;
    el.classList.remove('geteilt');
    el.innerHTML = el.dataset.roh;
    var teile = [];
    (function lauf(knoten, cls) {
      [].slice.call(knoten.childNodes).forEach(function (k) {
        if (k.nodeType === 3) {
          k.textContent.split(/\s+/).forEach(function (w) { if (w) teile.push({ w: w, cls: cls }); });
        } else if (k.nodeType === 1 && k.tagName === 'BR') teile.push({ br: true });
        else if (k.nodeType === 1) lauf(k, k.tagName === 'EM' ? 'em' : (k.className || cls));
      });
    })(el, '');
    el.innerHTML = teile.map(function (t) {
      if (t.br) return '<br>';
      return '<span class="wd">' + (t.cls === 'em' ? '<em>' + t.w + '</em>' : t.cls ? '<span class="' + t.cls + '">' + t.w + '</span>' : t.w) + '</span>';
    }).join(' ');
    var reihen = [], oben = null;
    [].slice.call(el.querySelectorAll('.wd')).forEach(function (w) {
      var t = Math.round(w.offsetTop);
      if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; }
      reihen[reihen.length - 1].push(w.innerHTML);
    });
    el.innerHTML = reihen.map(function (r, i) {
      return '<span class="zl"><span style="--z:' + i + '">' + r.join(' ') + '</span></span>';
    }).join('');
    el.classList.add('geteilt');
  }
  var titel = [].slice.call(d.querySelectorAll('[data-zeilen], .bruch__satz'));
  function alleZeilen() { titel.forEach(zeilen); }

  /* ---------- Erster Blick: erst zeigen, wenn Schrift und die Bilder des Auftakts geladen sind (load, nicht decode) ---------- */
  function geladen(img) {
    return new Promise(function (r) {
      if (img.complete && img.naturalWidth) return r();
      img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true });
    });
  }
  var losGegangen = false;
  function los() {
    if (losGegangen) return; losGegangen = true;
    alleZeilen();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        H.classList.remove('wartet');
        requestAnimationFrame(function () { d.body.classList.add('los'); beobachten(); });
      });
    });
  }
  function sichtbar(i) { return i.getClientRects().length > 0; }
  // erst nach fassungen.js (setzt die gewählte Fassung), deshalb DOMContentLoaded; nur Bilder, die gezeigt werden
  function warte() {
    var ims = [].slice.call(d.querySelectorAll('.auftakt img, [data-erst] img')).filter(sichtbar);
    ims.forEach(function (i) { i.loading = 'eager'; });
    Promise.all([d.fonts ? d.fonts.ready : 0].concat(ims.map(geladen))).then(los);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', warte); else setTimeout(warte, 0);
  setTimeout(los, 2600);

  /* ---------- Vorladen: Bilder eines Abschnitts laden, bevor er in Sicht kommt ---------- */
  var vor = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      vor.unobserve(e.target);
      e.target.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
    });
  }, { rootMargin: '150% 0px 150% 0px' });
  d.querySelectorAll('section, footer, article').forEach(function (s) { vor.observe(s); });

  function bereit(el) {
    var ims = [].slice.call(el.querySelectorAll('img'));
    ims.forEach(function (i) { i.loading = 'eager'; });
    return Promise.race([Promise.all(ims.map(geladen)), new Promise(function (r) { setTimeout(r, 900); })]);
  }

  /* ---------- Grosse Zahlen zählen hoch (kleine bis 3 stehen still) ---------- */
  function zaehlen(box) {
    box.querySelectorAll('b[data-bis]').forEach(function (b) {
      var ziel = parseFloat(b.dataset.bis), ab = ziel < 10 ? Math.max(0, ziel - 3) : Math.round(ziel * 0.6), t0 = null, dauer = 1300;
      function schritt(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - p, 3);
        b.textContent = String(Math.round(ab + (ziel - ab) * e));
        if (p < 1) requestAnimationFrame(schritt); else b.textContent = String(ziel);
      }
      b.textContent = String(ab);
      requestAnimationFrame(schritt);
    });
  }

  /* ---------- Auftritte ---------- */
  var AUFTRITT = '[data-r],[data-zeilen],[data-staffel],[data-flaeche],[data-zug]', io = null;
  function zeige(el) {
    bereit(el).then(function () {
      el.classList.add('da');
      if (el.hasAttribute('data-zahlen')) zaehlen(el);
    });
  }
  function beobachten() {
    if (ruhig) { d.querySelectorAll(AUFTRITT + ',.fb__haus').forEach(function (e) { e.classList.add('da'); }); return; }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); zeige(e.target); } });
    }, { rootMargin: '0px 0px 4% 0px' });
    d.querySelectorAll(AUFTRITT).forEach(function (e) { if (!e.closest('.auftakt,[data-erst]')) io.observe(e); });
    d.querySelectorAll('.auftakt [data-zeilen], .auftakt [data-r], [data-erst] [data-zeilen], [data-erst] [data-r]').forEach(function (e) { e.classList.add('da'); });
    d.querySelectorAll('[data-staffel]').forEach(function (s) { [].slice.call(s.children).forEach(function (k, i) { k.style.setProperty('--n', i); }); });
    d.querySelectorAll('[data-r=text]').forEach(function (t) {
      var vorher = t.previousElementSibling, i = 0;
      while (vorher && vorher.matches('[data-r=text],[data-zeilen],[data-r]') && i < 4) { i++; vorher = vorher.previousElementSibling; }
      t.style.setProperty('--i', i);
    });
    familienband();
  }

  /* ---------- Familienband «Vier Scheiben»: jede Scheibe schwebt herauf, sobald ihre Oberkante den unteren Rand erreicht ---------- */
  function familienband() {
    var L = [].slice.call(d.querySelectorAll('.familienband .fb__haus')); if (!L.length) return;
    L.forEach(function (x, i) { x.style.setProperty('--n', i); });
    var g = false, w = 0;
    function f() {
      w = 0; var h = innerHeight, b = L[0].getBoundingClientRect();
      if (!g && b.top < h * 2.5) { g = true; L.forEach(function (x) { x.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; }); }); }
      L.forEach(function (x) { if (!x.classList.contains('da') && x.getBoundingClientRect().top < h * 1.02) x.classList.add('da'); });
    }
    addEventListener('scroll', function () { if (!w) w = requestAnimationFrame(f); }, { passive: true });
    addEventListener('resize', f); f();
  }

  /* ---------- Leiste: geht beim Runterscrollen weg, kommt beim Hochscrollen wieder ---------- */
  var leiste = d.querySelector('[data-leiste]'), letzt = scrollY, tick = 0;
  addEventListener('scroll', function () {
    if (tick) return;
    tick = requestAnimationFrame(function () {
      tick = 0; var y = scrollY;
      if (menueOffen()) { letzt = y; return; }
      if (y > 220 && y > letzt + 4) leiste.classList.add('weg');
      else if (y < letzt - 4 || y < 220) leiste.classList.remove('weg');
      letzt = y;
    });
  }, { passive: true });

  /* ---------- Menü am Handy ---------- */
  var mk = d.querySelector('.leiste__menue'), mn = d.getElementById('menue');
  function menueOffen() { return mn && !mn.hidden; }
  function menue(auf) {
    mn.hidden = !auf; mk.setAttribute('aria-expanded', auf ? 'true' : 'false'); mk.textContent = auf ? 'Schliessen' : 'Menü';
    d.body.style.overflow = auf ? 'hidden' : '';
  }
  if (mk && mn) {
    mk.addEventListener('click', function () { menue(mn.hidden); });
    mn.addEventListener('click', function (e) { if (e.target.closest('a')) menue(false); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && menueOffen()) menue(false); });
  }


  /* ---------- Fenster (Vorlage Tasty Studios fen.js): der Satz steht fest in der Bildschirmmitte, das Fenster zieht darüber.
     Er rollt erst hoch, wenn die Oberkante des Fensters ihn zu einem Drittel freigegeben hat. ---------- */
  d.querySelectorAll('.bruch').forEach(function (f) {
    var t = f.querySelector('.bruch__satz'), fio = null; if (!t) return;

    function lausche() {
      if (fio) fio.disconnect();
      var hh = t.offsetHeight, linie = innerHeight / 2 - hh / 2 + hh * 0.68;
      fio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; fio.disconnect(); fio = null; removeEventListener('resize', lausche); f.classList.add('los'); });
      }, { rootMargin: '0px 0px -' + Math.max(0, Math.round(innerHeight - linie)) + 'px 0px', threshold: 0 });
      fio.observe(f);
    }
    lausche(); addEventListener('resize', lausche, { passive: true });
  });

  /* ---------- Wohnungen: Türschilder wechseln die Wohnung, kleine Bilder wechseln das grosse (das neue fährt von unten herein) ---------- */
  var tabs = [].slice.call(d.querySelectorAll('.schild[role=tab]'));
  function waehle(t, fokus) {
    tabs.forEach(function (x) {
      var an = x === t, p = d.getElementById(x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', an ? 'true' : 'false'); x.tabIndex = an ? 0 : -1;
      if (an && p.hidden) {
        p.hidden = false; p.classList.remove('wechsel'); void p.offsetWidth; p.classList.add('wechsel');
        p.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
      } else if (!an) p.hidden = true;
    });
    if (fokus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { waehle(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { e.preventDefault(); waehle(tabs[(i + n + tabs.length) % tabs.length], true); }
    });
  });
  // die Bilder der anderen Wohnungen vorab laden, sobald die Bühne naht
  var buehne = d.querySelector('.buehne');
  if (buehne) new IntersectionObserver(function (es, o) {
    if (es[0].isIntersecting) { o.disconnect(); buehne.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; }); }
  }, { rootMargin: '100% 0px 100% 0px' }).observe(buehne);
  d.querySelectorAll('.wohnung').forEach(function (w) {
    var gross = w.querySelector('.wohnung__gross');
    w.querySelectorAll('.mini').forEach(function (m) {
      m.addEventListener('click', function () {
        if (m.getAttribute('aria-pressed') === 'true') return;
        w.querySelectorAll('.mini').forEach(function (x) { x.setAttribute('aria-pressed', x === m ? 'true' : 'false'); });
        var n = m.dataset.gross, hoch = m.dataset.q === 'hoch', alt = gross.querySelectorAll('img');
        var img = new Image();
        img.className = 'neu'; img.alt = m.querySelector('img').alt; img.decoding = 'async';
        img.sizes = '(max-width:900px) 92vw, 58vw';
        img.srcset = hoch ? 'assets/img/' + n + '-700.webp 700w, assets/img/' + n + '-1050.webp 1050w' : 'assets/img/' + n + '-900.webp 900w, assets/img/' + n + '-1400.webp 1400w';
        img.src = 'assets/img/' + n + (hoch ? '-1050.webp' : '-1400.webp');
        (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
          gross.appendChild(img);
          requestAnimationFrame(function () { requestAnimationFrame(function () { img.classList.add('da'); }); });
          setTimeout(function () { [].slice.call(alt).forEach(function (a) { if (a !== img) a.remove(); }); }, 1000);
        });
      });
    });
  });


  /* ---------- Fassungen (fassungen.js): einen Abschnitt nach dem Umschalten neu auftreten lassen ---------- */
  window.RU = {
    neu: function (sec) {
      sec.querySelectorAll('[data-zeilen], .bruch__satz').forEach(function (e) { if (e.getClientRects().length) zeilen(e); });
      [].slice.call(sec.querySelectorAll('.da')).forEach(function (e) { e.classList.remove('da'); });
      if (sec.classList.contains('auftakt')) {
        d.body.classList.remove('los'); void sec.offsetWidth;
        var ims = [].slice.call(sec.querySelectorAll('img')).filter(sichtbar);
        ims.forEach(function (i) { i.loading = 'eager'; });
        Promise.race([Promise.all(ims.map(geladen)), new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
          requestAnimationFrame(function () { requestAnimationFrame(function () {
            d.body.classList.add('los');
            sec.querySelectorAll('[data-zeilen],[data-r]').forEach(function (e) { e.classList.add('da'); });
          }); });
        });
        return;
      }
      if (ruhig || !io) { sec.querySelectorAll(AUFTRITT).forEach(function (e) { e.classList.add('da'); }); return; }
      requestAnimationFrame(function () { sec.querySelectorAll(AUFTRITT).forEach(function (e) { if (sichtbar(e)) io.observe(e); }); });
    }
  };

  /* ---------- Auftakt «Sommer oder Winter»: das andere Bild fährt von unten herein ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('.ha10 [data-zeit]'); if (!b) return;
    var h = b.closest('.ha10');
    h.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
    h.dataset.jahreszeit = b.dataset.zeit;
    h.querySelectorAll('[data-zeit]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  });

  /* ---------- Wohnungs-Fassungen mit Schildern (data-wechsel): Wohnung wählen ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-wechsel] button[data-w]'); if (!b) return;
    var box = b.closest('[data-wechsel]'), w = b.dataset.w;
    box.querySelectorAll('button[data-w]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.w === w ? 'true' : 'false'); });
    box.querySelectorAll('[data-w]:not(button):not(figure)').forEach(function (p) {
      var an = p.dataset.w === w;
      if (an && p.hidden) { p.hidden = false; p.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; }); p.animate && p.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' }); }
      else if (!an) p.hidden = true;
    });
    if (box.hasAttribute('data-w-aktiv')) box.dataset.wAktiv = w;
  });


  /* ---------- Galerie in den Wohnungs-Fassungen: kleines Bild oder Pfeil wechselt das grosse (das neue fährt von unten herein) ---------- */
  function galZeige(g, b) {
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    g.querySelectorAll('[data-bild]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var gross = g.querySelector('.gal__gross'), alt = [].slice.call(gross.querySelectorAll('img')), quelle = b.querySelector('img');
    var im = new Image(); im.className = 'neu'; im.alt = quelle.alt; im.decoding = 'async'; im.sizes = alt[0] ? alt[0].sizes : '100vw';
    im.srcset = quelle.srcset; im.src = quelle.src;
    var t = g.querySelector('.gal__text'); if (t) t.textContent = b.dataset.text || '';
    (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () {
      gross.appendChild(im);
      requestAnimationFrame(function () { requestAnimationFrame(function () { im.classList.add('da'); }); });
      setTimeout(function () { alt.forEach(function (a) { a.remove(); }); }, 1000);
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-galerie] [data-bild]');
    if (b) { galZeige(b.closest('[data-galerie]'), b); return; }
    var s = e.target.closest('[data-galerie] [data-gal-schritt]'); if (!s) return;
    var g = s.closest('[data-galerie]'), alle = [].slice.call(g.querySelectorAll('[data-bild]'));
    var i = alle.findIndex(function (x) { return x.getAttribute('aria-pressed') === 'true'; });
    galZeige(g, alle[(i + (+s.dataset.galSchritt) + alle.length) % alle.length]);
  });

  /* ---------- Blätterband: Pfeile schieben die Karten (kein Scroll im Scroll) ---------- */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-blaettern]'); if (!b) return;
    var p = b.closest('.wv9__p'), band = p.querySelector('[data-band]'), k = [].slice.call(band.children);
    if (!k.length) return;
    var schritt = k[0].getBoundingClientRect().width + 10, sicht = Math.max(1, Math.floor(band.clientWidth / schritt));
    var i = Math.min(Math.max(0, (+band.dataset.i || 0) + (+b.dataset.blaettern)), Math.max(0, k.length - sicht));
    band.dataset.i = i;
    k.forEach(function (x) { x.style.setProperty('--x', (-i * schritt) + 'px'); x.querySelectorAll('img').forEach(function (im) { im.loading = 'eager'; }); });
  });

  /* ---------- Impressum ---------- */
  var imp = d.querySelector('dialog.impressum');
  d.querySelectorAll('[data-impressum]').forEach(function (b) { b.addEventListener('click', function () { imp.showModal(); }); });
  if (imp) {
    imp.querySelector('.dlg__zu').addEventListener('click', function () { imp.close(); });
    imp.addEventListener('click', function (e) { if (e.target === imp) imp.close(); });
  }

  /* ---------- Zeilen bei geänderter Breite neu teilen ---------- */
  var breite = innerWidth, rz = 0;
  addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { if (Math.abs(innerWidth - breite) > 40) { breite = innerWidth; alleZeilen(); } }, 200);
  });
})();
