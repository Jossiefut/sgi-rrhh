/* Análisis de egresos y cruce de indicadores (funciones puras, sin interfaz).
 * - Egresos: cada egreso se describe con dimensiones (motivo, tienda, cargo, mes, antigüedad, etc.). Se pueden combinar
 *   una, dos o más dimensiones; el resultado es cantidad, % del total, antigüedad promedio y egresos tempranos por combinación.
 * - Cruce de indicadores: cualquier conjunto de KPI evaluados sobre el MISMO período, desglosados por tienda, marca o total. */

export const TRAMOS_ANTIGUEDAD = ['Menos de 30 días', '30 a 89 días', '90 a 179 días', '180 a 364 días', '1 a 2 años', 'Más de 2 años'];
export const TIPOS_EGRESO = ['Voluntario', 'Por la empresa', 'Mutuo acuerdo', 'Otro o sin motivo'];
const TIPO_POR_MOTIVO = {
  'Renuncia voluntaria': 'Voluntario',
  'Abandono de trabajo': 'Voluntario',
  'Despido justificado': 'Por la empresa',
  'Término de contrato': 'Por la empresa',
  'Mutuo acuerdo': 'Mutuo acuerdo',
};
export function tipoDeEgreso(motivo) { return TIPO_POR_MOTIVO[String(motivo || '').trim()] || 'Otro o sin motivo'; }

export function tramoAntiguedad(dias) {
  if (dias === null || dias === undefined || Number.isNaN(dias)) return 'Sin fecha de ingreso';
  if (dias < 30) return TRAMOS_ANTIGUEDAD[0];
  if (dias < 90) return TRAMOS_ANTIGUEDAD[1];
  if (dias < 180) return TRAMOS_ANTIGUEDAD[2];
  if (dias < 365) return TRAMOS_ANTIGUEDAD[3];
  if (dias < 730) return TRAMOS_ANTIGUEDAD[4];
  return TRAMOS_ANTIGUEDAD[5];
}
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function etiquetaMes(iso) { const m = /^(\d{4})-(\d{2})/.exec(String(iso || '')); return m ? `${m[1]}-${m[2]} ${MESES[Number(m[2]) - 1]}` : 'Sin fecha'; }
export function etiquetaTrimestre(iso) { const m = /^(\d{4})-(\d{2})/.exec(String(iso || '')); return m ? `${m[1]} T${Math.floor((Number(m[2]) - 1) / 3) + 1}` : 'Sin fecha'; }

/* Dimensiones disponibles. ctx: { nombreTienda, nombreCargo, marcaDeTienda(tid), formatoDeTienda(tid), traducir(motivo), umbral, diffDias, edadAlEgresar(trab), generoDe(trab), verDemografia }.
 * orden: 'texto' (orden alfabético/cronológico por la propia etiqueta), lista fija (índice) o null (por cantidad). */
export function crearDimensiones(ctx) {
  const dims = [
    { id: 'motivo', nombre: 'Motivo', valor: (f) => ctx.traducir(f.trab.motivoEgreso) || 'Sin motivo registrado', orden: null },
    { id: 'tipo', nombre: 'Tipo de egreso', valor: (f) => tipoDeEgreso(f.trab.motivoEgreso), orden: TIPOS_EGRESO },
    { id: 'marca', nombre: 'Marca', valor: (f) => ctx.marcaDeTienda(f.trab.tiendaId) || 'Sin marca', orden: null },
    { id: 'tienda', nombre: 'Tienda', valor: (f) => ctx.nombreTienda(f.trab.tiendaId) || 'Sin tienda', orden: null },
    { id: 'formato', nombre: 'Formato de tienda', valor: (f) => ctx.formatoDeTienda(f.trab.tiendaId) || 'Sin formato', orden: null },
    { id: 'cargo', nombre: 'Cargo', valor: (f) => ctx.nombreCargo(f.trab.cargoId) || 'Sin cargo', orden: null },
    { id: 'mes', nombre: 'Mes de egreso', valor: (f) => etiquetaMes(f.trab.fechaEgreso), orden: 'texto' },
    { id: 'trimestre', nombre: 'Trimestre de egreso', valor: (f) => etiquetaTrimestre(f.trab.fechaEgreso), orden: 'texto' },
    { id: 'antiguedad', nombre: 'Antigüedad al egresar', valor: (f) => tramoAntiguedad(f.dias), orden: TRAMOS_ANTIGUEDAD },
    { id: 'temprano', nombre: `Egreso temprano (< ${ctx.umbral} días)`, valor: (f) => (f.temprano ? 'Temprano' : 'No temprano'), orden: ['Temprano', 'No temprano'] },
    { id: 'contrato', nombre: 'Tipo de contrato', valor: (f) => (f.trab.contrato && f.trab.contrato.tipo === 'INDETERMINADO' ? 'Fijo (tiempo indeterminado)' : 'Por contrato (tiempo determinado)'), orden: null },
  ];
  if (ctx.verDemografia) {
    dims.push(
      { id: 'genero', nombre: 'Género', valor: (f) => ctx.generoDe(f.trab) || 'Sin registrar', orden: null },
      { id: 'edad', nombre: 'Rango de edad al egresar', valor: (f) => ctx.rangoEdad(ctx.edadAlEgresar(f.trab)), orden: ctx.ordenEdad || 'texto' },
    );
    /* Otros datos personales (escolaridad, estado civil, hijos, residencia), definidos en perfil-personal.js */
    if (ctx.dimensionesPerfil) {
      const ya = new Set(dims.map((d) => d.id));
      ctx.dimensionesPerfil.filter((d) => ['escolaridad', 'estadoCivil', 'hijos', 'estadoResidencia', 'municipio'].includes(d.id) && !ya.has(d.id))
        .forEach((d) => dims.push({ id: d.id, nombre: d.nombre, valor: (f) => d.valor(f.trab), orden: d.orden }));
    }
  }
  return dims;
}

/* Filas de análisis a partir de los trabajadores egresados */
export function filasEgreso(trabajadores, ctx) {
  return trabajadores.filter((x) => x.fechaEgreso).map((trab) => {
    const dias = trab.fechaIngreso ? ctx.diffDias(trab.fechaIngreso, trab.fechaEgreso) : null;
    return { trab, dias, temprano: dias !== null && dias < ctx.umbral };
  });
}

function indiceOrden(dim, valor) {
  if (Array.isArray(dim.orden)) { const i = dim.orden.indexOf(valor); return i < 0 ? 999 : i; }
  return 0;
}

/* Agrupa por una o más dimensiones. Devuelve filas { valores:[...], n, pct, diasProm, tempranos, pctTemprano } */
export function agrupar(filas, dims) {
  const total = filas.length;
  const mapa = new Map();
  filas.forEach((f) => {
    const valores = dims.map((d) => d.valor(f));
    const k = valores.join('\u0001');
    let g = mapa.get(k);
    if (!g) { g = { valores, n: 0, sumaDias: 0, conDias: 0, tempranos: 0 }; mapa.set(k, g); }
    g.n += 1; g.tempranos += f.temprano ? 1 : 0;
    if (f.dias !== null && f.dias !== undefined) { g.sumaDias += f.dias; g.conDias += 1; }
  });
  const lista = [...mapa.values()].map((g) => ({
    valores: g.valores, n: g.n, pct: total ? (g.n / total) * 100 : 0,
    diasProm: g.conDias ? g.sumaDias / g.conDias : null, tempranos: g.tempranos, pctTemprano: g.n ? (g.tempranos / g.n) * 100 : 0,
  }));
  const ordinal = dims.length && dims[0].orden !== null;
  lista.sort((a, b) => {
    if (ordinal) {
      const d0 = dims[0];
      const c = Array.isArray(d0.orden) ? indiceOrden(d0, a.valores[0]) - indiceOrden(d0, b.valores[0]) : a.valores[0].localeCompare(b.valores[0]);
      if (c) return c;
    }
    return b.n - a.n || a.valores.join(' ').localeCompare(b.valores.join(' '));
  });
  return lista;
}

/* Tabla cruzada de dos dimensiones: { filas:[etiquetas], columnas:[etiquetas], celdas:[[n]], totalFila:[], totalCol:[], total } */
export function matriz(filas, dimF, dimC) {
  const celdas = new Map(); const totF = new Map(); const totC = new Map();
  filas.forEach((f) => {
    const a = dimF.valor(f); const b = dimC.valor(f);
    celdas.set(`${a}\u0001${b}`, (celdas.get(`${a}\u0001${b}`) || 0) + 1);
    totF.set(a, (totF.get(a) || 0) + 1); totC.set(b, (totC.get(b) || 0) + 1);
  });
  const ordenar = (mapaTot, dim) => [...mapaTot.keys()].sort((x, y) => {
    if (Array.isArray(dim.orden)) return indiceOrden(dim, x) - indiceOrden(dim, y);
    if (dim.orden === 'texto') return x.localeCompare(y);
    return mapaTot.get(y) - mapaTot.get(x) || x.localeCompare(y);
  });
  const etF = ordenar(totF, dimF); const etC = ordenar(totC, dimC);
  return {
    filas: etF, columnas: etC,
    celdas: etF.map((a) => etC.map((b) => celdas.get(`${a}\u0001${b}`) || 0)),
    totalFila: etF.map((a) => totF.get(a)), totalCol: etC.map((b) => totC.get(b)), total: filas.length,
  };
}

/* Indicadores resumen de los egresos del período */
export function resumenEgresos(filas) {
  const n = filas.length;
  const porMotivo = agrupar(filas, [{ id: 'm', orden: null, valor: (f) => f.trab.motivoEgreso || 'Sin motivo registrado' }]);
  const voluntarios = filas.filter((f) => tipoDeEgreso(f.trab.motivoEgreso) === 'Voluntario').length;
  return {
    n,
    principal: porMotivo[0] ? { motivo: porMotivo[0].valores[0], n: porMotivo[0].n, pct: porMotivo[0].pct } : null,
    voluntarios, pctVoluntarios: n ? (voluntarios / n) * 100 : null,
    tempranos: filas.filter((f) => f.temprano).length,
  };
}

/* ---- Cruce de indicadores ---- */
export function correlacion(xs, ys) {
  const pares = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => typeof x === 'number' && typeof y === 'number' && Number.isFinite(x) && Number.isFinite(y));
  const n = pares.length;
  if (n < 3) return null;
  const mx = pares.reduce((a, p) => a + p[0], 0) / n; const my = pares.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0; let sxx = 0; let syy = 0;
  pares.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
  if (sxx === 0 || syy === 0) return null;
  return { r: sxy / Math.sqrt(sxx * syy), n };
}
export function lecturaCorrelacion(r) {
  const a = Math.abs(r);
  const fuerza = a >= 0.7 ? 'fuerte' : a >= 0.4 ? 'moderada' : a >= 0.2 ? 'débil' : 'prácticamente nula';
  if (a < 0.2) return `Relación ${fuerza}`;
  return `Relación ${fuerza} ${r > 0 ? 'directa (suben juntos)' : 'inversa (uno sube cuando el otro baja)'}`;
}
