/* Entrevistas de salida: lectura del Excel de Microsoft Forms y análisis de las causas del egreso.
   Función pura (sin React) para poder probarla. Un egreso es CRÍTICO cuando su "Total de puntos" supera el umbral (por defecto 4):
   cada respuesta desfavorable (por ejemplo "No" a apoyo del supervisor, entrenamiento, información, reconocimiento, crecimiento o
   recontratación) suma un punto en el cuestionario. */
import { calcularNps } from './clima.js';
import { normalizar, soloDigitos, tituloNombre, tiendaDesdeTexto, cargoDesdeTexto, fechaISO, corregirTexto } from './sincronizacion.js';

export const UMBRAL_EGRESO_CRITICO = 4;

/* Preguntas que suman puntos y el factor de causa que representan cuando suman */
const FACTORES = [
  [/apoyo o guia de tu supervisor/, 'apoyo', 'Sin apoyo ni guía del supervisor'],
  [/fuiste entrenado para desempenar/, 'entrenado', 'Sin entrenamiento para el puesto'],
  [/informado completamente de tus condiciones/, 'informado', 'Condiciones de trabajo no informadas al ingreso'],
  [/reconocido por las cosas/, 'reconocido', 'Sin reconocimiento por su contribución'],
  [/entrenamiento oportuno y posibilidades de crecer/, 'crecimiento', 'Sin entrenamiento oportuno ni posibilidades de crecer'],
  [/gustaria trabajar nuevamente/, 'recontratar', 'No volvería a trabajar con la empresa'],
  [/probabilidades hay de que nos recomiende/, 'recomienda', 'Baja probabilidad de recomendar la empresa'],
];
export const ETIQUETAS_FACTOR = Object.fromEntries(FACTORES.map(([, k, t]) => [k, t]));

/* Respuesta de recomendación: acepta «9», «10 - Muy probable», «Muy probable (10)»; devuelve un entero 0–10 o null */
export function npsDeCelda(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0 && v <= 10 ? v : null;
  const m = String(v).match(/\b(10|[0-9])\b/);
  return m ? Number(m[1]) : null;
}
const lista = (v) => String(v === null || v === undefined ? '' : v).split(';').map((x) => corregirTexto(x)).filter(Boolean);
const texto = (v) => String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim();

/* Matriz (primera fila = encabezados) → entrevistas. Los encabezados se ubican por su texto, no por la posición. */
export function entrevistasDesdeFormulario(matriz, fuente = 'Entrevista de salida') {
  const avisos = [];
  if (!matriz || matriz.length < 2) return { filas: [], avisos: ['El archivo no tiene respuestas.'] };
  const enc = matriz[0].map((h) => normalizar(h));
  const cols = (re, conPuntos = false) => enc.map((h, i) => ({ h, i })).filter((x) => (conPuntos ? x.h.startsWith('puntos:') : !x.h.startsWith('puntos:') && !x.h.startsWith('comentarios:')) && re.test(x.h)).map((x) => x.i);
  const una = (re) => { const c = cols(re); return c.length ? c[0] : -1; };
  const iId = enc.indexOf('id');
  const iFecha = una(/^hora de finalizacion$/) >= 0 ? una(/^hora de finalizacion$/) : una(/^hora de inicio$/);
  const iTotal = enc.indexOf('total de puntos');
  const iNombre = una(/^nombres y apellidos/);
  const iCedula = una(/^cedula/);
  const iMarca = enc.indexOf('marca');
  const iLugares = cols(/^seleccione el lugar/);
  const iCargo = cols(/^(cual es su cargo|cargo)/);
  const iNps = una(/probabilidades hay de que nos recomiende|probable.*recomiende/);
  const iMotivo = una(/^motivo de la salida/);
  const iPositivo = una(/aspecto que mas considera como positivo/);
  const iNegativo = una(/aspecto que mas considera como negativo/);
  const iMejorar = una(/tema considera ud que la empresa deba mejorar/);
  const iComent = enc.findIndex((h, k) => h.startsWith('comentarios (explique') && !enc[k].startsWith('puntos:'));
  const iPuntosCol = enc.map((h, i) => (h.startsWith('puntos:') ? i : -1)).filter((i) => i >= 0);
  if (iTotal < 0 && !iPuntosCol.length) return { filas: [], avisos: ['No se encontró la columna «Total de puntos». ¿Es el Excel de la entrevista de salida?'] };
  if (iMotivo < 0) avisos.push('No se encontró la columna «Motivo de la salida».');
  if (iNps < 0) avisos.push('No se encontró la pregunta de recomendación (0 a 10): no se calculará el NPS de salida.');

  const filas = [];
  const vistos = new Set();
  for (let r = 1; r < matriz.length; r += 1) {
    const f = matriz[r];
    if (!f || f.every((c) => c === '' || c === null || c === undefined)) continue;
    const g = (i) => (i >= 0 ? f[i] : '');
    const marcaTxt = normalizar(g(iMarca));
    const marca = marcaTxt.includes('planeta') ? 'PLANETA' : marcaTxt.includes('balu') ? 'BALU' : '';
    const lugar = texto(iLugares.map((i) => f[i]).find((v) => texto(v)) || '');
    const cargoTxt = texto(iCargo.map((i) => f[i]).find((v) => texto(v)) || '');
    /* Factores: preguntas con puntos > 0 */
    const factores = [];
    let suma = 0;
    iPuntosCol.forEach((ip) => {
      const p = Number(String(f[ip] === '' ? 0 : f[ip]).replace(',', '.')) || 0;
      suma += p;
      if (p <= 0) return;
      const base = enc[ip].replace(/^puntos:\s*/, '');
      const hit = FACTORES.find(([re]) => re.test(base));
      if (hit) factores.push(hit[1]);
    });
    const total = iTotal >= 0 && f[iTotal] !== '' ? Number(String(f[iTotal]).replace(',', '.')) : suma;
    if (Number.isNaN(total)) { avisos.push(`Fila ${r + 1}: puntaje no numérico; se omitió.`); continue; }
    const fecha = fechaISO(g(iFecha));
    const cedula = soloDigitos(g(iCedula));
    const idForms = texto(g(iId));
    const id = `ES-${idForms || `${cedula}-${fecha}-${r}`}`;
    if (vistos.has(id)) { avisos.push(`Fila ${r + 1}: Id repetido (${idForms}); se tomó la primera.`); continue; }
    vistos.add(id);
    if (!fecha) avisos.push(`Fila ${r + 1}: sin fecha reconocida.`);
    filas.push({
      id, fecha, nombre: tituloNombre(g(iNombre)), cedula, marca, lugar: corregirTexto(lugar, 'titulo'), cargoTexto: corregirTexto(cargoTxt, 'titulo'), cargoId: cargoDesdeTexto(cargoTxt),
      tiendaId: tiendaDesdeTexto(lugar, marca), trabajadorId: '',
      motivo: lista(g(iMotivo)), positivo: lista(g(iPositivo)), negativo: lista(g(iNegativo)), mejorar: lista(g(iMejorar)),
      factores, comentario: corregirTexto(g(iComent)), puntos: total, fuente, nps: npsDeCelda(g(iNps)),
    });
  }
  return { filas, avisos };
}

export function esCritica(e, umbral = UMBRAL_EGRESO_CRITICO) { return Number(e.puntos) > Number(umbral); }

const contar = (xs, sacar) => {
  const m = new Map();
  xs.forEach((x) => { const v = sacar(x); (Array.isArray(v) ? v : [v]).forEach((k) => { if (k) m.set(k, (m.get(k) || 0) + 1); }); });
  return [...m.entries()].map(([clave, n]) => ({ clave, n })).sort((a, b) => b.n - a.n || a.clave.localeCompare(b.clave));
};

/* Resumen: totales, críticas, por tienda y causas más repetidas (de las críticas y de todas) */
export function analisisSalidas(entrevistas, umbral = UMBRAL_EGRESO_CRITICO) {
  const todas = entrevistas;
  const criticas = todas.filter((e) => esCritica(e, umbral));
  const porTienda = new Map();
  todas.forEach((e) => {
    const k = e.tiendaId || '';
    if (!porTienda.has(k)) porTienda.set(k, { tiendaId: k, total: 0, criticas: 0, suma: 0 });
    const t = porTienda.get(k);
    t.total += 1; t.suma += Number(e.puntos) || 0; if (esCritica(e, umbral)) t.criticas += 1;
    (t.npsValores = t.npsValores || []).push(e.nps);
  });
  const tiendas = [...porTienda.values()].map(({ npsValores, ...t }) => ({ ...t, promedio: t.total ? t.suma / t.total : 0, nps: (calcularNps(npsValores) || {}).nps ?? null }))
    .sort((a, b) => b.criticas - a.criticas || b.promedio - a.promedio);
  return {
    total: todas.length, criticas: criticas.length, pctCriticas: todas.length ? (criticas.length / todas.length) * 100 : 0,
    promedio: todas.length ? todas.reduce((a, e) => a + (Number(e.puntos) || 0), 0) / todas.length : 0,
    sinClasificar: todas.filter((e) => !e.tiendaId).length,
    nps: calcularNps(todas.map((e) => e.nps)),
    tiendas,
    causas: {
      motivo: contar(criticas, (e) => e.motivo), negativo: contar(criticas, (e) => e.negativo),
      mejorar: contar(criticas, (e) => e.mejorar), factores: contar(criticas, (e) => e.factores),
      motivoTodos: contar(todas, (e) => e.motivo),
    },
  };
}
