const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(200); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const texto = () => d.body.textContent;
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  const tab = (t) => [...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes(t));
  const dlg = () => d.querySelector('[role=dialog]');
  const entrarRRHH = async () => { await click(boton('Gerente de RRHH', 0)); await espera(400); };
  await entrarRRHH();
  const t0 = Date.now();
  await click(boton('Plan de sucesión'));
  console.log('  tiempo de cálculo ms:', Date.now() - t0);
  ok(texto().includes('Cobertura') && texto().includes('Posiciones críticas') && texto().includes('Banco de talento') && texto().includes('Personal con plan de desarrollo'), 'Indicadores de cabecera (consolidado Balú)');
  ok(Boolean(tab('Mapa de sucesión') && tab('Evolución mensual') && tab('Planes de desarrollo') && tab('Tamaño de tiendas')), 'Pestañas del módulo');
  const sel = d.getElementById('sc-tienda'); setValor(sel, 'T02'); await espera(200);
  ok(texto().includes('Lido') && texto().includes('Posiciones clave') && texto().includes('Gerente de Tienda') && texto().includes('Subgerente') && texto().includes('Visual Merchandiser'), 'Mapa de la tienda con las posiciones clave');
  ok(/Riesgo (alto|medio|bajo)/.test(texto()), 'Cada titular muestra su riesgo');
  console.log('  muestra:', (texto().match(/Sucesores[^]{0,10}/) || [''])[0]);
  { const t = [...d.querySelectorAll('table tbody tr')].map((r) => r.textContent.replace(/\s+/g,' ').slice(0,260)); console.log('  filas:', t.length); t.slice(0,8).forEach((x) => console.log('   ·', x)); }
  await click(tab('Tamaño de tiendas'));
  ok(texto().includes('Tamaño de las tiendas Balú') && texto().includes('Guardar tamaños') && texto().includes('Propuesto'), 'Propuesta de tamaño por plantilla, sin guardar');
  let est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); let dat = est.datos || est;
  ok(!dat.tiendas.some((x) => x.tamano), 'Nada se guarda antes de confirmar');
  await click(boton('Guardar tamaños'));
  est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); dat = est.datos || est;
  ok(dat.tiendas.filter((x) => x.marca === 'BALU' && !x.administrativa && x.tamano).length === 19, 'Al confirmar quedan las 19 tiendas con tamaño');
  ok((dat.fotosSucesion || []).some((x) => x.consolidado), 'Foto mensual guardada para el mes');
  await click(tab('Evolución mensual'));
  ok(texto().includes('Evolución mensual de la cobertura'), 'Gráfico de evolución mensual');
  // Ejemplo con datos reales del repositorio
  const est3 = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const d3 = est3.datos || est3;
  d3.fichas = [
    { id: '11111111', cedula: '11111111', letra: 'V', nombres: 'Ana', apellidos: 'Gerente Real', tiendaId: 'T02', cargoId: 'GT' },
    { id: '22222222', cedula: '22222222', letra: 'V', nombres: 'Luis', apellidos: 'Subgerente Real', tiendaId: 'T02', cargoId: 'SUB' },
    { id: '33333333', cedula: '33333333', letra: 'V', nombres: 'Eva', apellidos: 'Asesora Real', tiendaId: 'T03', cargoId: 'ASE' },
  ];
  const dom2 = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w2) { w2.scrollTo = () => {}; w2.localStorage.setItem('talento-balu-v2', JSON.stringify(est3.datos ? { ...est3, datos: d3 } : d3)); } });
  await espera(300); const w2 = dom2.window, dd = w2.document;
  const clk = async (el) => { el.dispatchEvent(new w2.MouseEvent('click', { bubbles: true })); await espera(250); };
  const bt = (t) => [...dd.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await clk(bt('Gerente de RRHH')); await espera(300); await clk(bt('Plan de sucesión'));
  await clk(bt('Ver con datos reales (ejemplo)')); await espera(400);
  const s2 = dd.getElementById('sc-tienda'); Object.getOwnPropertyDescriptor(w2.HTMLSelectElement.prototype, 'value').set.call(s2, 'T02'); s2.dispatchEvent(new w2.Event('change', { bubbles: true })); await espera(300);
  const t2 = dd.body.textContent;
  ok(t2.includes('Ejemplo con datos reales') && t2.includes('Ana Gerente Real') && t2.includes('Luis Subgerente Real') && t2.includes('Eva Asesora Real'), 'Ejemplo con datos reales del repositorio: titulares y candidata');
  process.exit(process.exitCode || 0);
})();
