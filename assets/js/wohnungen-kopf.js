/* Seite «Die Wohnungen», Kopf: Namen zum Zeigen, Sommer/Winter, Band zum Blättern */
(function(){
  function zeig(e){var a=e.target.closest&&e.target.closest('[data-kk-zeig] [data-i]');if(a)a.closest('[data-kk-zeig]').dataset.i=a.dataset.i}
  document.addEventListener('pointerover',zeig);document.addEventListener('focusin',zeig);
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-kk-saison] button[data-s]');
    if(b){var k=b.closest('[data-kk-saison]');k.dataset.s=b.dataset.s;k.querySelectorAll('button[data-s]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});return}
    var p=e.target.closest&&e.target.closest('[data-kk-band]');
    if(p){var f=p.closest('.kk15').querySelector('[data-kk-bandflaeche]');f.scrollBy({left:(+p.dataset.kkBand)*f.clientWidth*.8,behavior:'smooth'})}
  });
  document.addEventListener('input',function(e){var r=e.target.closest&&e.target.closest('[data-kk-schieber]');if(r)r.closest('.hk').style.setProperty('--x',r.value+'%')});
})();
