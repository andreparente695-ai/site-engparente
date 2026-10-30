/* www.engparente.com.br - "Trabalhe conosco" (22/10/2026, pedido do Andre; modelo aprovado no canvas).
 * Profissional (curriculo em PDF ate 5 MB) ou fornecedor (apresentacao em PDF opcional ate 10 MB, tipo e especialidade
 * da mesma lista do GESTAO). Tudo - dados e PDF - e TRANCADO AQUI, neste navegador (js/cofre.js), com as chaves publicas
 * da equipe fixadas no codigo do site (js/chaves.js), antes de sair do aparelho. O servidor so recebe o cofre fechado e,
 * em aberto, o tipo e o e-mail para mandar a confirmacao com o protocolo (o servidor nao grava o e-mail).
 * Sem criptografia disponivel, NADA e enviado. */
(function () {
  'use strict';
  var m = document.querySelector('meta[name="ep-api"]'), API = m ? m.getAttribute('content') : '';
  var MAX = { profissional: 5 * 1024 * 1024, fornecedor: 10 * 1024 * 1024 };
  var RE_EMAIL = /^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]{2,}$/;
  var esc = document.getElementById('tcEscolha'); if (!esc) return;
  var fim = document.getElementById('tcFim');
  var forms = { profissional: document.getElementById('tcFormProf'), fornecedor: document.getElementById('tcFormForn') };
  var arquivos = { profissional: null, fornecedor: null }, mostradoEm = { profissional: 0, fornecedor: 0 }, enviando = false;
  function $(id) { return document.getElementById(id); }
  function limpo(v, max) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max || 200); }

  /* ---------------------------------------------------------------- escolha do tipo */
  function escolher(tipo, foco) {
    Array.prototype.forEach.call(document.querySelectorAll('.tc-tipo'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tipo') === tipo ? 'true' : 'false'); });
    Object.keys(forms).forEach(function (k) { forms[k].hidden = k !== tipo; });
    if (!mostradoEm[tipo]) mostradoEm[tipo] = Date.now();
    if (foco) { var p = forms[tipo].querySelector('input.tc-c'); if (p) p.focus(); }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.tc-tipo'), function (b) { b.addEventListener('click', function () { escolher(b.getAttribute('data-tipo'), true); }); });
  escolher(/profissional|curriculo/i.test(location.hash) ? 'profissional' : 'fornecedor', false);

  /* ---------------------------------------------------------------- erros */
  function erro(tipo, msg, el) {
    var e = $(tipo === 'profissional' ? 'tcPErro' : 'tcFErro');
    e.textContent = msg; e.classList.add('on');
    if (el) { el.classList.add('tc-inv'); try { el.focus(); } catch (x) { } }
  }
  function limparErro(tipo) {
    $(tipo === 'profissional' ? 'tcPErro' : 'tcFErro').classList.remove('on');
    Array.prototype.forEach.call(forms[tipo].querySelectorAll('.tc-inv'), function (x) { x.classList.remove('tc-inv'); });
  }
  Object.keys(forms).forEach(function (t) {
    forms[t].addEventListener('input', function (ev) { if (ev.target && ev.target.classList) ev.target.classList.remove('tc-inv'); $(t === 'profissional' ? 'tcPErro' : 'tcFErro').classList.remove('on'); });
  });

  /* ---------------------------------------------------------------- PDF */
  function ligarArquivo(tipo, inputId, nomeId) {
    var inp = $(inputId), rot = $(nomeId), caixa = inp.closest('.tc-arq');
    inp.addEventListener('change', function () {
      limparErro(tipo); arquivos[tipo] = null; rot.textContent = 'Escolher arquivo';
      var f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > MAX[tipo]) { inp.value = ''; erro(tipo, 'O PDF tem ' + (f.size / 1048576).toFixed(1).replace('.', ',') + ' MB: o limite é ' + (MAX[tipo] / 1048576) + ' MB.', caixa); return; }
      if (f.size < 100) { inp.value = ''; erro(tipo, 'Arquivo vazio ou inválido.', caixa); return; }
      f.slice(0, 5).arrayBuffer().then(function (b) {
        var u = new Uint8Array(b);
        if (String.fromCharCode.apply(null, u) !== '%PDF-') { inp.value = ''; erro(tipo, 'Envie o arquivo em PDF.', caixa); return; }
        arquivos[tipo] = f; rot.textContent = f.name.length > 60 ? f.name.slice(0, 57) + '…' : f.name;
      }).catch(function () { inp.value = ''; erro(tipo, 'Não foi possível ler o arquivo.', caixa); });
    });
  }
  ligarArquivo('profissional', 'tcPCv', 'tcPCvNome');
  ligarArquivo('fornecedor', 'tcFArq', 'tcFArqNome');

  /* ---------------------------------------------------------------- CNPJ (numerico e alfanumerico, IN RFB 2.229/2024) */
  function cnpjLimpo(v) { return String(v || '').toUpperCase().replace(/[.\/\-\s]/g, ''); }
  function cnpjValido(v) {
    var c = cnpjLimpo(v);
    if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c) || /^(.)\1{13}$/.test(c)) return false;
    var val = function (ch) { return ch.charCodeAt(0) - 48; };
    var dv = function (base, pesos) { var s = 0; for (var i = 0; i < pesos.length; i++) s += val(base.charAt(i)) * pesos[i]; var r = s % 11; return r < 2 ? 0 : 11 - r; };
    var d1 = dv(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]), d2 = dv(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return d1 === Number(c.charAt(12)) && d2 === Number(c.charAt(13));
  }
  function cnpjFormatado(v) { var c = cnpjLimpo(v); return c.length === 14 ? c.slice(0, 2) + '.' + c.slice(2, 5) + '.' + c.slice(5, 8) + '/' + c.slice(8, 12) + '-' + c.slice(12) : c; }
  $('tcFCnpj').addEventListener('blur', function () { if (cnpjValido(this.value)) this.value = cnpjFormatado(this.value); });

  /* ---------------------------------------------------------------- coleta e conferencia */
  function telOk(v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 10 && d.length <= 13; }
  function coletar(tipo) {
    limparErro(tipo);
    var d;
    if (tipo === 'profissional') {
      d = { tipo: tipo, nome: limpo($('tcPNome').value, 100), email: limpo($('tcPEmail').value, 120).toLowerCase(), telefone: limpo($('tcPTel').value, 20),
        cidade: limpo($('tcPCidade').value, 80), area: $('tcPArea').value, registro: limpo($('tcPReg').value, 60), linkedin: limpo($('tcPLink').value, 200) };
      if (d.nome.length < 3) return erro(tipo, 'Informe o seu nome completo.', $('tcPNome'));
      if (!RE_EMAIL.test(d.email)) return erro(tipo, 'Confira o e-mail informado.', $('tcPEmail'));
      if (!telOk(d.telefone)) return erro(tipo, 'Informe um telefone com DDD.', $('tcPTel'));
      if (!d.area) return erro(tipo, 'Escolha a área de atuação.', $('tcPArea'));
      if (d.linkedin && !/^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/\S{2,190}$/i.test(d.linkedin)) return erro(tipo, 'Confira o endereço do LinkedIn (https://www.linkedin.com/in/...).', $('tcPLink'));
      if (!arquivos.profissional) return erro(tipo, 'Anexe o seu currículo em PDF (até 5 MB).', $('tcPCv').closest('.tc-arq'));
      if (!$('tcPConsent').checked) return erro(tipo, 'Marque a autorização para guardarmos o currículo.', $('tcPConsent').closest('.tc-ck'));
      d.consentimentoTexto = $('tcPConsent').parentNode.textContent.replace(/\s+/g, ' ').trim();
    } else {
      d = { tipo: tipo, razao: limpo($('tcFRazao').value, 150), cnpj: cnpjFormatado($('tcFCnpj').value), contato: limpo($('tcFContato').value, 100),
        email: limpo($('tcFEmail').value, 120).toLowerCase(), telefone: limpo($('tcFTel').value, 20), tipoFornecimento: $('tcFTipo').value, especialidade: $('tcFEsp').value,
        regiao: limpo($('tcFReg').value, 120), descricao: String($('tcFDesc').value || '').trim().slice(0, 800) };
      if (d.razao.length < 2) return erro(tipo, 'Informe a razão social.', $('tcFRazao'));
      if (!cnpjValido(d.cnpj)) return erro(tipo, 'Confira o CNPJ (os dígitos verificadores não conferem).', $('tcFCnpj'));
      if (d.contato.length < 3) return erro(tipo, 'Informe o nome do contato.', $('tcFContato'));
      if (!RE_EMAIL.test(d.email)) return erro(tipo, 'Confira o e-mail informado.', $('tcFEmail'));
      if (!telOk(d.telefone)) return erro(tipo, 'Informe um telefone com DDD.', $('tcFTel'));
      if (!d.tipoFornecimento) return erro(tipo, 'Escolha o tipo de fornecimento.', $('tcFTipo'));
      if (!d.especialidade) return erro(tipo, 'Escolha a especialidade.', $('tcFEsp'));
      if (!$('tcFConsent').checked) return erro(tipo, 'Marque a autorização para guardarmos os dados.', $('tcFConsent').closest('.tc-ck'));
      d.consentimentoTexto = $('tcFConsent').parentNode.textContent.replace(/\s+/g, ' ').trim();
    }
    d.consentimentoEm = new Date().toISOString();
    return d;
  }

  /* ---------------------------------------------------------------- envio */
  function botao(tipo, on) {
    var b = forms[tipo].querySelector('.tc-b1');
    if (!b._txt) b._txt = b.innerHTML;
    b.disabled = on; if (on) b.textContent = 'PROTEGENDO E ENVIANDO…'; else b.innerHTML = b._txt;
    forms[tipo].setAttribute('aria-busy', on ? 'true' : 'false');
  }
  var CAMPO = { profissional: { email: 'tcPEmail', arquivo: 'tcPCv', consentimento: 'tcPConsent' }, fornecedor: { email: 'tcFEmail', arquivo: 'tcFArq', consentimento: 'tcFConsent' } };
  function alvo(tipo, campo) { var id = CAMPO[tipo][campo]; if (!id) return null; var el = $(id); return el.type === 'file' ? el.closest('.tc-arq') : (el.type === 'checkbox' ? el.closest('.tc-ck') : el); }
  Object.keys(forms).forEach(function (tipo) {
    forms[tipo].addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (enviando) return;
      var d = coletar(tipo); if (!d) return;
      if (!(window.Cofre && window.crypto && window.crypto.subtle && window.CHAVES_SITE && window.CHAVES_SITE.length && API)) {
        erro(tipo, 'Este navegador não permite o envio protegido. Atualize o navegador ou escreva para contato@engparente.com.br.'); return;
      }
      enviando = true; botao(tipo, true);
      var f = arquivos[tipo], tempoForm = Date.now() - mostradoEm[tipo], ctl = window.AbortController ? new AbortController() : null, tempo = null;
      var email = d.email;
      (f ? f.arrayBuffer() : Promise.resolve(null)).then(function (buf) {
        var anexo = buf ? { nome: f.name.slice(0, 120), tipo: 'application/pdf', bytes: new Uint8Array(buf) } : null;
        return window.Cofre.trancar(d, window.CHAVES_SITE, anexo);
      }).then(function (envelope) {
        d = null; // o texto aberto nao fica guardado na pagina
        tempo = setTimeout(function () { if (ctl) ctl.abort(); }, 180000);
        return fetch(API + '/cadastro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctl ? ctl.signal : undefined,
          body: JSON.stringify({ tipo: tipo, envelope: envelope, email: email, consentimento: true, website: $(tipo === 'profissional' ? 'tcPSite' : 'tcFSite').value, t: tempoForm }) });
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j || {} }; });
      }).then(function (res) {
        clearTimeout(tempo); enviando = false; botao(tipo, false);
        if (res.s === 200 && res.j.ok) {
          $('tcProt').textContent = res.j.protocolo || '';
          $('tcFimTit').textContent = tipo === 'profissional' ? 'Recebemos o seu currículo.' : 'Recebemos o seu cadastro.';
          $('tcFimTxt').textContent = (res.j.confirmacao ? 'Se o e-mail ' + email + ' estiver correto, a confirmação com o protocolo chega em instantes. ' : '')
            + 'Nossa equipe vai analisar as informações e, se o ' + (tipo === 'profissional' ? 'perfil for selecionado' : 'cadastro for aprovado') + ', entraremos em contato.';
          forms.profissional.reset(); forms.fornecedor.reset(); arquivos.profissional = arquivos.fornecedor = null;
          $('tcPCvNome').textContent = $('tcFArqNome').textContent = 'Escolher arquivo';
          esc.hidden = true; fim.hidden = false; fim.focus();
          window.scrollTo({ top: Math.max(0, fim.getBoundingClientRect().top + window.pageYOffset - 120), behavior: 'smooth' });
          return;
        }
        if (res.s === 413) { erro(tipo, 'O arquivo é grande demais.', alvo(tipo, 'arquivo')); return; }
        if (res.s === 400 && res.j.campo) { erro(tipo, res.j.erro || 'Confira os dados.', alvo(tipo, res.j.campo)); return; }
        erro(tipo, (res.j.erro || 'Não foi possível enviar agora.') + (res.s >= 500 || res.s === 429 ? '' : ' Tente de novo ou escreva para contato@engparente.com.br.'));
      }).catch(function () {
        clearTimeout(tempo); enviando = false; botao(tipo, false);
        erro(tipo, 'Não foi possível enviar agora (sem conexão com o servidor). Tente de novo em alguns minutos.');
      });
    });
  });
  $('tcNovo').addEventListener('click', function () { fim.hidden = true; esc.hidden = false; mostradoEm = { profissional: 0, fornecedor: 0 }; escolher('fornecedor', false); var b = document.querySelector('.tc-tipo'); if (b) b.focus(); });
})();
