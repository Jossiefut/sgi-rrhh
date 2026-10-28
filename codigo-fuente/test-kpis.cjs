/* v1.13.0: KPI por área (formación y clima), vinculados a los objetivos del programa. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(90); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.getElementById('root').textContent;
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const escribe = async (id, v) => { const el = d.getElementById(id); const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(30); };
  const marca = async (id) => { await click(d.getElementById(id)); };
  const entrar = async (rol) => { const s = boton('Salir'); if (s) await click(s); await click(boton(rol, 0)); await espera(300); if (boton('Entendido')) await click(boton('Entendido')); };
  await entrar('Gerente de RRHH'); await click(nav('Indicadores de gestión')); await espera(300);
  ok(!texto().includes('no pudo mostrarse'), 'Indicadores de gestión abre sin error');
  ok(texto().includes('KPI por área y estrategia'), 'Bloque «KPI por área y estrategia»');
  ok(!d.getElementById('kpi-area-formacion'), 'Resumido: el detalle por área no se ve hasta ampliar');
  await click(boton('KPI por área y estrategia'));
  ok(!!d.getElementById('kpi-area-formacion') && !!d.getElementById('kpi-area-clima'), 'Al ampliar aparecen las áreas, incluidas Formación y Clima');
  const areas = [...d.querySelectorAll('[id^=kpi-area-]')].length;
  ok(areas >= 11, 'Todas las áreas del sistema tienen KPI: ' + areas);
  const f = d.getElementById('kpi-area-formacion').textContent;
  ok(['Tasa de finalización de cursos', 'Tasa de participación o asistencia', 'Horas de capacitación por empleado', 'Costo por participante', 'Evolución de puntuación', 'Satisfacción (NPS formativo)', 'Tiempo para alcanzar la competencia', 'Retención a 90 días', 'Conversión post-capacitación', 'Retorno de la inversión (ROI)'].every((x) => f.includes(x)), 'Formación: los indicadores solicitados');
  ok(d.getElementById('kpi-area-clima').textContent.includes('Cumplimiento de la encuesta'), 'Clima: cumplimiento de la encuesta');
  ok(texto().includes('Objetivos del programa'), 'KPI vinculados a los objetivos del programa');
  // Campos nuevos en formación
  await click(nav('Formación')); await espera(200);
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Catálogo'))); await click(boton('Nueva formación')); await espera(100);
  ok(!!d.getElementById('fc-costo'), 'Catálogo: costo total del programa');
  // Semáforo y vista de Dirección Ejecutiva
  await click(nav('Indicadores de gestión')); await espera(200);
  await click(boton('KPI por área y estrategia')); await espera(100);
  ok(d.querySelectorAll('[data-semaforo]').length > 0 || /Bueno|Regular|Malo/.test(texto()), 'RRHH: los KPI muestran su semáforo (Bueno / Regular / Malo)');
  await entrar('Visor General'); await espera(200);
  const tv = texto();
  ok(!tv.includes('Vencimientos de contrato') && !tv.includes('Contratos en alerta roja'), 'Dirección Ejecutiva: sin vencimientos de contrato');
  ok(!tv.includes('Pernoctas (30 días)') && !tv.includes('Documentos del mes'), 'Dirección Ejecutiva: sin pernoctas ni documentos del mes');
  ok(tv.includes('Personal evaluado') && tv.includes('Evaluaciones pendientes'), 'Dirección Ejecutiva: personal evaluado y su estatus en el tablero');
  ok(tv.includes('Clima laboral'), 'Tablero: indicadores de clima laboral');
  await click(nav('Indicadores de gestión')); await espera(300);
  const ti = d.querySelector('main').textContent;
  ok(ti.includes('Segmentación de la plantilla') && ti.includes('Personal evaluado y su estatus') && ti.includes('Clima laboral'), 'Indicadores: segmentación, personal evaluado y clima');
  ok(!ti.includes('Pernoctas') && !ti.includes('Vencimientos'), 'Indicadores (Dirección Ejecutiva): sin pernoctas ni vencimientos');
  ok(!!d.getElementById('per-desde') || /Período|Periodo/.test(ti), 'Dirección Ejecutiva elige su período de medición');
})().catch((e) => { console.log('✗ Excepción: ' + e.stack.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
