/* www.engparente.com.br - janela "Solicitar proposta".
 * 19/10/2026: a solicitacao vai DIRETO para a ENG PARENTE pelo sistema de gestao (WhatsApp continua como opcao).
 * 22/10/2026 (cofre, ponta a ponta): os dados sao TRANCADOS AQUI, no navegador do visitante (js/cofre.js), com as chaves
 * publicas da equipe fixadas no codigo do site (js/chaves.js), antes de sair do aparelho. O servidor, o banco e o e-mail de
 * aviso so veem um cofre fechado; abre so no GESTAO, com a frase de chave de quem tem acesso. Em aberto vao so o servico
 * (lista fixa), o idioma da pagina e, se informado, o e-mail para a confirmacao (o servidor usa so para mandar a
 * confirmacao e nao grava).
 * 30/10/2026: site em 3 idiomas (pt, en, es) - o mesmo arquivo serve as 3 versoes; o valor do servico enviado continua em
 * portugues (lista do GESTAO), so o rotulo muda. A confirmacao por e-mail sai no idioma da pagina.
 * Sem criptografia disponivel (navegador muito antigo), NADA e enviado: aparecem o WhatsApp e o e-mail. */
(function () {
  'use strict';
  var WPP = '5521971441934', MAIL = 'contato@engparente.com.br';
  var L = String(document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase(); if (!/^(pt|en|es)$/.test(L)) L = 'pt';
  var T = {
    pt: { tit: 'Conte o que você precisa', eyb: 'SOLICITAR PROPOSTA', servico: 'Escolha o serviço.', nome: 'Informe o seu nome.', tel: 'Informe um telefone com DDD.',
      email: 'Confira o e-mail informado.', desc: 'Descreva rapidamente o que você precisa.', consent: 'Marque a autorização para usarmos os dados na resposta.',
      semCofre: 'Este navegador não permite o envio protegido.', alt: ' Se preferir, use o WhatsApp ou envie por e-mail.', enviando: 'ENVIANDO…', enviar: 'ENVIAR SOLICITAÇÃO',
      ok1: 'Nossa equipe vai analisar e retornar em breve pelo telefone', ok2: ' ou e-mail', ok3: ' informado.',
      conf: function (e) { return ' Se o e-mail ' + e + ' estiver correto, a confirmação com o protocolo chega em instantes.'; },
      okEyb: 'SOLICITAÇÃO ENVIADA', okTit: 'Recebemos sua solicitação.', confira: 'Confira os dados.', falha: 'Não foi possível enviar agora.',
      semRede: 'Não foi possível enviar agora (sem conexão com o servidor).',
      w: ['Olá! Gostaria de solicitar uma proposta.', 'Serviço: ', 'Nome: ', 'Empresa: ', 'Telefone: ', 'E-mail: ', 'Local da obra: ', 'Descrição:'], assunto: 'Solicitação de proposta — ' },
    en: { tit: 'Tell us what you need', eyb: 'REQUEST A PROPOSAL', servico: 'Choose a service.', nome: 'Please enter your name.', tel: 'Please enter a phone number with country and area code.',
      email: 'Please check the email address.', desc: 'Briefly describe what you need.', consent: 'Please check the authorization so we can use your information to respond.',
      semCofre: 'This browser does not support protected submission.', alt: ' If you prefer, use WhatsApp or send us an email.', enviando: 'SENDING…', enviar: 'SEND REQUEST',
      ok1: 'Our team will review your request and get back to you shortly by phone', ok2: ' or email', ok3: '.',
      conf: function (e) { return ' If ' + e + ' is correct, a confirmation with the reference number will arrive in a moment.'; },
      okEyb: 'REQUEST SENT', okTit: 'We have received your request.', confira: 'Please check your information.', falha: 'We could not send your request right now.',
      semRede: 'We could not send your request right now (no connection to the server).',
      w: ['Hello! I would like to request a proposal.', 'Service: ', 'Name: ', 'Company: ', 'Phone: ', 'Email: ', 'Project location: ', 'Description:'], assunto: 'Proposal request — ' },
    es: { tit: 'Cuéntenos qué necesita', eyb: 'SOLICITAR PROPUESTA', servico: 'Elija el servicio.', nome: 'Informe su nombre.', tel: 'Informe un teléfono con código de país y de área.',
      email: 'Revise el correo electrónico informado.', desc: 'Describa brevemente lo que necesita.', consent: 'Marque la autorización para que usemos los datos en la respuesta.',
      semCofre: 'Este navegador no permite el envío protegido.', alt: ' Si lo prefiere, use WhatsApp o envíe un correo electrónico.', enviando: 'ENVIANDO…', enviar: 'ENVIAR SOLICITUD',
      ok1: 'Nuestro equipo analizará su solicitud y le responderá en breve por teléfono', ok2: ' o correo electrónico', ok3: '.',
      conf: function (e) { return ' Si el correo ' + e + ' es correcto, la confirmación con el número de solicitud llegará en unos instantes.'; },
      okEyb: 'SOLICITUD ENVIADA', okTit: 'Recibimos su solicitud.', confira: 'Revise los datos.', falha: 'No fue posible enviar ahora.',
      semRede: 'No fue posible enviar ahora (sin conexión con el servidor).',
      w: ['¡Hola! Quisiera solicitar una propuesta.', 'Servicio: ', 'Nombre: ', 'Empresa: ', 'Teléfono: ', 'Correo electrónico: ', 'Ubicación de la obra: ', 'Descripción:'], assunto: 'Solicitud de propuesta — ' }
  }[L];
  var m = document.querySelector('meta[name="ep-api"]'), API = m ? m.getAttribute('content') : '';
  var ov = document.getElementById('ppOv'); if (!ov) return;
  var form = document.getElementById('ppForm'), erro = document.getElementById('ppErro'), fim = document.getElementById('ppFim');
  var ultimo = null, abertoEm = 0, enviando = false;
  function $(id) { return document.getElementById(id); }
  function conta(e) { try { if (window.EPContador) window.EPContador.evento(e); } catch (x) { } }
  function focaveis() { return Array.prototype.slice.call(ov.querySelectorAll('button, input, select, textarea, [href]')).filter(function (e) { return !e.disabled && e.offsetParent !== null && e.tabIndex >= 0; }); }
  function limpar() {
    form.reset(); form.hidden = false; fim.hidden = true; $('ppTit').textContent = T.tit; $('ppEyb').textContent = T.eyb; $('ppMail').hidden = true; erro.classList.remove('on');
    Array.prototype.forEach.call(form.querySelectorAll('.pp-inv'), function (e) { e.classList.remove('pp-inv'); });
  }
  function abrir(ev) {
    if (ev) ev.preventDefault();
    if (!fim.hidden) limpar(); // depois de um envio, a janela volta em branco
    ultimo = document.activeElement;
    var sv = ev && ev.currentTarget && ev.currentTarget.getAttribute ? ev.currentTarget.getAttribute('data-servico') : '';
    if (sv) { var sel = $('ppServico'); for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === sv) { sel.selectedIndex = i; break; } }
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
  // telefone: no site em portugues, DDD + numero (10 a 13 digitos, com ou sem 55); em ingles e espanhol, numero internacional (8 a 15)
  function telOk(v) { var n = String(v || '').replace(/\D/g, '').length; return L === 'pt' ? n >= 10 && n <= 13 : n >= 8 && n <= 15; }
  function coletar() {
    erro.classList.remove('on');
    var sel = $('ppServico'), serv = sel.value;
    var d = { serv: serv, servRot: serv && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : '', nome: limpo($('ppNome').value), empresa: limpo($('ppEmpresa').value), tel: limpo($('ppTel').value),
              email: limpo($('ppEmail').value).toLowerCase(), local: limpo($('ppLocal').value), desc: String($('ppDesc').value || '').trim() };
    if (!serv) { mostrarErro(T.servico, $('ppServico')); return null; }
    if (d.nome.length < 3) { mostrarErro(T.nome, $('ppNome')); return null; }
    if (!telOk(d.tel)) { mostrarErro(T.tel, $('ppTel')); return null; }
    if (d.email && !/^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]{2,}$/.test(d.email)) { mostrarErro(T.email, $('ppEmail')); return null; }
    if (d.desc.length < 10) { mostrarErro(T.desc, $('ppDesc')); return null; }
    return d;
  }
  function texto(d) {
    var w = T.w, l = [w[0], '', w[1] + d.servRot, w[2] + d.nome];
    if (d.empresa) l.push(w[3] + d.empresa);
    l.push(w[4] + d.tel);
    if (d.email) l.push(w[5] + d.email);
    if (d.local) l.push(w[6] + d.local);
    l.push('', w[7], d.desc);
    return l.join('\n');
  }
  var CAMPO = { servico: 'ppServico', email: 'ppEmail' };
  function estadoEnvio(on) {
    enviando = on; var b = $('ppEnviar');
    b.disabled = on; b.textContent = on ? T.enviando : T.enviar; form.setAttribute('aria-busy', on ? 'true' : 'false');
  }
  function falhou(msg) { $('ppMail').hidden = false; mostrarErro(msg + T.alt); }
  function podeTrancar() { return !!(window.Cofre && window.crypto && window.crypto.subtle && window.CHAVES_SITE && window.CHAVES_SITE.length && API); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    var d = coletar(); if (!d) return;
    if (!$('ppConsent').checked) { mostrarErro(T.consent, null); $('ppConsent').parentNode.classList.add('pp-inv'); $('ppConsent').focus(); return; }
    if (!podeTrancar()) { falhou(T.semCofre); return; }
    estadoEnvio(true);
    var dados = { servico: d.serv, nome: d.nome, empresa: d.empresa, telefone: d.tel, email: d.email, local: d.local, descricao: d.desc, idioma: L,
      consentimentoEm: new Date().toISOString(), consentimentoTexto: $('ppConsent').parentNode.textContent.replace(/\s+/g, ' ').trim() };
    var tempoForm = Date.now() - abertoEm, ctl = window.AbortController ? new AbortController() : null, tempo = null;
    window.Cofre.trancar(dados, window.CHAVES_SITE).then(function (envelope) {
      dados = null; // o texto aberto nao fica guardado na pagina
      var corpo = { servico: d.serv, envelope: envelope, email: d.email, consentimento: true, idioma: L, website: $('ppSite').value, t: tempoForm };
      tempo = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);
      return fetch(API + '/proposta?l=' + L, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo), signal: ctl ? ctl.signal : undefined, credentials: 'omit', referrerPolicy: 'no-referrer' });
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { s: r.status, j: j || {} }; }); })
      .then(function (res) {
        clearTimeout(tempo); estadoEnvio(false);
        if (res.s === 200 && res.j.ok) {
          $('ppProt').textContent = res.j.protocolo || '';
          $('ppFimTxt').textContent = T.ok1 + (d.email ? T.ok2 : '') + T.ok3 + (res.j.confirmacao ? T.conf(d.email) : '');
          $('ppEyb').textContent = T.okEyb; $('ppTit').textContent = T.okTit;
          form.reset(); form.hidden = true; fim.hidden = false; $('ppTit').focus();
          return;
        }
        if (res.s === 400 && res.j.campo && CAMPO[res.j.campo]) { mostrarErro(res.j.erro || T.confira, $(CAMPO[res.j.campo])); return; }
        falhou(res.j.erro || T.falha);
      })
      .catch(function () { clearTimeout(tempo); estadoEnvio(false); falhou(T.semRede); });
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
    var assunto = T.assunto + d.servRot + (d.empresa ? ' — ' + d.empresa : '');
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(texto(d));
  });
})();
