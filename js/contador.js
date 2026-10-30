/* www.engparente.com.br - contador de acessos ANONIMO (22/10/2026).
 * Sem cookie, sem guardar nada neste aparelho, sem identificar ninguem: manda so a pagina, o DOMINIO de onde a pessoa
 * veio (ex.: www.google.com, nunca o endereco completo) e a campanha (utm_source), se houver. Quem marca "nao rastrear"
 * no navegador (Do Not Track / Global Privacy Control) nao e contado. O servidor nao grava IP (ver GESTAO
 * src/site/acessos.js). Tambem conta cliques no WhatsApp e a janela "Solicitar proposta" aberta. */
(function () {
  'use strict';
  var m = document.querySelector('meta[name="ep-api"]'), API = m ? m.getAttribute('content') : '';
  var n = navigator, nao = !API || n.globalPrivacyControl === true || n.doNotTrack === '1' || window.doNotTrack === '1' || n.msDoNotTrack === '1' || n.webdriver === true;
  function envia(o) {
    if (nao) return;
    try {
      fetch(API + '/acesso', { method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true, referrerPolicy: 'no-referrer', cache: 'no-store',
        headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(o) }).then(function (r) { return r.text(); }).catch(function () { });
    } catch (e) { /* contador nunca atrapalha o site */ }
  }
  function dominio(u) { try { return u ? new URL(u).hostname.toLowerCase() : ''; } catch (e) { return ''; } }
  function utm() { try { return (new URLSearchParams(location.search).get('utm_source') || '').slice(0, 40); } catch (e) { return ''; } }
  window.EPContador = { evento: function (e) { envia({ e: String(e) }); } };
  var p = location.pathname || '/';
  envia({ p: p.replace(/\/{2,}/g, '/'), r: dominio(document.referrer), u: utm() });
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="https://wa.me/"]') : null;
    if (a) envia({ e: 'whatsapp' });
  }, true);
})();
