const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300); const w = dom.window, d = w.document;
  const click = async (el) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(150); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => d.body.textContent;
  const entrar = async (rol) => { if (boton('Salir')) await click(boton('Salir')); await click(boton(rol, 0)); await espera(200); };
  await entrar('Gerente de RRHH');
  await click(nav('Informes'));
  ok([...d.querySelectorAll('[role=tab]')].some((b) => b.textContent.trim() === 'Informe global'), 'Informes tiene la pestaña «Informe global»');
  ok(texto().includes('Plantilla activa') && texto().includes('Por marca') && texto().includes('Por tienda') && texto().includes('Egresos críticos'), 'Informe global: indicadores, por marca y por tienda');
  await click(nav('Informes')); await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'Descargas en Excel'));
  ok(texto().includes('Plantilla') && texto().includes('Solicitudes') && texto().includes('Entrevistas de salida') && texto().includes('Resumen por tienda') && boton('Descargar libro completo'), 'RRHH ve la lista de informes y el libro completo');
  ok(![...d.querySelectorAll('button')].every((b) => !b.textContent.includes('Descargar .xlsx')), 'Cada informe tiene su descarga .xlsx');
  // Contenido de los planos con un XLSX simulado
  const libros = [];
  w.XLSX = { utils: { aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ hojas: [] }), book_append_sheet: (l, h, n) => l.hojas.push({ n, aoa: h.aoa }) }, write: (l) => { libros.push(l); return new Uint8Array(4); } };
  await click(boton('Descargar libro completo')); await espera(400);
  const lib = libros[0];
  ok(lib && lib.hojas.length >= 10, 'Libro completo con una hoja por informe');
  ok(lib && lib.hojas.filter((h) => h.n !== 'Autenticación').every((h) => h.aoa.every((f) => f.length === h.aoa[0].length)), 'Todas las filas tienen tantas columnas como el encabezado');
  ok(lib && lib.hojas[lib.hojas.length - 1].n === 'Autenticación', 'El libro completo lleva la hoja «Autenticación»');
  const pl = lib.hojas.find((h) => h.n === 'Plantilla');
  ok(pl && pl.aoa[0].includes('Cédula') && pl.aoa.length > 100, 'RRHH: la plantilla incluye cédula y nombre');
  for (const [rol, ve] of [['Gerente General', true], ['Gerente de Marca', false], ['Gerente de Operaciones', false]]) {
    await entrar(rol);
    await click(nav('Informes')); const tEx = [...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'Descargas en Excel'); ok(Boolean(tEx) === ve, `${rol}: ${ve ? 've' : 'no ve'} la pestaña Descargas en Excel`);
    if (ve) { await click(tEx); libros.length = 0; await click(boton('Descargar libro completo')); await espera(400); const p2 = libros[0] && libros[0].hojas.find((h) => h.n === 'Plantilla'); ok(p2 && !p2.aoa[0].includes('Cédula') && !p2.aoa[0].includes('Nombre'), `${rol}: plantilla sin cédula ni nombre`); }
  }
  process.exit(process.exitCode || 0);
})();
