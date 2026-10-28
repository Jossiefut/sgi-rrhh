import { PIL_ITEMS, corregirPIL, validarRespuestasPIL } from './integridad.js';
const mk = (fn) => Object.fromEntries(PIL_ITEMS.map((x) => [x[0], fn(x)]));
const casos = {
  ideal: mk((x) => (x[2] === '+' ? 5 : x[2] === '-' ? 1 : 2)),
  riesgo: mk((x) => (x[2] === '+' ? 2 : x[2] === '-' ? 4 : 2)),
  idealizada: mk((x) => (x[2] === '+' ? 5 : x[2] === '-' ? 1 : 5)),
  neutro: mk(() => 3),
};
let fallos = 0;
const ok = (c, m) => { if (!c) { fallos++; console.log('FALLA', m); } else console.log('ok', m); };
let r = corregirPIL(casos.ideal); ok(r.indice === 100 && r.conclusion === 'Favorable', 'ideal ' + r.indice + r.conclusion);
r = corregirPIL(casos.riesgo); ok(r.indice === 25 && r.criticos.length === 6 && r.conclusion === 'No favorable', 'riesgo ' + r.indice + ' ' + r.criticos.length);
r = corregirPIL(casos.idealizada); ok(r.indice === 100 && r.validez === 'Dudosa' && r.conclusion === 'Revisar en entrevista', 'idealizada');
r = corregirPIL(casos.neutro); ok(r.indice === 50 && r.conclusion === 'No favorable', 'neutro');
ok(!validarRespuestasPIL({}).valida, 'incompleta invalida');
process.exit(fallos ? 1 : 0);
