/* www.engparente.com.br - janela "Solicitar proposta".
 * 19/10/2026: a solicitacao vai DIRETO para a ENG PARENTE pelo sistema de gestao (WhatsApp continua como opcao).
 * 22/10/2026 (cofre, ponta a ponta): os dados sao TRANCADOS AQUI, no navegador do visitante (js/cofre.js), com as chaves
 * publicas da equipe fixadas no codigo do site (js/chaves.js), antes de sair do aparelho. O servidor, o banco e o e-mail de
 * aviso so veem um cofre fechado; abre so no GESTAO, com a frase de chave de quem tem acesso. Em aberto vao so o servico
 * (lista fixa) e, se informado, o e-mail para a confirmacao (o servidor usa so para mandar a confirmacao e nao grava).
 * Sem criptografia disponivel (navegador muito antigo), NADA e enviado: aparecem o WhatsApp e o e-mail. */
(function () {
  'use strict';
  var WPP = '5521971441934', MAIL = 'contato@engparente.com.br';
  var m = document.querySelector('meta[name="ep-api"]'), API = m ? m.getAttribute('content') : '';
  var ov = document.getElementById('ppOv'); if (!ov) return;
  var form = document.getElementById('ppForm'), erro = document.getElementById('ppErro'), fim = document.getElementById('ppFim');
  var ultimo = null, abertoEm = 0, enviando = false;
  function $(id) { return document.getElementById(id); }
  function conta(e) { try { if (window.EPContador) window.EPContador.evento(e); } catch (x) { } }
  function focaveis() { return Array.prototype.slice.call(ov.querySelectorAll('button, input, select, textarea, [href]')).filter(function (e) { return !e.disabled && e.offsetParent !== null && e.tabIndex >= 0; }); }
  function limpar() {
    form.reset(); form.hidden = false; fim.hidden = true; $('ppTit').textContent = 'Conte o que você precisa'; $('ppEyb').textContent = 'SOLICITAR PROPOSTA'; $('ppMail').hidden = true; erro.classList.remove('on');
    Array.prototype.forEach.call(form.querySelectorAll('.pp-inv'), function (e) { e.classList.remove('pp-inv'); });
  }
  function abrir(ev) {
    if (ev) ev.preventDefault();
    if (!fim.hidden) limpar(); // depois de um envio, a janela volta em branco
    ultimo = document.activeElement;
    var sv = ev && ev.currentTarget && ev.currentTarget.getAttribute ? ev.currentTarget.getAttribute('data-servico') : '';
    if (sv) { var sel = $('ppServico'); for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === sv) { sel.selectedIndex = i; break; } }
    ov.classList.add('on'); ov.setAttribute('aria-hidden', 'false'); document.body.classList.add('pp-aberto');
    abertoEm = Date.now();
    conta('proposta_aberta');
    setTimeout(function () { (sv ? $('ppNome') : $('ppServico')).focus(); }, 30);
  }
  function fechar() {
    if (enviando) return; // nao fecha no meio do envio
    ov.classList.remove('on'); ov.setAttribute('aria-hidden', 'true'); document.body.classList.remove('pp-aberto');
    if (ultimo && ultimo.focus) ultimo.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-proposta]'), function (b) { b.addEventListener('click', abrir); });
  $('ppFechar').addEventListener('click', fechar);
  $('ppFimFechar').addEventListener('click', fechar);
  ov.addEventListener('click', function (e) { if (e.target === ov) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (!ov.classList.contains('on')) return;
    if (e.key === 'Escape') { fechar(); return; }
    if (e.key === 'Tab') {
      var f = focaveis(); if (!f.length) return;
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
  });
  function limpo(v) { return String(v || '').replace(/\s+/g, ' ').trim(); }
  function mostrarErro(msg, el) {
    erro.textContent = msg; erro.classList.add('on');
    if (el) { el.classList.add('pp-inv'); try { el.focus(); } catch (e) { } }
  }
  ['ppNome', 'ppTel', 'ppEmail', 'ppDesc'].forEach(function (id) { $(id).addEventListener('input', function () { this.classList.remove('pp-inv'); erro.classList.remove('on'); }); });
  $('ppServico').addEventListener('change', function () { this.classList.remove('pp-inv'); erro.classList.remove('on'); });
  $('ppConsent').addEventListener('change', function () { $('ppConsent').parentNode.classList.remove('pp-inv'); erro.classList.remove('on'); });
  function coletar() {
    erro.classList.remove('on');
    var serv = $('ppServico').value;
    var d = { serv: serv, nome: limpo($('ppNome').value), empresa: limpo($('ppEmpresa').value), tel: limpo($('ppTel').value),
              email: limpo($('ppEmail').value).toLowerCase(), local: limpo($('ppLocal').value), desc: String($('ppDesc').value || '').trim() };
    if (!serv) { mostrarErro('Escolha o serviço.', $('ppServico')); return null; }
    if (d.nome.length < 3) { mostrarErro('Informe o seu nome.', $('ppNome')); return null; }
    var dig = d.tel.replace(/\D/g, '');
    if (dig.length < 10 || dig.length > 13) { mostrarErro('Informe um telefone com DDD.', $('ppTel')); return null; }
    if (d.email && !/^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]{2,}$/.test(d.email)) { mostrarErro('Confira o e-mail informado.', $('ppEmail')); return null; }
    if (d.desc.length < 10) { mostrarErro('Descreva rapidamente o que você precisa.', $('ppDesc')); return null; }
    return d;
  }
  function texto(d) {
    var l = ['Olá! Gostaria de solicitar uma proposta.', '', 'Serviço: ' + d.serv, 'Nome: ' + d.nome];
    if (d.empresa) l.push('Empresa: ' + d.empresa);
    l.push('Telefone: ' + d.tel);
    if (d.email) l.push('E-mail: ' + d.email);
    if (d.local) l.push('Local da obra: ' + d.local);
    l.push('', 'Descrição:', d.desc);
    return l.join('\n');
  }
  var CAMPO = { servico: 'ppServico', email: 'ppEmail' };
  function estadoEnvio(on) {
    enviando = on; var b = $('ppEnviar');
    b.disabled = on; b.textContent = on ? 'ENVIANDO…' : 'ENVIAR SOLICITAÇÃO'; form.setAttribute('aria-busy', on ? 'true' : 'false');
  }
  function falhou(msg) { $('ppMail').hidden = false; mostrarErro(msg + ' Se preferir, use o WhatsApp ou envie por e-mail.'); }
  function podeTrancar() { return !!(window.Cofre && window.crypto && window.crypto.subtle && window.CHAVES_SITE && window.CHAVES_SITE.length && API); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    var d = coletar(); if (!d) return;
    if (!$('ppConsent').checked) { mostrarErro('Marque a autorização para usarmos os dados na resposta.', null); $('ppConsent').parentNode.classList.add('pp-inv'); $('ppConsent').focus(); return; }
    if (!podeTrancar()) { falhou('Este navegador não permite o envio protegido.'); return; }
    estadoEnvio(true);
    var dados = { servico: d.serv, nome: d.nome, empresa: d.empresa, telefone: d.tel, email: d.email, local: d.local, descricao: d.desc,
      consentimentoEm: new Date().toISOString(), consentimentoTexto: $('ppConsent').parentNode.textContent.replace(/\s+/g, ' ').trim() };
    var tempoForm = Date.now() - abertoEm, ctl = window.AbortController ? new AbortController() : null, tempo = null;
    window.Cofre.trancar(dados, window.CHAVES_SITE).then(function (envelope) {
      dados = null; // o texto aberto nao fica guardado na pagina
      var corpo = { servico: d.serv, envelope: envelope, email: d.email, consentimento: true, website: $('ppSite').value, t: tempoForm };
      tempo = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
      return fetch(API + '/proposta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: ctl ? ctl.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer' });
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { s: r.status, j: j || {} }; }); })
      .then(function (res) {
        clearTimeout(tempo); estadoEnvio(false);
        if (res.s === 200 && res.j.ok) {
          $('ppProt').textContent = res.j.protocolo || '';
          $('ppFimTxt').textContent = 'Nossa equipe vai analisar e retornar em breve pelo telefone' + (d.email ? ' ou e-mail' : '') + ' informado.'
            + (res.j.confirmacao ? ' Se o e-mail ' + d.email + ' estiver correto, a confirmação com o protocolo chega em instantes.' : '');
          $('ppEyb').textContent = 'SOLICITAÇÃO ENVIADA'; $('ppTit').textContent = 'Recebemos sua solicitação.';
          form.reset(); form.hidden = true; fim.hidden = false; $('ppTit').focus();
          return;
        }
        if (res.s === 400 && res.j.campo && CAMPO[res.j.campo]) { mostrarErro(res.j.erro || 'Confira os dados.', $(CAMPO[res.j.campo])); return; }
        falhou(res.j.erro || 'Não foi possível enviar agora.');
      })
      .catch(function () { clearTimeout(tempo); estadoEnvio(false); falhou('Não foi possível enviar agora (sem conexão com o servidor).'); });
  });
  $('ppWpp').addEventListener('click', function () {
    var d = coletar(); if (!d) return;
    conta('whatsapp');
    // sem 'noopener' na chamada: com ele o window.open devolve null e a pagina do site tambem saia para o WhatsApp
    var url = 'https://wa.me/' + WPP + '?text=' + encodeURIComponent(texto(d)), w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) { } } else location.href = url;
  });
  $('ppMail').addEventListener('click', function () {
    var d = coletar(); if (!d) return;
    var assunto = 'Solicitação de proposta — ' + d.serv + (d.empresa ? ' — ' + d.empresa : '');
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(texto(d));
  });
})();
