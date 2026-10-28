/* Reglas de tiempo e intentos de las pruebas del portal (IPV y Kostick).
   - Cada intento dura 40 minutos (configurable) contados desde que el trabajador pulsa "Comenzar".
   - Si el tiempo vence sin enviar, el intento se cierra. Se permiten 2 intentos (un chance más por corte de luz o desconexión).
   - Los intentos agotados sin terminar bloquean la prueba hasta que RRHH autorice un último intento; ese es el definitivo.
   - Las respuestas ya dadas se conservan entre intentos.
   Estas mismas reglas están en la base de datos (función portal_accion); aquí sirven a la versión de prueba y a las verificaciones. */
export const PRUEBAS_PORTAL = ['IPV', 'KOSTICK', 'LOGICO', 'DISC', 'PIL', 'IPC'];
export const MINUTOS_INICIALES = { IPV: 40, KOSTICK: 40, LOGICO: 25, DISC: 20, PIL: 15, IPC: 20 };
export const INTENTOS_BASE = 2;
const GRACIA_MS = 10000;

export function minutosPrueba(config, id) {
  const m = config && config.minutosPrueba && Number(config.minutosPrueba[id]);
  return m > 0 ? m : MINUTOS_INICIALES[id] || 40;
}

/* ev de una prueba; el IPV de la versión anterior (columnas respuestas/estado) se convierte */
export function evDe(acceso, id) {
  const ev = acceso && acceso.ev && acceso.ev[id];
  if (ev) return ev;
  if (id === 'IPV' && acceso && (acceso.estado === 'COMPLETADA' || Object.keys(acceso.respuestas || {}).length)) {
    const hecha = acceso.estado === 'COMPLETADA';
    return { respuestas: acceso.respuestas || {}, intentos: hecha ? [{ inicio: acceso.inicio || '', fin: acceso.fin || '', cierre: 'ENVIADA' }] : [], extra: 0, completada: hecha };
  }
  return { respuestas: {}, intentos: [], extra: 0, completada: false };
}

function cerrarVencidos(ev, ahora, minutos) {
  const intentos = (ev.intentos || []).map((it) => {
    if (it.fin) return it;
    const limite = Date.parse(it.inicio) + minutos * 60000;
    return ahora > limite + GRACIA_MS ? { ...it, fin: new Date(limite).toISOString(), cierre: 'TIEMPO' } : it;
  });
  return { ...ev, intentos };
}

/* Situación de una prueba en un instante: estado y tiempo restante del intento en curso */
export function situacionPrueba(ev0, ahora, minutos) {
  const ev = cerrarVencidos(ev0, ahora, minutos);
  const usados = ev.intentos.length;
  const permitidos = INTENTOS_BASE + (ev.extra ? 1 : 0);
  const activo = ev.intentos.find((i) => !i.fin) || null;
  const restanteMs = activo ? Math.max(0, Date.parse(activo.inicio) + minutos * 60000 - ahora) : 0;
  let estado;
  if (ev.completada) estado = 'COMPLETADA';
  else if (activo) estado = 'EN_CURSO';
  else if (usados < permitidos) estado = 'PENDIENTE';
  else estado = ev.extra ? 'CERRADA' : 'BLOQUEADA';
  return { ev, estado, usados, permitidos, activo, restanteMs, restantes: Math.max(0, permitidos - usados), definitiva: estado === 'COMPLETADA' || estado === 'CERRADA', puedeAutorizar: estado === 'BLOQUEADA' };
}

/* Estado general del acceso según las pruebas del portal que contiene */
export function estadoGeneral(acceso, ahora, config) {
  if (acceso.estado === 'ANULADA') return 'ANULADA';
  const ids = (acceso.bateria || []).filter((x) => PRUEBAS_PORTAL.includes(x));
  const sit = ids.map((id) => situacionPrueba(evDe(acceso, id), ahora, minutosPrueba(config, id)));
  if (sit.length && sit.every((s) => s.definitiva)) return 'COMPLETADA';
  if (sit.some((s) => s.estado !== 'PENDIENTE' || Object.keys(s.ev.respuestas || {}).length)) return 'EN_CURSO';
  return 'PENDIENTE';
}

/* Aplica una acción sobre una prueba. tipo: iniciar | guardar | terminar | autorizar.
   Devuelve { acceso, error } con el acceso actualizado (incluso cuando hay error, por si se cerró un intento por tiempo). */
export function accionPrueba(acceso, id, tipo, params, ahora, config) {
  const minutos = minutosPrueba(config, id);
  const p = params || {};
  let sit = situacionPrueba(evDe(acceso, id), ahora, minutos);
  let ev = sit.ev;
  let error = '';
  const iso = new Date(ahora).toISOString();
  if (tipo === 'iniciar') {
    if (sit.estado === 'COMPLETADA') error = 'Esta prueba ya fue enviada.';
    else if (sit.estado === 'BLOQUEADA') error = 'Usó sus oportunidades sin terminar la prueba. Comuníquese con RRHH para que autorice un último intento.';
    else if (sit.estado === 'CERRADA') error = 'La prueba quedó cerrada de forma definitiva.';
    else if (sit.estado === 'PENDIENTE') ev = { ...ev, intentos: [...ev.intentos, { inicio: iso, fin: '', cierre: '' }], ...(p.aceptacion && !ev.aceptacion ? { aceptacion: iso } : {}) };
  } else if (tipo === 'guardar' || tipo === 'terminar') {
    if (sit.estado !== 'EN_CURSO') error = sit.estado === 'COMPLETADA' ? 'Esta prueba ya fue enviada.' : 'Se agotó el tiempo de la prueba.';
    else {
      const respuestas = { ...(ev.respuestas || {}), ...(p.respuestas || {}) };
      ev = { ...ev, respuestas };
      if (p.aceptacion && !ev.aceptacion) ev = { ...ev, aceptacion: iso };
      if (tipo === 'terminar') ev = { ...ev, completada: true, intentos: ev.intentos.map((i) => (i.fin ? i : { ...i, fin: iso, cierre: 'ENVIADA' })) };
    }
  } else if (tipo === 'autorizar') {
    if (sit.estado !== 'BLOQUEADA') error = sit.estado === 'COMPLETADA' ? 'La prueba ya fue terminada: no se puede reenviar.' : 'Solo se puede autorizar cuando el trabajador agotó sus intentos sin terminar, y una sola vez.';
    else ev = { ...ev, extra: 1 };
  } else error = 'Acción no válida.';
  const siguiente = { ...acceso, ev: { ...(acceso.ev || {}), [id]: ev } };
  if (p.nivelEducativo) siguiente.nivelEducativo = p.nivelEducativo;
  if (!siguiente.inicio && ev.intentos.length) siguiente.inicio = ev.intentos[0].inicio;
  siguiente.estado = estadoGeneral(siguiente, ahora, config);
  siguiente.fin = siguiente.estado === 'COMPLETADA' ? (siguiente.fin || iso) : '';
  if (tipo === 'autorizar' && !error && acceso.expira) {
    const dias = Number(config && config.diasAccesoPrueba) || 15;
    const hasta = new Date(ahora + dias * 86400000).toISOString().slice(0, 10);
    if (String(siguiente.expira).slice(0, 10) < hasta) siguiente.expira = hasta;
  }
  return { acceso: siguiente, error };
}
