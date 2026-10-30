/* 22/10/2026: o site so funciona em HTTPS (os formularios trancam os dados com criptografia do navegador, que exige conexao segura) */
(function () { if (location.protocol === 'http:' && /(^|\.)engparente\.com\.br$/i.test(location.hostname)) location.replace('https://' + location.host + location.pathname + location.search + location.hash); })();
(function () {
  'use strict';
  // idioma da pagina (pt, en ou es) - o mesmo arquivo serve as 3 versoes do site
  var L = String(document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase(); if (!/^(pt|en|es)$/.test(L)) L = 'pt';
  var MENU = { pt: ['Abrir menu', 'Fechar menu'], en: ['Open menu', 'Close menu'], es: ['Abrir menú', 'Cerrar menú'] }[L];
  // menu do celular
  var hd = document.querySelector('.hd'), bt = hd && hd.querySelector('.menu-bt');
  if (bt) {
    var marca = function (a) { hd.classList.toggle('aberto', a); bt.setAttribute('aria-expanded', a ? 'true' : 'false'); bt.setAttribute('aria-label', a ? MENU[1] : MENU[0]); };
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
(function () {
  'use strict';
  /* 30/10/2026 - sugestao de idioma: quem chega de fora (busca, link, digitado) com o navegador em outro idioma do site
   * ve uma faixa discreta com o link para a mesma pagina no idioma dele. NAO redireciona sozinho (quem quer o portugues
   * continua no portugues) e NAO guarda nada no aparelho (sem cookie, sem armazenamento): fechou, sumiu. Quem ja esta
   * navegando no site (veio de outra pagina do site) nao ve a faixa. */
  var html = document.documentElement, atual = String(html.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase();
  var langs = [];
  try { langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(function (x) { return String(x || '').slice(0, 2).toLowerCase(); }); } catch (e) { return; }
  var pref = null;
  for (var i = 0; i < langs.length; i++) { if (/^(pt|en|es)$/.test(langs[i])) { pref = langs[i]; break; } }
  if (!pref || pref === atual) return;
  try { if (document.referrer && new URL(document.referrer).host === location.host) return; } catch (e) { /* segue */ }
  var alvo = document.querySelector('link[rel="alternate"][hreflang="' + (pref === 'pt' ? 'pt-BR' : pref) + '"]'); if (!alvo) return;
  var caminho; try { caminho = new URL(alvo.getAttribute('href'), location.href).pathname; } catch (e) { return; }
  var T = {
    pt: ['Este site também está em português.', 'Ver em português', 'Fechar'],
    en: ['This website is also available in English.', 'View in English', 'Close'],
    es: ['Este sitio también está disponible en español.', 'Ver en español', 'Cerrar']
  }[pref];
  var faixa = document.createElement('div'); faixa.className = 'idi'; faixa.setAttribute('role', 'region'); faixa.setAttribute('lang', pref === 'pt' ? 'pt-BR' : pref);
  faixa.setAttribute('aria-label', T[0]);
  var p = document.createElement('span'); p.textContent = T[0];
  var a = document.createElement('a'); a.href = caminho + location.hash; a.textContent = T[1]; a.setAttribute('hreflang', pref === 'pt' ? 'pt-BR' : pref);
  var x = document.createElement('button'); x.type = 'button'; x.className = 'idi-x'; x.setAttribute('aria-label', T[2]); x.textContent = '✕';
  x.addEventListener('click', function () { if (faixa.parentNode) faixa.parentNode.removeChild(faixa); });
  faixa.appendChild(p); faixa.appendChild(a); faixa.appendChild(x);
  document.body.appendChild(faixa);
})();
