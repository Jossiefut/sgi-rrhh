/* =====================================================================================
   Prueba de Integridad Laboral (PIL): cuadernillo, clave, corrección e interpretación.
   Instrumento propio del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta)
   para cargos que manejan dinero y mercancía: Cajero, Cajero Principal, Depositario y Jefe de Almacén.

   - Mide ACTITUDES y criterios ante situaciones de trabajo. No pregunta por faltas cometidas en el
     pasado, antecedentes, salud ni datos personales.
   - 46 afirmaciones con escala de 1 a 5: 40 de cinco escalas de integridad y 6 de validez
     (deseabilidad social).
   - El resultado NUNCA descarta por sí solo a una persona: orienta la entrevista y se interpreta
     junto con las demás pruebas, la evaluación de desempeño y las referencias.
   - Los cortes son PROVISIONALES hasta contar con un baremo propio (100 aplicaciones o más).
   ===================================================================================== */

export const PIL_NOMBRE = 'Prueba de Integridad Laboral';
export const PIL_TOTAL = 46;
export const PIL_ESCALA_RESPUESTA = [
  { valor: 1, texto: 'Totalmente en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Totalmente de acuerdo' },
];
export const PIL_INSTRUCCIONES = 'A continuación encontrará afirmaciones sobre situaciones de trabajo. Indique qué tan de acuerdo está con cada una. No hay respuestas buenas ni malas: responda con sinceridad según lo que usted piensa, no según lo que cree que se espera. Tiempo sugerido: 15 minutos.';

export const PIL_ESCALAS = {
  ROB: { nombre: 'Actitud ante la apropiación indebida', descripcion: 'Rechazo a tomar dinero, mercancía o beneficios que no le corresponden.' },
  HON: { nombre: 'Honestidad y transparencia', descripcion: 'Disposición a decir la verdad, reconocer errores y reportar irregularidades.' },
  NOR: { nombre: 'Apego a normas y controles', descripcion: 'Cumplimiento de procedimientos de caja, inventario y seguridad, con o sin supervisión.' },
  RES: { nombre: 'Responsabilidad y confiabilidad', descripcion: 'Puntualidad, asistencia, cumplimiento de compromisos y cuidado de los bienes.' },
  RAC: { nombre: 'Rechazo a las justificaciones', descripcion: 'No acepta excusas (salario, trato, necesidad, «todos lo hacen») para cometer faltas.' },
};

/* Cuadernillo y clave: [n.º, escala, dirección, clave interna, afirmación]
   Dirección '+': estar de acuerdo es favorable. '-': estar de acuerdo es desfavorable. 'DS': validez. */
export const PIL_ITEMS = [
  [1, 'RES', '-', 'RES2', "Faltar al trabajo sin avisar se justifica cuando uno está muy cansado."],
  [2, 'NOR', '-', 'NOR8', "Las normas se cumplen sobre todo cuando el gerente está presente."],
  [3, 'DS', 'DS', 'DS6', "Jamás he dejado una tarea para después."],
  [4, 'RES', '+', 'RES1', "Llego a tiempo a mi turno aunque haya tenido una mala noche."],
  [5, 'RES', '-', 'RES6', "Usar el tiempo de trabajo para asuntos personales es normal si no hay clientes."],
  [6, 'HON', '-', 'HON6', "Reportar un poco más de horas trabajadas no le hace daño a nadie."],
  [7, 'ROB', '+', 'ROB5', "Me molestaría ver a un compañero llevarse algo de la tienda sin pagar."],
  [8, 'RES', '-', 'RES4', "Si no me supervisan, trabajo a mi propio ritmo aunque se retrase el trabajo."],
  [9, 'ROB', '-', 'ROB6', "Ajustar el inventario para tapar un faltante es aceptable si después se corrige."],
  [10, 'ROB', '+', 'ROB2', "Quien toma mercancía o dinero de la empresa, aunque sea poco, comete una falta seria."],
  [11, 'DS', 'DS', 'DS5', "Nunca he sentido envidia de nadie."],
  [12, 'NOR', '-', 'NOR2', "Los controles de inventario son una pérdida de tiempo."],
  [13, 'NOR', '+', 'NOR7', "Registro cada movimiento de mercancía, aunque sea pequeño."],
  [14, 'RES', '+', 'RES7', "Si no puedo asistir, aviso con anticipación."],
  [15, 'NOR', '+', 'NOR3', "Cuento el dinero frente al cliente aunque haya cola."],
  [16, 'NOR', '+', 'NOR1', "Sigo los procedimientos de caja aunque nadie me esté supervisando."],
  [17, 'HON', '-', 'HON4', "Encubrir a un compañero es una muestra de lealtad."],
  [18, 'HON', '+', 'HON1', "Si cometo un error en el cierre de caja, lo informo de inmediato aunque me traiga problemas."],
  [19, 'HON', '+', 'HON5', "Prefiero decir la verdad aunque me perjudique."],
  [20, 'DS', 'DS', 'DS1', "Nunca he dicho una mentira, ni siquiera pequeña."],
  [21, 'HON', '+', 'HON3', "Si veo que un compañero hace algo indebido, lo informo a mi supervisor."],
  [22, 'DS', 'DS', 'DS3', "En toda mi vida he cumplido todas las normas sin excepción."],
  [23, 'NOR', '-', 'NOR6', "Prestar mi clave del sistema a un compañero de confianza no es un problema."],
  [24, 'RAC', '+', 'RAC3', "Ninguna situación personal justifica tomar lo que no es mío."],
  [25, 'RAC', '-', 'RAC8', "Quien tiene necesidades económicas urgentes merece una excepción a las reglas."],
  [26, 'RAC', '-', 'RAC2', "Las empresas grandes tienen tanto dinero que una pequeña pérdida no les afecta."],
  [27, 'RAC', '+', 'RAC5', "Aunque otros lo hagan, eso no convierte una falta en algo correcto."],
  [28, 'HON', '-', 'HON2', "A veces es mejor no decir que uno se equivocó para evitar un llamado de atención."],
  [29, 'ROB', '-', 'ROB4', "Usar el descuento de empleado para comprarle a personas que no son de mi familia es una práctica normal."],
  [30, 'ROB', '-', 'ROB3', "Si un cliente deja dinero de más en la caja, no hay por qué devolverlo."],
  [31, 'NOR', '-', 'NOR4', "Si un procedimiento es lento, está bien saltarse algunos pasos para atender más rápido."],
  [32, 'ROB', '-', 'ROB1', "Tomar algo pequeño de la tienda, como un accesorio, no es grave si nadie lo nota."],
  [33, 'HON', '-', 'HON8', "Una pequeña mentira al supervisor está bien si evita un problema mayor."],
  [34, 'RES', '+', 'RES5', "Cuido los equipos y la mercancía como si fueran míos."],
  [35, 'RES', '-', 'RES8', "Cumplir el horario exacto no es tan importante si el trabajo se hace."],
  [36, 'RAC', '-', 'RAC6', "Si la empresa no se da cuenta, no hay un daño real."],
  [37, 'RES', '+', 'RES3', "Cuando me comprometo con una tarea, la termino."],
  [38, 'RAC', '-', 'RAC4', "Si un jefe trata mal al personal, es entendible que algunos no cuiden los bienes de la empresa."],
  [39, 'RAC', '+', 'RAC7', "Una falta pequeña, repetida, termina siendo un problema grande."],
  [40, 'HON', '+', 'HON7', "Si recibo de más en mi pago, aviso a la empresa."],
  [41, 'ROB', '+', 'ROB7', "El dinero de la caja es de la empresa desde el momento en que el cliente paga."],
  [42, 'DS', 'DS', 'DS2', "Jamás me he enojado con nadie."],
  [43, 'DS', 'DS', 'DS4', "Nunca he llegado tarde a ningún compromiso."],
  [44, 'RAC', '-', 'RAC1', "Si la empresa paga poco, es comprensible que algunos empleados busquen compensarlo por su cuenta."],
  [45, 'NOR', '+', 'NOR5', "Las revisiones de bolsos y las auditorías sorpresa son necesarias."],
  [46, 'ROB', '-', 'ROB8', "Casi todo el mundo se ha llevado alguna vez algo de su trabajo, así que no es para tanto."],
];

/* Ítems críticos: responder 4 o 5 («de acuerdo») genera una alerta que debe revisarse en entrevista */
export const PIL_CRITICOS = ['ROB1', 'ROB3', 'ROB6', 'NOR6', 'RAC1', 'RAC6'];
/* Pares de control de consistencia: [ítem favorable, ítem opuesto] */
export const PIL_PARES = [['ROB2', 'ROB1'], ['HON1', 'HON2'], ['NOR1', 'NOR4'], ['RAC3', 'RAC1']];

/* Cortes PROVISIONALES (puntaje 0 a 100) */
export const PIL_CORTES = { favorable: 75, moderado: 60 };
export const PIL_DS_CORTES = { alta: 4.5, moderada: 4 };

const porClave = Object.fromEntries(PIL_ITEMS.map((x) => [x[3], x]));
const valor = (respuestas, n) => { const v = Number(respuestas?.[n]); return v >= 1 && v <= 5 ? v : null; };
const favorable = (item, v) => (item[2] === '+' ? v : 6 - v);
const nivel = (p) => (p >= PIL_CORTES.favorable ? 'Favorable' : p >= PIL_CORTES.moderado ? 'Moderado' : 'Riesgo');

export function validarRespuestasPIL(respuestas) {
  const faltantes = PIL_ITEMS.filter((x) => valor(respuestas, x[0]) === null).map((x) => x[0]);
  return { valida: !faltantes.length, faltantes };
}

/* respuestas: { 1: 4, 2: 1, ... } (valor de 1 a 5 por número de afirmación) */
export function corregirPIL(respuestas) {
  const escalas = Object.keys(PIL_ESCALAS).map((id) => {
    const its = PIL_ITEMS.filter((x) => x[1] === id);
    const vals = its.map((x) => valor(respuestas, x[0])).filter((v) => v !== null);
    const fav = its.map((x) => { const v = valor(respuestas, x[0]); return v === null ? null : favorable(x, v); }).filter((v) => v !== null);
    const media = fav.length ? fav.reduce((a, b) => a + b, 0) / fav.length : 0;
    const puntaje = fav.length ? Math.round(((media - 1) / 4) * 100) : 0;
    return { id, ...PIL_ESCALAS[id], respondidas: vals.length, puntaje, nivel: nivel(puntaje) };
  });
  const indice = Math.round(escalas.reduce((a, e) => a + e.puntaje, 0) / escalas.length);
  const dsVals = PIL_ITEMS.filter((x) => x[2] === 'DS').map((x) => valor(respuestas, x[0])).filter((v) => v !== null);
  const ds = dsVals.length ? dsVals.reduce((a, b) => a + b, 0) / dsVals.length : 0;
  const criticos = PIL_CRITICOS.map((k) => porClave[k]).filter((x) => (valor(respuestas, x[0]) || 0) >= 4).map((x) => ({ n: x[0], afirmacion: x[4], respuesta: valor(respuestas, x[0]) }));
  const inconsistentes = PIL_PARES.filter(([a, b]) => {
    const va = valor(respuestas, porClave[a][0]); const vb = valor(respuestas, porClave[b][0]);
    return va !== null && vb !== null && Math.abs(favorable(porClave[a], va) - favorable(porClave[b], vb)) >= 3;
  }).length;

  const alertas = [];
  if (ds >= PIL_DS_CORTES.alta) alertas.push('Deseabilidad social alta: la persona tiende a presentarse de forma idealizada. Los puntajes pueden estar sobrestimados; profundice en la entrevista con ejemplos concretos.');
  else if (ds >= PIL_DS_CORTES.moderada) alertas.push('Deseabilidad social moderada: interprete los puntajes altos con cautela.');
  if (inconsistentes >= 2) alertas.push('Respuestas poco consistentes en afirmaciones opuestas: puede indicar respuestas al azar o poca comprensión. Considere repetir la prueba con acompañamiento.');
  if (criticos.length) alertas.push(`${criticos.length} ${criticos.length === 1 ? 'respuesta crítica' : 'respuestas críticas'}: revise cada una en la entrevista antes de cualquier decisión.`);

  const validez = ds >= PIL_DS_CORTES.alta || inconsistentes >= 2 ? 'Dudosa' : 'Aceptable';
  let conclusion;
  if (indice < PIL_CORTES.moderado || criticos.length >= 2) conclusion = 'No favorable';
  else if (indice < PIL_CORTES.favorable || criticos.length === 1 || validez === 'Dudosa' || escalas.some((e) => e.nivel === 'Riesgo')) conclusion = 'Revisar en entrevista';
  else conclusion = 'Favorable';

  return {
    escalas, indice, nivelIndice: nivel(indice), deseabilidadSocial: Math.round(ds * 100) / 100,
    criticos, inconsistentes, validez, alertas, conclusion,
    textoConclusion: PIL_CONCLUSIONES[conclusion], validacion: validarRespuestasPIL(respuestas),
    completa: validarRespuestasPIL(respuestas).valida,
  };
}

export const PIL_TEXTOS_ESCALA = {
  ROB: { Favorable: 'Muestra un rechazo claro a tomar dinero, mercancía o beneficios que no le corresponden.', Moderado: 'Rechaza la apropiación indebida en general, pero relativiza algunas situaciones menores. Conviene aclarar en la entrevista los límites que considera aceptables.', Riesgo: 'Tiende a minimizar la gravedad de tomar bienes de la empresa o de aprovechar errores a su favor.' },
  HON: { Favorable: 'Se muestra dispuesto a reconocer errores, decir la verdad y reportar irregularidades.', Moderado: 'Es honesto en lo general, aunque podría ocultar errores propios o de compañeros para evitar conflictos.', Riesgo: 'Muestra tendencia a ocultar errores o encubrir conductas indebidas.' },
  NOR: { Favorable: 'Valora los procedimientos y controles, y los cumple aun sin supervisión.', Moderado: 'Cumple las normas, pero puede saltarse pasos cuando hay presión de tiempo.', Riesgo: 'Percibe los controles como un obstáculo y tiende a cumplirlos solo bajo supervisión.' },
  RES: { Favorable: 'Se muestra puntual, comprometido con sus tareas y cuidadoso con los bienes de la empresa.', Moderado: 'Es responsable en lo general, con flexibilidad en horarios o en el uso del tiempo de trabajo.', Riesgo: 'Muestra baja valoración de la puntualidad, la asistencia o el cumplimiento de compromisos.' },
  RAC: { Favorable: 'No acepta justificaciones para cometer faltas, aun en situaciones difíciles.', Moderado: 'Comprende ciertas justificaciones (salario, necesidad, trato) aunque no las comparte del todo.', Riesgo: 'Tiende a justificar las faltas por condiciones externas, lo que facilita conductas indebidas.' },
};

export const PIL_CONCLUSIONES = {
  Favorable: 'Perfil de integridad favorable para cargos con manejo de dinero y mercancía. Continuar con el proceso.',
  'Revisar en entrevista': 'Perfil con aspectos a profundizar. Antes de decidir, RRHH debe revisar en entrevista las escalas moderadas o de riesgo, las respuestas críticas y las alertas de validez, y dejar constancia de sus conclusiones.',
  'No favorable': 'Perfil de integridad no favorable para cargos con manejo de dinero y mercancía en este momento. La decisión final corresponde a RRHH después de la entrevista; el resultado no descarta por sí solo a la persona.',
};
