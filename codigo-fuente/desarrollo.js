/* Desarrollo: formación (catálogo y participaciones) y plan de sucesión de tiendas.
   Lógica pura (sin pantalla): recibe datos ya calculados y devuelve resultados; así se puede probar sola.
   Todo parámetro de este archivo es una propuesta inicial y se edita en Configuración. */

/* ---------- Utilidades de fecha (ISO AAAA-MM-DD) ---------- */
const aFecha = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`);
export const diasEntre = (a, b) => Math.round((aFecha(b) - aFecha(a)) / 86400000);
export function sumarMeses(iso, n) {
  const d = aFecha(iso); const dia = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function mesesEntre(a, b) {
  if (!a || !b) return 0;
  const da = aFecha(a); const db = aFecha(b);
  let m = (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
  if (db.getDate() < da.getDate()) m -= 1;
  return Math.max(0, m);
}

/* ---------- Formación ---------- */
export const TIPOS_FORMACION = [
  { id: 'INDUCCION', texto: 'Inducción' },
  { id: 'TECNICA', texto: 'Técnica del cargo' },
  { id: 'LIDERAZGO', texto: 'Liderazgo' },
  { id: 'NORMATIVA', texto: 'Normativa o seguridad (LOPCYMAT)' },
  { id: 'OTRA', texto: 'Otra' },
];
export const MODALIDADES_FORMACION = ['Presencial', 'Virtual', 'Mixta', 'En el puesto de trabajo'];
export const ESTATUS_PARTICIPACION = ['Programada', 'En curso', 'Completada', 'No asistió', 'Vencida'];
export const ESCALAS_FORMACION = [{ id: 'NOTA20', texto: 'Nota de 0 a 20' }, { id: 'APROBADO', texto: 'Aprobado / No aprobado' }];
export const NOTA_MINIMA_FORMACION = 10;

/* Estatus real de una participación a una fecha: Vencida solo cuando pasó la fecha programada sin realizarse o caducó la vigencia */
export function estatusParticipacion(p, formacion, hoy) {
  const base = p.estatus || 'Programada';
  if (base === 'No asistió') return 'No asistió';
  if (base === 'Completada') {
    const meses = formacion && Number(formacion.vigenciaMeses) > 0 ? Number(formacion.vigenciaMeses) : 0;
    if (meses && p.fechaRealizacion && sumarMeses(p.fechaRealizacion, meses) < hoy) return 'Vencida';
    return 'Completada';
  }
  if (base === 'Vencida') return 'Vencida';
  if (p.fechaProgramada && p.fechaProgramada < hoy && !p.fechaRealizacion) return 'Vencida';
  return base;
}
export function participacionAprobada(p, formacion) {
  if (!formacion) return true;
  const escala = p.escala || formacion.escala || 'APROBADO';
  if (escala === 'NOTA20') return p.calificacion !== null && p.calificacion !== undefined && p.calificacion !== '' && Number(p.calificacion) >= NOTA_MINIMA_FORMACION;
  return p.aprobado !== false; /* sin dato se asume aprobada cuando está Completada */
}
/* Formación obligatoria cumplida y vigente */
export function formacionVigente(participaciones, formacionId, formacion, hoy) {
  return (participaciones || []).filter((p) => p.formacionId === formacionId)
    .some((p) => estatusParticipacion(p, formacion, hoy) === 'Completada' && participacionAprobada(p, formacion));
}
/* Los temas de onboarding completados cuentan como formación de inducción (participaciones virtuales, no se guardan) */
export function participacionesDeOnboarding(planes, trabajadorId, catalogoInduccionId) {
  return (planes || []).filter((pl) => pl.trabajadorId === trabajadorId && pl.tipo === 'INGRESO').flatMap((pl) => {
    const hechas = (pl.actividades || []).filter((a) => a.hecha);
    if (!hechas.length || hechas.length < (pl.actividades || []).length) return [];
    const fecha = hechas.map((a) => a.fecha).filter(Boolean).sort().slice(-1)[0] || pl.fechaFin;
    return [{ id: `ONB-${pl.id}`, trabajadorId, formacionId: catalogoInduccionId || 'ONBOARDING', fechaProgramada: pl.fechaInicio, fechaRealizacion: fecha, estatus: 'Completada', origen: 'ONBOARDING', escala: 'APROBADO', aprobado: true, registradoPor: '', fechaRegistro: fecha }];
  });
}
export function cumplimientoFormacion(participaciones, catalogo, trabajadorId, idsObligatorias, hoy) {
  const propias = (participaciones || []).filter((p) => p.trabajadorId === trabajadorId);
  const faltan = []; let cumplidas = 0;
  (idsObligatorias || []).forEach((id) => {
    const f = (catalogo || []).find((x) => x.id === id);
    if (!f) return;
    if (formacionVigente(propias, id, f, hoy)) cumplidas += 1; else faltan.push(f.nombre);
  });
  const total = (idsObligatorias || []).filter((id) => (catalogo || []).some((x) => x.id === id)).length;
  return { total, cumplidas, faltan, pct: total ? Math.round((cumplidas / total) * 100) : null };
}

/* ---------- Plan de sucesión: parámetros propuestos ---------- */
export const POSICIONES_CLAVE = [
  { id: 'GT', texto: 'Gerente de Tienda', cargos: ['GT'] },
  { id: 'SUB', texto: 'Subgerente', cargos: ['SUB'] },
  { id: 'CAJA', texto: 'Caja', cargos: ['CAJT', 'CAJ'] },
  { id: 'JALM', texto: 'Jefe de Almacén', cargos: ['JALM'] },
  { id: 'VM', texto: 'Visual Merchandiser', cargos: ['VM'] },
];
export const posicionDeCargo = (cargoId) => (POSICIONES_CLAVE.find((p) => p.cargos.includes(cargoId)) || {}).id || '';
/* Denominación del cargo de caja según el tamaño de la tienda */
export const cargoCajaSegunTamano = (tamano) => (tamano === 'GRANDE' ? 'CAJT' : tamano === 'PEQUENA' ? 'CAJ' : '');
export const TAMANOS_TIENDA = [{ id: 'GRANDE', texto: 'Grande' }, { id: 'PEQUENA', texto: 'Pequeña' }];
export const CORTE_TAMANO_GRANDE_INICIAL = 14; /* propuesta: 14 o más personas activas = grande */
export function proponerTamano(activos, corte = CORTE_TAMANO_GRANDE_INICIAL) { return activos >= corte ? 'GRANDE' : 'PEQUENA'; }

/* Rutas de carrera (origen → destino). destino 'CAJA' = Cajero Principal o Cajero según el tamaño de la tienda de destino */
export const RUTAS_INICIALES = [
  { id: 'RT01', origenId: 'ASE', destinoId: 'CAJA', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT02', origenId: 'ASE', destinoId: 'ALM', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT03', origenId: 'ASE', destinoId: 'VM', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT04', origenId: 'ALM', destinoId: 'JALM', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT05', origenId: 'CAJT', destinoId: 'SUB', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV', 'KOSTICK'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT06', origenId: 'CAJ', destinoId: 'SUB', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV', 'KOSTICK'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT07', origenId: 'JALM', destinoId: 'SUB', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV', 'KOSTICK'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT08', origenId: 'VM', destinoId: 'SUB', antiguedadMeses: 6, formaciones: [], pruebas: ['IPV', 'KOSTICK'], reqDescripcion: 'PENDIENTE', activa: true },
  { id: 'RT09', origenId: 'SUB', destinoId: 'GT', antiguedadMeses: 12, formaciones: [], pruebas: ['KOSTICK'], reqDescripcion: 'PENDIENTE', activa: true },
];
export const PESOS_PREPARACION_INICIALES = { DESEMPENO: 35, PRUEBAS: 25, FORMACION: 20, CONDUCTA: 10, ANTIGUEDAD: 10 };
export const ETIQUETAS_COMPONENTE = { DESEMPENO: 'Evaluación de desempeño vigente', PRUEBAS: 'Pruebas del portal y constancia de match', FORMACION: 'Formación obligatoria', CONDUCTA: 'Conducta', ANTIGUEDAD: 'Antigüedad en el cargo' };
export const PARAMETROS_SUCESION_INICIALES = {
  pesos: PESOS_PREPARACION_INICIALES,
  vigenciaEvaluacionMeses: 12,
  vigenciaIntegridadMeses: 24,
  mesesSinAmonestacion: 6,
  cortes: { LISTO: 80, M12: 65, M24: 50 },
  mesesEnCargoRiesgoMedio: 6,
  cajasNineBoxRiesgo: [1, 4],
  corteTamanoGrande: CORTE_TAMANO_GRANDE_INICIAL,
  maxSucesoresPorPosicion: 3,
};
export const NIVELES_PREPARACION = [
  { id: 'AHORA', texto: 'Listo ahora', color: 'verde', orden: 1 },
  { id: 'M12', texto: 'Listo en 6 a 12 meses', color: 'amarillo', orden: 2 },
  { id: 'M24', texto: 'Listo en 12 a 24 meses', color: 'naranja', orden: 3 },
  { id: 'DESARROLLO', texto: 'En desarrollo', color: 'gris', orden: 4 },
];
export const nivelDe = (puntaje, cortes = PARAMETROS_SUCESION_INICIALES.cortes) => (puntaje >= cortes.LISTO ? 'AHORA' : puntaje >= cortes.M12 ? 'M12' : puntaje >= cortes.M24 ? 'M24' : 'DESARROLLO');
export const textoNivel = (id) => (NIVELES_PREPARACION.find((n) => n.id === id) || {}).texto || '';

/* Puntaje de preparación 0 a 100.
   ctx: {
     evaluacion: { fecha, aprobada, pct } | null  (Nine-Box o última evaluación; pct 0-100),
     pruebas: { requeridas: bool, pct: número|null },
     formacion: { total, cumplidas, pct, faltan },
     conductaPct: 0-100,
     antiguedadMeses, contratoFijo, planMejoraAbierto, amonestacionesRecientes
   }
   ruta: { antiguedadMeses, reqDescripcion } */
export function puntajePreparacion(ctx, ruta, hoy, parametros = PARAMETROS_SUCESION_INICIALES) {
  const pesosBase = { ...PESOS_PREPARACION_INICIALES, ...(parametros.pesos || {}) };
  const faltan = []; const avisos = [];
  const comp = {};
  /* Evaluación de desempeño vigente */
  const ev = ctx.evaluacion;
  if (ev && ev.aprobada && ev.fecha && mesesEntre(ev.fecha, hoy) <= (parametros.vigenciaEvaluacionMeses || 12)) comp.DESEMPENO = { pct: Math.max(0, Math.min(100, ev.pct)), detalle: `Evaluación del ${ev.fecha}` };
  else {
    comp.DESEMPENO = { pct: 0, detalle: ev ? (ev.aprobada ? 'Vencida' : 'No aprobada') : 'Sin evaluación' };
    faltan.push(ev ? (ev.aprobada ? `evaluación vencida (${ev.fecha})` : 'evaluación no aprobada') : 'sin evaluación de desempeño');
  }
  /* Pruebas del portal */
  if (ctx.pruebas && ctx.pruebas.requeridas) {
    if (ctx.pruebas.pct === null || ctx.pruebas.pct === undefined) { comp.PRUEBAS = { pct: 0, detalle: 'Pendientes' }; faltan.push('pruebas del portal pendientes'); }
    else comp.PRUEBAS = { pct: ctx.pruebas.pct, detalle: `${ctx.pruebas.pct} %` };
  }
  /* Formación obligatoria de la ruta */
  const fo = ctx.formacion;
  if (fo && fo.total > 0) {
    comp.FORMACION = { pct: fo.pct, detalle: `${fo.cumplidas} de ${fo.total}` };
    if (fo.faltan.length) faltan.push(`${fo.faltan.length} formacion${fo.faltan.length === 1 ? '' : 'es'} obligatoria${fo.faltan.length === 1 ? '' : 's'}`);
  }
  comp.CONDUCTA = { pct: ctx.conductaPct === null || ctx.conductaPct === undefined ? 100 : ctx.conductaPct, detalle: `${ctx.amonestacionesRecientes || 0} amonestaciones recientes` };
  const min = Number(ruta.antiguedadMeses) || 0;
  const antPct = min ? Math.min(100, Math.round(((ctx.antiguedadMeses || 0) / min) * 100)) : 100;
  comp.ANTIGUEDAD = { pct: antPct, detalle: `${ctx.antiguedadMeses || 0} de ${min} meses` };
  if ((ctx.antiguedadMeses || 0) < min) faltan.push(`antigüedad: faltan ${min - (ctx.antiguedadMeses || 0)} mes${min - (ctx.antiguedadMeses || 0) === 1 ? '' : 'es'}`);
  /* Requisitos de descripción de cargo: pendientes, sin peso */
  const descPendiente = !ruta.reqDescripcion || ruta.reqDescripcion === 'PENDIENTE';
  if (descPendiente) avisos.push('Descripción de cargo pendiente');
  /* Reescalado: solo cuentan los componentes que aplican */
  const aplican = Object.keys(comp);
  const suma = aplican.reduce((a, k) => a + (Number(pesosBase[k]) || 0), 0) || 1;
  const filas = aplican.map((k) => ({ id: k, texto: ETIQUETAS_COMPONENTE[k], pesoBase: Number(pesosBase[k]) || 0, peso: Math.round(((Number(pesosBase[k]) || 0) / suma) * 1000) / 10, pct: comp[k].pct, detalle: comp[k].detalle }));
  const total = Math.round(filas.reduce((a, f) => a + (f.pct * f.peso) / 100, 0) * 10) / 10;
  /* Condiciones obligatorias */
  const condiciones = [
    { id: 'FIJO', texto: 'Contrato fijo (pase a fijo superado)', cumple: Boolean(ctx.contratoFijo) },
    { id: 'MEJORA', texto: 'Sin plan de mejora abierto', cumple: !ctx.planMejoraAbierto },
    { id: 'AMON', texto: `Sin amonestación en los últimos ${parametros.mesesSinAmonestacion || 6} meses`, cumple: !(ctx.amonestacionesRecientes > 0) },
  ];
  /* Rutas hacia cargos con manejo de dinero o mercancía: integridad laboral favorable, o «Continúa» de RRHH, con vigencia de 24 meses (propuesta) */
  if (ctx.integridad && ctx.integridad.requerida) condiciones.push({ id: 'PIL', texto: `Integridad laboral favorable o «Continúa» de RRHH (menos de ${(parametros.vigenciaIntegridadMeses || 24)} meses)`, cumple: Boolean(ctx.integridad.cumple) });
  const incumple = condiciones.filter((c) => !c.cumple);
  incumple.forEach((c) => faltan.push(c.id === 'FIJO' ? 'contrato aún no es fijo' : c.id === 'MEJORA' ? 'plan de mejora abierto' : c.id === 'PIL' ? 'integridad laboral pendiente o vencida' : 'amonestación reciente'));
  let nivel = nivelDe(total, parametros.cortes);
  if (nivel === 'AHORA' && incumple.length) nivel = 'M12'; /* sin las condiciones obligatorias no puede quedar «Listo ahora» */
  return { total, nivel, filas, condiciones, faltan, avisos, listoBloqueado: incumple.length > 0 && total >= parametros.cortes.LISTO };
}

/* Riesgo del titular */
export function riesgoTitular(t, parametros = PARAMETROS_SUCESION_INICIALES) {
  if (!t) return { id: 'VACANTE', texto: 'Vacante', motivos: ['Posición sin titular'] };
  const alto = [];
  if (t.egresoEnProceso) alto.push('egreso registrado o en proceso');
  if (t.planMejoraAbierto) alto.push('plan de mejora');
  if (t.cajaNineBox && (parametros.cajasNineBoxRiesgo || [1, 4]).includes(Number(t.cajaNineBox))) alto.push(`Nine-Box caja ${t.cajaNineBox}`);
  if (alto.length) return { id: 'ALTO', texto: 'Alto', motivos: alto };
  const medio = [];
  if (t.contratoDeterminado) medio.push('contrato a tiempo determinado');
  if ((t.mesesEnCargo || 0) < (parametros.mesesEnCargoRiesgoMedio || 6)) medio.push('menos de 6 meses en el cargo');
  if (medio.length) return { id: 'MEDIO', texto: 'Medio', motivos: medio };
  return { id: 'BAJO', texto: 'Bajo', motivos: [] };
}

/* Mapa de una tienda: posiciones con titular, riesgo y hasta 3 sucesores ordenados por puntaje.
   entrada: { posiciones: [{ posicionId, titular: ctxTitular|null, sucesores: [{ trabajadorId, nombre, tiendaOrigenId, puntaje, nivel, estado }] }] } */
export function armarMapaTienda(posiciones, parametros = PARAMETROS_SUCESION_INICIALES) {
  return posiciones.map((p) => {
    const riesgo = riesgoTitular(p.titular, parametros);
    const orden = [...(p.sucesores || [])].sort((a, b) => b.puntaje - a.puntaje).slice(0, parametros.maxSucesoresPorPosicion || 3);
    const listos = (p.sucesores || []).filter((s) => s.nivel === 'AHORA').length;
    return { ...p, riesgo, sucesores: orden, listos, critica: riesgo.id === 'ALTO' && listos === 0 };
  });
}
/* Indicadores de cabecera */
export function indicadoresMapa(mapas) {
  const pos = mapas.flat();
  const clave = pos.length;
  const conListo = pos.filter((p) => p.listos > 0).length;
  const niveles = Object.fromEntries(NIVELES_PREPARACION.map((n) => [n.id, 0]));
  const vistos = new Set();
  pos.forEach((p) => (p.sucesores || []).forEach((s) => { const k = `${s.trabajadorId}|${p.posicionId}`; if (vistos.has(k)) return; vistos.add(k); niveles[s.nivel] = (niveles[s.nivel] || 0) + 1; }));
  return {
    clave, conListo, cobertura: clave ? Math.round((conListo / clave) * 100) : 0,
    criticas: pos.filter((p) => p.critica).length, niveles,
    candidatos: vistos.size,
  };
}
/* Nominación formal: pasos y aprobadores */
export const ESTADOS_NOMINACION = ['SUGERIDO', 'PROPUESTO', 'APROBADO_RRHH', 'APROBADO', 'RECHAZADO', 'PROMOVIDO'];
export const TEXTO_ESTADO_NOMINACION = { SUGERIDO: 'Sugerido', PROPUESTO: 'Propuesto por el Gerente de Marca', APROBADO_RRHH: 'Aprobado por RRHH (pendiente de Gerencia General)', APROBADO: 'Nominación aprobada', RECHAZADO: 'Rechazado', PROMOVIDO: 'Promovido' };
/* Qué sigue tras una acción. Si el candidato viene de otra marca, además de RRHH aprueba Gerencia General. */
export function siguienteEstadoNominacion(nom, accion, otraMarca) {
  if (accion === 'PROPONER' && nom.estado === 'SUGERIDO') return 'PROPUESTO';
  if (accion === 'APROBAR_RRHH' && nom.estado === 'PROPUESTO') return otraMarca ? 'APROBADO_RRHH' : 'APROBADO';
  if (accion === 'APROBAR_GENERAL' && nom.estado === 'APROBADO_RRHH') return 'APROBADO';
  if (accion === 'RECHAZAR' && ['PROPUESTO', 'APROBADO_RRHH'].includes(nom.estado)) return 'RECHAZADO';
  if (accion === 'PROMOVER' && nom.estado === 'APROBADO') return 'PROMOVIDO';
  return null;
}
/* Foto mensual: se guarda el primer día de cada mes y no se modifica */
export const mesDeFoto = (iso) => String(iso).slice(0, 7);
