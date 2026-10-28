const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.body.textContent;
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); };
  const blur = async (el) => { el.dispatchEvent(new w.FocusEvent('focusout', { bubbles: true })); el.dispatchEvent(new w.FocusEvent('blur')); await espera(150); };
  const tab = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  await click(boton('Gerente de RRHH', 0)); await espera(200);
  await click(nav('Formación'));
  await click(tab('Catálogo'));
  ok(texto().includes('Clasificación'), 'El catálogo muestra la clasificación (Taller o Formación)');
  await click(boton('Nueva formación'));
  setValor(d.getElementById('fc-horas'), '4'); await espera();
  ok(texto().includes('Se registra como Taller'), 'Con 4 horas el formulario indica Taller');
  setValor(d.getElementById('fc-horas'), '8'); await espera();
  ok(texto().includes('Se registra como Formación'), 'Con 8 horas el formulario indica Formación');
  setValor(d.getElementById('fc-clase'), 'PROGRAMA'); await espera();
  ok(texto().includes('Se registra como Programa') && [...d.getElementById('fc-clase').options].some((o) => o.textContent === 'Capacitación'), 'Se puede registrar como Programa o Capacitación sin importar las horas');
  setValor(d.getElementById('fc-clase'), 'CAPACITACION'); setValor(d.getElementById('fc-horas'), '3'); await espera();
  ok(texto().includes('Se registra como Capacitación'), 'Con 3 horas y Capacitación elegida, queda como Capacitación');
  setValor(d.getElementById('fc-nombre'), 'Capacitación de apertura de caja'); await espera();
  await click(boton('Guardar'));
  { const e0 = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd0 = e0.datos || e0; const n = dd0.catalogoFormaciones.find((c) => c.nombre === 'Capacitación de apertura de caja'); ok(n && n.clase === 'CAPACITACION' && n.horas === 3, 'La modalidad queda guardada en el catálogo'); }
  ok(texto().includes('Capacitación'), 'El catálogo la muestra como Capacitación');
  // Talleres: un taller de 10 horas avisa que corresponde a Formación
  await click(tab('Talleres'));
  await click(boton('Nuevo taller'));
  ok([...d.getElementById('tl-clase').options].map((o) => o.textContent).join() === 'Taller,Programa,Capacitación', 'El módulo Talleres ofrece Taller, Programa y Capacitación');
  setValor(d.getElementById('tl-nombre'), 'Jornada larga'); await espera(); await click(boton('Crear taller'));
  const h = d.getElementById('tl-horas'); setValor(h, '10'); await blur(h);
  ok(texto().includes('Corresponde a Formación') && texto().includes('Desde 8 horas la actividad es una Formación'), 'Un taller de 10 horas avisa que corresponde a Formación');
  { const h2 = d.getElementById('tl-horas'); setValor(h2, '4'); await blur(h2); }
  ok(!texto().includes('Desde 8 horas la actividad es una Formación'), 'Con 4 horas vuelve a ser Taller');
  // Trayectoria: la participación de 4 h del caso de prueba aparece como Taller
  const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); const dd = est.datos || est;
  const cat = dd.catalogoFormaciones.find((c) => c.id === 'FC-PRUEBA-1');
  ok(cat && cat.horas === 4, 'Caso de prueba: Inducción de 4 horas');
  console.log('fin'); process.exit(process.exitCode || 0);
})();
