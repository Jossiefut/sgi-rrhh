/* Análisis de egresos (combinación de variables), KPI de egresos y cruce de indicadores en un mismo período */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const M = await import('./egresos-analisis.js');
  /* --- módulo puro --- */
  ok(M.tipoDeEgreso('Renuncia voluntaria') === 'Voluntario' && M.tipoDeEgreso('Abandono de trabajo') === 'Voluntario' && M.tipoDeEgreso('Despido justificado') === 'Por la empresa' && M.tipoDeEgreso('Mutuo acuerdo') === 'Mutuo acuerdo' && M.tipoDeEgreso('') === 'Otro o sin motivo', 'Tipo de egreso según el motivo');
  ok(M.tramoAntiguedad(10) === 'Menos de 30 días' && M.tramoAntiguedad(30) === '30 a 89 días' && M.tramoAntiguedad(89) === '30 a 89 días' && M.tramoAntiguedad(90) === '90 a 179 días' && M.tramoAntiguedad(364) === '180 a 364 días' && M.tramoAntiguedad(365) === '1 a 2 años' && M.tramoAntiguedad(900) === 'Más de 2 años' && M.tramoAntiguedad(null) === 'Sin fecha de ingreso', 'Tramos de antigüedad');
  const diff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const ctx = { nombreTienda: (i) => ({ T1: 'Tienda 1', T2: 'Tienda 2' }[i]), nombreCargo: (i) => ({ A: 'Asesor', C: 'Cajero' }[i]), marcaDeTienda: () => 'Balú', formatoDeTienda: () => 'Mall', traducir: (x) => x, umbral: 90, diffDias: diff, generoDe: () => 'Femenino', edadAlEgresar: () => 30, rangoEdad: () => '26 a 35', verDemografia: false };
  const mk = (tiendaId, cargoId, motivo, fi, fe) => ({ id: Math.random(), tiendaId, cargoId, motivoEgreso: motivo, fechaIngreso: fi, fechaEgreso: fe });
  const trabs = [
    mk('T1', 'A', 'Renuncia voluntaria', '2026-06-01', '2026-07-10'), mk('T1', 'A', 'Renuncia voluntaria', '2025-01-01', '2026-07-20'),
    mk('T1', 'C', 'Despido justificado', '2026-01-01', '2026-08-02'), mk('T2', 'A', 'Abandono de trabajo', '2026-05-01', '2026-08-15'),
    mk('T2', 'A', 'Término de contrato', '2024-01-01', '2026-09-30'), mk('T2', 'C', '', '2026-08-01', '2026-09-05'),
  ];
  const filas = M.filasEgreso(trabs, ctx);
  const dims = M.crearDimensiones(ctx); const D = (id) => dims.find((d) => d.id === id);
  ok(filas.length === 6 && dims.every((d) => d.id !== 'genero' && d.id !== 'edad'), 'Seis egresos; género y edad no están disponibles sin permiso');
  ok(M.crearDimensiones({ ...ctx, verDemografia: true }).some((d) => d.id === 'genero') && M.crearDimensiones({ ...ctx, verDemografia: true }).some((d) => d.id === 'edad'), 'Con permiso aparecen género y rango de edad');
  const g1 = M.agrupar(filas, [D('motivo')]);
  ok(g1[0].valores[0] === 'Renuncia voluntaria' && g1[0].n === 2 && Math.abs(g1[0].pct - 33.33) < 0.1 && g1.reduce((a, g) => a + g.n, 0) === 6, 'Una variable (motivo): cantidades y porcentajes, ordenado por cantidad');
  const g2 = M.agrupar(filas, [D('motivo'), D('cargo')]);
  ok(g2.length === 5 && g2.find((g) => g.valores[0] === 'Renuncia voluntaria' && g2 && g.valores[1] === 'Asesor').n === 2 && g2.reduce((a, g) => a + g.n, 0) === 6, 'Dos variables (motivo × cargo): combinaciones correctas y suman el total');
  const g3 = M.agrupar(filas, [D('marca'), D('tienda'), D('tipo')]);
  ok(g3.every((g) => g.valores.length === 3) && g3.reduce((a, g) => a + g.n, 0) === 6 && g3.find((g) => g.valores[1] === 'Tienda 1' && g.valores[2] === 'Voluntario').n === 2, 'Tres variables (marca × tienda × tipo)');
  const gm = M.agrupar(filas, [D('mes')]);
  ok(gm.map((g) => g.valores[0]).join('|') === '2026-07 julio|2026-08 agosto|2026-09 septiembre' && gm[0].n === 2, 'El mes se ordena cronológicamente');
  const ga = M.agrupar(filas, [D('antiguedad')]);
  ok(ga[0].valores[0] === '30 a 89 días' && ga[0].n === 2 && ga.map((g) => g.valores[0]).indexOf('Más de 2 años') > ga.map((g) => g.valores[0]).indexOf('30 a 89 días'), 'La antigüedad se ordena de menor a mayor');
  const tem = filas.filter((f) => f.temprano).length;
  ok(tem === 2 && M.agrupar(filas, [D('temprano')]).find((g) => g.valores[0] === 'Temprano').n === 2, 'Egresos tempranos (menos de 90 días): 2');
  const mt = M.matriz(filas, D('motivo'), D('cargo'));
  ok(mt.total === 6 && mt.totalFila.reduce((a, b) => a + b, 0) === 6 && mt.totalCol.reduce((a, b) => a + b, 0) === 6 && mt.celdas.flat().reduce((a, b) => a + b, 0) === 6, 'Matriz motivo × cargo: totales consistentes');
  const rs = M.resumenEgresos(filas);
  ok(rs.n === 6 && rs.voluntarios === 3 && Math.abs(rs.pctVoluntarios - 50) < 0.01 && rs.principal.motivo === 'Renuncia voluntaria', 'Resumen: voluntarios 50% y motivo principal');
  const cr = M.correlacion([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]); const ci = M.correlacion([1, 2, 3, 4], [8, 6, 4, 2]);
  ok(cr && Math.abs(cr.r - 1) < 1e-9 && ci && Math.abs(ci.r + 1) < 1e-9 && M.correlacion([1, 1, 1], [1, 2, 3]) === null && M.correlacion([1, 2], [1, 2]) === null && M.correlacion([1, null, 3, 4], [1, 5, 3, 4]).n === 3, 'Correlación: perfecta directa, inversa, y sin variación o pocos datos devuelve nulo');

  /* --- aplicación --- */
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w) { w.scrollTo = () => {}; w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {}; } });
  await espera(300);
  const w = dom.window; const d = w.document;
  const click = async (el, ms = 80) => { if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const texto = () => { const c = d.body.cloneNode(true); c.querySelectorAll('script,style').forEach((n) => n.remove()); return c.textContent; };
  const db = () => JSON.parse(w.localStorage.getItem('talento-balu-v2'));
  const setValor = async (el, vv) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, vv); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(120); };
  const marcar = async (el) => { await click(el, 120); };
  const libros = [];
  w.HTMLAnchorElement.prototype.click = function () {};
  w.XLSX = { utils: { aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ hojas: [] }), book_append_sheet: (l, h, n) => l.hojas.push({ n, aoa: h.aoa }) }, write: (l) => { libros.push(l); return new Uint8Array(4); } };
  await click(boton('Gerente de RRHH'), 250);
  const cerrarCumple = async () => { const b = [...d.querySelectorAll('[role=dialog] button')].find((x) => x.textContent.trim() === 'Entendido'); if (b) await click(b, 100); };
  await cerrarCumple();
  const hoy = new Date().toISOString().slice(0, 10);
  const sumar = (iso, n) => { const x = new Date(`${iso}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const desde12 = sumar(hoy, -365);
  const tiendasAlc = new Set(db().tiendas.filter((x) => x.activa && !x.administrativa).map((x) => x.id));
  const egr12 = db().trabajadores.filter((x) => !x.esPrueba && tiendasAlc.has(x.tiendaId) && x.fechaEgreso && x.fechaEgreso > desde12 && x.fechaEgreso <= hoy);

  /* Ingresos y egresos › Análisis de egresos */
  await click(nav('Ingresos y egresos'), 200);
  await setValor(d.querySelector('#ip-periodo'), 'ult12m');
  ok([...d.querySelector('#ip-periodo').options].some((o) => o.value === 'ult12m' && o.text === 'Últimos 12 meses'), 'El período «Últimos 12 meses» está disponible');
  const tabA = [...d.querySelectorAll('[role=tab]')].find((b) => b.textContent.includes('Análisis de egresos'));
  ok(!!tabA, 'Hay una pestaña «Análisis de egresos»');
  await click(tabA, 200);
  ok(!!d.querySelector('#analisis-egresos') && d.querySelector('#ae-dim-motivo').checked, 'Se abre el análisis con «Motivo» marcado');
  const sumaCant = () => [...d.querySelectorAll('#ae-tabla tbody tr')].filter((r) => !r.className.includes('border-t-2')).reduce((a, r) => a + Number(r.querySelectorAll('td')[r.querySelectorAll('td').length - 4].textContent), 0);
  const totalAlcance = Number([...d.querySelectorAll('#ae-tabla tbody tr')].pop().querySelectorAll('td')[1].textContent);
  const egrPeriodoApp = db().trabajadores.filter((x) => x.fechaEgreso && x.fechaEgreso >= desde12 && x.fechaEgreso <= hoy).length;
  ok(totalAlcance > 0 && sumaCant() === totalAlcance, `La suma de la tabla por motivo (${sumaCant()}) coincide con el total de egresos (${totalAlcance})`);
  ok(totalAlcance === egrPeriodoApp, 'El total corresponde a los egresos del período elegido');
  await marcar(d.querySelector('#ae-dim-cargo'));
  const encabezados = () => [...d.querySelectorAll('#ae-tabla thead th')].map((x) => x.textContent.trim());
  ok(encabezados().slice(0, 2).join('|') === 'Motivo|Cargo' && !!d.querySelector('#ae-matriz') && sumaCant() === totalAlcance, 'Motivo × Cargo: tabla combinada y matriz, mismo total');
  await marcar(d.querySelector('#ae-dim-tienda'));
  ok(encabezados().slice(0, 3).join('|') === 'Motivo|Cargo|Tienda' && !d.querySelector('#ae-matriz') && sumaCant() === totalAlcance, 'Tres variables: Motivo × Cargo × Tienda, sin matriz, mismo total');
  await marcar(d.querySelector('#ae-dim-motivo')); await marcar(d.querySelector('#ae-dim-cargo')); await marcar(d.querySelector('#ae-dim-tienda'));
  ok(texto().includes('Elija una variable'), 'Sin variables elegidas se pide elegir');
  await click(d.querySelector('#ae-preset-tienda-motivo'), 150);
  ok(encabezados().slice(0, 2).join('|') === 'Tienda|Motivo' && !!d.querySelector('#ae-matriz'), 'La combinación sugerida «Tienda × Motivo» funciona');
  ok(!!d.querySelector('#ae-dim-genero') && !!d.querySelector('#ae-dim-edad'), 'RRHH ve las variables de género y rango de edad');
  await click(d.querySelector('#ae-excel'), 400);
  const lx = libros[libros.length - 1];
  ok(lx && lx.hojas.map((h) => h.n).join('|') === 'Análisis|Matriz|Parámetros|Egresos|Autenticación', 'Excel del análisis: hojas Análisis, Matriz, Parámetros, Egresos y Autenticación: ' + (lx && lx.hojas.map((h) => h.n).join('|')));
  const hA = lx.hojas[0].aoa; const sumaX = hA.slice(1).reduce((a, f) => a + f[2], 0);
  ok(hA[0].join('|').startsWith('Tienda|Motivo|Cantidad') && sumaX === totalAlcance && lx.hojas[3].aoa.length - 1 === totalAlcance, 'El Excel trae las mismas cantidades y el detalle de cada egreso');

  /* KPI de egresos */
  await click(nav('Indicadores de gestión'), 300);
  const secKpi = d.querySelector('section[aria-labelledby=ind-kpi]');
  await click(secKpi.querySelector('button'), 200);
  const det = d.querySelector('#kpi-area-reclutamiento'); det.open = true; await espera(50);
  const filaK = (id) => d.querySelector(`#kpi-ver-${id}`).closest('tr');
  ok(!!d.querySelector('#kpi-ver-egrcant') && !!d.querySelector('#kpi-ver-egrmotivo') && !!d.querySelector('#kpi-ver-egrvol'), 'Reclutamiento e ingreso tiene los KPI de egresos con casilla «Ver»');
  const valEgr = Number(filaK('egrcant').querySelectorAll('td')[1].textContent.trim());
  ok(valEgr === egr12.length, `KPI «Egresos del período» = ${valEgr} (esperado ${egr12.length})`);
  ok(/·\s*\d+%/.test(filaK('egrmotivo').querySelectorAll('td')[1].textContent) && /\d+%/.test(filaK('egrvol').querySelectorAll('td')[1].textContent), 'Motivo principal y % de egresos voluntarios se muestran');
  ok(texto().includes('Período de medición'), 'El período de medición está disponible para todos los roles');

  /* Cruce de indicadores */
  ok(!d.querySelector('#cruce-tabla'), 'Sin indicadores marcados no hay cruce');
  await marcar(d.querySelector('#kpi-ver-egrcant')); await marcar(d.querySelector('#kpi-ver-rot')); await marcar(d.querySelector('#kpi-ver-hc'));
  ok(!!d.querySelector('#cruce-tabla'), 'Al marcar «Ver» se abre el cruce de indicadores');
  const cab = [...d.querySelectorAll('#cruce-tabla thead th')].map((x) => x.textContent.trim());
  ok(cab.length === 4 && cab[0] === 'Tienda' && cab.includes('Egresos del período') && cab.includes('Rotación 12 meses') && cab.includes('Cobertura del HC'), 'El cruce muestra por tienda los tres indicadores: ' + cab.join(' | '));
  const nFilas = d.querySelectorAll('#cruce-tabla tbody tr').length;
  ok(nFilas === tiendasAlc.size + 1, `Una fila por tienda (${tiendasAlc.size}) más el total del alcance`);
  const colEgr = cab.indexOf('Egresos del período');
  const sumaTiendas = [...d.querySelectorAll('#cruce-tabla tbody tr')].slice(0, -1).reduce((a, r) => a + Number(r.querySelectorAll('td')[colEgr].textContent.trim()), 0);
  const totalFila = Number([...d.querySelectorAll('#cruce-tabla tbody tr')].pop().querySelectorAll('td')[colEgr].textContent.trim());
  ok(sumaTiendas === totalFila && totalFila === valEgr, `La suma de egresos por tienda (${sumaTiendas}) coincide con el total (${totalFila}) y con el KPI`);
  ok(!!d.querySelector('#cruce-corr') && d.querySelectorAll('#cruce-corr li').length === 3, 'Con tres indicadores hay tres relaciones por pares');
  ok(texto().includes('Mismo período para todos') || texto().includes('el mismo período'), 'El cruce declara que todos los indicadores hablan del mismo período');
  await setValor(d.querySelector('#cruce-desglose'), 'total');
  ok(d.querySelectorAll('#cruce-tabla tbody tr').length === 1 && !d.querySelector('#cruce-corr'), 'Desglose «solo el total»: una fila y sin correlaciones');
  await setValor(d.querySelector('#cruce-desglose'), 'marca');
  ok(d.querySelectorAll('#cruce-tabla tbody tr').length === 3 && d.querySelector('#cruce-tabla thead th').textContent.trim() === 'Marca', 'Desglose por marca: Balú, Planeta y total');
  await setValor(d.querySelector('#cruce-desglose'), 'tienda');
  await click(d.querySelector('#cruce-excel'), 500);
  const lc = libros[libros.length - 1];
  ok(lc.hojas.map((h) => h.n).join('|') === 'Cruce|Parámetros|Correlaciones|Fórmulas|Autenticación', 'Excel del cruce: hojas Cruce, Parámetros, Correlaciones, Fórmulas y Autenticación: ' + lc.hojas.map((h) => h.n).join('|'));
  ok(lc.hojas[0].aoa.length === tiendasAlc.size + 2 && lc.hojas[0].aoa[0].length === 4, 'El Excel del cruce trae una fila por tienda, el total y los tres indicadores');
  /* Cambiar el período rige a todos los indicadores del cruce */
  await setValor(d.querySelector('#ind-periodo'), 'anio');
  const ant = hoy.slice(0, 4);
  const tx = d.querySelector('#ind-cruce') ? d.querySelector('#ind-cruce').closest('section').textContent : '';
  ok(tx.includes('01/01/' + ant), 'Al cambiar el período, el cruce pasa al año en curso (desde 01/01/' + ant + ')');
  const valEgrAnt = Number([...d.querySelectorAll('#cruce-tabla tbody tr')].pop().querySelectorAll('td')[colEgr].textContent.trim());
  const esperAnt = db().trabajadores.filter((x) => !x.esPrueba && tiendasAlc.has(x.tiendaId) && x.fechaEgreso && x.fechaEgreso > `${ant}-01-01` && x.fechaEgreso <= hoy).length;
  ok(valEgrAnt === esperAnt && esperAnt > 0 && esperAnt <= valEgr, `Egresos del año en curso en el cruce: ${valEgrAnt} (esperado ${esperAnt})`);
  await click(d.querySelector('#cruce-limpiar'), 150);
  ok(!d.querySelector('#cruce-tabla'), 'Quitar todos cierra el resultado del cruce');
  console.log(process.exitCode ? '\nHAY FALLAS' : '\nTodo correcto');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('✗ Error:', e); process.exit(1); });
