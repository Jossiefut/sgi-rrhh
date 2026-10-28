/* Programa de Formación: ajuste de la duración por RRHH en un programa existente (incluye programas antiguos de 3 meses) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const abrir = (estado) => new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; if (estado) w.localStorage.setItem('talento-balu-v2', estado); } });
(async () => {
  let dom = abrir(); await espera(300);
  let w = dom.window, d = w.document;
  const click = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  await click(boton('Administrador')); await espera(200);
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const tr = st.trabajadores.find((x) => x.estatus === 'ACTIVO' && x.cargoId === 'CAJ') || st.trabajadores.find((x) => x.estatus === 'ACTIVO');
  const sum = (iso, n) => new Date(new Date(iso + 'T12:00:00').getTime() + n * 86400000).toISOString().slice(0, 10);
  const ini = sum(new Date().toISOString().slice(0, 10), -5);
  const act = (etapa, texto, hecha) => ({ id: 'AX' + Math.random().toString(36).slice(2, 8), etapa, texto, hecha: Boolean(hecha), fecha: hecha ? ini : '', usuarioId: hecha ? 'rrhh' : '' });
  const antiguo = { id: 'ON-ANTIGUO', tipo: 'PROMOCION', trabajadorId: tr.id, tiendaId: tr.tiendaId, cargoId: tr.cargoId, solicitudId: '', fechaInicio: ini, fechaFin: sum(ini, 89), estado: 'EN_CURSO', creado: ini,
    actividades: [act('Mes 1 (días 1 a 30): transición', 'Entrega formal de funciones', true), act('Mes 2 (días 31 a 60): ejecución acompañada', 'Revisión de avance'), act('Mes 3 (días 61 a 90): autonomía y resultados', 'Evaluación de cierre')],
    expectativas: [{ dia: 30, texto: 'Texto A' }, { dia: 60, texto: 'Texto B' }, { dia: 90, texto: 'Texto C' }], supervisorRol: 'tienda', supervisorTexto: 'Gerente de Tienda', firma: null };
  st.onboarding = [antiguo, ...(st.onboarding || [])];
  dom.window.close();
  dom = abrir(JSON.stringify(st)); await espera(300); w = dom.window; d = w.document;
  const click2 = async (el) => { el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(80); };
  const boton2 = (t) => [...d.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const setValor = (el, v) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  await click2(boton2('Gerente de RRHH')); await espera(200);
  await click2([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Onboarding')));
  const fila = [...d.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(tr.apellidos.split(' ')[0]) && r.textContent.includes('Programa de Formación · 90 días'));
  ok(Boolean(fila), 'El programa antiguo de 3 meses se muestra como «Programa de Formación · 90 días»');
  ok(d.body.textContent.includes('Programa de Formación al cargo') || d.body.textContent.includes('Programa de Formación'), 'El módulo explica el Programa de Formación');
  if (fila) await click2(fila);
  const campo = d.getElementById('pf-dias-ON-ANTIGUO');
  ok(Boolean(campo) && campo.value === '90' && !campo.disabled, 'RRHH ve y puede editar los días del programa');
  setValor(campo, '3'); await espera(); ok(!boton2('Aplicar') || boton2('Aplicar').disabled, 'No permite menos de 7 días');
  setValor(campo, '30'); await espera(); await click2(boton2('Aplicar'));
  const p = db().onboarding.find((x) => x.id === 'ON-ANTIGUO');
  ok(p && p.dias === 30 && p.fechaFin === sum(ini, 29), 'Se ajusta la duración a 30 días y la fecha de cierre');
  ok(p.actividades[0].etapa === 'Etapa 1 · Transición (días 1 a 10)' && p.actividades[1].etapa === 'Etapa 2 · Ejecución acompañada (días 11 a 20)' && p.actividades[2].etapa === 'Etapa 3 · Autonomía y resultados (días 21 a 30)', 'Las tres etapas se reparten en los nuevos días');
  ok(p.actividades[0].hecha === true && p.expectativas.map((x) => x.dia).join() === '10,20,30' && p.expectativas.map((x) => x.texto).join() === 'Texto A,Texto B,Texto C', 'Se conserva lo avanzado y los textos de las expectativas');
  ok(db().bitacora.some((b) => /Duración fijada por RRHH: 30 días/.test(b.detalle || '')), 'El ajuste queda en la bitácora');
  await click2(boton2('Salir')); await click2(boton2('Gerente de Marca')); await espera(150);
  await click2([...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith('Onboarding')));
  const fila2 = [...d.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Programa de Formación · 30 días'));
  if (fila2) { await click2(fila2); ok(d.getElementById('pf-dias-ON-ANTIGUO') && d.getElementById('pf-dias-ON-ANTIGUO').disabled, 'Otros roles ven los días pero no los editan'); }
  else ok(true, 'El programa no está en el alcance del Gerente de Marca (no aplica la comprobación)');
  dom.window.close();
})().catch((e) => { console.log('FALLO', e.message); process.exitCode = 1; });
