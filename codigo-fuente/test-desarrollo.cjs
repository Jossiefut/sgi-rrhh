(async () => {
  const D = await import('./desarrollo.js');
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
  const hoy = '2026-10-06';
  const cat = [{ id: 'F1', nombre: 'Inducción', vigenciaMeses: 0, escala: 'APROBADO' }, { id: 'F2', nombre: 'LOPCYMAT', vigenciaMeses: 12, escala: 'NOTA20' }];
  ok(D.estatusParticipacion({ estatus: 'Programada', fechaProgramada: '2026-10-01' }, cat[0], hoy) === 'Vencida', 'Programada con fecha pasada y sin realizar → Vencida');
  ok(D.estatusParticipacion({ estatus: 'Programada', fechaProgramada: '2026-10-20' }, cat[0], hoy) === 'Programada', 'Programada a futuro sigue Programada');
  ok(D.estatusParticipacion({ estatus: 'Completada', fechaRealizacion: '2025-09-01' }, cat[1], hoy) === 'Vencida', 'Completada caduca tras la vigencia (12 meses)');
  ok(D.estatusParticipacion({ estatus: 'Completada', fechaRealizacion: '2025-11-01' }, cat[1], hoy) === 'Completada', 'Completada dentro de la vigencia');
  ok(D.estatusParticipacion({ estatus: 'No asistió', fechaProgramada: '2026-01-01' }, cat[0], hoy) === 'No asistió', 'No asistió se respeta');
  ok(D.participacionAprobada({ calificacion: 9, escala: 'NOTA20' }, cat[1]) === false && D.participacionAprobada({ calificacion: 15, escala: 'NOTA20' }, cat[1]) === true, 'Nota mínima 10 sobre 20');
  const parts = [{ trabajadorId: 'W1', formacionId: 'F1', estatus: 'Completada', fechaRealizacion: '2026-03-01' }, { trabajadorId: 'W1', formacionId: 'F2', estatus: 'Completada', fechaRealizacion: '2025-01-01', calificacion: 18, escala: 'NOTA20' }];
  const c = D.cumplimientoFormacion(parts, cat, 'W1', ['F1', 'F2'], hoy);
  ok(c.total === 2 && c.cumplidas === 1 && c.pct === 50 && c.faltan[0] === 'LOPCYMAT', 'Cumplimiento: 1 de 2, falta la vencida');
  const onb = D.participacionesDeOnboarding([{ id: 'ON1', trabajadorId: 'W1', tipo: 'INGRESO', fechaInicio: '2026-01-05', fechaFin: '2026-02-01', actividades: [{ hecha: true, fecha: '2026-01-20' }, { hecha: true, fecha: '2026-02-01' }] }], 'W1', 'F1');
  ok(onb.length === 1 && onb[0].formacionId === 'F1' && onb[0].fechaRealizacion === '2026-02-01', 'Onboarding completo cuenta como formación de inducción');
  ok(D.sumarMeses('2026-01-31', 1) === '2026-02-28' && D.mesesEntre('2026-01-15', '2026-10-06') === 8, 'Fechas: sumar meses y antigüedad');
  // puntaje
  const ruta = { antiguedadMeses: 6, reqDescripcion: 'PENDIENTE' };
  const base = { evaluacion: { fecha: '2026-08-01', aprobada: true, pct: 90 }, pruebas: { requeridas: true, pct: 80 }, formacion: { total: 2, cumplidas: 2, pct: 100, faltan: [] }, conductaPct: 100, antiguedadMeses: 12, contratoFijo: true, planMejoraAbierto: false, amonestacionesRecientes: 0 };
  let r = D.puntajePreparacion(base, ruta, hoy);
  ok(Math.abs(r.filas.reduce((a, f) => a + f.peso, 0) - 100) < 0.2, 'Pesos reescalados suman 100');
  ok(r.total === 90 * 0.35 + 80 * 0.25 + 100 * 0.2 + 100 * 0.1 + 100 * 0.1 && r.nivel === 'AHORA', 'Puntaje 90/80/100/100/100 = ' + r.total + ' → Listo ahora');
  ok(r.avisos.includes('Descripción de cargo pendiente'), 'Aviso «Descripción de cargo pendiente»');
  r = D.puntajePreparacion({ ...base, planMejoraAbierto: true }, ruta, hoy);
  ok(r.nivel === 'M12' && r.listoBloqueado && r.faltan.includes('plan de mejora abierto'), 'Sin condiciones obligatorias no queda «Listo ahora»');
  r = D.puntajePreparacion({ ...base, pruebas: { requeridas: false }, formacion: { total: 0, cumplidas: 0, pct: null, faltan: [] } }, ruta, hoy);
  ok(r.filas.length === 3 && Math.abs(r.filas.reduce((a, f) => a + f.peso, 0) - 100) < 0.2, 'Sin pruebas ni formación exigidas: se reescala a 100');
  r = D.puntajePreparacion({ ...base, evaluacion: { fecha: '2025-06-01', aprobada: true, pct: 95 }, antiguedadMeses: 3 }, ruta, hoy);
  ok(r.faltan.some((x) => x.startsWith('evaluación vencida')) && r.faltan.includes('antigüedad: faltan 3 meses'), 'Muestra qué le falta: evaluación vencida y 3 meses de antigüedad');
  ok(D.nivelDe(79) === 'M12' && D.nivelDe(64) === 'M24' && D.nivelDe(49) === 'DESARROLLO' && D.nivelDe(80) === 'AHORA', 'Cortes de nivel 80/65/50');
  // riesgo
  ok(D.riesgoTitular({ cajaNineBox: 4 }).id === 'ALTO' && D.riesgoTitular({ contratoDeterminado: true, mesesEnCargo: 20 }).id === 'MEDIO' && D.riesgoTitular({ mesesEnCargo: 20 }).id === 'BAJO' && D.riesgoTitular({ mesesEnCargo: 2 }).id === 'MEDIO', 'Riesgo alto / medio / bajo');
  const mapa = D.armarMapaTienda([
    { posicionId: 'GT', titular: { cajaNineBox: 1, mesesEnCargo: 30 }, sucesores: [{ trabajadorId: 'a', puntaje: 70, nivel: 'M12' }, { trabajadorId: 'b', puntaje: 85, nivel: 'AHORA' }] },
    { posicionId: 'SUB', titular: { egresoEnProceso: true, mesesEnCargo: 30 }, sucesores: [{ trabajadorId: 'c', puntaje: 60, nivel: 'M24' }] },
    { posicionId: 'JALM', titular: null, sucesores: [] },
  ]);
  ok(mapa[0].sucesores[0].trabajadorId === 'b' && !mapa[0].critica && mapa[1].critica && mapa[2].riesgo.id === 'VACANTE', 'Mapa: ordena por puntaje; crítica = riesgo alto sin «Listo ahora»');
  const ind = D.indicadoresMapa([mapa]);
  ok(ind.clave === 3 && ind.conListo === 1 && ind.cobertura === 33 && ind.criticas === 1 && ind.niveles.AHORA === 1, 'Indicadores: cobertura 33 %, 1 crítica');
  ok(D.siguienteEstadoNominacion({ estado: 'SUGERIDO' }, 'PROPONER') === 'PROPUESTO' && D.siguienteEstadoNominacion({ estado: 'PROPUESTO' }, 'APROBAR_RRHH', false) === 'APROBADO' && D.siguienteEstadoNominacion({ estado: 'PROPUESTO' }, 'APROBAR_RRHH', true) === 'APROBADO_RRHH' && D.siguienteEstadoNominacion({ estado: 'APROBADO_RRHH' }, 'APROBAR_GENERAL') === 'APROBADO' && D.siguienteEstadoNominacion({ estado: 'SUGERIDO' }, 'APROBAR_RRHH') === null, 'Nominación: otra marca exige además a Gerencia General');
  ok(D.proponerTamano(14) === 'GRANDE' && D.proponerTamano(13) === 'PEQUENA' && D.cargoCajaSegunTamano('GRANDE') === 'CAJT' && D.cargoCajaSegunTamano('PEQUENA') === 'CAJ', 'Tamaño y denominación de caja');
  ok(D.RUTAS_INICIALES.length === 9 && !D.RUTAS_INICIALES.some((x) => (x.origenId === 'CAJ' && x.destinoId === 'CAJT') || (x.origenId === 'CAJT' && x.destinoId === 'CAJ')), 'Rutas iniciales sin ruta Cajero↔Cajero Principal');
})();
