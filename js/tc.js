/* www.engparente.com.br - "Trabalhe conosco" (22/10/2026, pedido do Andre; modelo aprovado no canvas).
 * Profissional (curriculo em PDF ate 5 MB) ou fornecedor (apresentacao em PDF opcional ate 10 MB, tipo e especialidade
 * da mesma lista do GESTAO). Tudo - dados e PDF - e TRANCADO AQUI, neste navegador (js/cofre.js), com as chaves publicas
 * da equipe fixadas no codigo do site (js/chaves.js), antes de sair do aparelho. O servidor so recebe o cofre fechado e,
 * em aberto, o tipo e o e-mail para mandar a confirmacao com o protocolo (o servidor nao grava o e-mail).
 * Sem criptografia disponivel, NADA e enviado.
 * 30/10/2026: site em 3 idiomas (pt, en, es) - o mesmo arquivo serve as 3 versoes; os valores das listas (area, tipo,
 * especialidade) continuam em portugues (lista do GESTAO), so o rotulo muda; a confirmacao sai no idioma da pagina. */
(function () {
  'use strict';
  var m = document.querySelector('meta[name="ep-api"]'), API = m ? m.getAttribute('content') : '';
  var L = String(document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase(); if (!/^(pt|en|es)$/.test(L)) L = 'pt';
  var T = {
    pt: { arq: 'Escolher arquivo', tam: function (a, b) { return 'O PDF tem ' + a + ' MB: o limite é ' + b + ' MB.'; }, vazio: 'Arquivo vazio ou inválido.', pdf: 'Envie o arquivo em PDF.',
      ler: 'Não foi possível ler o arquivo.', nomeC: 'Informe o seu nome completo.', email: 'Confira o e-mail informado.', tel: 'Informe um telefone com DDD.',
      area: 'Escolha a área de atuação.', linkedin: 'Confira o endereço do LinkedIn (https://www.linkedin.com/in/...).', cv: 'Anexe o seu currículo em PDF (até 5 MB).',
      consP: 'Marque a autorização para guardarmos o currículo.', razao: 'Informe a razão social.', cnpj: 'Confira o CNPJ (os dígitos verificadores não conferem).',
      contato: 'Informe o nome do contato.', tipo: 'Escolha o tipo de fornecimento.', esp: 'Escolha a especialidade.', consF: 'Marque a autorização para guardarmos os dados.',
      enviando: 'PROTEGENDO E ENVIANDO…', semCofre: 'Este navegador não permite o envio protegido. Atualize o navegador ou escreva para contato@engparente.com.br.',
      okP: 'Recebemos o seu currículo.', okF: 'Recebemos o seu cadastro.', conf: function (e) { return 'Se o e-mail ' + e + ' estiver correto, a confirmação com o protocolo chega em instantes. '; },
      seguir: function (p) { return 'Nossa equipe vai analisar as informações e, se o ' + (p ? 'perfil for selecionado' : 'cadastro for aprovado') + ', entraremos em contato.'; },
      grande: 'O arquivo é grande demais.', confira: 'Confira os dados.', falha: 'Não foi possível enviar agora.', tente: ' Tente de novo ou escreva para contato@engparente.com.br.',
      semRede: 'Não foi possível enviar agora (sem conexão com o servidor). Tente de novo em alguns minutos.', dec: ',' },
    en: { arq: 'Choose file', tam: function (a, b) { return 'The PDF is ' + a + ' MB: the limit is ' + b + ' MB.'; }, vazio: 'Empty or invalid file.', pdf: 'Please send the file as a PDF.',
      ler: 'The file could not be read.', nomeC: 'Please enter your full name.', email: 'Please check the email address.', tel: 'Please enter a phone number with country and area code.',
      area: 'Choose your field of work.', linkedin: 'Please check the LinkedIn address (https://www.linkedin.com/in/...).', cv: 'Attach your résumé as a PDF (up to 5 MB).',
      consP: 'Please check the authorization so we can keep your résumé.', razao: 'Please enter the legal company name.', cnpj: 'Please check the CNPJ (the check digits do not match).',
      contato: 'Please enter the contact name.', tipo: 'Choose the type of supply.', esp: 'Choose the specialty.', consF: 'Please check the authorization so we can keep your information.',
      enviando: 'PROTECTING AND SENDING…', semCofre: 'This browser does not support protected submission. Please update your browser or write to contato@engparente.com.br.',
      okP: 'We have received your résumé.', okF: 'We have received your registration.', conf: function (e) { return 'If ' + e + ' is correct, a confirmation with the reference number will arrive in a moment. '; },
      seguir: function (p) { return 'Our team will review the information and, if your ' + (p ? 'profile is selected' : 'registration is approved') + ', we will contact you.'; },
      grande: 'The file is too large.', confira: 'Please check your information.', falha: 'We could not send it right now.', tente: ' Please try again or write to contato@engparente.com.br.',
      semRede: 'We could not send it right now (no connection to the server). Please try again in a few minutes.', dec: '.' },
    es: { arq: 'Elegir archivo', tam: function (a, b) { return 'El PDF tiene ' + a + ' MB: el límite es ' + b + ' MB.'; }, vazio: 'Archivo vacío o no válido.', pdf: 'Envíe el archivo en PDF.',
      ler: 'No fue posible leer el archivo.', nomeC: 'Informe su nombre completo.', email: 'Revise el correo electrónico informado.', tel: 'Informe un teléfono con código de país y de área.',
      area: 'Elija el área de actuación.', linkedin: 'Revise la dirección de LinkedIn (https://www.linkedin.com/in/...).', cv: 'Adjunte su currículum en PDF (hasta 5 MB).',
      consP: 'Marque la autorización para que conservemos su currículum.', razao: 'Informe la razón social.', cnpj: 'Revise el CNPJ (los dígitos verificadores no coinciden).',
      contato: 'Informe el nombre del contacto.', tipo: 'Elija el tipo de suministro.', esp: 'Elija la especialidad.', consF: 'Marque la autorización para que conservemos los datos.',
      enviando: 'PROTEGIENDO Y ENVIANDO…', semCofre: 'Este navegador no permite el envío protegido. Actualice el navegador o escriba a contato@engparente.com.br.',
      okP: 'Recibimos su currículum.', okF: 'Recibimos su registro.', conf: function (e) { return 'Si el correo ' + e + ' es correcto, la confirmación con el número de solicitud llegará en unos instantes. '; },
      seguir: function (p) { return 'Nuestro equipo analizará la información y, si ' + (p ? 'su perfil es seleccionado' : 'el registro es aprobado') + ', nos pondremos en contacto.'; },
      grande: 'El archivo es demasiado grande.', confira: 'Revise los datos.', falha: 'No fue posible enviar ahora.', tente: ' Intente de nuevo o escriba a contato@engparente.com.br.',
      semRede: 'No fue posible enviar ahora (sin conexión con el servidor). Intente de nuevo en unos minutos.', dec: ',' }
  }[L];
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
      limparErro(tipo); arquivos[tipo] = null; rot.textContent = T.arq;
      var f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > MAX[tipo]) { inp.value = ''; erro(tipo, T.tam((f.size / 1048576).toFixed(1).replace('.', T.dec), MAX[tipo] / 1048576), caixa); return; }
      if (f.size < 100) { inp.value = ''; erro(tipo, T.vazio, caixa); return; }
      f.slice(0, 5).arrayBuffer().then(function (b) {
        var u = new Uint8Array(b);
        if (String.fromCharCode.apply(null, u) !== '%PDF-') { inp.value = ''; erro(tipo, T.pdf, caixa); return; }
        arquivos[tipo] = f; rot.textContent = f.name.length > 60 ? f.name.slice(0, 57) + '…' : f.name;
      }).catch(function () { inp.value = ''; erro(tipo, T.ler, caixa); });
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
  // telefone: no site em portugues, DDD + numero (10 a 13 digitos, com ou sem 55); em ingles e espanhol, numero internacional (8 a 15)
  function telOk(v) { var n = String(v || '').replace(/\D/g, '').length; return L === 'pt' ? n >= 10 && n <= 13 : n >= 8 && n <= 15; }
  function coletar(tipo) {
    limparErro(tipo);
    var d;
    if (tipo === 'profissional') {
      d = { tipo: tipo, nome: limpo($('tcPNome').value, 100), email: limpo($('tcPEmail').value, 120).toLowerCase(), telefone: limpo($('tcPTel').value, 20),
        cidade: limpo($('tcPCidade').value, 80), area: $('tcPArea').value, registro: limpo($('tcPReg').value, 60), linkedin: limpo($('tcPLink').value, 200) };
      if (d.nome.length < 3) return erro(tipo, T.nomeC, $('tcPNome'));
      if (!RE_EMAIL.test(d.email)) return erro(tipo, T.email, $('tcPEmail'));
      if (!telOk(d.telefone)) return erro(tipo, T.tel, $('tcPTel'));
      if (!d.area) return erro(tipo, T.area, $('tcPArea'));
      if (d.linkedin && !/^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/\S{2,190}$/i.test(d.linkedin)) return erro(tipo, T.linkedin, $('tcPLink'));
      if (!arquivos.profissional) return erro(tipo, T.cv, $('tcPCv').closest('.tc-arq'));
      if (!$('tcPConsent').checked) return erro(tipo, T.consP, $('tcPConsent').closest('.tc-ck'));
      d.consentimentoTexto = $('tcPConsent').parentNode.textContent.replace(/\s+/g, ' ').trim();
    } else {
      d = { tipo: tipo, razao: limpo($('tcFRazao').value, 150), cnpj: cnpjFormatado($('tcFCnpj').value), contato: limpo($('tcFContato').value, 100),
        email: limpo($('tcFEmail').value, 120).toLowerCase(), telefone: limpo($('tcFTel').value, 20), tipoFornecimento: $('tcFTipo').value, especialidade: $('tcFEsp').value,
        regiao: limpo($('tcFReg').value, 120), descricao: String($('tcFDesc').value || '').trim().slice(0, 800) };
      if (d.razao.length < 2) return erro(tipo, T.razao, $('tcFRazao'));
      if (!cnpjValido(d.cnpj)) return erro(tipo, T.cnpj, $('tcFCnpj'));
      if (d.contato.length < 3) return erro(tipo, T.contato, $('tcFContato'));
      if (!RE_EMAIL.test(d.email)) return erro(tipo, T.email, $('tcFEmail'));
      if (!telOk(d.telefone)) return erro(tipo, T.tel, $('tcFTel'));
      if (!d.tipoFornecimento) return erro(tipo, T.tipo, $('tcFTipo'));
      if (!d.especialidade) return erro(tipo, T.esp, $('tcFEsp'));
      if (!$('tcFConsent').checked) return erro(tipo, T.consF, $('tcFConsent').closest('.tc-ck'));
      d.consentimentoTexto = $('tcFConsent').parentNode.textContent.replace(/\s+/g, ' ').trim();
    }
    d.consentimentoEm = new Date().toISOString(); d.idioma = L;
    return d;
  }

  /* ---------------------------------------------------------------- envio */
  function botao(tipo, on) {
    var b = forms[tipo].querySelector('.tc-b1');
    if (!b._txt) b._txt = b.innerHTML;
    b.disabled = on; if (on) b.textContent = T.enviando; else b.innerHTML = b._txt;
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
        erro(tipo, T.semCofre); return;
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
        return fetch(API + '/cadastro?l=' + L, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctl ? ctl.signal : undefined,
          body: JSON.stringify({ tipo: tipo, envelope: envelope, email: email, consentimento: true, idioma: L, website: $(tipo === 'profissional' ? 'tcPSite' : 'tcFSite').value, t: tempoForm }) });
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j || {} }; });
      }).then(function (res) {
        clearTimeout(tempo); enviando = false; botao(tipo, false);
        if (res.s === 200 && res.j.ok) {
          $('tcProt').textContent = res.j.protocolo || '';
          $('tcFimTit').textContent = tipo === 'profissional' ? T.okP : T.okF;
          $('tcFimTxt').textContent = (res.j.confirmacao ? T.conf(email) : '') + T.seguir(tipo === 'profissional');
          forms.profissional.reset(); forms.fornecedor.reset(); arquivos.profissional = arquivos.fornecedor = null;
          $('tcPCvNome').textContent = $('tcFArqNome').textContent = T.arq;
          esc.hidden = true; fim.hidden = false; fim.focus();
          window.scrollTo({ top: Math.max(0, fim.getBoundingClientRect().top + window.pageYOffset - 120), behavior: 'smooth' });
          return;
        }
        if (res.s === 413) { erro(tipo, T.grande, alvo(tipo, 'arquivo')); return; }
        if (res.s === 400 && res.j.campo) { erro(tipo, res.j.erro || T.confira, alvo(tipo, res.j.campo)); return; }
        erro(tipo, (res.j.erro || T.falha) + (res.s >= 500 || res.s === 429 ? '' : T.tente));
      }).catch(function () {
        clearTimeout(tempo); enviando = false; botao(tipo, false);
        erro(tipo, T.semRede);
      });
    });
  });
  $('tcNovo').addEventListener('click', function () { fim.hidden = true; esc.hidden = false; mostradoEm = { profissional: 0, fornecedor: 0 }; escolher('fornecedor', false); var b = document.querySelector('.tc-tipo'); if (b) b.focus(); });
})();
