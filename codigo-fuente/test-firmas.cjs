/* Firma digital (v1.24.0): la importan los perfiles de Gerente de Marca hacia arriba y se ve en lo que emiten o aprueban */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
let dom, w, d;
const crear = (estado) => {
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w0) { w0.scrollTo = () => {}; w0.URL.createObjectURL = () => 'blob:x'; w0.URL.revokeObjectURL = () => {}; if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
  w = dom.window; d = w.document;
};
const click = async (el, ms = 120) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
const estado = () => { const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); return est.datos || est; };
const subir = async (bytesB64, tipo, nombre) => {
  const inp = d.getElementById('firma-archivo');
  const bin = Buffer.from(bytesB64, 'base64');
  const arch = new w.File([bin], nombre, { type: tipo });
  Object.defineProperty(inp, 'files', { value: [arch], configurable: true });
  inp.dispatchEvent(new w.Event('change', { bubbles: true }));
};
(async () => {
  /* --- módulo puro --- */
  const F = await import('./firmas.js');
  const mem = (() => { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = v; }, removeItem: (k) => { delete m[k]; }, m }; })();
  ok(['marca', 'operaciones', 'rrhh', 'general', 'junta', 'admin'].every(F.puedeTenerFirma) && !['tienda', 'visor', 'consulta', 'pendiente'].some(F.puedeTenerFirma), 'Pueden tener firma: Gerente de Marca y superiores; no la tienda, el visor ni consulta');
  ok(F.esImagenFirmaValida(PNG) && !F.esImagenFirmaValida('data:text/html;base64,AAAA') && !F.esImagenFirmaValida('javascript:alert(1)') && !F.esImagenFirmaValida('data:image/svg+xml;base64,AAAA') && !F.esImagenFirmaValida(''), 'Solo se aceptan PNG o JPG en data URL (no SVG ni HTML ni scripts)');
  ok(!F.esImagenFirmaValida('data:image/png;base64,' + 'A'.repeat(F.MAX_CHARS_FIRMA)), 'Se rechaza una imagen demasiado pesada');
  ok(F.guardarFirma('u1', PNG, mem) && F.leerFirma('u1', mem) === PNG && F.leerFirma('u2', mem) === '', 'Guardar y leer la firma de cada persona por separado');
  ok(F.firmaParaRegistro({ id: 'u1', rol: 'marca' }, mem) === PNG && F.firmaParaRegistro({ id: 'u1', rol: 'tienda' }, mem) === '', 'La firma solo se copia a un registro si el perfil puede usarla');
  F.quitarFirma('u1', mem); ok(F.leerFirma('u1', mem) === '', 'Quitar la firma');
  const h = F.htmlImagenFirma(PNG, 'Ana <b>"X"</b>', 50);
  ok(h.includes('data-firma-digital="1"') && !h.includes('<b>') && F.htmlImagenFirma('x', 'a') === '', 'El HTML de la firma escapa el nombre y no dibuja imágenes inválidas');

  /* --- Visor General: no ve la opción --- */
  crear(); await espera(400);
  await click(boton('Visor General'), 250);
  ok(!d.getElementById('btn-firma'), 'El Visor General no tiene la opción «Mi firma»');
  dom.window.close();
  crear(); await espera(400);
  await click(boton('Gerente de Marca', 0), 250);
  ok(!!d.getElementById('btn-firma'), 'El Gerente de Marca sí tiene la opción «Mi firma»');
  dom.window.close();

  /* --- Gerente de RRHH: importa, reemplaza y quita --- */
  crear(); await espera(400);
  const raw0 = JSON.parse(w.localStorage.getItem('talento-balu-v2')); dom.window.close();
  crear(JSON.stringify(raw0)); await espera(400);
  await click(boton('Gerente de RRHH'), 250);
  const bf = d.getElementById('btn-firma');
  ok(!!bf && bf.textContent.includes('pendiente'), 'El Gerente de RRHH ve «Mi firma (pendiente)»');
  await click(bf, 200);
  ok(!!d.getElementById('firma-archivo'), 'Se abre la ventana para importar la firma');
  await subir(Buffer.from('hola').toString('base64'), 'text/plain', 'x.txt'); await espera(300);
  ok(!!d.querySelector('[role=dialog] [role=alert]'), 'Rechaza un archivo que no es imagen');
  await subir(PNG.split(',')[1], 'image/png', 'firma.png'); await espera(4800);
  const claves = Object.keys(w.localStorage._data || {}).filter(() => false);
  let guardada = null; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); if (k.startsWith('sgi-firma-v1-')) guardada = [k, w.localStorage.getItem(k)]; }
  ok(guardada && /^data:image\/png;base64,/.test(guardada[1]), 'La firma queda guardada en este navegador');
  ok(d.querySelector('#firma-vista img') && !!d.getElementById('firma-quitar'), 'Se ve la vista previa y aparece «Quitar firma»');
  const e1 = estado();
  ok((e1.bitacora || []).some((b) => /firma digital/i.test(`${b.entidad || ''} ${b.detalle || ''}`)) && !JSON.stringify(e1).includes(guardada[1].slice(30, 80)), 'Queda en la bitácora sin guardar la imagen en los datos de la aplicación');
  await click(d.getElementById('firma-quitar'), 200);
  let quedan = 0; for (let i = 0; i < w.localStorage.length; i++) if (w.localStorage.key(i).startsWith('sgi-firma-v1-')) quedan++;
  ok(quedan === 0, 'Quitar la firma la borra del navegador');
  dom.window.close();

  /* --- Gerente General: al aprobar, la firma se copia al registro y sale en el documento --- */
  crear(); await espera(400);
  const raw = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd = raw.datos || raw; dom.window.close();
  const base = dd.solicitudes.find((s) => s.id === 'S001');
  const pasos = JSON.parse(JSON.stringify(base.pasos)); pasos.forEach((p, i) => { if (i < pasos.length - 1) Object.assign(p, { estado: 'APROBADO', usuarioId: 'rrhh', fecha: '2026-10-12T10:00' }); });
  dd.solicitudes = dd.solicitudes.map((s) => (s.id === 'S001' ? { ...s, pasos, pasoActual: pasos.length - 1, estado: 'EN_REVISION' } : s));
  if (raw.datos) raw.datos = dd;
  crear(JSON.stringify(raw)); await espera(400);
  await click(boton('Gerente General'), 250);
  await click(boton('Mi firma'), 200);
  await subir(PNG.split(',')[1], 'image/png', 'firma.png'); await espera(4800);
  await click([...d.querySelectorAll('[role=dialog] button')].find((b) => /Cerrar|×/.test(b.textContent + (b.getAttribute('aria-label') || ''))), 150);
  await click(boton('Pendientes de mi aprobación'), 200);
  await click([...d.querySelectorAll('tr')].find((r) => r.textContent.includes('S001')), 250);
  await click(boton('Aprobar', 0));
  const dlg = [...d.querySelectorAll('[role=dialog]')].pop();
  const chk = dlg.querySelector('input[type=checkbox]'); if (chk) await click(chk, 100);
  await click([...[...d.querySelectorAll('[role=dialog]')].pop().querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Aprobar')), 400);
  const s = estado().solicitudes.find((x) => x.id === 'S001');
  const ultimo = s.pasos[s.pasos.length - 1];
  ok(ultimo.estado === 'APROBADO' && /^data:image\/png;base64,/.test(ultimo.firmaImg || ''), 'Al aprobar y firmar, la firma digital queda copiada en el registro del paso');
  ok(s.pasos.slice(0, -1).every((p) => !p.firmaImg), 'Los pasos de otras personas no reciben esa firma');
  console.log(process.exitCode ? '\nHAY FALLAS' : '\nTodo correcto');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('✗ Error:', e); process.exit(1); });
