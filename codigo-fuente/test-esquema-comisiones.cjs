/* Importar el Excel «Esquema de comisiones y estructura de pago» a modelos de compensación y exportar modelos y salarios a Excel (v1.24.0) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));

/* Libro de ejemplo con la misma estructura que el real, pero con datos inventados */
const hojasEjemplo = [
  { nombre: 'Esquemas de Comisiones', filas: [
    ['Marca', 'Razón Social', 'Ubicación', 'Cargo', '% Base', '% Meta 1', '% Meta 2', '% Meta 3', 'Cálculo'],
    ['Balú', 'Empresa Uno, C.A.', 'C.C. Lido / C.C. Parque Inexistente', 'Gerente De Tienda', 0.002, '', '', '', 'Venta Global Sin Iva'],
    ['Balú', 'Empresa Uno, C.A.', 'C.C. Lido / C.C. Parque Inexistente', 'Asesor (A) De Ventas', 0.005, '', '', '', 'Venta Individual sin Iva'],
    ['Balú', 'Empresa Uno, C.A.', 'C.C. Propatria', 'Gerente De Tienda', '1,20%, 1,40%, 1,70%', '1,30%, 1,50%, 1,80%', '1,40%, 1,60%, 1,90%', '1,50%, 1,70%, 2%', '*Global + Otras secciones + su sección'],
    ['Balú', 'Empresa Uno, C.A.', 'C.C. Propatria', 'Cajero (A) Titular', 0.015, 0.016, 0.017, 0.018, '* De la Venta Global sin Iva diaria'],
    ['Planeta Sports', 'Empresa Dos, C.A.', 'Toda la Marca', 'Gerente de Tienda', 0.005, '', '', '', 'Venta Global sin Iva'],
    ['Planeta Sports', 'Empresa Dos, C.A.', 'Toda la Marca', 'Gerente de Tienda', 0.003, '', '', '', 'Venta Global sin Iva'],
  ] },
  { nombre: 'Estructura de Pago', filas: [
    ['', 'Marcas Propias (Balú - Planeta)'],
    ['', 'Cargos', 'Sueldo', 'Tickets', 'Ayuda Mensual', 'Asignación Tren Gerencial $ - Bs.', '', '', 'Observaciones'],
    ['', '', 'Bs.', '(Pagados en Bs tasa oficial)', '(Pagados en Bs tasa ajustada)', 'Categoria AAA', 'Categoria A', 'Categoria B', ''],
    ['', 'Gerente de Tienda', 210, 40, 170, 300, 200, 100, 'Aplica para algunas tiendas'],
    ['', 'Sub-Gerente de Tienda', 190, 40, 150, 250, 150, 80, ''],
    ['', 'Asesor (A) De Ventas', 130, 40, 80, '', '', '', ''],
  ] },
  { nombre: 'Divisas Tiendas', filas: [
    ['', '', '', '', '', '', '', 'CATEGORIAS', 'CARGOS', 'MONTO'],
    ['Asignación Tren Gerencial', '', '', '', '', '', '', 'AAA', 'GERENTE DE TIENDA', '$300,00'],
    ['', '', '', '', '', '', '', 'AAA', 'SUB-GERENTE DE TIENDA', '$250,00'],
    ['', '', '', '', '', '', '', 'A', 'GERENTE DE TIENDA', '$200,00'],
    ['', '', '', '', '', '', '', 'A', 'SUB-GERENTE DE TIENDA', '$150,00'],
    ['', '', '', '', '', '', '', 'B', 'GERENTE DE TIENDA', '$100,00'],
    ['', '', '', '', '', '', '', 'B', 'SUB-GERENTE DE TIENDA', '$80,00'],
    ['MARCA', 'RAZÓN SOCIAL', 'UBICACIÓN', 'ASIGNACIÓN', 'CATEGORIA', 'OBSERVACIONES'],
    ['BALÚ MODA', 'EMPRESA UNO, C.A.', 'C.C. PROPATRIA', 'SI', 'B', 'MIXTO'],
    ['BALÚ MODA', 'EMPRESA UNO, C.A.', 'C.C. LIDO', 'SI', 'AAA', ''],
    ['BALÚ MODA', 'EMPRESA UNO, C.A.', 'C.C. LA CASCADA', 'NO', '', ''],
    ['BALÚ MODA', 'EMPRESA UNO, C.A.', 'C.C. SAMBIL INEXISTENTE', 'SI', 'A', ''],
  ] },
  { nombre: 'Asignación Tren Gerencial', filas: [['Marcas', 'Cédula'], ['BALÚ MODA', 'V-00.000.000']] },
];

(async () => {
  /* --- módulo puro --- */
  const E = await import('./esquema-comisiones.js');
  ok(E.cargoIdDe('Sub-Gerente De Tienda') === 'SUB' && E.cargoIdDe('Gerente de Tienda') === 'GT' && E.cargoIdDe('Jefe (A) De Almacén') === 'JALM' && E.cargoIdDe('Cajero (A) Titular') === 'CAJT' && E.cargoIdDe('Cajero (A)') === 'CAJ' && E.cargoIdDe('Depositario (A)') === 'ALM' && E.cargoIdDe('Visual') === 'VM' && E.cargoIdDe('Asesor (A) De Ventas') === 'ASE' && E.cargoIdDe('Panadero') === '', 'Los cargos del Excel se reconocen');
  ok(E.porcentajeDe(0.0015) === '0.15' && E.porcentajeDe(0.004999999999999999) === '0.5' && E.porcentajeDe('1,20%, 1,40%') === '1,20%, 1,40%' && E.porcentajeDe('') === '', 'Los porcentajes del Excel pasan a porcentaje legible');
  ok(E.montoDe('$300,00') === 300 && E.montoDe(40) === 40 && E.montoDe('') === null, 'Los montos con signo $ y coma decimal se leen');
  const tds = [{ id: 'a', nombre: 'Sambil Chacao', marca: 'BALU' }, { id: 'b', nombre: 'Sambil Maracaibo', marca: 'BALU' }, { id: 'c', nombre: 'Sambil Chacao', marca: 'PLANETA' }, { id: 'd', nombre: 'CCCT', marca: 'PLANETA' }];
  ok(E.tiendaIdDe('C.C. SAMBIL CHACAO', 'BALU', tds) === 'a' && E.tiendaIdDe('C.C. Sambil Chacao', 'PLANETA', tds) === 'c' && E.tiendaIdDe('C.C.C.T.', 'PLANETA', tds) === 'd' && E.tiendaIdDe('C.C. Sambil', 'BALU', tds) === '' && E.tiendaIdDe('Mall X', 'BALU', tds) === '', 'Las tiendas se emparejan por nombre y marca; si hay duda no se adivina');

  /* --- aplicación --- */
  let dom; let w; let d; const libros = []; let hojasLeidas = hojasEjemplo;
  const crear = (estado) => {
    dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w0) { w0.scrollTo = () => {}; w0.URL.createObjectURL = () => 'blob:x'; w0.URL.revokeObjectURL = () => {}; if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
    w = dom.window; d = w.document;
    w.HTMLAnchorElement.prototype.click = function () {};
    w.XLSX = { utils: { aoa_to_sheet: (aoa) => ({ aoa }), book_new: () => ({ hojas: [] }), book_append_sheet: (l, h, n) => l.hojas.push({ n, aoa: h.aoa }), sheet_to_json: (h) => h.filas }, read: () => ({ SheetNames: hojasLeidas.map((h) => h.nombre), Sheets: Object.fromEntries(hojasLeidas.map((h) => [h.nombre, h])) }), write: (l) => { libros.push(l); return new Uint8Array(4); } };
  };
  const click = async (el, ms = 120) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const estado = () => { const est = JSON.parse(w.localStorage.getItem('talento-balu-v2')); return est.datos || est; };
  const setValor = async (el, vv) => { const proto = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, vv); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(150); };
  const hoja = (nombre) => (libros[libros.length - 1].hojas.find((h) => h.n === nombre) || {}).aoa;

  crear(); await espera(400);
  const raw = JSON.parse(w.localStorage.getItem('talento-balu-v2')); dom.window.close();
  crear(JSON.stringify(raw)); await espera(400);
  const tProp = estado().tiendas.find((t) => t.nombre === 'Propatria'); const tLido = estado().tiendas.find((t) => t.nombre === 'Lido'); const t05 = estado().tiendas.find((t) => t.nombre === 'Tienda 05');
  await click(boton('Gerente de RRHH'), 250);
  await click(nav('Modelos de compensación'), 300);
  ok(!!d.getElementById('mc-importar') && !!d.getElementById('mc-exportar'), 'RRHH ve «Importar esquema (Excel)» y «Exportar a Excel» en Modelos de compensación');

  /* importar */
  const inp = d.getElementById('mc-esquema');
  Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'esquema.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })], configurable: true });
  inp.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(500);
  const dlg = () => [...d.querySelectorAll('[role=dialog]')].pop();
  ok(dlg() && /Vista previa del esquema/.test(dlg().textContent), 'Se abre la vista previa con los modelos que se cargarán');
  ok(/Estructura de pago Balú/.test(dlg().textContent) && /Comisión Balú · Grupo 1/.test(dlg().textContent) && /Comisión Planeta · Toda la marca/.test(dlg().textContent), 'Propone un modelo base por marca y un modelo de comisión por grupo de tiendas');
  ok(/Ubicaciones del Excel sin tienda/.test(dlg().textContent) && /Parque Inexistente/i.test(dlg().textContent) && /Sambil Inexistente/i.test(dlg().textContent), 'Avisa de las ubicaciones del Excel que no existen en la aplicación y deja elegirlas u omitirlas');
  ok(/más de un porcentaje para el mismo cargo/.test(dlg().textContent), 'Avisa cuando el Excel trae dos porcentajes para el mismo cargo');
  ok(!/V-00\.000\.000/.test(d.body.textContent), 'La hoja nominal con cédulas no se muestra ni se carga');
  /* asignar manualmente una ubicación sin coincidencia: se elige Lido para «Parque Inexistente» no; se deja omitida y se elige Propatria para «Sambil Inexistente» */
  const selects = [...dlg().querySelectorAll('select[id^=esq-map-]')];
  const selSambil = selects.find((s) => /Sambil Inexistente/i.test(s.closest('div').textContent));
  await setValor(selSambil, t05.id);
  await click(d.getElementById('mc-esquema-cargar'), 400);
  const e1 = estado();
  const modelos = e1.modelosCompensacion || [];
  ok(modelos.length === 5, `Se cargaron 5 modelos (2 de estructura, 2 de comisión de Balú y 1 de Planeta): ${modelos.length}`);
  const base = modelos.find((m) => m.nombre === 'Estructura de pago Balú');
  ok(base && base.oficial === false && base.componentes.some((c) => c.concepto === 'Sueldo mensual' && c.valor === 'USD 210' && c.cargos.join() === 'GT') && base.componentes.some((c) => c.concepto === 'Tickets' && c.montoUsd === '40'), 'La estructura de pago queda como borrador con sueldo por cargo y tickets');
  ok(base.ayudaPorCargo.GT.monto === '170' && base.ayudaPorCargo.ASE.monto === '80' && base.ayudaPorCargo.GT.moneda === 'USD', 'La ayuda mensual por cargo queda cargada');
  ok(base.trenGerencial[tProp.id] && base.trenGerencial[tProp.id].gt.monto === '100' && base.trenGerencial[tProp.id].gt.categoria === 'B' && base.trenGerencial[tProp.id].gt.mixto === true && base.trenGerencial[tProp.id].sub.monto === '80', 'El tren gerencial de cada tienda sale de su categoría y conserva la marca «mixto»');
  ok(base.trenGerencial[tLido.id] && base.trenGerencial[tLido.id].gt.monto === '300' && base.trenGerencial[t05.id].gt.monto === '200' && !base.trenGerencial[(estado().tiendas.find((t) => t.nombre === 'La Cascada') || {}).id], 'Tiendas con categoría AAA reciben 300; las que no tienen asignación quedan sin tren gerencial');
  const com = modelos.find((m) => m.nombre === 'Comisión Balú · Grupo 2');
  ok(com && com.comisionCargos.find((c) => c.cargoId === 'GT').pctVenta === '1,20%, 1,40%, 1,70%' && com.comisionCargos.find((c) => c.cargoId === 'GT').metas.length === 3 && com.formasComision.includes('ESCALA') && com.tiendas.join() === tProp.id, 'Comisión de Propatria: escala por metas y solo esa tienda');
  const g1 = modelos.find((m) => m.nombre === 'Comisión Balú · Grupo 1');
  ok(g1 && g1.comisionCargos.find((c) => c.cargoId === 'GT').pctVenta === '0.2' && g1.tiendas.includes(tLido.id), 'Comisión del grupo 1: 0,002 se guarda como 0,2 % y Lido queda asignada');
  const pla = modelos.find((m) => m.nombre === 'Comisión Planeta · Toda la marca');
  ok(pla && pla.comisionCargos.length === 1 && pla.comisionCargos[0].alternativas.length === 1 && pla.tiendas.length === 11, 'Planeta: el segundo porcentaje queda como alternativa por confirmar y aplica a toda la marca');
  ok((e1.bitacora || []).some((b) => b.accion === 'IMPORTAR' && b.entidad === 'Modelo de compensación'), 'La importación queda en la bitácora');
  const nBase = estado().tiendas.length; ok(estado().tiendas.length === nBase, 'No se modifican las tiendas');

  /* volver a importar reemplaza por nombre */
  await click(nav('Modelos de compensación'), 200);
  Object.defineProperty(d.getElementById('mc-esquema'), 'files', { value: [new w.File(['x'], 'esquema.xlsx')], configurable: true });
  d.getElementById('mc-esquema').dispatchEvent(new w.Event('change', { bubbles: true })); await espera(500);
  await click(d.getElementById('mc-esquema-cargar'), 400);
  ok((estado().modelosCompensacion || []).length === 5, 'Al importar de nuevo se reemplazan los modelos del mismo nombre (no se duplican)');

  /* pestaña Modelos: se ve la comisión con metas */
  await click([...d.querySelectorAll('[role=tab]')].find((t) => t.textContent.trim().startsWith('Modelos')), 250);
  ok(/Metas 1 · 2 · 3/.test(d.body.textContent) && /Estructura de pago Balú/.test(d.body.textContent), 'El detalle del modelo muestra las metas y la estructura de pago');

  /* exportar */
  await click(d.getElementById('mc-exportar'), 400);
  const nombres = libros.length ? libros[libros.length - 1].hojas.map((h) => h.n) : [];
  ok(['Resumen', 'Modelos', 'Componentes', 'Comisión por cargo', 'KPI de retail', 'Ayuda mensual', 'Tren gerencial', 'Comisión por vendedor', 'Modelos por tienda', 'Salarios vigentes', 'Historial de salarios'].every((n) => nombres.includes(n)), 'El Excel trae: ' + nombres.join(', '));
  const mod = hoja('Modelos'); ok(mod.length === 6 && mod[0][2] === 'Tipo de modelo' && mod.some((f) => f[0] === 'Estructura de pago Balú' && /Fijo/.test(f[2]) && f[3] === 'Borrador'), 'La hoja Modelos indica el tipo de modelo (Fijo, Variable…) y su estado');
  const tg = hoja('Tren gerencial'); ok(tg.some((f) => /Propatria/.test(f[2]) && f[3] === 'B' && f[4] === 100 && f[8] === 'Sí'), 'La hoja Tren gerencial trae categoría, montos y si es mixto');
  const cc = hoja('Comisión por cargo'); ok(cc.some((f) => f[2] === 'Gerente de Tienda' && f[3] === '1,20%, 1,40%, 1,70%' && f[5] === '1,30%, 1,50%, 1,80%'), 'La hoja Comisión por cargo trae base y metas');
  const ay = hoja('Ayuda mensual'); ok(ay.some((f) => f[2] === 'Gerente de Tienda' && f[4] === 170), 'La hoja Ayuda mensual trae los montos como números');
  const comp = hoja('Componentes'); ok(comp.some((f) => f[2] === 'Sueldo mensual' && f[9] === 210), 'La hoja Componentes trae los sueldos por cargo');
  const bit = estado().bitacora || []; ok(bit.some((b) => b.accion === 'EXPORTAR'), 'La exportación queda en la bitácora');

  /* Remuneración: botón de modelos y salarios */
  const antes = libros.length;
  await click(nav('Remuneración'), 300);
  ok(!!d.getElementById('rem-exp-modelos'), 'En Remuneración del personal aparece «Modelos y salarios (Excel)»');
  await click(d.getElementById('rem-exp-modelos'), 400);
  ok(libros.length === antes + 1 && libros[libros.length - 1].hojas.some((h) => h.n === 'Modelos') && libros[libros.length - 1].hojas.some((h) => h.n === 'Salarios vigentes'), 'Desde Remuneración también se exporta el tipo de modelo y los salarios');
  dom.window.close();

  /* Gerente de Marca: ve y exporta, pero no importa */
  crear(JSON.stringify({ ...raw, datos: undefined, ...(raw.datos ? { datos: estado ? raw.datos : raw.datos } : {}) })); await espera(400);
  await click(boton('Gerente de Marca', 0), 250);
  await click(nav('Modelos de compensación'), 300);
  ok(!d.getElementById('mc-importar') && !!d.getElementById('mc-exportar'), 'El Gerente de Marca puede exportar pero no importar esquemas');
  console.log(process.exitCode ? '\nHAY FALLAS' : '\nTodo correcto');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('✗ Error:', e); process.exit(1); });
