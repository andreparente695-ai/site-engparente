/* cofre.js - criptografia de ponta a ponta do site e do GESTAO (22/10/2026, pedido do Andre: "precisa ser perfeito e jamais
 * vazar informacoes"). Roda no NAVEGADOR (Web Crypto, sem biblioteca externa) e tambem no Node 22 (testes).
 *
 *  - Cada aprovador tem um par de chaves RSA-OAEP 3072 / SHA-256 gerado no proprio navegador. A chave PRIVADA sai do
 *    navegador so trancada por AES-256-GCM com uma chave derivada da "senha de chave" (PBKDF2-SHA256, 600.000 rodadas,
 *    sal aleatorio): o servidor guarda esse pacote, mas sem a senha ele nao serve para nada. A senha nunca sai do navegador.
 *  - O site tranca cada envio com uma chave AES-256-GCM nova (aleatoria) e embala essa chave para CADA aprovador com a
 *    chave PUBLICA dele. As chaves publicas usadas pelo site vem do proprio codigo do site (GitHub), nao do servidor.
 *  - Formato do envelope (JSON): { v: 1, alg, iv, ct, k: { <idChave>: <chave AES embalada> }, arq?: { iv, ct } }
 *    (base64 em tudo; o arquivo, quando ha, vai cifrado a parte com a mesma chave AES e outro iv).
 *  - idChave = 32 primeiros hex (128 bits) do SHA-256 da chave publica (SPKI): impressao digital para conferir na tela.
 *  - 22/10/2026 (revisao de seguranca): o pacote da chave privada fica PRESO a chave publica (dado adicional do AES-GCM =
 *    SHA-256 da chave publica) e, ao abrir, o par e testado (cifra com a publica e decifra com a privada). Assim ninguem
 *    com acesso ao banco consegue trocar a chave publica de uma pessoa mantendo a privada dela: a abertura falha.
 */
(function (raiz) {
  'use strict';
  var C = (raiz.crypto && raiz.crypto.subtle) ? raiz.crypto : null;
  var ALG = 'RSA-OAEP-3072-SHA256/AES-256-GCM';
  var PBKDF2_ITER = 600000;
  var RSA = { name: 'RSA-OAEP', modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' };

  function exigir() { if (!C) throw new Error('Este navegador não tem criptografia segura (Web Crypto). Atualize o navegador.'); }
  function b64(buf) {
    var u = buf instanceof Uint8Array ? buf : new Uint8Array(buf), s = '', i, P = 0x8000;
    for (i = 0; i < u.length; i += P) s += String.fromCharCode.apply(null, u.subarray(i, i + P));
    return (typeof btoa === 'function') ? btoa(s) : Buffer.from(s, 'binary').toString('base64');
  }
  function deB64(s) {
    if (typeof s !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4) throw new Error('base64 inválido');
    var bin = (typeof atob === 'function') ? atob(s) : Buffer.from(s, 'base64').toString('binary');
    var u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function aleatorio(n) { var u = new Uint8Array(n); C.getRandomValues(u); return u; }
  var enc = new TextEncoder(), dec = new TextDecoder();

  async function idDaChave(spkiB64) { return hex(await C.subtle.digest('SHA-256', deB64(spkiB64))).slice(0, 32); }
  async function aadDaChave(spkiB64) { return new Uint8Array(await C.subtle.digest('SHA-256', deB64(spkiB64))); }
  async function importarPublica(spkiB64) { return C.subtle.importKey('spki', deB64(spkiB64), RSA, false, ['encrypt']); }
  async function kekDaSenha(senha, sal, iter) {
    var base = await C.subtle.importKey('raw', enc.encode(String(senha).normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
    return C.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  /* Frase de chave: 16+ caracteres, com letras e numeros ou simbolos, sem ser repeticao boba */
  function senhaFraca(s) {
    s = String(s || '');
    if (s.length < 16) return 'Use pelo menos 16 caracteres (uma frase curta, por exemplo).';
    if (!/\p{L}/u.test(s) || !/[\p{N}\p{P}\p{S}\s]/u.test(s)) return 'Misture letras com números ou símbolos.';
    if (/^(.)\1+$/.test(s) || /^(0123|1234|abcd|qwer|senha|password)/i.test(s)) return 'Senha fácil demais de adivinhar.';
    return '';
  }

  /* Cria o par de chaves do aprovador. Devolve o que o servidor guarda: { id, spki, priv: {alg, iter, sal, iv, ct} } */
  async function criarChave(senha) {
    exigir();
    var f = senhaFraca(senha); if (f) throw new Error(f);
    var par = await C.subtle.generateKey(RSA, true, ['encrypt', 'decrypt']);
    var spki = b64(await C.subtle.exportKey('spki', par.publicKey));
    var pkcs8 = await C.subtle.exportKey('pkcs8', par.privateKey);
    var sal = aleatorio(16), iv = aleatorio(12);
    var kek = await kekDaSenha(senha, sal, PBKDF2_ITER);
    var ct = await C.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: await aadDaChave(spki) }, kek, pkcs8);
    new Uint8Array(pkcs8).fill(0);
    return { id: await idDaChave(spki), spki: spki, priv: { alg: 'PBKDF2-SHA256/AES-256-GCM', aad: 'sha256-spki', iter: PBKDF2_ITER, sal: b64(sal), iv: b64(iv), ct: b64(ct) } };
  }
  /* Abre a chave privada com a senha (fica so na memoria da aba, nao exportavel). Senha errada -> erro claro. */
  async function abrirChave(pacote, senha) {
    exigir();
    if (!pacote || !pacote.priv || !pacote.spki) throw new Error('Chave inválida.');
    var p = pacote.priv, iter = Number(p.iter);
    if (!(iter >= 600000 && iter <= 5000000) || p.aad !== 'sha256-spki') throw new Error('Chave inválida.');
    var id = await idDaChave(pacote.spki);
    if (pacote.id && pacote.id !== id) throw new Error('Chave inválida.');
    var kek = await kekDaSenha(senha, deB64(p.sal), iter);
    var pkcs8;
    try { pkcs8 = await C.subtle.decrypt({ name: 'AES-GCM', iv: deB64(p.iv), additionalData: await aadDaChave(pacote.spki) }, kek, deB64(p.ct)); }
    catch (e) { throw new Error('Senha de chave incorreta.'); }
    var priv;
    try { priv = await C.subtle.importKey('pkcs8', pkcs8, RSA, false, ['decrypt']); }
    finally { new Uint8Array(pkcs8).fill(0); }
    // teste do par: o que a chave publica tranca, a privada tem de abrir
    var teste = aleatorio(32), volta;
    try { volta = new Uint8Array(await C.subtle.decrypt({ name: 'RSA-OAEP' }, priv, await C.subtle.encrypt({ name: 'RSA-OAEP' }, await importarPublica(pacote.spki), teste))); }
    catch (e) { throw new Error('Chave inválida (a parte pública não confere com a privada).'); }
    if (volta.length !== teste.length || !volta.every(function (x, i) { return x === teste[i]; })) throw new Error('Chave inválida (a parte pública não confere com a privada).');
    return { id: id, priv: priv };
  }

  /* Troca a senha de chave: abre o pacote com a senha atual e tranca de novo com a nova (mesma chave, mesma impressao
     digital; os envios continuam abrindo). Devolve o pacote novo { id, spki, priv }. */
  async function trocarSenha(pacote, senhaAtual, senhaNova) {
    exigir();
    var f = senhaFraca(senhaNova); if (f) throw new Error(f);
    await abrirChave(pacote, senhaAtual); // confere a senha atual e a impressao digital
    var p = pacote.priv, aad = await aadDaChave(pacote.spki);
    var pkcs8 = await C.subtle.decrypt({ name: 'AES-GCM', iv: deB64(p.iv), additionalData: aad }, await kekDaSenha(senhaAtual, deB64(p.sal), Number(p.iter)), deB64(p.ct));
    var sal = aleatorio(16), iv = aleatorio(12);
    var ct = await C.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: aad }, await kekDaSenha(senhaNova, sal, PBKDF2_ITER), pkcs8);
    new Uint8Array(pkcs8).fill(0);
    return { id: await idDaChave(pacote.spki), spki: pacote.spki, priv: { alg: 'PBKDF2-SHA256/AES-256-GCM', aad: 'sha256-spki', iter: PBKDF2_ITER, sal: b64(sal), iv: b64(iv), ct: b64(ct) } };
  }

  /* Tranca um objeto (e um arquivo opcional {nome,tipo,bytes:Uint8Array}) para a lista de chaves publicas [{id,spki}] */
  async function trancar(obj, chavesPublicas, arquivo) {
    exigir();
    if (!Array.isArray(chavesPublicas) || !chavesPublicas.length) throw new Error('Nenhuma chave de destino.');
    var aes = aleatorio(32), k = {};
    for (var i = 0; i < chavesPublicas.length; i++) {
      var cp = chavesPublicas[i], id = await idDaChave(cp.spki);
      if (cp.id && cp.id !== id) throw new Error('Chave pública não confere com a impressão digital.');
      k[id] = b64(await C.subtle.encrypt({ name: 'RSA-OAEP' }, await importarPublica(cp.spki), aes));
    }
    var chave = await C.subtle.importKey('raw', aes, { name: 'AES-GCM' }, false, ['encrypt']);
    aes.fill(0);
    var dados = Object.assign({}, obj);
    var env = { v: 1, alg: ALG, k: k };
    if (arquivo && arquivo.bytes) {
      dados.__arquivo = { nome: String(arquivo.nome || 'arquivo'), tipo: String(arquivo.tipo || 'application/octet-stream'), tamanho: arquivo.bytes.length };
      var iva = aleatorio(12);
      env.arq = { iv: b64(iva), ct: b64(await C.subtle.encrypt({ name: 'AES-GCM', iv: iva, additionalData: enc.encode('arq') }, chave, arquivo.bytes)) };
    }
    var iv = aleatorio(12);
    env.iv = b64(iv);
    env.ct = b64(await C.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: enc.encode('dados') }, chave, enc.encode(JSON.stringify(dados))));
    return env;
  }
  async function _aesDoEnvelope(env, minha) {
    if (!env || env.v !== 1 || !env.k) throw new Error('Envelope inválido.');
    var emb = env.k[minha.id];
    if (!emb) throw new Error('Este cadastro não foi liberado para a sua chave.');
    var raw;
    try { raw = new Uint8Array(await C.subtle.decrypt({ name: 'RSA-OAEP' }, minha.priv, deB64(emb))); }
    catch (e) { throw new Error('Não foi possível abrir com a sua chave.'); }
    return raw;
  }
  /* Abre o envelope: { dados, arquivo?: {nome,tipo,bytes} } */
  async function abrir(env, minha) {
    exigir();
    var raw = await _aesDoEnvelope(env, minha);
    var chave = await C.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
    raw.fill(0);
    var dados;
    try { dados = JSON.parse(dec.decode(await C.subtle.decrypt({ name: 'AES-GCM', iv: deB64(env.iv), additionalData: enc.encode('dados') }, chave, deB64(env.ct)))); }
    catch (e) { throw new Error('Conteúdo alterado ou corrompido.'); }
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw new Error('Conteúdo inválido.');
    var info = dados.__arquivo && typeof dados.__arquivo === 'object' ? dados.__arquivo : null;
    delete dados.__arquivo;
    /* arquivoInfo: nome, tipo e tamanho do anexo (vem dentro dos dados trancados); o arquivo em si so quando env.arq vem junto */
    var out = { dados: dados, arquivoInfo: info ? { nome: String(info.nome || 'arquivo'), tipo: String(info.tipo || ''), tamanho: Number(info.tamanho) || 0 } : null };
    if (env.arq && info) {
      var bytes;
      try { bytes = new Uint8Array(await C.subtle.decrypt({ name: 'AES-GCM', iv: deB64(env.arq.iv), additionalData: enc.encode('arq') }, chave, deB64(env.arq.ct))); }
      catch (e) { throw new Error('Arquivo alterado ou corrompido.'); }
      out.arquivo = { nome: out.arquivoInfo.nome, tipo: out.arquivoInfo.tipo, bytes: bytes };
    }
    return out;
  }
  /* Libera um envelope ja existente para outra chave publica (novo aprovador): devolve { id, embalada } para gravar em k */
  async function liberarPara(env, minha, chavePublica) {
    exigir();
    var raw = await _aesDoEnvelope(env, minha);
    var id = await idDaChave(chavePublica.spki);
    if (chavePublica.id && chavePublica.id !== id) throw new Error('Chave pública não confere com a impressão digital.');
    var emb = b64(await C.subtle.encrypt({ name: 'RSA-OAEP' }, await importarPublica(chavePublica.spki), raw));
    raw.fill(0);
    return { id: id, embalada: emb };
  }

  var api = { ALG: ALG, PBKDF2_ITER: PBKDF2_ITER, senhaFraca: senhaFraca, criarChave: criarChave, abrirChave: abrirChave, trancar: trancar, abrir: abrir,
    liberarPara: liberarPara, trocarSenha: trocarSenha, idDaChave: idDaChave, b64: b64, deB64: deB64 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.Cofre = api;
})(typeof window !== 'undefined' ? window : globalThis);
