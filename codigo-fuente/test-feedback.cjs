/* Feedback de la evaluación: si el colaborador no continúa solo lleva «Notas»; si continúa, fortalezas, oportunidades y compromisos. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const crear = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  const d0 = crear(); await espera(300);
  const estado = JSON.parse(d0.window.localStorage.getItem('talento-balu-v2')); d0.window.close();
  const base = estado.solicitudes.find((x) => x.tipo === 'EVAL_FIJO');
  const mk = (id, decision, extra) => ({ ...JSON.parse(JSON.stringify(base)), id, estado: 'EJECUTADA', feedback: null, datosPropuestos: { ...base.datosPropuestos, decision, ...(extra || {}) } });
  estado.solicitudes.push(mk('S-NOCONT', 'NO_CONTINUA'), mk('S-CONT', 'CONTINUA'), mk('S-COND', 'CONTINUA', { excepcion: true }));
  const dom = crear(JSON.stringify(estado)); await espera(300);
  const w = dom.window, d = w.document; const texto = () => d.body.textContent; const rootTxt = () => d.getElementById('root').textContent;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const setValor = (id, v) => { const el = d.getElementById(id); const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const abrir = async (id) => { await click(boton('Solicitudes')); await click(boton('Todas')); const fila = [...d.querySelectorAll('tr')].find((r) => r.textContent.includes(id)); await click(fila); };
  await click(boton('Administrador', 0)); await espera(200);
  // No continúa: solo Notas
  await abrir('S-NOCONT');
  ok(texto().includes('no continúa en la empresa') && !!d.getElementById('fb-notas') && !d.getElementById('fb-fort') && !d.getElementById('fb-opor') && !d.getElementById('fb-comp'), 'No continúa: el feedback solo pide Notas (sin fortalezas, oportunidades ni compromisos)');
  setValor('fb-notas', 'Se conversó la decisión y la entrega de pendientes.'); await espera();
  await click(boton('Registrar feedback y generar informe'));
  const e1 = JSON.parse(w.localStorage.getItem('talento-balu-v2')).solicitudes.find((x) => x.id === 'S-NOCONT');
  ok(e1.feedback && e1.feedback.sale === true && e1.feedback.notas.includes('entrega de pendientes') && e1.feedback.fortalezas === '', 'No continúa: se guardan las notas y se genera el informe final');
  const doc = JSON.parse(w.localStorage.getItem('talento-balu-v2')).documentos.find((x) => x.categoria === 'INFORME_FINAL' && x.refId === 'S-NOCONT');
  ok(doc && doc.html.includes('Notas') && !doc.html.includes('Fortalezas') && !doc.html.includes('Compromisos y plan de acción'), 'Informe final sin fortalezas, oportunidades ni compromisos');
  ok(rootTxt().includes('Notas') && !rootTxt().includes('Oportunidades de mejora') && !rootTxt().includes('Fortalezas'), 'Pantalla del feedback registrado muestra solo Notas');
  // Continúa y continúa con condiciones: formulario completo
  for (const id of ['S-CONT', 'S-COND']) {
    await abrir(id);
    ok(!!d.getElementById('fb-fort') && !!d.getElementById('fb-opor') && !!d.getElementById('fb-comp') && !d.getElementById('fb-notas'), `${id}: supera el período, se piden fortalezas, oportunidades y compromisos`);
  }
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
