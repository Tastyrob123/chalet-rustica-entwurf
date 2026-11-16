/* Hereinschweben im Newsletter-Baukasten (Chalet Rustica, 09.11.2026), gleiche Feder wie feder.js/feder.css der Übersicht: was beim Öffnen unterhalb des ersten
   Bildschirms liegt (am Handy die Bausteine, die Einstellungen, der Fuss der Mail), schwebt beim Hereinscrollen an seinen Platz. Der erste Bildschirm steht sofort. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var SEL = '.ml-links > div, .ml-meine > *, .ml-rechts > div, .ml-felder > *, .ml-buehne > *';
  var io = new IntersectionObserver(function (es) {
    es.filter(function (e) { return e.isIntersecting; }).forEach(function (e, n) {
      var el = e.target; io.unobserve(el); el.style.setProperty('--i', Math.min(n, 6)); el.classList.add('da');
      el.addEventListener('animationend', function f(ev) { if (ev.target === el && ev.animationName === 'ce-feder') { el.classList.add('gespielt'); el.removeEventListener('animationend', f); } });
    });
  }, { rootMargin: '0px 0px 8% 0px' });
  function markiere() {
    document.querySelectorAll(SEL).forEach(function (el) {
      if (el.hasAttribute('data-fd') || el.hidden) return;
      var r = el.getBoundingClientRect(); if (!r.height || r.top < innerHeight * 1.02) return;   // nur unterhalb des ersten Bildschirms
      el.setAttribute('data-fd', ''); io.observe(el);
    });
  }
  function los() { setTimeout(markiere, 600); }
  if (document.readyState === 'complete') los(); else addEventListener('load', los);
})();
