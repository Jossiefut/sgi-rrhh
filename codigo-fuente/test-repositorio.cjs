const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
const hoy = new Date(); const iso = (d) => d.toISOString().slice(0, 10);
const hace = (n) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return iso(d); };
(async () => {
  // 1) estado inicial
  let dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; } });
  await espera(300);
  const raw = dom.window.localStorage.getItem('talento-balu-v2'); const est = JSON.parse(raw); const datos = est.datos || est;
  dom.window.close();
  const t02 = datos.tiendas.find((x) => x.id === 'T02');
  const ficha = (ced, extra) => ({ id: ced, cedula: ced, letra: 'V', nombres: 'Maria', apellidos: 'Prueba Reingreso', genero: 'Femenino', fechaNacimiento: '1995-04-10', telefono: '04121234567', estadoResidencia: 'Miranda', direccion: { calle: 'Av Principal', sector: 'Centro', edificio: 'Casa 1', municipio: 'Sucre' }, estadoCivil: 'Soltero/a', educacion: 'Bachiller en Ciencias', tiendaId: 'T02', cargoId: 'ASE', fuente: 'Prueba', respuesta: '2026-08-05', ...extra });
  datos.fichas = [ficha('29111000', { numRegistros: 2, respuestasPrevias: ['2026-05-01'] }), ficha('29222000', { numRegistros: 1, respuestasPrevias: [], nombres: 'Luis' })];
  datos.trabajadores.push({ id: 'W-EGR1', marca: t02.marca, tiendaId: 'T02', tiendaIngresoId: 'T02', cargoId: 'ASE', nombres: 'Luis', apellidos: 'Prueba Reingreso', cedula: 'V-29222000', fechaNacimiento: '1990-01-01', fechaIngreso: '2025-01-10', fechaEgreso: hace(30), motivoEgreso: 'Renuncia', estatus: 'EGRESADO', historial: [], contrato: { tipo: 'DETERMINADO', hitos: {} } });
  const nuevo = est.datos ? { ...est, datos } : datos;
  dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.localStorage.setItem('talento-balu-v2', JSON.stringify(nuevo)); } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { const _e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (_e && _e !== el) { _e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); }  if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const texto = () => d.body.textContent;
  const setValor = (el, v) => { const proto = el.tagName === 'SELECT' ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new w.Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const entrar = async (rol) => { if (boton('Salir')) await click(boton('Salir')); await click(boton(rol, 0)); await espera(200); };
  await entrar('Gerente de RRHH');
  await click(boton('Nuevo ingreso'));
  // a) cédula con dos registros en el repositorio
  setValor(d.getElementById('bus-numero'), '29111000'); await espera(); await click(boton('Buscar'));
  ok(d.querySelector('[role=dialog]') && d.querySelector('[role=dialog]').textContent.includes('Más de un registro'), 'Dos registros: pregunta si desea actualizar los datos');
  await click(boton('Sí, actualizar'));
  ok(d.getElementById('in-nombres') && d.getElementById('in-nombres').value === 'Maria', 'Sí: los datos se cargan del repositorio (registro más reciente)');
  ok(texto().includes('segunda vez que esta persona trabaja con nosotros'), 'Se aclara que es la segunda vez');
  ok(texto().includes('Viene de otra empresa del grupo'), 'Casilla de procedencia del grupo');
  ok(texto().includes('Ficha del trabajador (datos del repositorio)') && texto().includes('Contacto de emergencia 1') && texto().includes('Talla'), 'La ficha del trabajador se llena con los datos del repositorio');
  await click(boton('Cambiar cédula'));
  // b) egresado hace 30 días
  setValor(d.getElementById('bus-numero'), '29222000'); await espera(); await click(boton('Buscar'));
  { const t = texto(); const i = t.indexOf('Han pasado'); console.log('  ', t.slice(i, i + 40)); }
  ok(texto().includes('segunda vez que esta persona trabaja con nosotros') && /Han pasado (29|30) días/.test(texto()), 'Egresado: cuenta 30 días desde el egreso');
  ok(texto().includes('Es menor de 90 días') && texto().includes('después del día 90'), 'Menor de 90 días: ingreso no efectivo hasta después del día 90');
  // casilla de grupo
  await click(d.querySelector('input[type=checkbox]'));
  ok(texto().includes('Fecha de egreso (otra empresa)') && texto().includes('Duración total') && !d.querySelector('select#in-empgrupo'), 'Al marcar: empresa, ingreso, egreso y duración, de solo lectura');
  await click(boton('Salir')); await entrar('Gerente de RRHH'); await click(boton('Sincronización'));
  await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Repositorios de datos')));
  ok(texto().includes('Repositorio 1') && texto().includes('Repositorio 2') && texto().includes('Pendiente') && boton('Leer del repositorio ahora'), 'Dos repositorios: el primero en uso y el segundo pendiente');
  console.log('fin');
  process.exit(process.exitCode || 0);
})();
