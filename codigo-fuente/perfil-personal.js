/* Datos personales cruzables con los indicadores (funciones puras, sin interfaz).
 * Cada dimensión describe a una persona (género, edad, escolaridad, estado civil, hijos, estado y municipio de residencia,
 * antigüedad, tipo de contrato y cargo). Con ellas se parten los indicadores de gestión y el análisis de egresos.
 * Solo RRHH, el Administrador y la Gerencia General ven estas dimensiones (datos personales). */

export const SIN_REGISTRAR = 'Sin registrar';
export const ORDEN_HIJOS = ['Con hijos', 'Sin hijos', SIN_REGISTRAR];
export const ORDEN_CONTRATO = ['Fijo (tiempo indeterminado)', 'Por contrato (tiempo determinado)'];
export const MIN_MUESTRA = 5; /* grupos con menos personas se señalan como muestra pequeña */

/* Indicadores que no se pueden partir por persona: se miden por tienda o por toda la empresa (clima anónimo, HC, fichas de tienda, ventas) */
export const KPI_NO_SEGMENTABLES = ['hc', 'npssal', 'part', 'npsclima', 'fav', 'cumpl', 'ideas', 'ficha', 'oficial', 'conv', 'upt', 'mermas', 'roi'];

/* ctx: { hoy, generoDe(t), edadDe(t, hoy), rangoEdad(edad), ordenEdad[], nivelDe(t), ordenNivel[], estadoCivilDe(t), hijosDe(t), estadoResidenciaDe(t),
 *        municipioDe(t), tramoAntiguedad(dias), ordenAntiguedad[], diasAntiguedad(t, hoy), contratoDe(t), nombreCargo(id) } */
export function crearDimensionesPerfil(ctx) {
  const o = (v) => (v === undefined || v === null || String(v).trim() === '' ? SIN_REGISTRAR : String(v).trim());
  return [
    { id: 'genero', nombre: 'Género', valor: (t) => o(ctx.generoDe(t)), orden: null },
    { id: 'edad', nombre: 'Rango de edad', valor: (t) => ctx.rangoEdad(ctx.edadDe(t, ctx.hoy)), orden: ctx.ordenEdad || 'texto' },
    { id: 'escolaridad', nombre: 'Escolaridad (nivel de instrucción)', valor: (t) => o(ctx.nivelDe(t)), orden: ctx.ordenNivel || null },
    { id: 'estadoCivil', nombre: 'Estado civil', valor: (t) => o(ctx.estadoCivilDe(t)), orden: null },
    { id: 'hijos', nombre: 'Hijos', valor: (t) => ctx.hijosDe(t), orden: ORDEN_HIJOS },
    { id: 'estadoResidencia', nombre: 'Estado de residencia', valor: (t) => o(ctx.estadoResidenciaDe(t)), orden: null },
    { id: 'municipio', nombre: 'Municipio o zona de residencia', valor: (t) => o(ctx.municipioDe(t)), orden: null },
    { id: 'antiguedadActual', nombre: 'Antigüedad en la empresa', valor: (t) => ctx.tramoAntiguedad(ctx.diasAntiguedad(t, ctx.hoy)), orden: ctx.ordenAntiguedad || null },
    { id: 'contratoPerfil', nombre: 'Tipo de contrato', valor: (t) => ctx.contratoDe(t), orden: ORDEN_CONTRATO },
    { id: 'cargoPerfil', nombre: 'Cargo', valor: (t) => o(ctx.nombreCargo(t.cargoId)), orden: null },
  ];
}

/* Valor de hijos a partir del dato guardado: «Sí»/«No», cantidad o lista de hijos de la ficha */
export function textoHijos(trab, ficha) {
  const v = trab && trab.tieneHijos !== undefined && trab.tieneHijos !== '' ? trab.tieneHijos : ficha ? ficha.tieneHijos : undefined;
  const n = ficha && Array.isArray(ficha.hijos) ? ficha.hijos.length : 0;
  const s = String(v === undefined || v === null ? '' : v).trim().toUpperCase();
  if (s.startsWith('S') || (typeof v === 'number' && v > 0) || n > 0) return 'Con hijos';
  if (s.startsWith('N') || v === 0) return 'Sin hijos';
  return SIN_REGISTRAR;
}

/* Categorías presentes en un conjunto de personas, en el orden de la dimensión */
export function categoriasDe(dim, personas) {
  const cuenta = new Map();
  personas.forEach((p) => { const v = dim.valor(p); cuenta.set(v, (cuenta.get(v) || 0) + 1); });
  const claves = [...cuenta.keys()];
  claves.sort((a, b) => {
    if (Array.isArray(dim.orden)) {
      const ia = dim.orden.indexOf(a); const ib = dim.orden.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
    }
    if (dim.orden === 'texto') return a.localeCompare(b);
    if (a === SIN_REGISTRAR) return 1;
    if (b === SIN_REGISTRAR) return -1;
    return cuenta.get(b) - cuenta.get(a) || a.localeCompare(b);
  });
  return claves.map((valor) => ({ valor, n: cuenta.get(valor) }));
}
