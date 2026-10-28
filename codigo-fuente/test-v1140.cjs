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
  const FAKE = JSON.stringify({ version: 1, moneda: 'USD', periodicidad: 'MENSUAL', componentes: [{ id: 'sal', nombre: 'Salario base' }, { id: 'cesta', nombre: 'Cesta ticket' }, { id: 'ayuda', nombre: 'Ayuda' }, { id: 'efectivo', nombre: 'Efectivo' }, { id: 'otras', nombre: 'Otras' }, { id: 'bonoEsp', nombre: 'Bono especial' }],
    areas: [{ id: 'DG', nombre: 'Dirección General' }, { id: 'COMBALU', nombre: 'Comercial Balú' }, { id: 'MERC', nombre: 'Mercadeo' }],
    posiciones: [
      { id: 'A1', areaId: 'DG', cargo: 'Director de Prueba', nombre: 'Ficticio Uno', jefeId: '', vacante: false, comp: null },
      { id: 'A2', areaId: 'COMBALU', cargo: 'Analista Comercial de Prueba', nombre: 'Ficticio Dos', jefeId: 'A1', vacante: false, comp: { sal: 100, cesta: 60, ayuda: 840, efectivo: 0, otras: 0, bonoEsp: 0 } },
      { id: 'A3', areaId: 'MERC', cargo: 'Coordinador de Mercadeo', nombre: '', jefeId: 'A1', vacante: true, comp: null },
      { id: 'A4', areaId: 'MERC', cargo: 'Diseñador de Prueba', nombre: 'Ficticio Cuatro', jefeId: 'A3', vacante: false, comp: { sal: 100, cesta: 60, ayuda: 440, efectivo: 400, otras: 0, bonoEsp: 0 } },
    ],
    distribucion: [{ area: 'Comercial (prueba)', criterio: 'Directo', total: 1000, balu: 1000, planeta: 0 }, { area: 'Mercadeo (prueba)', criterio: 'Proporcional', total: 500, balu: 300, planeta: 200 }], notas: ['Nota de prueba.'] });
  await entrar('Visor General'); ok(!nav('Estructura administrativa'), 'Dirección Ejecutiva no ve «Estructura administrativa»');
  await entrar('Gerente de Marca'); ok(!nav('Estructura administrativa'), 'Gerencia de Marca no ve «Estructura administrativa»');
  await entrar('Administrador'); ok(!!nav('Estructura administrativa'), 'Administrador ve «Estructura administrativa»');
  await entrar('Gerente General'); ok(!!nav('Estructura administrativa'), 'Gerencia General ve «Estructura administrativa»');
  await entrar('Gerente de RRHH'); ok(!!nav('Estructura administrativa'), 'RRHH ve «Estructura administrativa»');
  await click(nav('Estructura administrativa')); await espera(200);
  ok(!texto().includes('no pudo mostrarse'), 'El módulo abre sin error');
  ok((texto().includes('queda solo en este navegador') && texto().includes('.vsdx')), 'Sin datos: pide el archivo de Visio y avisa que queda solo en el equipo');
  await escribe('adm-json', 'esto no es json'); await click(d.getElementById('adm-cargar'));
  ok(texto().includes('JSON válido') || !texto().includes('Organigrama\n'), 'Un archivo inválido se rechaza');
  await escribe('adm-json', FAKE); await click(d.getElementById('adm-cargar')); await espera(150);
  ok(texto().includes('Director de Prueba') && texto().includes('Vacante'), 'Organigrama: cargos y vacantes');
  ok(texto().includes('3 cargos ocupados') && texto().includes('1 vacantes'), 'Organigrama: resumen de ocupados y vacantes');
  ok(!!w.localStorage.getItem('sgi-estructura-admin-v1'), 'Los datos quedan en este equipo');
  ok(!JSON.stringify(db()).includes('Ficticio Dos') && !JSON.stringify(db()).includes('Analista Comercial de Prueba'), 'Los datos NO pasan a la base compartida del sistema');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Personal y cargos'))); await espera(100);
  ok(texto().includes('Ficticio Cuatro') && texto().includes('Mercadeo'), 'Personal y cargos');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent === 'Compensación')); await espera(100);
  ok(texto().includes('$ 1.000') || texto().includes('$ 1000'), 'Compensación: total mensual (1.000)') ;
  ok(texto().includes('Monto no cargado') && texto().includes('Ficticio Uno'), 'Compensación: avisa los montos no cargados');
  ok(texto().includes('12.000') || texto().includes('12000'), 'Compensación: anualizado');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Distribución'))); await espera(100);
  ok(texto().includes('Total: USD 1.500') || texto().includes('Total: USD 1500'), 'Distribución: total Balú + Planeta');
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.includes('Pruebas y Nine-Box'))); await espera(100);
  ok(texto().includes('Visual merchandising') && texto().includes('Talento Humano') && texto().includes('Comercial'), 'Pruebas: familias de cargo');
  ok(d.getElementById('adm-pr-COM-IPC').checked, 'Pruebas: la batería inicial de Comercial incluye IPC');
  await marca('adm-pr-COM-IPC'); await marca('adm-pr-COM-PIL'); await marca('adm-pr-COM-IPV');
  ok(texto().includes('Máximo 3 pruebas') || [...d.querySelectorAll('input[id^=adm-pr-COM-]')].filter((x) => x.checked).length <= 3, 'Máximo 3 pruebas por cargo');
  await click(boton('Guardar')); await espera(100);
  ok(Array.isArray(db().config.bateriaAdm.COM) && db().config.bateriaAdm.COM.length <= 3, 'La batería por familia se guarda en la configuración');
  ok(texto().includes('Criterios de la Nine-Box'), 'Nine-Box por familia de cargo');
  // Nine-Box adaptada
  const st = JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const adm = st.trabajadores.filter((t) => t.estatus === 'ACTIVO' && (st.cargos.find((c) => c.id === t.cargoId) || {}).administrativo);
    if (adm.length) {
    const sel = d.getElementById('adm-fam-' + adm[0].id); ok(!!sel, 'RRHH asigna la familia de cargo');
    await escribe('adm-fam-' + adm[0].id, 'FIN'); await espera(100);
    ok((db().trabajadores.find((t) => t.id === adm[0].id) || {}).familiaAdm === 'FIN', 'La familia asignada queda en el trabajador');
  }
  // Selector de cargo en asignación de pruebas
  ok(html.includes('Administrativo \\xB7 ${'), 'Asignación de pruebas: cargos administrativos por familia (selector)');
  await click(nav('Estructura administrativa')); await espera(150);
  await click([...d.querySelectorAll('[role=tab]')].find((x) => x.textContent === 'Datos')); await espera(100);
  await click(d.getElementById('adm-quitar')); await click(boton('Sí, quitar')); await espera(100);
  ok(!w.localStorage.getItem('sgi-estructura-admin-v1'), 'Se pueden quitar los datos de este equipo');
})().catch((e) => { console.log('✗ Excepción: ' + e.stack.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
