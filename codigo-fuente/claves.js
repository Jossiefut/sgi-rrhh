/* Clave de acceso al portal de pruebas: el primer apellido del evaluado, en mayúsculas, sin acentos ni espacios.
 * Los apellidos compuestos con partícula (De Abreu, Del Valle, De La Cruz) se toman completos: DEABREU, DELVALLE, DELACRUZ. */
export function normalizarClave(texto) { return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9Ñ]/g, ''); }
export const PARTICULAS_APELLIDO = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'DA', 'DAS', 'DO', 'DOS', 'DI', 'SAN', 'SANTA', 'VAN', 'VON'];
export function claveEvaluado(apellidos) {
  const t = String(apellidos || '').trim().split(/\s+/).filter(Boolean);
  const partes = []; let i = 0;
  while (i < t.length - 1 && PARTICULAS_APELLIDO.includes(normalizarClave(t[i]))) { partes.push(t[i]); i += 1; }
  partes.push(t[i] || '');
  return normalizarClave(partes.join(''));
}
