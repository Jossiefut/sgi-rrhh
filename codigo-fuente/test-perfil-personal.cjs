/* Datos personales cruzables con los indicadores: género, edad, escolaridad, estado civil, hijos, residencia, antigüedad, contrato y cargo */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const P = await import('./perfil-personal.js');
  /* --- módulo puro --- */
  const ctx = { hoy: '2026-10-13', generoDe: (t) => t.g, edadDe: (t) => t.e, rangoEdad: (e) => (e === null ? 'Sin fecha de nacimiento' : e < 25 ? 'Menos de 25 años' : '25 a 34 años'), nivelDe: (t) => t.n, estadoCivilDe: () => '', hijosDe: (t) => P.textoHijos(t, null), estadoResidenciaDe: () => 'Miranda', municipioDe: () => '', tramoAntiguedad: () => 'x', diasAntiguedad: () => 1, contratoDe: () => P.ORDEN_CONTRATO[0], nombreCargo: () => 'Cajero' };
  const dims = P.crearDimensionesPerfil(ctx); const D = (id) => dims.find((d) => d.id === id);
  ok(dims.map((d) => d.id).join() === 'genero,edad,escolaridad,estadoCivil,hijos,estadoResidencia,municipio,antiguedadActual,contratoPerfil,cargoPerfil', 'Diez dimensiones de datos personales');
  ok(D('estadoCivil').valor({}) === 'Sin registrar' && D('municipio').valor({}) === 'Sin registrar' && D('escolaridad').valor({ n: ' Universitario ' }) === 'Universitario', 'Lo que falta se agrupa como «Sin registrar»');
  ok(P.textoHijos({ tieneHijos: 'Sí' }, null) === 'Con hijos' && P.textoHijos({ tieneHijos: 'No' }, null) === 'Sin hijos' && P.textoHijos({}, null) === 'Sin registrar' && P.textoHijos({}, { hijos: [{}] }) === 'Con hijos' && P.textoHijos({}, { tieneHijos: 'No', hijos: [] }) === 'Sin hijos', 'Hijos: del registro o de la ficha');
  const cat = P.categoriasDe(D('genero'), [{ g: 'Masculino' }, { g: 'Femenino' }, { g: 'Femenino' }, { g: '' }]);
  ok(cat.map((c) => `${c.valor}:${c.n}`).join() === 'Femenino:2,Masculino:1,Sin registrar:1', 'Categorías: por cantidad y «Sin registrar» al final: ' + cat.map((c) => `${c.valor}:${c.n}`).join());
  ok(P.categoriasDe(D('hijos'), [{ tieneHijos: 'No' }, { tieneHijos: 'Sí' }, {}]).map((c) => c.valor).join() === 'Con hijos,Sin hijos,Sin registrar', 'Hijos: orden fijo');
  ok(P.KPI_NO_SEGMENTABLES.includes('hc') && P.KPI_NO_SEGMENTABLES.includes('npsclima') && !P.KPI_NO_SEGMENTABLES.includes('rot'), 'Indicadores que no se parten por persona: HC y clima; la rotación sí');

  /* --- aplicación --- */
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; w.console.error = () => {}; } });
  await espera(300);
  const w = dom.window; const d = w.document;
  const click = async (el, ms = 80) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => { const c = d.body.cloneNode(true); c.querySelectorAll('script,style').forEach((n) => n.remove()); return c.textContent; };
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const setValor = async (el, vv) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, vv); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(150); };
  const libros = [];
  w.HTMLAnchorElement.prototype.click = function () {};
  w.XLSX = { utils: { aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ hojas: [] }), book_append_sheet: (l, h, n) => l.hojas.push({ n, aoa: h.aoa }) }, write: (l) => { libros.push(l); return new Uint8Array(4); } };
  await click(boton('Gerente de RRHH'), 250);
  { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Entendido'); if (b) await click(b, 100); }
  const reales = db().trabajadores.filter((x) => !x.esPrueba);
  const con = (f) => reales.filter(f).length / reales.length;
  ok(con((x) => x.genero === 'F' || x.genero === 'M') > 0.95 && con((x) => x.formacion && x.formacion.nivel) > 0.95 && con((x) => x.estadoResidencia) > 0.95 && con((x) => x.municipio) > 0.95 && con((x) => x.tieneHijos) > 0.95, 'Los datos de ejemplo traen género, escolaridad, hijos, estado y municipio de residencia');

  await click(nav('Indicadores de gestión'), 300);
  const secKpi = d.querySelector('section[aria-labelledby=ind-kpi]');
  await click(secKpi.querySelector('button'), 200);
  for (const a of ['reclutamiento', 'personal', 'formacion']) { const det = d.querySelector(`#kpi-area-${a}`); if (det) det.open = true; }
  await espera(80);
  for (const id of ['egrcant', 'ingresos12', 'hc']) await click(d.querySelector(`#kpi-ver-${id}`), 120);
  const sel = d.querySelector('#cruce-desglose');
  const opts = [...sel.options].map((o) => o.value);
  ok(['perfil:genero', 'perfil:edad', 'perfil:escolaridad', 'perfil:estadoCivil', 'perfil:hijos', 'perfil:estadoResidencia', 'perfil:municipio'].every((v) => opts.includes(v)), 'RRHH puede desglosar por género, edad, escolaridad, estado civil, hijos, estado y municipio');
  const cab = () => [...d.querySelectorAll('#cruce-tabla thead th')].map((x) => x.textContent.trim());
  const filas = () => [...d.querySelectorAll('#cruce-tabla tbody tr')].map((r) => [...r.querySelectorAll('td')].map((c) => c.textContent.trim()));
  const num = (t) => Number(String(t).replace(/[^0-9.-]/g, ''));
  const verificar = async (dim, nombre) => {
    await setValor(d.querySelector('#cruce-desglose'), `perfil:${dim}`);
    const c = cab(); const f = filas(); const tot = f[f.length - 1]; const cuerpo = f.slice(0, -1);
    const iEgr = c.indexOf('Egresos del período'); const iIng = c.indexOf('Ingresos (12 meses)'); const iHc = c.findIndex((x) => x.startsWith('Cobertura del HC'));
    ok(c[0] === nombre && c[1] === 'Personas activas' && iEgr > 0 && iHc > 0, `${nombre}: encabezados ${c.join(' | ')}`);
    ok(cuerpo.length >= 2, `${nombre}: ${cuerpo.length} categorías (${cuerpo.map((r) => r[0]).join(', ')})`);
    ok(cuerpo.reduce((a, r) => a + num(r[iEgr]), 0) === num(tot[iEgr]), `${nombre}: los egresos por categoría suman el total (${num(tot[iEgr])})`);
    ok(cuerpo.reduce((a, r) => a + num(r[iIng]), 0) === num(tot[iIng]), `${nombre}: los ingresos por categoría suman el total (${num(tot[iIng])})`);
    ok(cuerpo.reduce((a, r) => a + num(r[1]), 0) === num(tot[1]), `${nombre}: las personas activas suman el total (${num(tot[1])})`);
    ok(cuerpo.every((r) => r[iHc] === '—') && num(tot[iHc]) > 0, `${nombre}: la cobertura del HC (no se parte por persona) queda en «—»`);
  };
  await verificar('genero', 'Género');
  ok(filas().slice(0, -1).map((r) => r[0]).join() === 'Femenino,Masculino' || filas().slice(0, -1).map((r) => r[0]).sort().join() === 'Femenino,Masculino', 'Género: Femenino y Masculino');
  await verificar('escolaridad', 'Escolaridad (nivel de instrucción)');
  await verificar('edad', 'Rango de edad');
  await verificar('estadoResidencia', 'Estado de residencia');
  await verificar('hijos', 'Hijos');
  await verificar('municipio', 'Municipio o zona de residencia');
  ok(!!d.querySelector('#cruce-perfil-nota') && texto().includes('confidenciales'), 'Se advierte que los datos personales son confidenciales');
  ok(texto().includes('‡'), 'Se marca con ‡ el indicador que no se puede partir por persona');
  /* Excel */
  await setValor(d.querySelector('#cruce-desglose'), 'perfil:genero');
  await click(d.querySelector('#cruce-excel'), 400);
  const lx = libros[libros.length - 1];
  ok(lx && lx.hojas[0].aoa[0].slice(0, 2).join('|') === 'Género|Personas activas' && lx.hojas[1].aoa.some((r) => String(r[0]).startsWith('Desglose') && String(r[1]).includes('dato personal')), 'Excel: columnas Género y Personas activas, y el desglose indicado en Parámetros');
  /* Edad dentro del total: el total por tienda coincide con el total de ‹Solo el total› */
  await setValor(d.querySelector('#cruce-desglose'), 'total');
  const totalSolo = filas()[0]; const iE = cab().indexOf('Egresos del período');
  await setValor(d.querySelector('#cruce-desglose'), 'perfil:genero');
  ok(num(filas().pop()[iE + 1]) === num(totalSolo[iE]), 'El total del desglose por dato personal coincide con el total del alcance');

  /* Análisis de egresos con los datos personales */
  await click(nav('Ingresos y egresos'), 200);
  const tabA = [...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Análisis de egresos'));
  await click(tabA, 200);
  ok(['escolaridad', 'estadoCivil', 'hijos', 'estadoResidencia', 'municipio', 'genero', 'edad'].every((id) => !!d.querySelector(`#ae-dim-${id}`)), 'Análisis de egresos: RRHH puede combinar también escolaridad, estado civil, hijos y residencia');
  await click(d.querySelector('#ae-dim-motivo'), 100); await click(d.querySelector('#ae-dim-escolaridad'), 100); await click(d.querySelector('#ae-dim-hijos'), 100);
  const sumaCant = () => [...d.querySelectorAll('#ae-tabla tbody tr')].filter((r) => !r.className.includes('border-t-2')).reduce((a, r) => a + Number(r.querySelectorAll('td')[r.querySelectorAll('td').length - 4].textContent), 0);
  const totalAe = Number([...d.querySelectorAll('#ae-tabla tbody tr')].pop().querySelectorAll('td')[1].textContent);
  ok(totalAe > 0 && sumaCant() === totalAe, `Escolaridad × Hijos: la tabla suma el total de egresos (${totalAe})`);

  /* Un Gerente de Marca no ve datos personales */
  await click(boton('Salir'), 200);
  await click(boton('Gerente de Marca'), 250);
  { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Entendido'); if (b) await click(b, 100); }
  await click(nav('Indicadores de gestión'), 300);
  const sk = d.querySelector('section[aria-labelledby=ind-kpi]'); await click(sk.querySelector('button'), 200);
  const d2 = d.querySelector('#kpi-area-personal'); if (d2) d2.open = true; await espera(60);
  await click(d.querySelector('#kpi-ver-rot'), 150);
  const sel2 = d.querySelector('#cruce-desglose');
  ok(!!sel2 && ![...sel2.options].some((o) => o.value.startsWith('perfil:')), 'Gerente de Marca: el desglose por datos personales no está disponible');
  await click(nav('Ingresos y egresos'), 200);
  await click([...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Análisis de egresos')), 200);
  ok(!d.querySelector('#ae-dim-escolaridad') && !d.querySelector('#ae-dim-hijos') && !d.querySelector('#ae-dim-genero'), 'Gerente de Marca: el análisis de egresos no ofrece datos personales');
})();
