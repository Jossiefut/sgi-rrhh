/* Incremento de plantilla: lo decide el Gerente o Director de Operaciones; el sistema anota quién autorizó */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 60) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })); } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); };
  const b = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const poner = (el, v, ev = 'input') => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new w.Event(ev, { bubbles: true })); };
  await click(b('Administrador')); await espera(200);
  await click([...d.querySelectorAll('aside nav button')].find((x) => x.textContent.trim().startsWith('Configuración')));
  const tab = [...d.querySelectorAll('button, [role=tab]')].find((x) => x.textContent.trim().startsWith('Plantilla de HC'));
  if (!tab) { console.log([...d.querySelectorAll('main button')].map((x) => x.textContent.trim()).slice(0, 30).join(' | ')); process.exit(1); }
  await click(tab);
  const main = () => d.querySelector('main').textContent;
  const dlgAut = () => [...d.querySelectorAll('[role=dialog]')].find((x) => /Autorización del incremento de plantilla/.test(x.textContent));
  ok(main().includes('Autorizaciones de incremento de plantilla'), 'Aparece la lista de autorizaciones de incremento');
  /* 1. cambio sin aumento: se guarda sin pedir autorización */
  const guardar = () => [...d.querySelectorAll('main button')].filter((x) => x.textContent.trim() === 'Guardar')[0];
  await click(guardar()); await espera(100);
  ok(!dlgAut(), 'Guardar sin aumentar el HC no pide autorización');
  /* 2. aumento del HC de un formato */
  const entradas = [...d.querySelectorAll('main input[inputmode=numeric]')];
  const inp = entradas.find((x) => /^hcf-|^hc-/.test(x.id)) || entradas[0];
  const nuevoValor = String((Number(inp.value) || 0) + 2);
  poner(inp, nuevoValor); await espera(80);
  await click(guardar()); await espera(120);
  const dlg = dlgAut();
  ok(Boolean(dlg) && /Gerente o el Director de Operaciones/.test(dlg.textContent), 'Al aumentar el HC pide anotar quién lo autorizó (Gerente o Director de Operaciones)');
  if (dlg) {
    ok([...dlg.querySelector('#ah-cargo').options].map((o) => o.textContent).join(',') === 'Gerente de Operaciones,Director de Operaciones', 'Se elige Gerente o Director de Operaciones');
    await click([...dlg.querySelectorAll('button')].find((x) => x.textContent.includes('Registrar y guardar')));
    ok(/Escriba el nombre de quien autorizó/.test(dlgAut().textContent), 'No guarda sin el nombre de quien autorizó');
    poner(d.getElementById('ah-nombre'), 'Carlos Operaciones'); poner(d.getElementById('ah-cargo'), 'Director de Operaciones', 'change'); poner(d.getElementById('ah-nota'), 'Refuerzo de temporada'); await espera(60);
    await click([...dlgAut().querySelectorAll('button')].find((x) => x.textContent.includes('Registrar y guardar'))); await espera(150);
  }
  ok(!dlgAut(), 'Se cierra la ventana al registrar');
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const cfg = st.config || (st.datos && st.datos.config) || {};
  const au = (cfg.autorizacionesHC || [])[0];
  ok(Boolean(au) && au.autorizadoPor === 'Carlos Operaciones' && au.cargoAutoriza === 'Director de Operaciones' && (au.incrementoNormal + au.incrementoTemporada) > 0 && au.nota === 'Refuerzo de temporada', 'Queda registrada la autorización (' + (au ? '+' + au.incrementoNormal + ' normal, +' + au.incrementoTemporada + ' temporada' : 'sin registro') + ')');
  const bit = (st.bitacora || (st.datos && st.datos.bitacora) || []).find((x) => /HC necesario/.test(JSON.stringify(x)) && /Incremento autorizado por Carlos Operaciones/.test(JSON.stringify(x)));
  ok(Boolean(bit), 'La bitácora anota quién autorizó el incremento');
  ok(main().includes('Carlos Operaciones') && main().includes('Director de Operaciones'), 'La lista muestra la autorización registrada');
  /* 3. reducción: no pide autorización */
  const inp2 = [...d.querySelectorAll('main input[inputmode=numeric]')].find((x) => x.id === inp.id);
  poner(inp2, '0'); await espera(80);
  await click(guardar()); await espera(100);
  ok(!dlgAut(), 'Reducir el HC no pide autorización');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.log('FALLO', e.message, (e.stack || '').split('\n')[1]); process.exit(1); });
