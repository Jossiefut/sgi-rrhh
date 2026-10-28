/* =====================================================================================
   Inventario de Personalidad Comercial (IPC): cuadernillo, clave, corrección e interpretación.
   Instrumento propio del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta).
   Se basa en el modelo de los cinco grandes factores de la personalidad (de uso libre) adaptado
   a la venta minorista de moda. No reproduce Hogan (HPI/HDS) ni otros instrumentos comerciales.

   - 54 afirmaciones con escala de 1 a 5: 48 de seis escalas, 4 de deseabilidad social y
     2 de atención (verifican que la persona lee las afirmaciones).
   - Resultados: puntaje 0 a 100 por escala, índice de potencial comercial, riesgos bajo presión
     y coincidencia con el perfil del cargo.
   - Cortes PROVISIONALES hasta contar con un baremo propio (100 aplicaciones o más).
   ===================================================================================== */

export const IPC_NOMBRE = 'Inventario de Personalidad Comercial';
export const IPC_TOTAL = 54;
export const IPC_ESCALA_RESPUESTA = [
  { valor: 1, texto: 'Totalmente en desacuerdo' },
  { valor: 2, texto: 'En desacuerdo' },
  { valor: 3, texto: 'Ni de acuerdo ni en desacuerdo' },
  { valor: 4, texto: 'De acuerdo' },
  { valor: 5, texto: 'Totalmente de acuerdo' },
];
export const IPC_INSTRUCCIONES = 'A continuación encontrará afirmaciones sobre su forma de ser en el trabajo. Indique qué tan de acuerdo está con cada una. No hay respuestas buenas ni malas: responda pensando en cómo es usted normalmente. Lea cada afirmación con atención. Tiempo sugerido: 20 minutos.';

export const IPC_ESCALAS = {
  EST: { nombre: 'Estabilidad emocional', descripcion: 'Calma, control de las emociones y resistencia a la presión.' },
  EMP: { nombre: 'Empuje y ambición', descripcion: 'Iniciativa, orientación a metas, competitividad y deseo de asumir responsabilidad.' },
  SOC: { nombre: 'Sociabilidad', descripcion: 'Facilidad para el contacto con personas y gusto por el trato con el público.' },
  AMA: { nombre: 'Amabilidad y servicio', descripcion: 'Empatía, cortesía, cooperación y disposición a ayudar.' },
  RES: { nombre: 'Responsabilidad y orden', descripcion: 'Organización, cumplimiento, cuidado del detalle y apego a procedimientos.' },
  APE: { nombre: 'Apertura y aprendizaje', descripcion: 'Curiosidad, interés por lo nuevo, adaptación al cambio y gusto por aprender.' },
};

/* Cuadernillo y clave: [n.º, escala, dirección, clave interna, afirmación]
   '+': estar de acuerdo suma; '-': estar de acuerdo resta; 'DS': deseabilidad social;
   en 'ATN' la dirección es la respuesta esperada (2 o 5). */
export const IPC_ITEMS = [
  [1, 'EMP', '+', 'EMP6', "Busco oportunidades para asumir más responsabilidad."],
  [2, 'APE', '-', 'APE5', "Me cuesta adaptarme cuando cambian los procedimientos."],
  [3, 'APE', '+', 'APE2', "Aprendo rápido a usar sistemas y herramientas nuevas."],
  [4, 'RES', '-', 'RES5', "Me cuesta seguir rutinas y procedimientos."],
  [5, 'RES', '+', 'RES8', "Planifico mi día antes de empezar."],
  [6, 'SOC', '+', 'SOC4', "Me da energía un día con mucho público en la tienda."],
  [7, 'EST', '+', 'EST5', "Trabajo bien bajo presión, como en temporada alta."],
  [8, 'DS', 'DS', 'DS4', "Todos mis compañeros me aprecian, sin excepción."],
  [9, 'SOC', '+', 'SOC8', "Recuerdo con facilidad los nombres y gustos de los clientes."],
  [10, 'SOC', '+', 'SOC2', "Me resulta fácil iniciar una conversación con un cliente."],
  [11, 'RES', '-', 'RES3', "Suelo dejar las cosas para el último momento."],
  [12, 'EMP', '+', 'EMP8', "Insisto hasta cerrar una venta difícil."],
  [13, 'AMA', '+', 'AMA6', "Disfruto ayudar a que un cliente encuentre lo que busca."],
  [14, 'SOC', '-', 'SOC5', "Me cuesta acercarme a los clientes que entran a la tienda."],
  [15, 'ATN', '5', 'ATN2', "Para esta afirmación, marque «Totalmente de acuerdo»."],
  [16, 'APE', '-', 'APE7', "No me interesa aprender tareas fuera de mi cargo."],
  [17, 'RES', '+', 'RES1', "Termino mis tareas antes de la hora de salida."],
  [18, 'APE', '+', 'APE6', "Disfruto los cursos y las capacitaciones."],
  [19, 'ATN', '2', 'ATN1', "Para esta afirmación, marque «En desacuerdo»."],
  [20, 'SOC', '+', 'SOC1', "Disfruto conversar con personas que no conozco."],
  [21, 'EMP', '-', 'EMP5', "Me conformo con cumplir lo mínimo que se me pide."],
  [22, 'APE', '+', 'APE4', "Busco nuevas formas de exhibir o presentar los productos."],
  [23, 'DS', 'DS', 'DS2', "Siempre estoy de buen humor."],
  [24, 'EST', '+', 'EST7', "Puedo controlar mis emociones frente al público."],
  [25, 'EST', '+', 'EST3', "Me recupero rápido después de un mal día de ventas."],
  [26, 'SOC', '-', 'SOC3', "Prefiero trabajar solo antes que en contacto con gente."],
  [27, 'AMA', '-', 'AMA7', "Me cuesta disculparme cuando me equivoco con alguien."],
  [28, 'RES', '+', 'RES4', "Reviso mi trabajo para evitar errores."],
  [29, 'AMA', '+', 'AMA4', "Trato con respeto a todos, aunque no estén de acuerdo conmigo."],
  [30, 'EMP', '-', 'EMP3', "Prefiero que otros tomen las decisiones importantes."],
  [31, 'RES', '+', 'RES6', "Cumplo lo que prometo a clientes y compañeros."],
  [32, 'EMP', '-', 'EMP7', "Evito tomar el mando cuando hay un problema en la tienda."],
  [33, 'EST', '-', 'EST8', "Me siento tenso con frecuencia en el trabajo."],
  [34, 'AMA', '-', 'AMA3', "Me impaciento con los clientes indecisos."],
  [35, 'AMA', '+', 'AMA1', "Me pongo en el lugar del cliente para entender lo que necesita."],
  [36, 'DS', 'DS', 'DS1', "Nunca me he equivocado con un cliente."],
  [37, 'APE', '+', 'APE1', "Me interesa conocer las nuevas colecciones y tendencias de moda."],
  [38, 'RES', '+', 'RES2', "Mantengo ordenada mi área de trabajo."],
  [39, 'EST', '+', 'EST1', "Mantengo la calma cuando un cliente está molesto."],
  [40, 'EMP', '+', 'EMP1', "Me pongo metas de venta más altas que las que me asignan."],
  [41, 'EST', '-', 'EST6', "Las críticas de mi jefe me afectan durante días."],
  [42, 'AMA', '-', 'AMA5', "Pienso que la mayoría de las personas busca aprovecharse de los demás."],
  [43, 'RES', '-', 'RES7', "A veces olvido tareas que me asignaron."],
  [44, 'AMA', '-', 'AMA8', "Si un cliente es grosero, le respondo en el mismo tono."],
  [45, 'SOC', '-', 'SOC7', "Después de mucho contacto con gente, termino agotado."],
  [46, 'AMA', '+', 'AMA2', "Ayudo a mis compañeros aunque no sea mi tarea."],
  [47, 'DS', 'DS', 'DS3', "Jamás he perdido la paciencia."],
  [48, 'EST', '-', 'EST2', "Me altero con facilidad cuando las cosas no salen como espero."],
  [49, 'EMP', '+', 'EMP2', "Me gusta tomar la iniciativa sin esperar instrucciones."],
  [50, 'SOC', '+', 'SOC6', "Me gusta participar en las actividades del equipo."],
  [51, 'APE', '+', 'APE8', "Propongo ideas para mejorar la tienda."],
  [52, 'EMP', '+', 'EMP4', "Me motiva competir por ser el mejor del equipo."],
  [53, 'EST', '-', 'EST4', "Me preocupo demasiado por los errores que cometo."],
  [54, 'APE', '-', 'APE3', "Prefiero hacer las cosas como siempre se han hecho."],
];

/* Cortes PROVISIONALES */
export const IPC_CORTES = { alto: 70, medio: 40 };
export const IPC_DS_CORTES = { alta: 4.5, moderada: 4 };
/* Índice de potencial comercial: pesos por escala (PROPUESTA; editable) */
export const IPC_PESOS_POTENCIAL = { EST: 20, EMP: 25, SOC: 20, AMA: 20, RES: 15, APE: 0 };

const valor = (r, n) => { const v = Number(r?.[n]); return v >= 1 && v <= 5 ? v : null; };
const nivel = (p) => (p >= IPC_CORTES.alto ? 'Alto' : p >= IPC_CORTES.medio ? 'Medio' : 'Bajo');

export function validarRespuestasIPC(respuestas) {
  const faltantes = IPC_ITEMS.filter((x) => valor(respuestas, x[0]) === null).map((x) => x[0]);
  return { valida: !faltantes.length, faltantes };
}

/* respuestas: { 1: 4, 2: 1, ... } */
export function corregirIPC(respuestas) {
  const escalas = Object.keys(IPC_ESCALAS).map((id) => {
    const fav = IPC_ITEMS.filter((x) => x[1] === id).map((x) => { const v = valor(respuestas, x[0]); return v === null ? null : x[2] === '+' ? v : 6 - v; }).filter((v) => v !== null);
    const media = fav.length ? fav.reduce((a, b) => a + b, 0) / fav.length : 1;
    const puntaje = Math.round(((media - 1) / 4) * 100);
    const nv = nivel(puntaje);
    return { id, ...IPC_ESCALAS[id], puntaje, nivel: nv, texto: IPC_TEXTOS[id][nv] };
  });
  const p = Object.fromEntries(escalas.map((e) => [e.id, e.puntaje]));
  const sumPesos = Object.values(IPC_PESOS_POTENCIAL).reduce((a, b) => a + b, 0);
  const potencial = Math.round(Object.entries(IPC_PESOS_POTENCIAL).reduce((a, [k, w]) => a + p[k] * w, 0) / sumPesos);

  const ds = (() => { const v = IPC_ITEMS.filter((x) => x[2] === 'DS').map((x) => valor(respuestas, x[0])).filter((y) => y !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; })();
  const atencionFallida = IPC_ITEMS.filter((x) => x[1] === 'ATN').filter((x) => valor(respuestas, x[0]) !== null && valor(respuestas, x[0]) !== Number(x[2])).length;

  const riesgos = IPC_RIESGOS.filter((r) => r.condicion(p)).map(({ id, titulo, texto }) => ({ id, titulo, texto }));
  const alertas = [];
  if (atencionFallida) alertas.push(`${atencionFallida === 1 ? 'Falló 1 afirmación' : `Falló ${atencionFallida} afirmaciones`} de atención: es posible que no haya leído con cuidado. ${atencionFallida >= 2 ? 'El resultado no es válido; repita la prueba con acompañamiento.' : 'Interprete con cautela.'}`);
  if (ds >= IPC_DS_CORTES.alta) alertas.push('Deseabilidad social alta: tiende a presentarse de forma idealizada. Los puntajes pueden estar sobrestimados; confirme con ejemplos concretos en la entrevista.');
  else if (ds >= IPC_DS_CORTES.moderada) alertas.push('Deseabilidad social moderada: interprete los puntajes altos con cautela.');
  const validez = atencionFallida >= 2 ? 'No válida' : atencionFallida === 1 || ds >= IPC_DS_CORTES.alta ? 'Dudosa' : 'Aceptable';

  const orden = [...escalas].sort((a, b) => b.puntaje - a.puntaje);
  return {
    escalas, potencial, nivelPotencial: nivel(potencial),
    fortalezas: orden.slice(0, 2).map((e) => e.nombre), aDesarrollar: orden.slice(-2).map((e) => e.nombre),
    riesgos, deseabilidadSocial: Math.round(ds * 100) / 100, atencionFallida, validez, alertas,
    validacion: validarRespuestasIPC(respuestas), completa: validarRespuestasIPC(respuestas).valida,
  };
}

export const IPC_TEXTOS = {
  EST: { Alto: 'Mantiene la calma ante clientes difíciles y periodos de alta exigencia. Se recupera rápido de los contratiempos.', Medio: 'Maneja la presión habitual del trabajo, aunque las situaciones muy tensas pueden afectarlo por momentos.', Bajo: 'Las presiones, críticas o errores lo afectan con facilidad. Necesita apoyo y retroalimentación cuidadosa en periodos de alta demanda.' },
  EMP: { Alto: 'Se fija metas exigentes, toma la iniciativa y busca asumir más responsabilidad. Persistente en el cierre de ventas.', Medio: 'Cumple sus metas y toma iniciativa cuando la situación lo pide, sin buscar protagonismo.', Bajo: 'Prefiere seguir instrucciones y evita liderar o competir. Puede necesitar metas claras y seguimiento para mantener el ritmo.' },
  SOC: { Alto: 'Disfruta el contacto con el público, inicia conversaciones con facilidad y se siente cómodo en tiendas con mucho movimiento.', Medio: 'Se relaciona bien con clientes y compañeros, y también necesita momentos de trabajo individual.', Bajo: 'Prefiere tareas con poco contacto con el público. El trato prolongado con clientes puede agotarlo.' },
  AMA: { Alto: 'Empático, cortés y cooperador. Se interesa por las necesidades del cliente y apoya a sus compañeros.', Medio: 'Trata bien a clientes y compañeros, aunque puede impacientarse en situaciones difíciles.', Bajo: 'Puede mostrarse impaciente, desconfiado o confrontativo, sobre todo con clientes difíciles.' },
  RES: { Alto: 'Organizado, cumplido y cuidadoso con los detalles y los procedimientos.', Medio: 'Cumple con sus tareas y procedimientos, con algunos descuidos ocasionales.', Bajo: 'Tiende a postergar tareas, olvidar compromisos o saltarse procedimientos. Requiere supervisión cercana.' },
  APE: { Alto: 'Curioso, aprende rápido y propone ideas. Se adapta bien a cambios de colección, sistemas y procesos.', Medio: 'Se adapta a los cambios cuando se le explican, y aprende lo necesario para su cargo.', Bajo: 'Prefiere la rutina conocida y le cuestan los cambios de procedimiento o los aprendizajes nuevos.' },
};

/* Riesgos bajo presión: combinaciones que pueden afectar el desempeño (no son diagnósticos) */
export const IPC_RIESGOS = [
  { id: 'reactividad', titulo: 'Reactividad bajo presión', texto: 'En temporada alta o ante clientes difíciles puede perder la calma o desanimarse.', condicion: (p) => p.EST < 40 },
  { id: 'imposicion', titulo: 'Tendencia a imponerse', texto: 'Su empuje, con poca amabilidad, puede generar roces con el equipo o con clientes.', condicion: (p) => p.EMP >= 85 && p.AMA < 50 },
  { id: 'rigidez', titulo: 'Rigidez o perfeccionismo', texto: 'Su alto apego al orden puede volverlo inflexible o lento ante imprevistos.', condicion: (p) => p.RES >= 90 && p.APE < 50 },
  { id: 'incumplimiento', titulo: 'Riesgo de incumplimiento', texto: 'Puede descuidar procedimientos, controles o compromisos.', condicion: (p) => p.RES < 40 },
  { id: 'dispersion', titulo: 'Dispersión', texto: 'Su gusto por el contacto social puede distraerlo de tareas operativas y de seguimiento.', condicion: (p) => p.SOC >= 85 && p.RES < 50 },
  { id: 'complacencia', titulo: 'Complacencia', texto: 'Puede ceder ante clientes o compañeros para evitar conflictos y le cuesta poner límites.', condicion: (p) => p.AMA >= 90 && p.EMP < 40 },
  { id: 'resistencia', titulo: 'Resistencia al cambio', texto: 'Puede tener dificultad con cambios de colección, sistemas o procedimientos.', condicion: (p) => p.APE < 30 },
];

/* Perfil deseado por cargo (PROPUESTA; editable). Nivel mínimo por escala: 'alto' (≥ 70), 'medio' (≥ 40) o null (indiferente). */
export const IPC_PERFIL_CARGO_INICIAL = {
  ASE: { EST: 'medio', EMP: 'medio', SOC: 'alto', AMA: 'alto', RES: 'medio', APE: null },
  CAJ: { EST: 'alto', EMP: null, SOC: 'medio', AMA: 'medio', RES: 'alto', APE: null },
  CAJT: { EST: 'alto', EMP: 'medio', SOC: 'medio', AMA: 'medio', RES: 'alto', APE: null },
  ALM: { EST: 'medio', EMP: null, SOC: null, AMA: 'medio', RES: 'alto', APE: null },
  JALM: { EST: 'medio', EMP: 'medio', SOC: null, AMA: 'medio', RES: 'alto', APE: 'medio' },
  VM: { EST: 'medio', EMP: 'medio', SOC: 'medio', AMA: null, RES: 'medio', APE: 'alto' },
  SUB: { EST: 'alto', EMP: 'alto', SOC: 'medio', AMA: 'medio', RES: 'alto', APE: 'medio' },
  GT: { EST: 'alto', EMP: 'alto', SOC: 'medio', AMA: 'medio', RES: 'medio', APE: 'medio' },
};
/* Coincidencia: 100 si alcanza el mínimo, 50 si queda a 10 puntos o menos, 0 si no. Se resta 10 por cada riesgo detectado (mínimo 0). */
export function matchIPC(resultado, perfilCargo) {
  const defs = Object.keys(IPC_ESCALAS).filter((k) => perfilCargo && perfilCargo[k]);
  if (!defs.length) return null;
  const detalle = defs.map((k) => {
    const pts = resultado.escalas.find((e) => e.id === k).puntaje;
    const min = perfilCargo[k] === 'alto' ? IPC_CORTES.alto : IPC_CORTES.medio;
    const puntos = pts >= min ? 100 : pts >= min - 10 ? 50 : 0;
    return { escala: k, esperado: perfilCargo[k], obtenido: pts, puntos };
  });
  const base = detalle.reduce((a, x) => a + x.puntos, 0) / detalle.length;
  const pct = Math.max(0, Math.round(base - 10 * resultado.riesgos.length));
  return { porcentaje: pct, nivel: pct >= 80 ? 'Alto' : pct >= 65 ? 'Medio' : 'Bajo', detalle, descuentoRiesgos: 10 * resultado.riesgos.length };
}
