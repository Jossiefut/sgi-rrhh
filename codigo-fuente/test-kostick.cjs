/* Verificación del módulo Kostick y de las reglas de intentos (sin pantalla) */
const fs = require('fs');
let fallos = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fallos++; };
(async () => {
  const K = await import('./kostick.js'); const C = await import('./kostick-cuadernillo.js'); const I = await import('./intentos.js');
  const leo = JSON.parse(fs.readFileSync('fixtures/kostick-leonardo.json', 'utf8'));
  const sinNulos = Object.fromEntries(Object.entries(leo).filter(([, v]) => v));
  const r = K.corregirKostick(sinNulos);
  ok(r.escalas.map((e) => e.id + e.pd).join(' ') === 'N7 A5 G6 L6 P5 I5 T3 V5 O0 B7 S4 X4 D5 C3 R6 Z4 E2 K3 F2 W7', 'Kostick: los 20 puntajes de Leonardo coinciden con la hoja de Excel');
  if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(r.escalas));
  const cl = K.KOSTICK_ESCALAS.flatMap((e) => e.items.map(([q, o]) => q + o));
  ok(cl.length === 180 && new Set(cl).size === 180 && K.KOSTICK_ESCALAS.every((e) => e.items.length === 9), 'Kostick: la clave cubre cada frase (90 x 2) una sola vez, 9 por escala');
  ok(K.KOSTICK_ESCALAS.every((e) => e.nivel.length === 10 && e.nivel.every((n) => [1, 2, 3].includes(n))), 'Kostick: nivel definido para todos los puntajes 0 a 9 (A=8 asumido en 3)');
  ok(C.KOSTICK_CUADERNILLO.length === 90 && C.KOSTICK_CUADERNILLO.every((q, i) => q.n === i + 1 && q.a && q.b && !/^[ab]\)/.test(q.a) && !/^[ab]\)/.test(q.b)), 'Cuadernillo Kostick: 90 preguntas con las frases a y b limpias');
  ok(C.KOSTICK_CUADERNILLO[0].a === 'Soy trabajador tenaz' && C.KOSTICK_CUADERNILLO[0].b === 'No soy voluble' && C.KOSTICK_CUADERNILLO[17].a.startsWith('Algunas veces culpo'), 'Cuadernillo Kostick: sin letra, la primera frase es a y la segunda b');
  const todasA = K.corregirKostick(Object.fromEntries(Array.from({ length: 90 }, (_, i) => [i + 1, 'a'])));
  ok(todasA.respondidas === 90 && todasA.completa, 'Kostick: 90 respondidas se marcan completas');
  // Match
  const perfilTotal = Object.fromEntries(r.escalas.map((e) => [e.id, [e.nivel, 1]]));
  ok(K.matchKostick(r, perfilTotal).pct === 100, 'Match: un perfil idéntico da 100 %');
  const opuesto = Object.fromEntries(r.escalas.map((e) => [e.id, [e.nivel === 2 ? 2 : 4 - e.nivel, 1]]));
  ok(K.matchKostick(r, opuesto).pct < 60, 'Match: un perfil opuesto da un porcentaje bajo');
  const gt = K.matchKostick(r, K.KOSTICK_PERFILES_INICIALES.GT), sub = K.matchKostick(r, K.KOSTICK_PERFILES_INICIALES.SUB);
  ok(gt.pct >= 0 && gt.pct <= 100 && sub.pct >= 0 && sub.pct <= 100 && gt.pct !== undefined && gt.coinciden + gt.cercanas + gt.distantes === 20, 'Match: Gerente ' + gt.pct + ' % y Subgerente ' + sub.pct + ' % (Leonardo)');
  ok(K.veredictoMatch(80).id === 'ALTO' && K.veredictoMatch(79).id === 'MEDIO' && K.veredictoMatch(65).id === 'MEDIO' && K.veredictoMatch(64).id === 'BAJO', 'Match: rangos 80 / 65');
  // Intentos
  const cfg = {}; const T0 = Date.parse('2026-10-05T12:00:00Z'); const t = (m) => T0 + m * 60000;
  let a = { bateria: ['IPV', 'KOSTICK'], estado: 'PENDIENTE', respuestas: {}, expira: '2026-10-20' };
  const x = (id, tipo, p, m) => { const q = I.accionPrueba(a, id, tipo, p, t(m), cfg); a = q.acceso; return q.error; };
  const est = (id, m) => I.situacionPrueba(I.evDe(a, id), t(m), 40);
  ok(x('KOSTICK', 'iniciar', {}, 0) === '' && est('KOSTICK', 1).estado === 'EN_CURSO', 'Intentos: iniciar abre el intento 1');
  ok(est('KOSTICK', 39).restanteMs === 60000 && est('KOSTICK', 41).estado === 'PENDIENTE', 'Intentos: a los 40 min vence y queda una oportunidad');
  x('KOSTICK', 'guardar', { respuestas: { 1: 'a' } }, 10);
  ok(x('KOSTICK', 'guardar', { respuestas: { 2: 'b' } }, 41) !== '' && !I.evDe(a, 'KOSTICK').respuestas[2], 'Intentos: no se guarda nada después de los 40 minutos');
  ok(x('KOSTICK', 'iniciar', {}, 50) === '' && I.evDe(a, 'KOSTICK').respuestas[1] === 'a', 'Intentos: el 2.º intento conserva lo respondido');
  x('KOSTICK', 'guardar', {}, 95);
  ok(est('KOSTICK', 95).estado === 'BLOQUEADA' && x('KOSTICK', 'iniciar', {}, 96) !== '', 'Intentos: tras 2 intentos sin terminar queda bloqueada');
  ok(x('KOSTICK', 'autorizar', {}, 97) === '' && est('KOSTICK', 97).estado === 'PENDIENTE' && est('KOSTICK', 97).permitidos === 3, 'Intentos: RRHH autoriza un último intento');
  ok(x('KOSTICK', 'autorizar', {}, 98) !== '', 'Intentos: no se puede autorizar dos veces');
  x('KOSTICK', 'iniciar', {}, 100); x('KOSTICK', 'guardar', {}, 150);
  ok(est('KOSTICK', 150).estado === 'CERRADA' && est('KOSTICK', 150).definitiva && x('KOSTICK', 'iniciar', {}, 151) !== '' && x('KOSTICK', 'autorizar', {}, 152) !== '', 'Intentos: el tercero es definitivo; no hay más');
  ok(x('IPV', 'iniciar', {}, 0) === '' && x('IPV', 'terminar', { respuestas: { 1: 'a' } }, 5) === '' && x('IPV', 'autorizar', {}, 6) !== '' && a.estado === 'COMPLETADA', 'Intentos: una prueba terminada no se puede reabrir; con ambas definitivas el acceso queda COMPLETADA');
  const b = I.evDe({ estado: 'COMPLETADA', respuestas: { 1: 'a' }, inicio: 'x', fin: 'y' }, 'IPV');
  ok(b.completada && b.intentos.length === 1, 'Intentos: los accesos de la versión anterior se leen como una prueba enviada');
  ok(I.minutosPrueba({ minutosPrueba: { KOSTICK: 25 } }, 'KOSTICK') === 25 && I.minutosPrueba({}, 'IPV') === 40, 'Intentos: minutos configurables (40 por defecto)');
  process.exit(fallos ? 1 : 0);
})();
