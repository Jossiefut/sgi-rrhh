/* Lectura del libro «Esquema de comisiones y estructura de pago» (v1.24.0).
 * Convierte las hojas del Excel en modelos de compensación (borrador) listos para revisar:
 *   - «Esquemas de Comisiones»  → un modelo de comisión por grupo de tiendas (porcentaje por cargo, metas 1-3 y forma de cálculo).
 *   - «Estructura de Pago»      → un modelo base por marca (sueldo, tickets, ayuda mensual por cargo y montos del tren gerencial).
 *   - «Divisas Tiendas»         → tren gerencial de cada tienda (si aplica, categoría AAA/A/B y si es mixto).
 *   - «Asignación Tren Gerencial» (lista nominal con cédulas) NO se lee: los montos salen de la categoría de la tienda.
 * Es un módulo puro: no toca la pantalla ni el almacenamiento. Nada de lo que el libro contiene queda en el código. */

const SIN_ACENTOS = (s) => String(s === undefined || s === null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '');
export const normalizarTexto = (s) => SIN_ACENTOS(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const PALABRAS_VACIAS = new Set(['c', 'cc', 'centro', 'comercial', 'mall', 'de', 'del', 'la', 'el', 'los', 'las', 'y', 'bulevar', 'nacional', 'na', 'nl']);
function fichaUbicacion(texto) {
  const n = normalizarTexto(texto);
  if (n === 'c c c t' || n === 'ccct') return ['ccct'];
  return n.split(' ').filter((p) => p && !PALABRAS_VACIAS.has(p));
}

export function marcaDe(texto) {
  const n = normalizarTexto(texto);
  if (n.startsWith('planeta')) return 'PLANETA';
  if (n.startsWith('balu')) return 'BALU';
  return '';
}

export function cargoIdDe(texto) {
  const n = normalizarTexto(texto).replace(/\ba\b/g, ' ').replace(/\s+/g, ' ').trim();
  if (!n) return '';
  if (n.includes('sub') && n.includes('gerente')) return 'SUB';
  if (n.includes('gerente')) return 'GT';
  if (n.includes('jefe') && n.includes('almacen')) return 'JALM';
  if (n.includes('cajero') && n.includes('titular')) return 'CAJT';
  if (n.includes('cajero')) return 'CAJ';
  if (n.includes('depositario')) return 'ALM';
  if (n.includes('visual')) return 'VM';
  if (n.includes('asesor')) return 'ASE';
  if (n.includes('seguridad')) return 'SEG';
  return '';
}

/* Id de la tienda de la aplicación que corresponde al texto del Excel (misma marca). '' si no hay una única coincidencia. */
export function tiendaIdDe(texto, marca, tiendas, mapaManual) {
  const clave = `${marca}|${normalizarTexto(texto)}`;
  if (mapaManual && Object.prototype.hasOwnProperty.call(mapaManual, clave)) return mapaManual[clave] || '';
  const q = fichaUbicacion(texto);
  if (!q.length) return '';
  const candidatas = (tiendas || []).filter((t) => t.marca === marca && !t.administrativa);
  const fichas = candidatas.map((t) => ({ t, f: fichaUbicacion(t.nombre) }));
  const iguales = fichas.filter((x) => x.f.length === q.length && x.f.every((p) => q.includes(p)));
  if (iguales.length === 1) return iguales[0].t.id;
  const contiene = fichas.filter((x) => x.f.length && (x.f.every((p) => q.includes(p)) || q.every((p) => x.f.includes(p))));
  return contiene.length === 1 ? contiene[0].t.id : '';
}

/* 0,0015 → «0.15» (porcentaje). Un texto ya escrito como porcentaje se conserva tal cual. */
export function porcentajeDe(v) {
  if (v === '' || v === undefined || v === null) return '';
  if (typeof v === 'number') return String(Number((v * 100).toFixed(4)));
  return String(v).trim();
}

export function montoDe(v) {
  if (v === '' || v === undefined || v === null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let t = String(v).replace(/[^0-9,.-]/g, '');
  if (!t) return null;
  if (t.includes(',') && t.includes('.')) t = t.replace(/\./g, '').replace(',', '.');
  else if (t.includes(',')) t = t.replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const hojaPorNombre = (hojas, ...partes) => (hojas || []).find((h) => { const n = normalizarTexto(h.nombre); return partes.every((p) => n.includes(p)); });
const celda = (fila, i) => (i >= 0 && fila && fila[i] !== undefined && fila[i] !== null ? fila[i] : '');
const texto = (v) => String(v === undefined || v === null ? '' : v).trim();
const indiceColumna = (fila, patron) => (fila || []).findIndex((c) => patron.test(normalizarTexto(c)));

/* Hoja «Esquemas de Comisiones»: filas con marca, ubicación, cargo, % base, % meta 1-3 y forma de cálculo */
function leerComisiones(hoja, avisos) {
  const filas = hoja.filas || [];
  const h = filas.findIndex((f) => indiceColumna(f, /^marca$/) >= 0 && indiceColumna(f, /^cargo$/) >= 0 && indiceColumna(f, /base/) >= 0);
  if (h < 0) { avisos.push('En «Esquemas de Comisiones» no se encontró la fila de encabezados (Marca, Cargo, % Base).'); return []; }
  const enc = filas[h];
  const ix = { marca: indiceColumna(enc, /^marca$/), razon: indiceColumna(enc, /razon/), ubic: indiceColumna(enc, /ubicacion/), cargo: indiceColumna(enc, /^cargo$/), base: indiceColumna(enc, /base/), m1: indiceColumna(enc, /meta 1/), m2: indiceColumna(enc, /meta 2/), m3: indiceColumna(enc, /meta 3/), calc: indiceColumna(enc, /calculo/) };
  const salida = [];
  for (let i = h + 1; i < filas.length; i++) {
    const f = filas[i];
    const marca = marcaDe(celda(f, ix.marca));
    if (!marca || !texto(celda(f, ix.cargo))) continue;
    salida.push({
      fila: i + 1, marca, razon: texto(celda(f, ix.razon)), ubicacion: texto(celda(f, ix.ubic)), cargoTexto: texto(celda(f, ix.cargo)), cargoId: cargoIdDe(celda(f, ix.cargo)),
      base: celda(f, ix.base), metas: [celda(f, ix.m1), celda(f, ix.m2), celda(f, ix.m3)], calculo: texto(celda(f, ix.calc)),
    });
  }
  return salida;
}

/* Hoja «Estructura de Pago»: una fila por cargo con sueldo, tickets, ayuda mensual y tren gerencial por categoría */
function leerEstructura(hoja, avisos) {
  const filas = hoja.filas || [];
  const h = filas.findIndex((f) => indiceColumna(f, /^cargos?$/) >= 0 && indiceColumna(f, /sueldo/) >= 0);
  if (h < 0) { avisos.push('En «Estructura de Pago» no se encontró la fila de encabezados (Cargos, Sueldo).'); return []; }
  const enc = filas[h]; const sub = filas[h + 1] || [];
  const ix = { cargo: indiceColumna(enc, /^cargos?$/), sueldo: indiceColumna(enc, /sueldo/), tickets: indiceColumna(enc, /tickets/), ayuda: indiceColumna(enc, /ayuda/), obs: indiceColumna(enc, /observ/) };
  const cat = { AAA: indiceColumna(sub, /categoria aaa/), A: indiceColumna(sub, /categoria a$/), B: indiceColumna(sub, /categoria b$/) };
  const salida = [];
  for (let i = h + 2; i < filas.length; i++) {
    const f = filas[i];
    const cargoTexto = texto(celda(f, ix.cargo));
    if (!cargoTexto) { if (salida.length) break; continue; }
    const cargoId = cargoIdDe(cargoTexto);
    salida.push({ fila: i + 1, cargoTexto, cargoId, sueldo: montoDe(celda(f, ix.sueldo)), tickets: montoDe(celda(f, ix.tickets)), ayuda: montoDe(celda(f, ix.ayuda)), tren: { AAA: montoDe(celda(f, cat.AAA)), A: montoDe(celda(f, cat.A)), B: montoDe(celda(f, cat.B)) }, obs: texto(celda(f, ix.obs)) });
  }
  return salida;
}

/* Hoja «Divisas Tiendas»: tabla de montos por categoría y cargo, y tabla de tiendas con asignación, categoría y observaciones */
function leerDivisas(hoja) {
  const filas = hoja.filas || [];
  const montos = { AAA: {}, A: {}, B: {} };
  filas.forEach((f) => {
    const celdas = (f || []).map(texto);
    const i = celdas.findIndex((c) => /^(AAA|A|B)$/.test(c));
    if (i < 0) return;
    const sig = celdas.slice(i + 1).filter(Boolean);
    const cargoId = cargoIdDe(sig[0]); const monto = montoDe(sig[1]);
    if (cargoId && monto !== null && /\$/.test(sig[1] || '')) montos[celdas[i]][cargoId] = monto;
  });
  const h = filas.findIndex((f) => indiceColumna(f, /^marca$/) >= 0 && indiceColumna(f, /ubicacion/) >= 0 && indiceColumna(f, /categoria/) >= 0);
  const tiendas = [];
  if (h >= 0) {
    const enc = filas[h];
    const ix = { marca: indiceColumna(enc, /^marca$/), razon: indiceColumna(enc, /razon/), ubic: indiceColumna(enc, /ubicacion/), asig: indiceColumna(enc, /asignacion/), cat: indiceColumna(enc, /categoria/), obs: indiceColumna(enc, /observ/) };
    for (let i = h + 1; i < filas.length; i++) {
      const f = filas[i]; const marca = marcaDe(celda(f, ix.marca));
      if (!marca || !texto(celda(f, ix.ubic))) continue;
      tiendas.push({ fila: i + 1, marca, ubicacion: texto(celda(f, ix.ubic)), asigna: /^s/i.test(texto(celda(f, ix.asig))), categoria: texto(celda(f, ix.cat)).toUpperCase(), mixto: /mixto/i.test(texto(celda(f, ix.obs))), obs: texto(celda(f, ix.obs)) });
    }
  }
  return { montos, tiendas };
}

const NOMBRE_MARCA = { BALU: 'Balú', PLANETA: 'Planeta' };
const RAZON_MARCA = { BALU: 'Representaciones Ulab 24, C.A.', PLANETA: 'Comercializadora Clock Work, C.A.' };

/* Punto de entrada. hojas = [{ nombre, filas }]. Devuelve los modelos propuestos y todo lo que hay que revisar. */
export function analizarEsquema(hojas, opciones) {
  const { tiendas = [], cargos = [], vigenteDesde = '', nuevoId = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`, moneda = 'USD', mapaTiendas = {} } = opciones || {};
  const avisos = [];
  const hCom = hojaPorNombre(hojas, 'comision');
  const hEst = hojaPorNombre(hojas, 'estructura');
  const hDiv = hojaPorNombre(hojas, 'divisas');
  if (!hCom && !hEst && !hDiv) return { modelos: [], avisos: ['El archivo no trae las hojas «Esquemas de Comisiones», «Estructura de Pago» ni «Divisas Tiendas».'], sinTienda: [], resumen: { comision: 0, estructura: 0, divisas: 0 } };

  const nombreCargo = (id) => ((cargos.find((c) => c.id === id) || {}).nombre) || id;
  const sinTienda = new Map();
  const idTienda = (txt, marca, origen) => {
    const id = tiendaIdDe(txt, marca, tiendas, mapaTiendas);
    if (!id) { const k = `${marca}|${normalizarTexto(txt)}`; if (!sinTienda.has(k)) sinTienda.set(k, { clave: k, marca, texto: txt, origen }); }
    return id;
  };
  const filasCom = hCom ? leerComisiones(hCom, avisos) : [];
  const filasEst = hEst ? leerEstructura(hEst, avisos) : [];
  const div = hDiv ? leerDivisas(hDiv) : { montos: { AAA: {}, A: {}, B: {} }, tiendas: [] };
  filasCom.filter((f) => !f.cargoId).forEach((f) => avisos.push(`Comisiones, fila ${f.fila}: el cargo «${f.cargoTexto}» no coincide con ningún cargo de la aplicación.`));
  filasEst.filter((f) => !f.cargoId).forEach((f) => avisos.push(`Estructura de pago, fila ${f.fila}: el cargo «${f.cargoTexto}» no coincide con ningún cargo de la aplicación.`));

  const modelos = [];
  const marcas = ['BALU', 'PLANETA'];

  /* --- Modelo base por marca: sueldo, tickets, ayuda mensual y tren gerencial --- */
  if (filasEst.length || div.tiendas.length) {
    const enUsd = moneda === 'USD';
    marcas.forEach((marca) => {
      const tiendasMarca = tiendas.filter((t) => t.marca === marca && !t.administrativa);
      const componentes = []; const ayudaPorCargo = {};
      const agrupar = (campo) => { const m = new Map(); filasEst.filter((f) => f.cargoId && f[campo] !== null).forEach((f) => { if (!m.has(f[campo])) m.set(f[campo], []); m.get(f[campo]).push(f.cargoId); }); return [...m.entries()].sort((a, b) => b[0] - a[0]); };
      agrupar('sueldo').forEach(([monto, ids]) => componentes.push({ concepto: 'Sueldo mensual', tipo: 'FIJO', base: 'Monto fijo por cargo (columna «Sueldo» de la estructura de pago)', valor: `${enUsd ? 'USD' : 'Bs'} ${monto}`, periodicidad: 'MENSUAL', cargos: ids, enUsd, montoUsd: enUsd ? String(monto) : '', tasa: enUsd ? 'BCV' : '', pagoBs: enUsd, pagoBsItem: enUsd ? 'Sueldo pagado en Bs' : '' }));
      agrupar('tickets').forEach(([monto, ids]) => componentes.push({ concepto: 'Tickets', tipo: 'BENEFICIO', base: 'Monto fijo por cargo', valor: `${enUsd ? 'USD' : 'Bs'} ${monto}`, periodicidad: 'MENSUAL', cargos: ids, enUsd, montoUsd: enUsd ? String(monto) : '', tasa: enUsd ? 'BCV' : '', pagoBs: enUsd, pagoBsItem: enUsd ? 'Tickets pagados en Bs a tasa oficial' : '' }));
      filasEst.filter((f) => f.cargoId && f.ayuda !== null).forEach((f) => { ayudaPorCargo[f.cargoId] = { monto: String(f.ayuda), moneda: enUsd ? 'USD' : 'BS' }; });
      /* Montos del tren gerencial por categoría (la hoja «Divisas Tiendas» manda; si no está, la «Estructura de Pago») */
      const montoTren = (categoria, cargoId) => {
        if (div.montos[categoria] && div.montos[categoria][cargoId] !== undefined) return div.montos[categoria][cargoId];
        const f = filasEst.find((x) => x.cargoId === cargoId); return f && f.tren[categoria] !== null && f.tren[categoria] !== undefined ? f.tren[categoria] : null;
      };
      const trenGerencial = {}; const trenTexto = [];
      div.tiendas.filter((t) => t.marca === marca).forEach((t) => {
        const tid = idTienda(t.ubicacion, marca, 'Divisas Tiendas');
        if (!tid) return;
        if (!t.asigna) return;
        if (!['AAA', 'A', 'B'].includes(t.categoria)) { avisos.push(`Divisas Tiendas, fila ${t.fila}: «${t.ubicacion}» tiene asignación pero no categoría AAA, A o B.`); return; }
        const gt = montoTren(t.categoria, 'GT'); const sub = montoTren(t.categoria, 'SUB');
        const entrada = {};
        if (gt !== null) entrada.gt = { aplica: true, moneda: 'DIVISAS', monto: String(gt), categoria: t.categoria, ...(t.mixto ? { mixto: true } : {}) };
        if (sub !== null) entrada.sub = { aplica: true, moneda: 'DIVISAS', monto: String(sub), categoria: t.categoria, ...(t.mixto ? { mixto: true } : {}) };
        if (Object.keys(entrada).length) { trenGerencial[tid] = entrada; trenTexto.push(`${t.ubicacion}: categoría ${t.categoria}${t.mixto ? ' (mixto)' : ''}`); }
      });
      const catTxt = ['AAA', 'A', 'B'].map((c) => `${c}: Gerente ${montoTren(c, 'GT') ?? '—'} · Subgerente ${montoTren(c, 'SUB') ?? '—'}`).join(' | ');
      if (!componentes.length && !Object.keys(ayudaPorCargo).length && !Object.keys(trenGerencial).length) return;
      modelos.push({
        id: nuevoId('MC'), tipoImportado: 'ESTRUCTURA', nombre: `Estructura de pago ${NOMBRE_MARCA[marca]}`, marca, vigenteDesde,
        descripcion: `Estructura de pago de ${NOMBRE_MARCA[marca]} (${RAZON_MARCA[marca]}), cargada desde el Excel «Esquema de comisiones y estructura de pago». Asignación del tren gerencial en USD por categoría: ${catTxt}. Los montos se expresan en ${enUsd ? 'USD' : 'bolívares'}.`,
        observaciones: filasEst.map((f) => f.obs).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · '),
        componentes, ayudaPorCargo, trenGerencial, tiendas: tiendasMarca.map((t) => t.id), comisionCargos: [], formasComision: [], oficial: false,
      });
    });
  }

  /* --- Un modelo de comisión por grupo de tiendas (misma marca y misma lista de ubicaciones) --- */
  const grupos = new Map();
  filasCom.forEach((f) => { const k = `${f.marca}|${normalizarTexto(f.ubicacion)}`; if (!grupos.has(k)) grupos.set(k, { marca: f.marca, ubicacion: f.ubicacion, razon: f.razon, filas: [] }); grupos.get(k).filas.push(f); });
  const contador = { BALU: 0, PLANETA: 0 };
  [...grupos.values()].forEach((g) => {
    contador[g.marca] += 1;
    const toda = /toda la marca/i.test(g.ubicacion);
    const ubicaciones = toda ? [] : g.ubicacion.split('/').map((x) => x.trim()).filter(Boolean);
    const ids = toda ? tiendas.filter((t) => t.marca === g.marca && !t.administrativa).map((t) => t.id) : ubicaciones.map((u) => idTienda(u, g.marca, 'Esquemas de Comisiones')).filter(Boolean);
    const comisionCargos = []; const usadas = new Map(); const alternativas = [];
    let conMetas = false; let conTexto = false;
    g.filas.forEach((f) => {
      if (!f.cargoId) return;
      const metas = f.metas.map(porcentajeDe);
      const entrada = { cargoId: f.cargoId, pctVenta: porcentajeDe(f.base), pctPool: '', ...(metas.some(Boolean) ? { metas } : {}), ...(f.calculo ? { calculo: f.calculo } : {}) };
      if (metas.some(Boolean)) conMetas = true;
      if (typeof f.base === 'string' && /%/.test(f.base)) conTexto = true;
      if (usadas.has(f.cargoId)) {
        usadas.get(f.cargoId).alternativas = [...(usadas.get(f.cargoId).alternativas || []), { pctVenta: entrada.pctVenta, metas: entrada.metas || [], calculo: entrada.calculo || '' }];
        alternativas.push(`${nombreCargo(f.cargoId)}: ${entrada.pctVenta || '—'} %`);
        return;
      }
      usadas.set(f.cargoId, entrada); comisionCargos.push(entrada);
    });
    if (alternativas.length) avisos.push(`${NOMBRE_MARCA[g.marca]} · ${toda ? 'Toda la marca' : `grupo ${contador[g.marca]}`}: el Excel trae más de un porcentaje para el mismo cargo (${alternativas.join('; ')}). Se guardó el primero y los demás quedaron como alternativas; confirme a qué caso corresponde cada uno.`);
    const nombre = toda ? `Comisión ${NOMBRE_MARCA[g.marca]} · Toda la marca` : `Comisión ${NOMBRE_MARCA[g.marca]} · Grupo ${contador[g.marca]}`;
    modelos.push({
      id: nuevoId('MC'), tipoImportado: 'COMISION', nombre, marca: g.marca, vigenteDesde,
      descripcion: `Esquema de comisión de ${NOMBRE_MARCA[g.marca]} (${g.razon || RAZON_MARCA[g.marca]}) para: ${toda ? 'toda la marca' : ubicaciones.join(', ')}.`,
      observaciones: alternativas.length ? `Porcentajes alternativos por confirmar: ${alternativas.join('; ')}.` : '',
      descripcionComision: Array.from(new Set(g.filas.map((f) => f.calculo).filter(Boolean))).join('\n'),
      componentes: [{ concepto: 'Comisión sobre la venta', tipo: 'VARIABLE', base: 'Venta global sin IVA (ver forma de cálculo por cargo)', valor: 'Según cargo', periodicidad: 'MENSUAL', cargos: [], enUsd: false, montoUsd: '', tasa: '', pagoBs: false, pagoBsItem: '' }],
      comisionCargos, formasComision: conMetas || conTexto ? ['ESCALA'] : ['PORCENTAJE'], tiendas: ids, ubicacionesExcel: ubicaciones, oficial: false,
    });
  });

  sinTienda.forEach((x) => avisos.push(`No se encontró la tienda «${x.texto}» (${NOMBRE_MARCA[x.marca]}, hoja «${x.origen}»). Elíjala en la lista de la vista previa o se omite.`));
  const sinCargo = (hojas && cargos.length) ? [] : [];
  return {
    modelos, avisos: avisos.concat(sinCargo), sinTienda: [...sinTienda.values()],
    resumen: { comision: filasCom.length, estructura: filasEst.length, divisas: div.tiendas.length },
  };
}
