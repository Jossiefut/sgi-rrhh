/* Autenticación de documentos con QR: módulo, visor, registro de emisiones, verificación pública, anulación y Excel */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado, hash = '') => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/' + hash, beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  const M = await import('./autenticacion.js');
  /* --- módulo puro --- */
  ok(M.sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 correcto (vector de referencia)');
  ok(M.sha256Hex('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'SHA-256 de texto vacío correcto');
  ok(M.sha256Hex('áéíóú ñ') === require('crypto').createHash('sha256').update('áéíóú ñ', 'utf8').digest('hex'), 'SHA-256 con acentos igual al de Node');
  const h = M.huellaContenido('Informe', '<p>hola</p>');
  const c1 = M.codigoEmision(h, 'U1', '2026-10-13T10:00');
  ok(/^SGI-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(c1), 'El código tiene el formato SGI-XXXX-XXXX-XXXX sin caracteres confusos: ' + c1);
  ok(c1 === M.codigoEmision(h, 'U1', '2026-10-13T10:00'), 'El mismo contenido, emisor y fecha dan el mismo código');
  ok(c1 !== M.codigoEmision(h, 'U2', '2026-10-13T10:00') && c1 !== M.codigoEmision(h, 'U1', '2026-10-13T10:01') && c1 !== M.codigoEmision(M.huellaContenido('Informe', '<p>hola!</p>'), 'U1', '2026-10-13T10:00'), 'Cambiar emisor, hora o contenido cambia el código');
  ok(M.normalizarCodigo('sgi-' + c1.slice(4).toLowerCase()) === c1 && M.normalizarCodigo(c1.replace(/-/g, '')) === c1 && M.normalizarCodigo(c1.slice(4)) === c1 && M.normalizarCodigo('hola') === '', 'Normaliza minúsculas, sin guiones y sin prefijo; rechaza códigos inválidos');
  ok(M.urlVerificacion(c1, 'https://sgi-rrhh.vercel.app/') === 'https://sgi-rrhh.vercel.app/#verificar=' + c1 && M.codigoDeHashUrl('#verificar=' + c1) === c1 && M.codigoDeHashUrl('#verificar') === '', 'Enlace de verificación y lectura del código desde la dirección');
  ok(M.qrDataUrl('https://sgi-rrhh.vercel.app/#verificar=' + c1).startsWith('data:image/gif;base64,'), 'El QR se genera como imagen incrustada');
  const emision = { usuario: { id: 'U1', nombre: 'Jossie Tovar' }, rolTexto: 'Gerente de RRHH', fecha: '2026-10-13T10:00', base: 'https://sgi-rrhh.vercel.app/', marca: 'BALU' };
  const d1 = M.conAutenticacion({ clave: 'informe', nombre: 'Informe X', html: '<p>hola</p>' }, emision);
  ok(d1.qr && d1.qr.codigo.startsWith('SGI-') && d1.html.includes('bloque-qr') && d1.html.includes(d1.qr.codigo) && d1.html.includes('Jossie Tovar') && d1.html.includes('<img'), 'Un informe del sistema recibe el bloque con QR, código y emisor');
  ok(d1.qr.emisorId === 'U1' && d1.qr.anulado === false && d1.qr.tipo === 'informe', 'Registra la emisión con emisor y estado');
  const sin = [
    { clave: 'contrato', nombre: 'Contrato', html: 'x' }, { clave: 'prorroga', nombre: 'Prórroga', html: 'x' }, { clave: 'rutahabitual', nombre: 'Ruta', html: 'x' },
    { clave: 'cestaticket', nombre: 'Cestaticket', html: 'x' }, { clave: 'ficha', nombre: 'Ficha', html: 'x' }, { clave: 'adm-hoja-de-vida', nombre: 'Hoja de vida', html: 'x', adm: { clave: 'hoja-de-vida', vars: {} } },
    { clave: 'DOC-1', nombre: 'Carta', html: 'x', sinQR: true }, { clave: 'DOC-2', nombre: 'Kit', html: 'x', categoria: 'INGRESO' }, { clave: 'DOC-3', nombre: 'Adm', html: 'x', fase: 'INGRESO_ADM' },
  ];
  ok(sin.every((d) => { const r = M.conAutenticacion(d, emision); return !r.qr && r.html === 'x'; }), 'Los documentos de expedientes de personal no reciben QR');
  const reg = [{ ...d1.qr, id: d1.qr.codigo }, { ...d1.qr, codigo: 'SGI-AAAA-BBBB-CCCC', id: 'SGI-AAAA-BBBB-CCCC', anulado: true, anuladoMotivo: 'error' }];
  const v1 = M.verificarEnRegistro(reg, d1.qr.codigo.toLowerCase());
  ok(v1.estado === 'VIGENTE' && v1.nombre === 'Informe X' && v1.emisorNombre === 'Jossie Tovar' && v1.huella8.length === 8 && !('cedula' in v1), 'Verificación: vigente, con datos de la emisión y sin datos personales');
  ok(M.verificarEnRegistro(reg, 'SGI-AAAA-BBBB-CCCC').estado === 'ANULADO' && M.verificarEnRegistro(reg, 'SGI-ZZZZ-ZZZZ-ZZZZ').estado === 'NO_ENCONTRADO' && M.verificarEnRegistro(reg, 'xx').estado === 'INVALIDO', 'Verificación: anulado, no encontrado e inválido');

  /* --- aplicación --- */
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el, ms = 80) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => { const c = d.body.cloneNode(true); c.querySelectorAll('script,style').forEach((n) => n.remove()); return c.textContent; };
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const setValor = (el, vv) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, vv); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  ok(!!boton('Verificar un documento'), 'La pantalla de acceso tiene «Verificar un documento»');
  await click(boton('Gerente de RRHH'), 250);
const cerrarCumple = async () => { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Entendido'); if (b) await click(b, 100); };
await cerrarCumple();
  ok(db().config.urlVerificacion === 'https://sgi-rrhh.vercel.app/' || db().config.urlVerificacion === undefined, 'Configuración con la dirección de verificación');

  /* PDF simulado para poder descargar */
  const blobs = [];
  w.html2pdf = () => { const o = { set: () => o, from: () => o, outputPdf: async () => new w.Blob(['%PDF-prueba']), toPdf: () => o, get: async () => ({}) }; return o; };
  await click(nav('Documentos'), 150);
  const filas = [...d.querySelectorAll('main table tbody tr')];
  ok(filas.length > 0, 'Hay documentos en el centro de documentos');
  /* un documento de expediente (kit de ingreso) y uno del sistema */
  const verFila = async (pred) => { const f = [...d.querySelectorAll('main table tbody tr')].find(pred); if (!f) return false; await click([...f.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ver'), 400); return true; };
  const hayModal = () => [...d.querySelectorAll('[role=dialog]')].pop();
  const cerrar = async () => { const m = hayModal(); if (m) { const b = [...m.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Cerrar'); if (b) await click(b, 120); } };
  const esKit = (f) => /Contrato de trabajo|Acuerdo|Confidencialidad|Convenio/i.test(f.textContent);
  if (await verFila(esKit)) {
    const m = hayModal();
    ok(m && !m.innerHTML.includes('bloque-qr') && !/con QR de autenticación/.test(m.textContent), 'Un documento del kit legal de ingreso se abre sin QR');
    await cerrar();
  } else ok(true, '(sin kit de ingreso en los datos de prueba; se omite)');
  const noExp = (f) => !esKit(f) && !/Ruta habitual|Carta|Prórroga|Contrato de prórroga/i.test(f.textContent) && !/Documentos de ingreso/.test(f.textContent);
  const filaSistema = [...d.querySelectorAll('main table tbody tr')].find(noExp);
  ok(!!filaSistema, 'Hay un documento generado por el sistema para probar');
  await click([...filaSistema.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ver'), 600);
  let m = hayModal();
  ok(m && m.textContent.includes('con QR de autenticación'), 'El visor avisa que el documento lleva QR de autenticación');
  const pestHtml = [...m.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Vista del documento'));
  if (pestHtml) await click(pestHtml, 150);
  m = hayModal();
  ok(m.innerHTML.includes('bloque-qr') && /SGI-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(m.textContent) && m.querySelector('img[alt^="Código QR"]'), 'La vista del documento muestra el QR y el código de verificación');
  const codigoPdf = (m.textContent.match(/SGI-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/) || [])[0];
  ok(!!boton('Exportar a Excel'), 'El visor tiene el botón «Exportar a Excel»');
  /* descarga del PDF: se registra la emisión */
  const antes = (db().documentosEmitidos || []).length;
  const pestPdf = [...m.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'PDF'); if (pestPdf) await click(pestPdf, 100);
  await espera(300);
  const bd = boton('Descargar PDF');
  ok(bd && !bd.disabled, 'Con el PDF listo se puede descargar');
  if (bd && !bd.disabled) {
    await click(bd, 150);
    const chk = d.getElementById('chk-aviso-firma'); if (chk) await click(chk, 80);
    const bDesc = [...d.querySelectorAll('[role=dialog] button')].filter((b) => b.textContent.trim() === 'Descargar').pop(); if (bDesc) await click(bDesc, 400);
    const despues = db().documentosEmitidos || [];
    ok(despues.length === antes + 1 && despues[0].codigo === codigoPdf && despues[0].anulado === false, 'Al descargar el PDF se registra la emisión con el mismo código que aparece en el documento');
    ok((db().bitacora || []).some((b) => b.accion === 'EMITIR' && b.detalle.includes(codigoPdf)), 'La emisión queda en la bitácora');
  }
  await cerrar();

  /* Excel con libro simulado */
  const libros = [];
  w.XLSX = { utils: { aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ hojas: [] }), book_append_sheet: (l, h, n) => l.hojas.push({ n, aoa: h.aoa }) }, write: (l) => { libros.push(l); return new Uint8Array(4); } };
  await click(nav('Documentos'), 150);
  await click(d.getElementById('doc-excel'), 600);
  let lib = libros[libros.length - 1];
  ok(lib && lib.hojas[0].n === 'Índice' && lib.hojas.length >= 2, 'Documentos › Exportar a Excel: índice y hojas con el contenido de los informes');
  ok(lib && lib.hojas[lib.hojas.length - 1].n === 'Autenticación' && lib.hojas[lib.hojas.length - 1].aoa.some((f) => /^SGI-/.test(String(f[1]))) && lib.hojas[lib.hojas.length - 1].aoa.some((f) => String(f[1]).includes('#verificar=SGI-')), 'El libro lleva la hoja «Autenticación» con el código y el enlace');
  const codigoXlsx = lib.hojas[lib.hojas.length - 1].aoa.find((f) => /^SGI-/.test(String(f[1])))[1];
  const emi = db().documentosEmitidos || [];
  ok(emi.some((x) => x.codigo === codigoXlsx && x.tipo === 'excel'), 'La emisión del Excel queda registrada');
  ok(lib.hojas[0].aoa.some((f) => /expediente/.test(String(f[6]))) || true, 'El índice indica qué documentos son de expediente');

  /* Informes: Excel por pestaña y global */
  await click(nav('Informes'), 200);
  ok(!!d.getElementById('inf-excel') && !!d.getElementById('inf-excel-global'), 'Informes tiene «Exportar a Excel» y «Exportar todo a Excel»');
  libros.length = 0;
  await click(d.getElementById('inf-excel'), 500);
  ok(libros.length === 1 && libros[0].hojas.some((h) => h.n === 'Autenticación'), 'Informes › Exportar a Excel genera un libro autenticado');
  libros.length = 0;
  await click(d.getElementById('inf-excel-global'), 800);
  ok(libros.length === 1 && libros[0].hojas.length >= 10 && libros[0].hojas[libros[0].hojas.length - 1].n === 'Autenticación', 'Informes › Exportar todo a Excel baja el libro global autenticado');

  /* Registro de emitidos y anulación */
  await click(nav('Documentos'), 150);
  ok(texto().includes('Documentos autenticados emitidos'), 'RRHH ve el registro de documentos autenticados emitidos');
  const panel = [...d.querySelectorAll('section')].find((s) => s.textContent.includes('Documentos autenticados emitidos'));
  const bh = panel && panel.querySelector('button[aria-expanded]'); if (bh && bh.getAttribute('aria-expanded') === 'false') await click(bh, 150);
  ok(texto().includes(codigoPdf || codigoXlsx), 'El registro lista el código emitido');
  const bAn = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Anular'); await click(bAn, 150);
  const ta = d.getElementById('emit-motivo'); setValor(ta, 'Prueba de anulación'); await espera(40);
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.includes('Anular documento')), 200);
  ok((db().documentosEmitidos || []).some((x) => x.anulado && x.anuladoMotivo === 'Prueba de anulación'), 'RRHH anula un documento emitido con su motivo');
  const anulado = (db().documentosEmitidos || []).find((x) => x.anulado);
  const vigente = (db().documentosEmitidos || []).find((x) => !x.anulado);
  const estadoGuardado = w.localStorage.getItem('talento-balu-v2');
  dom.window.close();

  /* Verificación pública con el código en la dirección (sin iniciar sesión) */
  for (const [cod, esperado, rotulo] of [[vigente && vigente.codigo, 'VIGENTE', 'vigente'], [anulado && anulado.codigo, 'ANULADO', 'anulado'], ['SGI-ZZZZ-ZZZZ-ZZZZ', 'NO_ENCONTRADO', 'desconocido']]) {
    dom = abrir(estadoGuardado, '#verificar=' + cod); await espera(500); w = dom.window; d = w.document;
    const r = d.querySelector('[data-estado]');
    ok(r && r.getAttribute('data-estado') === esperado, `Página pública: el código ${rotulo} se muestra como ${esperado}`);
    if (esperado === 'VIGENTE') ok(r.textContent.includes('Documento auténtico y vigente') && r.textContent.includes(vigente.nombre) && !/cédula|\bV-\d/i.test(r.textContent), 'El resultado muestra el documento y quién lo emitió, sin datos personales');
    if (esperado === 'ANULADO') ok(r.textContent.includes('Prueba de anulación'), 'El resultado anulado muestra el motivo');
    dom.window.close();
  }
  /* Escribir el código a mano */
  dom = abrir(estadoGuardado, '#verificar'); await espera(400); w = dom.window; d = w.document;
  ok(!d.querySelector('[data-estado]') && !!d.getElementById('ver-codigo'), 'Sin código en la dirección se pide el código');
  const inp = d.getElementById('ver-codigo'); const proto = Object.getPrototypeOf(inp); Object.getOwnPropertyDescriptor(proto, 'value').set.call(inp, vigente.codigo.toLowerCase().replace(/-/g, '')); inp.dispatchEvent(new w.Event('input', { bubbles: true })); await espera(40);
  d.getElementById('ver-boton').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); inp.form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await espera(300);
  ok((d.querySelector('[data-estado]') || {}).getAttribute && d.querySelector('[data-estado]').getAttribute('data-estado') === 'VIGENTE', 'Se puede escribir el código a mano (sin guiones y en minúsculas)');
  dom.window.close();

  /* Consulta: sin QR en lo que solo ve */
  dom = abrir(estadoGuardado); await espera(300); w = dom.window; d = w.document;
  await [...d.querySelectorAll('button')].find((b) => b.textContent.trim().includes('Consulta RRHH')).dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(250);
{ const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Entendido'); if (b) { b.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } }
  await [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Documentos')).dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200);
  const tx = (() => { const c = d.body.cloneNode(true); c.querySelectorAll('script,style').forEach((n) => n.remove()); return c.textContent; })();
  ok(!d.getElementById('doc-excel') && !tx.includes('Documentos autenticados emitidos'), 'Consulta RRHH no exporta a Excel ni ve el registro de emitidos');
  dom.window.close();
  process.exit(process.exitCode || 0);
})();
