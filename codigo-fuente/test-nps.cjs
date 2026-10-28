/* eNPS (v1.19.0): clasificación, cálculo, entrevista de salida, encuesta de clima y indicadores. */
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const C = await import('./clima.js'); const S = await import('./salidas.js');
  ok(C.clasificarNps(9) === 'PROMOTOR' && C.clasificarNps(10) === 'PROMOTOR' && C.clasificarNps(7) === 'PASIVO' && C.clasificarNps(8) === 'PASIVO' && C.clasificarNps(6) === 'DETRACTOR' && C.clasificarNps(0) === 'DETRACTOR', 'Promotores 9–10, pasivos 7–8, detractores 0–6');
  ok(C.clasificarNps(11) === null && C.clasificarNps('') === null && C.clasificarNps(null) === null && C.clasificarNps(7.5) === null, 'Valores fuera de 0–10 no cuentan');
  const r = C.calcularNps([10, 9, 9, 8, 7, 3, 0, 6, null]);
  ok(r.n === 8 && r.promotores === 3 && r.pasivos === 2 && r.detractores === 3 && r.nps === 0, 'NPS = %promotores − %detractores (3/8 − 3/8 = 0)');
  ok(C.calcularNps([10, 10, 9, 9]).nps === 100 && C.calcularNps([0, 5]).nps === -100 && C.calcularNps([]) === null, 'Extremos +100 / −100 y sin datos');
  ok(C.nivelNps(55).id === 'EXCELENTE' && C.nivelNps(-5).id === 'CRITICO', 'Niveles del NPS');
  const ciclo = C.crearCicloClima({ id: 'C1', tipo: 'CLIMA', nombre: 'x' });
  ok(ciclo.nps === true && C.crearCicloClima({ id: 'C2', tipo: 'SUGERENCIAS', nombre: 'y' }).nps === false, 'Los ciclos de clima nuevos incluyen la pregunta eNPS; el buzón no');
  const resp = Object.fromEntries(ciclo.preguntas.map((q) => [q.id, 4]));
  ok(!C.validarRespuestaClima(ciclo, resp).valida && C.validarRespuestaClima(ciclo, resp).faltan.includes('NPS'), 'Sin la respuesta 0–10 la encuesta de clima no es válida');
  ok(C.validarRespuestaClima(ciclo, resp, 8).valida && C.validarRespuestaClima({ ...ciclo, nps: false }, resp).valida, 'Con la respuesta es válida; los ciclos anteriores sin eNPS siguen válidos');
  const rs = [10, 9, 6, 8].map((n, i) => ({ cicloId: 'C1', respuestas: resp, nps: n, id: i }));
  const calc = C.calcularClima(ciclo, rs);
  ok(calc.nps && calc.nps.nps === 25 && C.resumenCiclo(ciclo, rs, []).nps === 25, 'El resultado del ciclo incluye el eNPS');
  /* entrevista de salida */
  ok(S.npsDeCelda(9) === 9 && S.npsDeCelda('10 - Muy probable') === 10 && S.npsDeCelda('Muy probable (8)') === 8 && S.npsDeCelda('') === null && S.npsDeCelda('Nada') === null, 'Lee la recomendación 0–10 de la entrevista de salida en varios formatos');
  const enc = ['Id', 'Hora de finalizacion', 'Nombres y apellidos', 'Cedula', 'Marca', 'Motivo de la salida', 'Total de puntos', 'Que probabilidades hay de que nos recomiende como lugar de trabajo?', 'Puntos: Que probabilidades hay de que nos recomiende como lugar de trabajo?'];
  const mk = (id, nps, pts) => [id, '2026-09-01 10:00', 'Ana Perez', '12345678', 'Balú', 'Renuncia', pts, nps, 0];
  const res = S.entrevistasDesdeFormulario([enc, mk(1, 10, 1), mk(2, '3', 5), mk(3, 8, 0)]);
  ok(res.filas.length === 3 && res.filas[0].nps === 10 && res.filas[1].nps === 3, 'La importación guarda el NPS de cada entrevista');
  const an = S.analisisSalidas(res.filas);
  ok(an.nps && an.nps.n === 3 && an.nps.nps === 0 && an.tiendas[0].nps === 0, 'El análisis de salidas calcula el eNPS total y por tienda');
  ok(S.entrevistasDesdeFormulario([enc.slice(0, 7), ['1', '2026-09-01', 'A', '1', 'Balú', 'x', 1]]).avisos.some((a) => a.includes('NPS')), 'Avisa si el Excel no trae la pregunta de recomendación');
  process.exit(process.exitCode || 0);
})();
