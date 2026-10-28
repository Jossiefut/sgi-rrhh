/* Un trabajador egresado no queda activo en ningún módulo: al ejecutarse el egreso se cierran sus pendientes. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
let dom, w, d;
const crear = (estado) => {
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w0) { w0.scrollTo = () => {}; w0.URL.createObjectURL = () => 'blob:x'; w0.URL.revokeObjectURL = () => {}; if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
  w = dom.window; d = w.document;
};
const click = async (el) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200); };
const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
const estado = () => { const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); return est.datos || est; };
(async () => {
  crear(); await espera(400);
  const raw = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd = raw.datos || raw; dom.window.close();
  const s3 = dd.solicitudes.find((s) => s.id === 'S003'); const tid = s3.trabajadorId;
  const tr = dd.trabajadores.find((x) => x.id === tid);
  const abierta = { ...JSON.parse(JSON.stringify(dd.solicitudes.find((s) => s.id === 'S001'))), id: 'S-EGR-1', trabajadorId: tid };
  dd.solicitudes.push(abierta);
  const plan = JSON.parse(JSON.stringify((dd.onboarding || [])[0] || {})); 
  if (plan.id) { plan.id = 'OB-EGR-1'; plan.trabajadorId = tid; plan.estado = 'EN_CURSO'; plan.tiendaId = tr.tiendaId; dd.onboarding.push(plan); }
  if (raw.datos) raw.datos = dd;
  crear(JSON.stringify(raw)); await espera(400);
  await click(boton('Gerente de RRHH'));
  await click(boton('Pendientes de mi aprobación'));
  await click([...d.querySelectorAll('tr')].find((r) => r.textContent.includes('S003')));
  await click(boton('Ejecutar', 0)); await click([...d.querySelectorAll('[role=dialog] button')].find((b) => b.textContent.trim() === 'Ejecutar'));
  const e = estado();
  ok(e.trabajadores.find((x) => x.id === tid).estatus === 'EGRESADO', 'El trabajador queda egresado');
  const cerrada = e.solicitudes.find((s) => s.id === 'S-EGR-1');
  ok(cerrada.estado === 'RECHAZADA' && cerrada.cerradaPorEgreso === true, 'Su solicitud abierta se cierra automáticamente');
  ok(cerrada.eventos[cerrada.eventos.length - 1].comentario.includes('egres'), 'Queda constancia del cierre en el historial');
  ok(e.solicitudes.find((s) => s.id === 'S003').estado === 'EJECUTADA', 'La desincorporación queda ejecutada');
  const nombre = `${tr.apellidos}`;
  if (plan.id) {
    await click(nav('Onboarding') || nav('Ingreso') || boton('Onboarding'));
    const enCurso = d.getElementById('root').textContent;
    ok(/nboarding/.test(d.querySelector('main h1') ? d.querySelector('main h1').textContent : ''), 'Se abrió el módulo de onboarding');
    ok(!enCurso.includes(`${tr.apellidos}, ${tr.nombres}`), 'Onboarding en curso no lista al egresado');
  }
  ok(true, 'Fin');
  process.exit(process.exitCode || 0);
})();
