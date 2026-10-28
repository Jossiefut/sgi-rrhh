const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(boton('Administrador')); await espera(200);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const tr = st.trabajadores.find((x) => x.estatus === 'ACTIVO' && x.tiendaId === 'T01' && x.cargoId === 'ASE');
  const destino = st.tiendas.find((t) => t.id !== tr.tiendaId).id;
  const base = st.solicitudes.find((s) => s.tipo === 'TRASLADO') || st.solicitudes[0];
  const sol = { ...base, id: 'S900', tipo: 'TRASLADO', trabajadorId: tr.id, tiendaId: tr.tiendaId, estado: 'EN_REVISION', rutagrama: undefined, datosPropuestos: { ...(base.datosPropuestos || {}), tiendaDestinoId: destino } };
  delete sol.rutagrama;
  st.solicitudes = [sol, ...st.solicitudes];
  dom.window.close();
  dom = abrir(JSON.stringify(st)); await espera(300); w = dom.window; d = w.document;
  const click2 = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton2 = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click2(boton2('Administrador')); await espera(200);
  const lee = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  ok(lee.solicitudes.some((s) => s.id === 'S900' && !s.rutagrama), 'Solicitud de traslado en curso (sin ejecutar) cargada');
  const nav = [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.includes('Solicitudes') || b.textContent.includes('Bandeja'));
  await click2(nav); await espera(150);
  const fila = [...d.querySelectorAll('tr, li, button')].find((x) => x.textContent.includes('S900'));
  ok(Boolean(fila), 'La solicitud S900 aparece en la lista');
  if (fila) { await click2(fila.tagName === 'TR' ? (fila.querySelector('button') || fila) : fila); await espera(200); }
  const bt = boton2('Ruta habitual de traslado');
  ok(Boolean(bt), 'Traslado en curso ofrece la ruta habitual de traslado antes de ejecutarse');
  if (bt) { await click2(bt); await espera(150); await click2(boton2('Vista del documento')); const dlg = [...d.querySelectorAll('[role=dialog]')].pop(); const t = dlg ? dlg.textContent : ''; ok(t.includes('PRIMERA ALTERNATIVA') && t.includes('Trayecto del Centro de Trabajo a mi Residencia') && t.includes(tr.cedula), 'Documento idéntico al original, prellenado con la cédula del trabajador'); }
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
