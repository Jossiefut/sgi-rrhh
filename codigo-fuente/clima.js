/* Clima laboral y buzón de sugerencias: preguntas base, cálculo de resultados y enlaces.
   Funciones puras, sin dependencias de la interfaz. */

export const ESCALA_CLIMA = [
  { valor: 1, texto: 'Totalmente en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Totalmente de acuerdo' },
];

export const DIMENSIONES_CLIMA = [
  { id: 'LID', nombre: 'Liderazgo y supervisión' },
  { id: 'COM', nombre: 'Comunicación' },
  { id: 'REC', nombre: 'Reconocimiento y remuneración' },
  { id: 'DES', nombre: 'Desarrollo y formación' },
  { id: 'CON', nombre: 'Condiciones y seguridad en el trabajo' },
  { id: 'EQU', nombre: 'Trabajo en equipo y convivencia' },
  { id: 'COMP', nombre: 'Compromiso y orgullo de pertenencia' },
  { id: 'CAR', nombre: 'Carga de trabajo y equilibrio' },
];

/* Propuesta base: RRHH puede cambiar el texto, quitar o agregar preguntas al crear cada ciclo */
export const PREGUNTAS_CLIMA_BASE = [
  { id: 'Q01', dim: 'LID', texto: 'Mi jefe inmediato me trata con respeto.' },
  { id: 'Q02', dim: 'LID', texto: 'Mi jefe inmediato me explica con claridad lo que se espera de mi trabajo.' },
  { id: 'Q03', dim: 'LID', texto: 'Puedo plantear un problema a mi jefe inmediato sin temor a represalias.' },
  { id: 'Q04', dim: 'COM', texto: 'Recibo a tiempo la información que necesito para hacer bien mi trabajo.' },
  { id: 'Q05', dim: 'COM', texto: 'Las decisiones que afectan a mi tienda se comunican de forma clara.' },
  { id: 'Q06', dim: 'REC', texto: 'Mi trabajo es reconocido cuando lo hago bien.' },
  { id: 'Q07', dim: 'REC', texto: 'Considero justa mi remuneración total (sueldo, bonos y beneficios) por el trabajo que realizo.' },
  { id: 'Q08', dim: 'REC', texto: 'Las reglas de los incentivos y las comisiones son claras para mí.' },
  { id: 'Q09', dim: 'DES', texto: 'En esta empresa tengo oportunidades reales de crecer.' },
  { id: 'Q10', dim: 'DES', texto: 'La capacitación que recibo me sirve para hacer mejor mi trabajo.' },
  { id: 'Q11', dim: 'DES', texto: 'Conozco qué debo lograr para ser considerado en un ascenso.' },
  { id: 'Q12', dim: 'CON', texto: 'Mi puesto de trabajo es seguro y tiene las condiciones necesarias (espacio, mobiliario, equipos).' },
  { id: 'Q13', dim: 'CON', texto: 'Cuento con los recursos y las herramientas necesarias para atender bien al cliente.' },
  { id: 'Q14', dim: 'CON', texto: 'Me siento seguro(a) en mi trayecto y en mi horario de trabajo.' },
  { id: 'Q15', dim: 'EQU', texto: 'En mi tienda nos ayudamos entre compañeros.' },
  { id: 'Q16', dim: 'EQU', texto: 'En mi tienda se trata a todas las personas con igualdad y sin discriminación.' },
  { id: 'Q17', dim: 'EQU', texto: 'Los conflictos entre compañeros se resuelven de manera justa.' },
  { id: 'Q18', dim: 'COMP', texto: 'Me siento orgulloso(a) de trabajar en esta empresa.' },
  { id: 'Q19', dim: 'COMP', texto: 'Recomendaría esta empresa a un familiar o amigo como lugar de trabajo.' },
  { id: 'Q20', dim: 'COMP', texto: 'Me veo trabajando en esta empresa dentro de un año.' },
  { id: 'Q21', dim: 'CAR', texto: 'La carga de trabajo de mi puesto es razonable.' },
  { id: 'Q22', dim: 'CAR', texto: 'Mi horario y mis días libres me permiten atender mi vida personal y familiar.' },
];

export const CATEGORIAS_SUGERENCIA = [
  { id: 'VENTA', nombre: 'Ventas y atención al cliente' },
  { id: 'OPER', nombre: 'Operación de la tienda' },
  { id: 'EXHIB', nombre: 'Exhibición y mercadeo' },
  { id: 'INVEN', nombre: 'Inventario y recepción de mercancía' },
  { id: 'SEG', nombre: 'Seguridad y prevención de pérdidas' },
  { id: 'BIEN', nombre: 'Bienestar y ambiente de trabajo' },
  { id: 'CAPA', nombre: 'Capacitación y desarrollo' },
  { id: 'PROC', nombre: 'Procesos, sistemas y herramientas' },
  { id: 'OTRO', nombre: 'Otro' },
];

export const ESTADOS_CICLO_CLIMA = { BORRADOR: 'Borrador', ABIERTO: 'Abierto', CERRADO: 'Cerrado' };
export const TIPOS_CICLO_CLIMA = { CLIMA: 'Encuesta de clima', SUGERENCIAS: 'Buzón de sugerencias' };
export const ESTADOS_IDEA = { RECIBIDA: 'Recibida', REVISION: 'En revisión', IMPLEMENTADA: 'Implementada', NO_VIABLE: 'No viable' };
export const MINIMO_GRUPO_CLIMA = 5;
export const MAX_IDEAS_POR_PERSONA = 5;
export const MIN_CARACTERES_IDEA = 15;
export const MAX_CARACTERES_IDEA = 1000;
export const MAX_CARACTERES_COMENTARIO = 600;

const dec = (n, d = 1) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : null);
/* eNPS (Net Promoter Score de personal): «¿Qué tan probable es que recomiende esta empresa como lugar de trabajo?» de 0 a 10.
   Promotores 9–10, pasivos 7–8, detractores 0–6. NPS = % promotores − % detractores (de −100 a +100). */
export const TEXTO_NPS = '¿Qué tan probable es que recomiende esta empresa como lugar de trabajo a un familiar o amigo?';
export const META_NPS = 30;
export function clasificarNps(v) {
  const n = Number(v);
  if (v === '' || v === null || v === undefined || !Number.isInteger(n) || n < 0 || n > 10) return null;
  return n >= 9 ? 'PROMOTOR' : n >= 7 ? 'PASIVO' : 'DETRACTOR';
}
export function calcularNps(valores) {
  const cl = (valores || []).map(clasificarNps).filter(Boolean);
  const n = cl.length;
  if (!n) return null;
  const c = (t) => cl.filter((x) => x === t).length;
  const pro = c('PROMOTOR'); const pas = c('PASIVO'); const det = c('DETRACTOR');
  return { n, promotores: pro, pasivos: pas, detractores: det, pctPromotores: Math.round((pro / n) * 1000) / 10, pctPasivos: Math.round((pas / n) * 1000) / 10, pctDetractores: Math.round((det / n) * 1000) / 10, nps: Math.round(((pro - det) / n) * 100) };
}
export function nivelNps(v) {
  if (v === null || v === undefined || !Number.isFinite(v)) return { id: 'SIN', texto: 'Sin datos', tono: 'neutro' };
  if (v >= 50) return { id: 'EXCELENTE', texto: 'Excelente', tono: 'exito' };
  if (v >= 30) return { id: 'BUENO', texto: 'Bueno', tono: 'info' };
  if (v >= 0) return { id: 'MEJORABLE', texto: 'Por mejorar', tono: 'alerta' };
  return { id: 'CRITICO', texto: 'Crítico', tono: 'peligro' };
}
export const soloDigitosClima = (v) => String(v || '').replace(/\D/g, '');

export function nombreDimension(id) { return (DIMENSIONES_CLIMA.find((d) => d.id === id) || {}).nombre || id; }

/* Texto del periodo a partir de una fecha: 2026-S1 / 2026-S2 */
export function periodoDeFecha(iso) {
  const [a, m] = String(iso || '').slice(0, 10).split('-').map(Number);
  if (!a || !m) return '';
  return `${a}-S${m <= 6 ? 1 : 2}`;
}
export function textoPeriodo(p) {
  const m = /^(\d{4})-S([12])$/.exec(String(p || ''));
  return m ? `${m[2] === '1' ? '1.er' : '2.º'} semestre ${m[1]}` : String(p || '');
}

export function crearCicloClima({ id, tipo = 'CLIMA', nombre, periodo = '', fechaInicio = '', fechaCierre = '', marca = 'TODAS', mensaje = '', preguntas, categorias, creadoPor = '', creado = '' }) {
  return {
    id, tipo, nombre: String(nombre || '').trim(), periodo, fechaInicio, fechaCierre, marca, mensaje: String(mensaje || '').trim(),
    estado: 'BORRADOR', historico: false, nps: tipo === 'CLIMA',
    preguntas: tipo === 'CLIMA' ? (preguntas || PREGUNTAS_CLIMA_BASE).map((q) => ({ ...q })) : [],
    categorias: tipo === 'SUGERENCIAS' ? (categorias || CATEGORIAS_SUGERENCIA).map((c) => ({ ...c })) : [],
    creadoPor, creado, tiendaId: null,
  };
}

/* Un ciclo acepta respuestas solo si está abierto y no ha vencido la fecha de cierre */
export function cicloAbierto(ciclo, hoy) {
  if (!ciclo || ciclo.estado !== 'ABIERTO' || ciclo.historico) return false;
  if (ciclo.fechaCierre && hoy && String(hoy).slice(0, 10) > String(ciclo.fechaCierre).slice(0, 10)) return false;
  return true;
}
export function motivoCerrado(ciclo, hoy) {
  if (!ciclo) return 'Este enlace no corresponde a ninguna encuesta.';
  if (ciclo.estado === 'BORRADOR') return 'Esta encuesta todavía no está activa.';
  if (ciclo.estado === 'CERRADO') return 'Esta encuesta ya fue cerrada. Gracias por su interés.';
  if (!cicloAbierto(ciclo, hoy)) return 'El plazo para responder esta encuesta terminó. Gracias por su interés.';
  return '';
}

/* Colaboradores a los que alcanza el ciclo (universo de participación) */
export function universoCiclo(ciclo, trabajadores) {
  return (trabajadores || []).filter((t) => t.estatus === 'ACTIVO' && !t.esPrueba && (!ciclo || !ciclo.marca || ciclo.marca === 'TODAS' || t.marca === ciclo.marca));
}

export function validarRespuestaClima(ciclo, respuestas, nps) {
  const faltan = [];
  if (ciclo.nps && clasificarNps(nps) === null) faltan.push('NPS');
  (ciclo.preguntas || []).forEach((q) => {
    const v = Number((respuestas || {})[q.id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) faltan.push(q.id);
  });
  return { valida: faltan.length === 0, faltan };
}
export function validarIdea(texto, categoria, ciclo) {
  const t = String(texto || '').trim();
  if (t.length < MIN_CARACTERES_IDEA) return `Cuéntenos su idea con un poco más de detalle (mínimo ${MIN_CARACTERES_IDEA} caracteres).`;
  if (t.length > MAX_CARACTERES_IDEA) return `La idea es demasiado larga (máximo ${MAX_CARACTERES_IDEA} caracteres).`;
  if (!(ciclo.categorias || []).some((c) => c.id === categoria)) return 'Elija a qué tema corresponde su idea.';
  return '';
}

/* Resultados de una encuesta de clima. Todo se expresa como % favorable (respuestas 4 y 5) y promedio de 1 a 5. */
export function calcularClima(ciclo, respuestas) {
  const lista = (respuestas || []).filter((r) => r.respuestas);
  const n = lista.length;
  const porPregunta = (ciclo.preguntas || []).map((q) => {
    const vals = lista.map((r) => Number(r.respuestas[q.id])).filter((v) => v >= 1 && v <= 5);
    const fav = vals.filter((v) => v >= 4).length;
    const dist = [1, 2, 3, 4, 5].map((k) => vals.filter((v) => v === k).length);
    return { id: q.id, dim: q.dim, texto: q.texto, n: vals.length, media: vals.length ? dec(vals.reduce((a, b) => a + b, 0) / vals.length, 2) : null, favorable: vals.length ? dec((fav / vals.length) * 100, 1) : null, dist };
  });
  const dimIds = [...new Set((ciclo.preguntas || []).map((q) => q.dim))];
  const porDimension = dimIds.map((id) => {
    const qs = porPregunta.filter((q) => q.dim === id && q.n);
    const total = qs.reduce((a, q) => a + q.n, 0);
    const fav = qs.reduce((a, q) => a + (q.favorable / 100) * q.n, 0);
    const suma = qs.reduce((a, q) => a + q.media * q.n, 0);
    return { id, nombre: nombreDimension(id), n: n, preguntas: qs.length, media: total ? dec(suma / total, 2) : null, favorable: total ? dec((fav / total) * 100, 1) : null };
  });
  const totalResp = porPregunta.reduce((a, q) => a + q.n, 0);
  const favGlobal = totalResp ? dec((porPregunta.reduce((a, q) => a + (q.favorable / 100) * q.n, 0) / totalResp) * 100, 1) : null;
  const mediaGlobal = totalResp ? dec(porPregunta.reduce((a, q) => a + q.media * q.n, 0) / totalResp, 2) : null;
  return { n, porPregunta, porDimension, favorable: favGlobal, media: mediaGlobal, nps: calcularNps(lista.map((r) => r.nps)) };
}

/* Resultados por grupo (marca, tienda, cargo). Los grupos con menos de MINIMO_GRUPO_CLIMA respuestas no muestran cifras. */
export function agruparClima(ciclo, respuestas, claveDe, minimo = MINIMO_GRUPO_CLIMA) {
  const grupos = new Map();
  (respuestas || []).forEach((r) => { const k = claveDe(r) || 'Sin dato'; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(r); });
  return [...grupos.entries()].map(([clave, lista]) => {
    const oculto = lista.length < minimo;
    const c = oculto ? null : calcularClima(ciclo, lista);
    return { clave, n: lista.length, oculto, favorable: c ? c.favorable : null, media: c ? c.media : null, nps: c && c.nps ? c.nps.nps : null, porDimension: c ? c.porDimension : [] };
  }).sort((a, b) => (b.favorable ?? -1) - (a.favorable ?? -1) || b.n - a.n);
}

export function nivelFavorable(pct) {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) return { id: 'SIN', texto: 'Sin datos', tono: 'neutro', color: '#6B6470' };
  if (pct >= 75) return { id: 'FORTALEZA', texto: 'Fortaleza', tono: 'exito', color: '#047857' };
  if (pct >= 60) return { id: 'ESTABLE', texto: 'Estable', tono: 'info', color: '#2563EB' };
  if (pct >= 45) return { id: 'ATENCION', texto: 'Requiere atención', tono: 'alerta', color: '#B45309' };
  return { id: 'CRITICO', texto: 'Crítico', tono: 'peligro', color: '#B42318' };
}

export function participacionPct(respondieron, universo) {
  return universo > 0 ? dec((respondieron / universo) * 100, 1) : null;
}

/* Resumen de un ciclo (para comparar ciclos). Los ciclos históricos usan los valores cargados a mano. */
export function resumenCiclo(ciclo, respuestas, trabajadores) {
  if (ciclo.historico) {
    const h = ciclo.resultadoManual || {};
    const dims = (h.dimensiones || []).map((d) => ({ id: d.id, nombre: nombreDimension(d.id), favorable: Number.isFinite(Number(d.favorable)) ? Number(d.favorable) : null }));
    const vals = dims.filter((d) => d.favorable !== null).map((d) => d.favorable);
    return { n: Number(h.participantes) || 0, universo: Number(h.universo) || 0, participacion: participacionPct(Number(h.participantes) || 0, Number(h.universo) || 0), nps: (h.nps === '' || h.nps === null || h.nps === undefined || !Number.isFinite(Number(h.nps))) ? null : Number(h.nps), favorable: Number.isFinite(Number(h.favorableGlobal)) && h.favorableGlobal !== '' && h.favorableGlobal !== null ? Number(h.favorableGlobal) : (vals.length ? dec(vals.reduce((a, b) => a + b, 0) / vals.length, 1) : null), porDimension: dims, historico: true };
  }
  const mias = (respuestas || []).filter((r) => r.cicloId === ciclo.id && r.tipo !== 'SUGERENCIA');
  const c = calcularClima(ciclo, mias);
  const universo = universoCiclo(ciclo, trabajadores).length;
  return { n: c.n, universo, participacion: participacionPct(c.n, universo), favorable: c.favorable, nps: c.nps ? c.nps.nps : null, npsDetalle: c.nps, porDimension: c.porDimension, historico: false };
}

/* Resumen del buzón de sugerencias */
export function resumenSugerencias(ciclo, ideas) {
  const lista = (ideas || []).filter((x) => x.cicloId === ciclo.id);
  const personas = new Set(lista.map((x) => soloDigitosClima(x.cedula)));
  const cuenta = (fn) => { const m = new Map(); lista.forEach((x) => { const k = fn(x) || 'Sin dato'; m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()].map(([clave, n]) => ({ clave, n })).sort((a, b) => b.n - a.n); };
  return {
    total: lista.length, personas: personas.size,
    porCategoria: cuenta((x) => x.categoria), porMarca: cuenta((x) => x.marca), porTienda: cuenta((x) => x.tiendaId),
    porEstado: cuenta((x) => x.estadoIdea || 'RECIBIDA'),
  };
}

/* Enlaces */
export function enlaceClima(base, cicloId) { return `${base}#clima=${encodeURIComponent(cicloId)}`; }
export function cicloDeHash(hash) {
  const m = /^#clima=([^&]+)/i.exec(String(hash || ''));
  return m ? decodeURIComponent(m[1]) : '';
}
export function mensajeCicloWhatsApp(ciclo, enlace) {
  if (ciclo.tipo === 'SUGERENCIAS') {
    return `Hola, te invitamos a participar en el Buzón de sugerencias "${ciclo.nombre}". Tu idea para mejorar nuestras tiendas es importante. Ingresa con tu cédula aquí: ${enlace}${ciclo.fechaCierre ? ` (disponible hasta el ${ciclo.fechaCierre.split('-').reverse().join('/')})` : ''}`;
  }
  return `Hola, te invitamos a responder la encuesta de clima laboral "${ciclo.nombre}". Toma unos 5 minutos y tus respuestas se presentan agrupadas. Ingresa con tu cédula aquí: ${enlace}${ciclo.fechaCierre ? ` (disponible hasta el ${ciclo.fechaCierre.split('-').reverse().join('/')})` : ''}`;
}
