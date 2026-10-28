/* Indicador Lógico I: clave de corrección y puntaje. Clave entregada por RRHH (hoja "Clave_Indicador_Logico_I").
   Respuestas: número de la opción (1 a 5), letra en la pregunta 13 o el número calculado en las preguntas numéricas. */
export const LOGICO_TOTAL = 50;
export const LOGICO_CLAVE = {"1": "4", "2": "156", "3": "3", "4": "4", "5": "2", "6": "1", "7": "4", "8": "3", "9": "1", "10": "84", "11": "4", "12": "1", "13": "B", "14": "4", "15": "1", "16": "96", "17": "3", "18": "2", "19": "3", "20": "2", "21": "5", "22": "3", "23": "3", "24": "22", "25": "2", "26": "7", "27": "2", "28": "2", "29": "2", "30": "3", "31": "1", "32": "3", "33": "63", "34": "2", "35": "3", "36": "1", "37": "13", "38": "2", "39": "203", "40": "1", "41": "1", "42": "40", "43": "1", "44": "25", "45": "66", "46": "6", "47": "3", "48": "1", "49": "3", "50": "2"};
/* Preguntas que la clave marca para verificar contra el cuadernillo impreso */
export const LOGICO_REVISAR = {"3": "Admite otra lectura", "8": "Verificar contra el cuadernillo impreso (escaneo borroso)", "12": "Verificar contra el cuadernillo impreso (escaneo borroso)", "20": "Admite otra lectura", "28": "Admite otra lectura", "50": "Aclarar en el enunciado que son días completos"};
/* Cargos que presentan la prueba (destino de la promoción o cargo al que ingresa) y mínimo de correctas (RRHH lo define) */
export const LOGICO_CARGOS_INICIALES = ['GT', 'CAJT', 'CAJ'];
export const LOGICO_MINIMOS_INICIALES = { CAJ: 8, CAJT: 8, GT: 12 };

const norm = (v) => String(v === null || v === undefined ? '' : v).trim().toUpperCase();
function esNumero(t) { return /^-?\d+([.,]\d+)?$/.test(t); }
export function respuestaCorrecta(n, resp) {
  const r = norm(resp);
  if (!r) return null;
  const c = norm(LOGICO_CLAVE[n]);
  if (esNumero(r) && esNumero(c)) return Number(r.replace(',', '.')) === Number(c.replace(',', '.'));
  return r === c;
}
/* respuestas: { 1: '4', 2: '156', 13: 'B', ... } */
export function corregirLogico(respuestas) {
  const r = respuestas || {};
  const detalle = Array.from({ length: LOGICO_TOTAL }, (_, i) => { const n = i + 1; const ok = respuestaCorrecta(n, r[n]); return { n, respuesta: norm(r[n]), correcta: LOGICO_CLAVE[n], estado: ok === null ? 'SIN' : ok ? 'OK' : 'MAL' }; });
  const correctas = detalle.filter((x) => x.estado === 'OK').length;
  const incorrectas = detalle.filter((x) => x.estado === 'MAL').length;
  const sinResponder = LOGICO_TOTAL - correctas - incorrectas;
  return { detalle, correctas, incorrectas, sinResponder, respondidas: correctas + incorrectas, pct: Math.round((correctas / LOGICO_TOTAL) * 100), completa: sinResponder === 0 };
}
/* Resultado frente al mínimo del cargo: sin mínimo definido no se califica como cumple o no cumple */
export function evaluarMinimoLogico(correctas, minimo) {
  const m = Number(minimo);
  if (!(m > 0)) return { id: 'SIN_MINIMO', texto: 'Sin mínimo definido para el cargo', tono: 'neutro', minimo: null };
  return correctas >= m ? { id: 'CUMPLE', texto: `Cumple el mínimo del cargo (${m} de ${LOGICO_TOTAL})`, tono: 'exito', minimo: m } : { id: 'NO_CUMPLE', texto: `No alcanza el mínimo del cargo (${m} de ${LOGICO_TOTAL})`, tono: 'peligro', minimo: m };
}
