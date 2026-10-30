/* 22/10/2026: o site so funciona em HTTPS (os formularios trancam os dados com criptografia do navegador, que exige conexao segura) */
(function () { if (location.protocol === 'http:' && /(^|\.)engparente\.com\.br$/i.test(location.hostname)) location.replace('https://' + location.host + location.pathname + location.search + location.hash); })();
(function () {
  'use strict';
  // menu do celular
  var hd = document.querySelector('.hd'), bt = hd && hd.querySelector('.menu-bt');
  if (bt) {
    var marca = function (a) { hd.classList.toggle('aberto', a); bt.setAttribute('aria-expanded', a ? 'true' : 'false'); bt.setAttribute('aria-label', a ? 'Fechar menu' : 'Abrir menu'); };
    bt.addEventListener('click', function () { marca(!hd.classList.contains('aberto')); });
    Array.prototype.forEach.call(hd.querySelectorAll('.nav a'), function (a) { a.addEventListener('click', function () { marca(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('aberto')) { marca(false); bt.focus(); } });
    document.addEventListener('click', function (e) { if (hd.classList.contains('aberto') && !hd.contains(e.target)) marca(false); });
    if (window.matchMedia) { var mq = window.matchMedia('(min-width: 981px)'), f = function (e) { if (e.matches) marca(false); };
      if (mq.addEventListener) mq.addEventListener('change', f); else if (mq.addListener) mq.addListener(f); }
  }
})();
(function () {
  'use strict';
  // carrossel do topo
  var box = document.getElementById('heroImg'); if (!box) return;
  var sl = box.querySelectorAll('.sl'), n = sl.length, i = 0, t = null;
  var num = document.getElementById('indN'), txt = document.getElementById('indTxt'), barra = document.getElementById('indBarra');
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mostra(k) {
    sl[i].classList.remove('on'); i = k; sl[i].classList.add('on');
    num.textContent = ('0' + (i + 1)).slice(-2); txt.textContent = sl[i].getAttribute('data-cap') || '';
    barra.classList.remove('anda'); void barra.offsetWidth; if (!calmo && n > 1) barra.classList.add('anda');
  }
  function proximo() { mostra((i + 1) % n); }
  function liga() { if (calmo || n < 2) { barra.style.width = '100%'; return; } desliga(); t = setInterval(proximo, 6000); }
  function desliga() { if (t) clearInterval(t); t = null; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) desliga(); else { mostra(i); liga(); } });
  mostra(0); liga();
})();
