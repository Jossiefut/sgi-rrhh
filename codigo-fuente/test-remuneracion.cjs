/* KPI y remuneración (v1.18.0): permisos por jefe directo, historial, validación y carga desde Excel. */
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
const poner = async (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); await espera(60); };
(async () => {
  const R = await import('./remuneracion.js');
  /* ---- reglas puras ---- */
  const rA = { jefeRol: 'tienda', tiendaId: 'T1', marca: 'BALU' }; const rB = { jefeRol: 'marca', tiendaId: 'T1', marca: 'BALU' }; const rC = { jefeRol: 'general', tiendaId: 'T1', marca: 'BALU' };
  const u = (rol, extra) => ({ rol, tiendaId: '', marca: '', ...(extra || {}) });
  ok(R.puedeVerRemuneracion(u('rrhh'), rC) && R.puedeVerRemuneracion(u('admin'), rC) && R.puedeVerRemuneracion(u('general'), rC) && R.puedeVerRemuneracion(u('junta'), rC), 'RRHH, Administrador, Gerencia General y Junta ven todo');
  ok(R.puedeVerRemuneracion(u('tienda', { tiendaId: 'T1' }), rA) && !R.puedeVerRemuneracion(u('tienda', { tiendaId: 'T1' }), rB), 'El Gerente de Tienda ve a sus subordinados directos, no al nivel de su jefe');
  ok(!R.puedeVerRemuneracion(u('tienda', { tiendaId: 'T2' }), rA), 'El Gerente de Tienda no ve otra tienda');
  ok(R.puedeVerRemuneracion(u('operaciones', { marca: 'BALU' }), rB) && !R.puedeVerRemuneracion(u('operaciones', { marca: 'PLANETA' }), rB), 'Operaciones ve su marca hacia abajo, no la otra marca');
  ok(!R.puedeVerRemuneracion(u('operaciones', { marca: 'BALU' }), rC), 'Operaciones no ve lo que reporta a Gerencia General');
  ok(!R.puedeVerRemuneracion(u('visor', { marca: 'BALU' }), rA) && !R.puedeVerRemuneracion(u('consulta', { marca: 'BALU' }), rA), 'Visor y Consulta nunca ven remuneración');
  ok(R.puedeEditarRemuneracion(u('junta')) && !R.puedeEditarRemuneracion(u('operaciones')), 'Solo RRHH, Administrador, Gerencia General y Junta editan');
  const base = { vigenteDesde: '2026-11-01', moneda: 'USD', salarioBase: 300, bonoVariable: 50, otros: 0, jefeRol: 'tienda', kpis: [{ id: 'a', nombre: 'A', peso: 60 }, { id: 'b', nombre: 'B', peso: 30 }] };
  ok(R.validarRemuneracion(base).some((e) => e.includes('100')), 'Pesos que no suman 100 se rechazan');
  base.kpis[1].peso = 40; ok(R.validarRemuneracion(base).length === 0, 'Pesos que suman 100 se aceptan');
  ok(R.catalogoKpi('ASE', '', false, null).some((k) => k.nombre.includes('Ventas')), 'Catálogo por cargo de tienda');
  const adm = require('fs').readFileSync('kpis-adm.js', 'utf8'); ok((adm.match(/"nombre"/g) || []).length > 100, 'Guía de KPI por cargo administrativo cargada');
  /* ---- importación ---- */
  const trabs = [{ id: 'W1', cedula: 'V-12345678', nombres: 'Ana', apellidos: 'Pérez', estatus: 'ACTIVO', tiendaId: 'T1', marca: 'BALU', cargoId: 'ASE' }];
  const ctx = { trabajadores: trabs, remuneraciones: [], ahoraISO: '2026-10-13T10:00', usuarioId: 'rrhh', nuevoId: (() => { let i = 0; return () => `R${++i}`; })(), esAdm: () => false };
  const m = [R.COLUMNAS_PLANTILLA, ['12345678', '01/11/2026', 'usd', '300', '50', '', '', 'Ajuste', 'Ventas vs. meta individual', 60, 'Calidad de servicio', 40], ['99999999', '2026-11-01', 'USD', 100, 0, 0, '', '', '', ''], ['12345678', '2026-11-01', 'USD', 300, 0, 0, '', '', 'X', 70]];
  const res = R.registrosDesdeMatriz(m, ctx);
  ok(res.registros.length === 1 && res.errores.length === 2, 'Importa la fila válida y reporta la cédula desconocida y los pesos incorrectos');
  ok(res.registros[0].jefeRol === 'tienda' && res.registros[0].vigenteDesde === '2026-11-01' && res.registros[0].visiblePara.join() === 'tienda,marca,operaciones,general,junta', 'Fecha dd/mm/aaaa, jefe por defecto y visibilidad calculados');
  const ctx2 = { ...ctx, remuneraciones: res.registros };
  ok(R.registrosDesdeMatriz([m[0], m[1]], ctx2).registros.length === 0, 'Una fila idéntica ya cargada se omite');
  ok(R.hojasPlantilla([]).Ejemplo.length === 3 && Object.keys(R.hojasPlantilla([])).includes('Instrucciones'), 'La plantilla incluye ejemplo e instrucciones');
  /* ---- pantalla: RRHH registra desde la ficha ---- */
  crear(); await espera(400);
  const dd0 = estado();
  await click(boton('Gerente de RRHH'));
  ok(nav('Remuneración del personal'), 'RRHH ve «Remuneración del personal» en el menú');
  await click(nav('Remuneración del personal'));
  ok(d.querySelector('main h1').textContent.includes('Remuneración del personal') && d.getElementById('root').textContent.includes('Cómo debe estar el archivo'), 'El módulo muestra el ejemplo del archivo de Excel');
  const fila = [...d.querySelectorAll('main table')].pop().querySelector('tbody tr'); await click(fila);
  ok(d.getElementById('root').textContent.includes('Vigente hoy'), 'La fila abre la pestaña KPI y remuneración de la ficha');
  await click(boton('Registrar cambio'));
  await poner(d.getElementById('rem-base'), '300'); await poner(d.getElementById('rem-var'), '60');
  await click(d.getElementById('rem-k-0')); await click(d.getElementById('rem-k-1'));
  await poner(d.getElementById('rem-p-0'), '70'); await poner(d.getElementById('rem-p-1'), '20');
  await click(boton('Guardar registro'));
  ok([...d.querySelectorAll('[role=alert]')].some((x) => /sumar 100/.test(x.textContent)), 'Con pesos que no suman 100 muestra el error');
  await poner(d.getElementById('rem-p-1'), '30'); await click(boton('Guardar registro'));
  const e1 = estado();
  ok((e1.remuneraciones || []).length === 1 && e1.remuneraciones[0].kpis.length === 2 && e1.remuneraciones[0].salarioBase === 300, 'Se guarda el registro con sus KPI y pesos');
  ok(!JSON.stringify(e1.bitacora).includes('300') || !e1.bitacora[0].detalle.includes('300'), 'La bitácora no contiene montos');
  await click(boton('Registrar cambio')); await poner(d.getElementById('rem-base'), '350'); await click(boton('Guardar registro'));
  ok(estado().remuneraciones.length === 2, 'Un segundo cambio se suma al historial sin borrar el anterior');
  dom.window.close();
  /* ---- Visor no ve el módulo ---- */
  crear(JSON.stringify({ ...(JSON.parse(JSON.stringify({ datos: { ...e1 } }))) })); await espera(400);
  await click(boton('Visor General'));
  ok(!nav('Remuneración del personal'), 'El Visor no ve el módulo');
  dom.window.close();
  crear(JSON.stringify({ datos: e1 })); await espera(400);
  await click(boton('Junta Directiva'));
  ok(Boolean(nav('Remuneración del personal')), 'La Junta Directiva entra y ve el módulo');
  process.exit(process.exitCode || 0);
})();
