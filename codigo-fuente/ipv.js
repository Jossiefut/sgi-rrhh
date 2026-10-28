/* Inventario de Personalidad para Vendedores (IPV): clave de corrección, baremos, niveles y textos del informe.
   Fuente: archivo IPV Balú – Representaciones Ulab (hojas Respuestas e Informe). Los enunciados de las preguntas
   no están en este archivo: RRHH los carga desde el cuadernillo en Configuración. */
export const IPV_TOTAL_PREGUNTAS = 87;
/* Opciones que suman 1 punto en cada pregunta (1 a 87) */
export const IPV_CLAVE = ["b", "b", "b", "b", "a", "c", "a", "ac", "a", "b", "b", "c", "b", "b", "a", "c", "b", "c", "c", "b", "c", "c", "b", "c", "c", "b", "a", "c", "c", "b", "c", "c", "b", "c", "a", "c", "a", "c", "a", "a", "a", "a", "b", "a", "b", "b", "c", "a", "a", "c", "b", "a", "b", "a", "b", "a", "a", "c", "b", "b", "b", "a", "b", "a", "c", "a", "b", "a", "b", "c", "b", "a", "c", "a", "c", "c", "b", "b", "b", "c", "c", "c", "b", "a", "c", "a", "a"];
/* Escalas: preguntas que suman a cada una (puntaje directo) */
export const IPV_ESCALAS = [
  { id: 'DGV', nombre: 'Disposición general para la venta', corto: 'DGV', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 27, 35] },
  { id: 'R', nombre: 'Receptividad', corto: 'R', compuesta: ['I', 'II', 'III', 'IV'] },
  { id: 'A', nombre: 'Agresividad', corto: 'A', compuesta: ['V', 'VI', 'VII', 'VIII'] },
  { id: 'I', nombre: 'Comprensión', corto: 'I', items: [1, 2, 19, 20, 37, 38, 55, 56, 73, 74, 75] },
  { id: 'II', nombre: 'Adaptabilidad', corto: 'II', items: [3, 4, 21, 22, 39, 40, 57, 58, 59, 76, 77] },
  { id: 'III', nombre: 'Control de sí mismo', corto: 'III', items: [5, 6, 7, 23, 24, 25, 41, 42, 43, 60, 78] },
  { id: 'IV', nombre: 'Tolerancia a la frustración', corto: 'IV', items: [8, 26, 44, 61, 62, 79, 80, 81], inversa: 8 },
  { id: 'V', nombre: 'Combatividad', corto: 'V', items: [9, 10, 11, 27, 28, 29, 45, 46, 63, 64, 82] },
  { id: 'VI', nombre: 'Dominancia', corto: 'VI', items: [12, 13, 30, 31, 47, 48, 49, 65, 66, 83] },
  { id: 'VII', nombre: 'Seguridad', corto: 'VII', items: [14, 32, 50, 67, 68, 85, 86, 87] },
  { id: 'VIII', nombre: 'Actividad', corto: 'VIII', items: [15, 33, 34, 51, 52, 69, 70, 71] },
  { id: 'IX', nombre: 'Sociabilidad', corto: 'IX', items: [16, 17, 18, 35, 36, 53, 54, 72] },
];
/* Baremos: puntaje directo → puntaje típico (1 a 10). [pdMinimo, pt] en orden; se toma el último cuyo mínimo se alcanza. */
export const IPV_BAREMOS = {
  DGV: [[0, 1], [6, 2], [7, 3], [9, 4], [10, 5], [11, 6], [12, 7], [13, 8], [15, 9], [16, 10]],
  R: [[0, 1], [15, 2], [16, 3], [18, 4], [20, 5], [21, 6], [23, 7], [25, 8], [27, 9], [29, 10]],
  A: [[0, 1], [8, 2], [9, 3], [11, 4], [13, 5], [14, 6], [16, 7], [17, 8], [19, 9], [21, 10]],
  I: [[0, 1], [2, 2], [3, 3], [4, 4], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  II: [[0, 1], [2, 2], [3, 3], [4, 4], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  III: [[0, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 8], [8, 9], [9, 10]],
  IV: [[0, 1], [4, 2], [5, 4], [6, 5], [7, 7], [8, 9]],
  V: [[0, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 7], [7, 8], [8, 9], [9, 10]],
  VI: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 6], [5, 7], [6, 8], [7, 10]],
  VII: [[0, 1], [1, 2], [2, 4], [3, 5], [4, 7], [5, 8], [6, 10]],
  VIII: [[0, 2], [1, 4], [2, 6], [3, 8], [4, 9], [5, 10]],
  IX: [[0, 1], [2, 2], [3, 3], [4, 4], [5, 6], [6, 7], [7, 9], [8, 10]],
};
export const IPV_NIVELES = ['BAJO', 'MEDIO BAJO', 'MEDIO', 'MEDIO ALTO', 'ALTO'];
/* Textos del informe por escala: [puntaje 1 a 3, 4 a 7, 8 a 10] */
export const IPV_TEXTOS = {
  "DGV": [
    "Presenta dificultad para establecer relaciones con los demás en actividades de tipo comercial.",
    "Su habilidad para persuadir a los demás en relaciones de tipo comercial se encuentra dentro del promedio.",
    "Establece relaciones de tipo comercial con facilidad, persuadiendo a otros en pro de su propio rol."
  ],
  "R": [
    "Frente a situaciones novedosas con personas diferentes, presenta dificultad para adaptarse rápidamente a la circunstancia, lo que implica que posee un bajo control de sí mismo y poca resistencia a la frustración.",
    "Presenta cierta disposición para ponerse en lugar de los demás, escucharlos y comprender sus situaciones especificas. De igual forma, la facilidad con la que se adapta a personas y situaciones diferentes es promedio, al igual que su capacidad de autocontrol y de resistencia a la frustración se encuentran dentro de la media poblacional.",
    "Presenta una muy buena capacidad para ponerse en el lugar de los demás y comprender sus situaciones; se adapta rápida y fácilmente a personas y a situaciones nuevas, demostrando capacidad para controlarse a sí mismo y buena resistencia frente a la frustración."
  ],
  "A": [
    "Presenta dificultad para afrontar situaciones conflictivas, debido a su carácter  poco dominante, especialmente con personas que ejercen autoridad. De igual manera, supone poca seguridad en sí mismo y poca capacidad para asumir riesgos.",
    "Presenta una habilidad media para afrontar  situaciones conflictivas, manifestando cierta seguridad en sí mismo y capacidad para asumir riesgos en un nivel promedio.",
    "Afronta situaciones conflictivas de forma adecuada y correcta, presentado altos niveles de seguridad en sí mismo y capacidad para asumir riesgos. Implica una actitud dominante por poder o por ascendencia."
  ],
  "I": [
    "Presenta poca habilidad para manifestar sus ideas de forma adecuada, lo que supone un sentimiento de inseguridad al momento de influir en otros, con poca capacidad de integrar un suceso a un contexto específico.",
    "Se expresa de forma básica, lo que conlleva cierta seguridad al momento de influir en otros. De igual forma, posee cierta capacidad para integrarse a un suceso cualquiera, asumiendo sus diversos componentes.",
    "Manifiesta sus ideas de forma asertiva y adecuada, lo que implica que posee un alto nivel de seguridad en sí mismo al influir en los demás. Su capacidad para integrar un suceso cualquiera a un contexto específico es buena."
  ],
  "II": [
    "Es inconstante en el desarrollo de sus actividades, con poca tendencia a ser ordenado y perseverante. En algunas ocasiones podría cumplir con las tareas que le han sido asignadas dando resultados a largo plazo.",
    "Es constante en sus actividades, ordenado y perseverante. Cumple con las tareas que debe terminar, sin demostrar demasiada iniciativa para hacer de su trabajo un espacio creativo y productivo.",
    "Es constante  en las actividades que realiza, con una alta tendencia a ser ordenado y perseverante. Es responsable y cumplido con las tareas que le han sido asignadas demostrando resultados medibles en tiempos cortos."
  ],
  "III": [
    "Puede tratarse de una persona  poco controlada, con una baja capacidad para administrar su potencial psicológico y físico. No pretende dominar ni tener el control de las actividades que realiza y tiende a verse a sí mismo como poco intrépido y poco competitivo.",
    "Es una persona controlada, con cierta capacidad para administrar su potencial psicológico y físico. En algunas ocasiones tiende a dominar y controlar las actividades en las que se desempeña y tiende a verse a sí mismo con ciertos rasgos de eficiencia y competitividad, sin ser estos criterios, aspectos fundamentales dentro de su trabajo.",
    "Es una persona controlada, con una alta capacidad para administrar su potencial psicológico y físico. Busca dominar y tener el control de las actividades que realiza y se ve a sí mismo como intrépido, eficaz y competitivo."
  ],
  "IV": [
    "Presenta poca capacidad para soportar acciones frustrantes y para comprender los fracasos, tomándolos en un plano personal.",
    "En algunos casos puede soportar las acciones frustrantes y comprender los fracasos. De igual forma, tiende a interpretar las situaciones externas de forma personal, viéndose involucrado emocionalmente en aspectos que no dependen de si mismo.",
    "Presente alta capacidad para soportar adecuadamente las acciones frustrantes y para comprender los fracasos y no toma estos en un plano personal."
  ],
  "V": [
    "Presenta poca capacidad para discutir y soportar los desacuerdos; indica a una persona poco polémica y con poca agresividad comercial.",
    "Es capaz de discutir si es necesario y soportar los desacuerdos; de igual forma, si es preciso desenvolverse de manera polémica con algún grado de agresividad comercial.",
    "Presenta alta capacidad para discutir y soportar los desacuerdos, generando debates y ejemplificando las situaciones para lograr los objetivos que se ha trazado."
  ],
  "VI": [
    "Presenta poca voluntad de dominio, de ganar o de manipular a los demás, siendo una persona poco persuasiva o cautivadora en su entorno.",
    "Presenta cierto nivel de autoridad, para  ganar o manipular a los demás, siendo persuasivo y cautivador en su entorno solo si la situación amerita hacerlo.",
    "Presenta al nivel de voluntad de domino, de ganar o de manipular a los demás, siendo persuasivo y cautivador en su entorno."
  ],
  "VII": [
    "Es una persona poco segura de sí misma, a la que no le gustan las situaciones nuevas o inesperadas, con poca capacidad de enfrentarse a los riesgos, por miedo a perder.",
    "Presenta cierto nivel de seguridad en sí mismo, adaptándose a  situaciones nuevas o inesperadas y con capacidad de enfrentarse a los riesgos si la situación lo permite, de lo contrario prefiere seguir el conducto que ya conoce.",
    "Presenta altos niveles de seguridad en sí mismo y agrado por las situaciones nuevas o inesperadas, con alta capacidad para enfrentarse a los riesgos."
  ],
  "VIII": [
    "Presenta bajos niveles de actividad física, siendo una persona poco dinámica y poco deportiva.",
    "Presenta un nivel promedio de actividad física y dinamismo, con opción de desempeñarse de forma pasiva.",
    "Es una persona altamente dinámica, físicamente activa, suele ser alguien quien no soporta la pasividad y la inactividad."
  ],
  "IX": [
    "Es una persona introvertida, con poca capacidad para crear nuevos contactos y para convivir con los demás, prefiere establecer relaciones humanas básicas dándoles poca importancia a los vínculos sociales.",
    "Presenta capacidad para crear nuevos contactos y para convivir con los demás si es necesario; sin embargo no busca aprobación social.",
    "Es una persona extrovertida, con alta capacidad para crear nuevos contactos y convivir con los demás, prefiere la compañía de otros a la soledad. De igual forma, reconoce la importancia de las relaciones humanas."
  ]
};

export function nivelIPV(pt) { return IPV_NIVELES[Math.min(4, Math.max(0, Math.ceil(pt / 2) - 1))]; }
export function textoIPV(id, pt) { const t = IPV_TEXTOS[id] || []; return String((pt <= 3 ? t[0] : pt <= 7 ? t[1] : t[2]) || '').replace(/\s+/g, ' ').trim(); }
function convertir(id, pd) { let pt = 1; (IPV_BAREMOS[id] || []).forEach(([min, v]) => { if (pd >= min) pt = v; }); return pt; }
/* respuestas: { 1: 'a', 2: 'c', ... } → resultado por escala */
export function corregirIPV(respuestas) {
  const punto = (n) => (IPV_CLAVE[n - 1] || '').includes(String(respuestas[n] || '').toLowerCase()) && respuestas[n] ? 1 : 0;
  const pd = {};
  IPV_ESCALAS.filter((e) => e.items).forEach((e) => { const s = e.items.reduce((a, n) => a + punto(n), 0); pd[e.id] = e.inversa ? e.inversa - s : s; });
  IPV_ESCALAS.filter((e) => e.compuesta).forEach((e) => { pd[e.id] = e.compuesta.reduce((a, k) => a + pd[k], 0); });
  const escalas = IPV_ESCALAS.map((e) => { const pt = convertir(e.id, pd[e.id]); return { id: e.id, nombre: e.nombre, pd: pd[e.id], pt, nivel: nivelIPV(pt), texto: textoIPV(e.id, pt) }; });
  const respondidas = Object.keys(respuestas).filter((k) => respuestas[k]).length;
  return { escalas, respondidas, completa: respondidas >= IPV_TOTAL_PREGUNTAS };
}
/* Preguntas provisionales para la versión de prueba (hasta que RRHH cargue el cuadernillo) */
export function preguntasProvisionalesIPV() {
  return Array.from({ length: IPV_TOTAL_PREGUNTAS }, (_, i) => ({ n: i + 1, texto: `Pregunta ${i + 1} (texto provisional: cargue el cuadernillo en Configuración)`, a: 'Opción a', b: 'Opción b', c: 'Opción c', provisional: true }));
}
