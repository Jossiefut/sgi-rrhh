/* Inventario Kostick (percepción y preferencias): clave de corrección, niveles y textos del informe.
   Fuente: archivo "kostick_Leonardo.xls" (hojas Respuestas e Informe) entregado por RRHH.
   - 90 preguntas con dos frases (a y b). Cada escala suma 9 frases: items = [[pregunta, opción]].
   - nivel[puntaje directo 0..9] = 1, 2 o 3, igual que la hoja. Para el puntaje 8 de la escala A la hoja no
     define nivel (celda vacía): se tomó 3, igual que 5 a 7. */
export const KOSTICK_TOTAL = 90;
export const KOSTICK_ESCALAS = [
  { id: "N", nombre: "Necesidad de finalizar una tarea", grupo: "Energía",
    items: [[2, "b"], [13, "b"], [24, "b"], [35, "b"], [46, "b"], [57, "b"], [68, "b"], [79, "b"], [90, "b"]],
    nivel: [1, 2, 2, 3, 3, 3, 2, 2, 1, 1],
    textos: { 3: "Es una persona responsable y perseverante y un buen colaborador. Cuando se le da una tarea, la finaliza, con un fuerte sentido del deber. Prefiere un trabajo a la vez y como jefe presenta dificultades para delegar.", 2: "Es una persona cumplidora en cuanto a las tareas que le son asignadas. No siente la necesidad de culminar por completo las labores iniciadas, hace estrictamente lo necesario.", 1: "No siente necesidad de finalizar las cosas personalmente, manejando simultáneamente varios trabajos y delegando fácilmente. Puede ser distraído y pasar de una tarea a otra. Como jefe, no tiene problemas para delegar; como subordinado, tiene problemas para finalizar lo que comienza. Muestra poco compromiso con las tareas." } },
  { id: "A", nombre: "Necesidad de realización", grupo: "Energía",
    items: [[2, "a"], [3, "b"], [14, "b"], [25, "b"], [36, "b"], [47, "b"], [58, "b"], [69, "b"], [80, "b"]],
    nivel: [1, 1, 2, 2, 2, 3, 3, 3, 3, 2],
    textos: { 3: "Es ambicioso, competitivo, auto iniciador e individualista. Se coloca altos estándares para si mismo y para otros, siendo irrealista en sus expectativas. Quiere ser el mejor siempre, tiene claros objetivos y dirección.", 2: "Persona que lleva a cabo su trabajo y se empeña en lograr objetivos de acuerdo con sus prioridades de forma selectiva", 1: "Es un buen compañero, quien atiende con facilidad las indicaciones de sus jefes. No se ve motivado por la competencia, cree que ser bueno y cumplir es suficiente. Es fácil de manejar y no presiona por su progreso. No se ve interesado por romper marcas." } },
  { id: "G", nombre: "Rol de trabajador incansable", grupo: "Energía",
    items: [[1, "a"], [11, "a"], [21, "a"], [31, "a"], [41, "a"], [51, "a"], [61, "a"], [71, "a"], [81, "a"]],
    nivel: [1, 1, 2, 2, 3, 3, 3, 2, 1, 1],
    textos: { 3: "Se identifica con el trabajo duro, siendo este una prioridad frente a otros ámbitos de su vida. Se siente orgulloso de trabajar fuertemente, se molesta cuando piensa que sus colaboradores o compañeros de trabajo no trabajan a su ritmo y se involucra más en los proceso que en los resultados.", 2: "Persona que trabaja de acuerdo a las necesidades de la organización, sin traspasar los límites de tiempo y espacio.", 1: "No se ve así mismo como un trabajador incansable. Sin embrago, se ve motivado por buscar métodos y sistemas que le ahorren tiempo. Es peligroso que se vuelva perezoso por su temperamento relajado y tranquilo." } },
  { id: "L", nombre: "Rol de líder", grupo: "Liderazgo",
    items: [[12, "a"], [22, "a"], [32, "a"], [42, "a"], [52, "a"], [62, "a"], [72, "a"], [82, "a"], [81, "b"]],
    nivel: [1, 1, 1, 1, 2, 2, 3, 3, 3, 1],
    textos: { 3: "Se siente muy bien en su rol de líder, manifestando seguridad en sí mismo llevándola a no preocuparse por competir con otros. Puede mostrarse engreído y arrogante, las personas lo escuchan cuando habla. Puede ser percibido como creído, autosuficiente y presuntuoso.", 2: "Persona en capacidad de dirigir y organizar un grupo determinado aunque no figure como el líder del mismo. Es abierto frente a la perspectiva y opiniones de otros.", 1: "No se ve a si mismo como líder. Tiene sentimientos de inferioridad en relación a su dominancia con el grupo. No es competitivo, es bueno para cargos en donde no existan expectativas de líder, sino que se manejen estructuras horizontales, puede ser retraído y tender al aislamiento." } },
  { id: "P", nombre: "Necesidad de controlar a otros", grupo: "Liderazgo",
    items: [[13, "a"], [3, "a"], [4, "b"], [15, "b"], [26, "b"], [37, "b"], [48, "b"], [59, "b"], [70, "b"]],
    nivel: [1, 1, 1, 2, 2, 2, 3, 3, 3, 3],
    textos: { 3: "Tiene motivaciones de líder; disfruta de la responsabilidad y del poder, tomando decisiones por otros. Es responsable y le gusta decirle a otros lo que hay que hacer. Se siente muy bien de mostrar a las personas como hacer las cosas, cree que las personas son mejores cuando son ayudadas.", 2: "Persona que supervisa a su grupo de trabajo, verificando las situaciones que ocurren al interior del mismo, sin generar presión frente a otros.", 1: "No se ve motivado por alcanzar posiciones de liderazgo y no busca la responsabilidad del grupo y del poder dentro del mismo. Es permisivo. No se siente muy bien direccionando a otros, sin embargo, dentro de un equipo logra trabajar adecuadamente. Es sumiso y no sabotea los esfuerzos del líder. Tiene pocas necesidades de poder." } },
  { id: "I", nombre: "Facilidad para tomar decisiones", grupo: "Liderazgo",
    items: [[23, "a"], [33, "a"], [43, "a"], [53, "a"], [63, "a"], [73, "a"], [83, "a"], [82, "b"], [71, "b"]],
    nivel: [1, 1, 2, 2, 2, 3, 3, 3, 2, 2],
    textos: { 3: "Toma decisiones fácil y rápidamente, desde la intuición más que desde la información teórica. Su temperamento es decidido, rápido de pensamiento, con tendencia a la impulsividad, lo que hace que se impaciente rápidamente.", 2: "Frente a la toma de decisiones se trata de una persona evaluativa, que mide de forma cautelosa las diversas alternativas antes de riesgos, tiende a aplazar decisiones por su falta de decisión.", 1: "Tiene dificultades para tomar decisiones. No le gusta tomar riesgos. Es serio y cauteloso de pensamiento. Necesita de mucha información antes de tomar una decisión. Pondera demasiado las alternativas." } },
  { id: "T", nombre: "Dinamismo", grupo: "Dinamismo",
    items: [[34, "a"], [44, "a"], [54, "a"], [64, "a"], [74, "a"], [84, "a"], [83, "b"], [72, "b"], [61, "b"]],
    nivel: [1, 1, 2, 2, 2, 3, 3, 3, 2, 2],
    textos: { 3: "Le gusta realizar las actividades a un paso rápido, cumple con las tareas asignadas. Se hace notar en la oficina, tiende a ser apresurado lo que lo puede llevar a no realizar su trabajo eficientemente.", 2: "Realiza sus actividades bajo un ritmo normal, aunque no es sedentario tampoco se esfuerza en realizar las tareas en lapsos cortos de tiempo, las distribuye de forma tal que las lleva a cabo son alterarse.", 1: "Su aproximación a la vida es muy tranquila y relajada. Rara vez es apresurado o afanado para realizar las cosas. Habla despacio. Puede tener poco interés por el tiempo y realiza sus actividades a de forma pasiva y puede obtener resultados deficientes en cuanto a producción." } },
  { id: "V", nombre: "Energía física", grupo: "Dinamismo",
    items: [[45, "a"], [55, "a"], [65, "a"], [75, "a"], [85, "a"], [84, "b"], [73, "b"], [62, "b"], [51, "b"]],
    nivel: [1, 2, 2, 3, 3, 3, 3, 2, 2, 1],
    textos: { 3: "Le gusta las actividades que requieran de ejercicio físico. Tiene dificultades de permanecer sentado en horas laborales. Le gusta el deporte, no se cansa fácilmente, tiene mucho vigor y resistencia.", 2: "Presenta capacidad para desarrollar actividades que implican labores físicas, sin embargo no las realiza constantemente.", 1: "Tiende a permanecer sentado y quieto, con baja actividad física. Sirve para trabajos sedentarios y ambientes tranquilos. Su capacidad para estar en un mismo sitio es alta." } },
  { id: "O", nombre: "Necesidad de cercanía y afecto", grupo: "Sociabilidad",
    items: [[46, "a"], [36, "a"], [26, "a"], [16, "a"], [6, "a"], [7, "b"], [18, "b"], [29, "b"], [40, "b"]],
    nivel: [2, 3, 3, 3, 3, 2, 2, 1, 1, 1],
    textos: { 3: "Se le facilita crear ambientes cálidos y relaciones sinceras. Le gusta ser apreciado y querido, buscando cercanía a otras personas. Le molesta cuando las personas no le prestan atención, siendo susceptible y fácil de herir.", 2: "Se relaciona adecuadamente con las personas que lo rodean, sin ser muy cercano pero al mismo tiempo sin generar barreras que impidan el buen desarrollo de las actividades que implican otras personas.", 1: "Evita situaciones de intimidad con otras personas. Puede ser objetivo e imparcial, tiende a ser distante en sus relaciones sociales." } },
  { id: "B", nombre: "Necesidad de pertenecer a grupos", grupo: "Sociabilidad",
    items: [[35, "a"], [25, "a"], [15, "a"], [5, "a"], [6, "b"], [17, "b"], [28, "b"], [39, "b"], [50, "b"]],
    nivel: [1, 2, 3, 3, 3, 3, 2, 2, 1, 1],
    textos: { 3: "Es altamente influenciado por el grupo y su opinión, perteneciendo a estos mediante actividades que se desarrollan con otras personas. Puede volverse dependiente del grupo.", 2: "Participa en diversas actividades que implican dinámica de grupo, sin generar cohesión al interior del mismo, en lo que al aspecto emocional se refiere.", 1: "Es solitario. No se deja influenciar por la presión del grupo. Puede ser insensible y despegado. Le gusta estar solo." } },
  { id: "S", nombre: "Sociabilidad", grupo: "Sociabilidad",
    items: [[56, "a"], [66, "a"], [76, "a"], [86, "a"], [85, "b"], [74, "b"], [63, "b"], [52, "b"], [41, "b"]],
    nivel: [1, 1, 1, 2, 2, 3, 3, 3, 2, 2],
    textos: { 3: "Hace amigos fácilmente y crea una buena atmósfera. Le gusta las actividades sociales que le proveen de lazos de amistad y en donde tenga que comunicarse frecuentemente. Tiene una actitud positiva hacia las personas y encuentra el tiempo para compartir con todos.", 2: "Posee la capacidad de establecer relaciones sociales de acuerdo al ambiente en que se encuentra sin crear vínculos que le generen dependencia.", 1: "Se siente poco cómodo en situaciones que requieren un alto contacto social. Es serio y en ocasiones difícil de manejar. No hace amigos fácilmente, es solitario, se siente incomodo en un ambiente social." } },
  { id: "X", nombre: "Necesidad de ser percibido", grupo: "Sociabilidad",
    items: [[24, "a"], [14, "a"], [4, "a"], [5, "b"], [16, "b"], [27, "b"], [38, "b"], [49, "b"], [60, "b"]],
    nivel: [1, 2, 2, 3, 3, 2, 2, 2, 1, 1],
    textos: { 3: "Le gusta ser el centro de atención. Hace las cosas con estilo para mostrarse y venderse frente a otros. Para ésta persona es muy importante ser percibido y reconocido. Quiere sobresalir en el grupo.", 2: "Aunque no pasa desapercibido en el grupo al que pertenece, no realiza mayores esfuerzos por sobresalir en el mismo.", 1: "Es reservado y modesto. No se muestra en su trabajo sino que logra resultados para cumplir. Puede ser tímido y con tendencia al aislamiento. Se le dificulta dar a conocer sus ideas." } },
  { id: "D", nombre: "Enfoque organizado", grupo: "Enfoque hacia el trabajo",
    items: [[78, "a"], [88, "a"], [87, "b"], [76, "b"], [65, "b"], [54, "b"], [43, "b"], [32, "b"], [21, "b"]],
    nivel: [3, 2, 2, 2, 2, 2, 1, 1, 1, 1],
    textos: { 3: "Es ordenado y pulcro al realizar tareas de tipo laboral. Puede ser un poco obstaculizador y rígido, se molesta si las personas son desordenadas a su alrededor. Trabaja planeando y no por inspiración.", 2: "Persona que lleva a cabo las labores manteniendo cierta pulcritud y esmero sin demostrar obsesión por el orden.", 1: "No se ve interesado por el orden y la organización. Fácilmente tolera la confusión, demostrando flexibilidad de pensamiento. Realiza su trabajo de una forma asistemática." } },
  { id: "C", nombre: "Interés por los detalles", grupo: "Enfoque hacia el trabajo",
    items: [[89, "a"], [88, "b"], [77, "b"], [66, "b"], [55, "b"], [44, "b"], [33, "b"], [22, "b"], [11, "b"]],
    nivel: [1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
    textos: { 3: "Encuentra muy placentero y gratificante trabajar con detalles, interesándose por la exactitud de los mismos. Siente que todos los detalles son importantes, lo que implica dificultades para quedarse en la superficie de las cosas. Puede perderse en los aspectos minuciosos sin ir a la esencia de su trabajo.", 2: "Conoce los aspectos relevantes de su trabajo sin descuidar los detalles pero sin concentrarse en estos como la base de sus acciones, pues estos le generan desgaste innecesario.", 1: "No disfruta de los detalles. Busca delegar los detalles cuando puede. Discrimina los aspectos esenciales dentro de una realidad determinada." } },
  { id: "R", nombre: "Enfoque teórico", grupo: "Enfoque hacia el trabajo",
    items: [[67, "a"], [77, "a"], [87, "a"], [86, "b"], [75, "b"], [64, "b"], [53, "b"], [42, "b"], [31, "b"]],
    nivel: [1, 2, 2, 2, 3, 3, 3, 3, 2, 1],
    textos: { 3: "Es reflexivo y se muestra interesado por la teoría. Disfruta de la planeación y con capacidad para establecer modelos teóricos. Se interesa en el porque de las cosas.", 2: "Es una persona que reconoce la importancia de la teoría sin dejar de lado los aspectos prácticos que se requieran en la labor a realizar. Es un mediador entre los dos aspectos mencionados.", 1: "Es más un ejecutor que un planeador. Le gusta tratar con cosas prácticas y concretas. No planea suficientemente, sino que actúa de acuerdo al momento." } },
  { id: "Z", nombre: "Necesidad de cambio", grupo: "Naturaleza emocional",
    items: [[57, "a"], [47, "a"], [37, "a"], [27, "a"], [17, "a"], [7, "a"], [8, "b"], [19, "b"], [30, "b"]],
    nivel: [1, 1, 1, 2, 2, 3, 3, 3, 3, 2],
    textos: { 3: "Es experimental y flexible. Se adapta fácilmente al cambio. Constantemente rompe con las rutinas establecidas. Acepta nuevas ideas de una forma entusiasta. Le gusta tratar y manejar nuevas cosas. No permanece en una situación el tiempo suficiente sino que cambia de foco hasta el punto de abandono de tareas asignadas.", 2: "Es una persona que se adapta al entorno adecuadamente, es decir, puede trabajar en un entorno cambiante o en un entorno rutinario sin que esto afecte su rendimiento.", 1: "Prefiere no cambiar. Puede adaptarse a situaciones novedosas sin aburrirse. Es complaciente, inactivo, rutinario. Prefiere desarrollar actividades que conoce en vez de nuevos retos, dificultándosele adaptarse a situaciones novedosas." } },
  { id: "E", nombre: "Control emocional", grupo: "Naturaleza emocional",
    items: [[89, "b"], [78, "b"], [67, "b"], [56, "b"], [45, "b"], [34, "b"], [23, "b"], [12, "b"], [1, "b"]],
    nivel: [1, 2, 2, 3, 3, 3, 3, 2, 1, 1],
    textos: { 3: "Es consecuente, calmado, controlado ante situaciones estresantes. No es variable en su temperamento, ni cambia de humor fácilmente, lo que hace que genere un distanciamiento con personas que se descontrolan emocionalmente. En ocasiones es tan controlando que puede percibirse como pasivo o no respondiente.", 2: "Asume las situaciones desde una perspectiva parcial, en ocasiones se siente comprometido emocionalmente pero sin afectar su rendimiento laboral.", 1: "Es dramático en la expresión de sus emociones y cambia de humor fácilmente. Se compromete emocionalmente con el trabajo, lo que implica un desgaste de mucha energía cuando trabaja." } },
  { id: "K", nombre: "Necesidad de ser defensivamente agresivo", grupo: "Relación con la autoridad",
    items: [[68, "a"], [58, "a"], [48, "a"], [38, "a"], [28, "a"], [18, "a"], [8, "a"], [9, "b"], [20, "b"]],
    nivel: [1, 1, 1, 2, 3, 3, 3, 2, 1, 1],
    textos: { 3: "Tiende a tomar las cosas personalmente. Defiende hasta el final su punto de vista. Frecuentemente se siente mal tratado y es muy sensible afrente a los juicios que otros puedan emitir.", 2: "Aunque no es una persona que entable discusiones con facilidad, si es necesario defiende sus opiniones frente a otros, dando espacio para reconocer el punto de vista de los demás.", 1: "Es reservado y prefiere evitar el conflicto. Ve las cosas desde una posición aislada y objetiva tratando de no herir a la gente. Rara vez discute." } },
  { id: "F", nombre: "Necesidad de defenderse de la autoridad", grupo: "Relación con la autoridad",
    items: [[79, "a"], [69, "a"], [59, "a"], [49, "a"], [39, "a"], [29, "a"], [19, "a"], [9, "a"], [10, "b"]],
    nivel: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
    textos: { 3: "Se muestra impaciente por agradar a la autoridad, comportándose de tal forma que no crea ofensas ni agravios. Muestra respeto por la autoridad y trabaja mejor cuando cuenta con el aprecio del jefe. Puede ser en exceso adulador y siempre decir “si” a todo.", 2: "Persona que maneja ciertos límites frente a la normativa establecida por sus superiores, aunque las cumple no se esfuerza demasiado en depender siempre de la aprobación de los mismos.", 1: "Es una persona que reta a la autoridad, con el fin de obtener una satisfacción personal. No necesita a un jefe que lo este empujando para que realice su trabajo, se motiva por su trabajo y no por el concepto que emitan sus jefes." } },
  { id: "W", nombre: "Necesidad de reglas y supervisión", grupo: "Relación con la autoridad",
    items: [[90, "a"], [80, "a"], [70, "a"], [60, "a"], [50, "a"], [40, "a"], [30, "a"], [20, "a"], [10, "a"]],
    nivel: [3, 3, 2, 2, 2, 2, 1, 1, 1, 1],
    textos: { 3: "Le gustan los ambientes estructurados, sigue las reglas y normas establecidas por la compañía con el fin de cumplirlas a cabalidad. Puede volverse un esclavo de las reglas. Le gustan las mismas ya que su adaptación depende de tener direccionamientos claros.", 2: "Atiende a las normas y reglas establecidas dentro de su trabajo con el fin de cumplirlas y ponerlas en práctica, aunque en ocasiones tiende a crear parámetros propios al momento de tomar decisiones.", 1: "Tiene una alta tolerancia a la ambigüedad. Presenta dificultades en cumplir las reglas establecidas, dirigiéndose más a los objetivos que a las tareas y tomado decisiones según su agrado." } },
];

/* Perfil deseado por cargo: nivel esperado (1, 2 o 3 según los textos del informe) y peso (2 = escala crítica).
   Es una propuesta inicial para Gerente de Tienda y Subgerente; RRHH puede ajustarla en Configuración. */
export const KOSTICK_PERFILES_INICIALES = {
  GT: { N: [3, 1], A: [3, 2], G: [2, 1], L: [3, 2], P: [3, 2], I: [3, 2], T: [3, 1], V: [2, 1], O: [2, 1], B: [2, 1], S: [3, 1], X: [2, 1], D: [2, 1], C: [2, 1], R: [2, 1], Z: [3, 1], E: [3, 2], K: [2, 1], F: [2, 1], W: [2, 1] },
  SUB: { N: [3, 2], A: [3, 1], G: [3, 1], L: [2, 1], P: [2, 2], I: [2, 1], T: [2, 1], V: [3, 1], O: [2, 1], B: [2, 1], S: [3, 2], X: [2, 1], D: [3, 2], C: [3, 1], R: [2, 1], Z: [2, 1], E: [3, 2], K: [2, 1], F: [2, 1], W: [2, 1] },
};
export const KOSTICK_NIVELES = { 3: 'Marcado', 2: 'Intermedio', 1: 'Bajo' };

/* Rangos de match: 80 % o más recomendable; de 65 % a 79 % con observaciones; menos de 65 % no recomendable */
export function veredictoMatch(pct) {
  if (pct >= 80) return { id: 'ALTO', texto: 'Alto: perfil coherente con el cargo', tono: 'exito' };
  if (pct >= 65) return { id: 'MEDIO', texto: 'Medio: coherente con observaciones', tono: 'alerta' };
  return { id: 'BAJO', texto: 'Bajo: perfil poco coherente con el cargo', tono: 'peligro' };
}

/* respuestas: { 1: 'a', 2: 'b', ... } → puntaje directo, nivel y texto por escala */
export function corregirKostick(respuestas) {
  const r = respuestas || {};
  const escalas = KOSTICK_ESCALAS.map((e) => {
    const pd = e.items.reduce((s, [q, op]) => s + (String(r[q] || '').toLowerCase() === op ? 1 : 0), 0);
    const nivel = e.nivel[pd];
    return { id: e.id, nombre: e.nombre, grupo: e.grupo, pd, nivel, nivelTexto: KOSTICK_NIVELES[nivel], texto: e.textos[nivel] };
  });
  const respondidas = Object.keys(r).filter((k) => r[k]).length;
  return { escalas, respondidas, completa: respondidas >= KOSTICK_TOTAL };
}

/* Match con el cargo: cada escala suma 1 si el nivel coincide con el deseado, 0,5 si difiere en un nivel y 0 si difiere en dos.
   El resultado es el promedio ponderado por el peso de cada escala, de 0 a 100. perfil = { N: [nivel, peso], ... } */
export function matchKostick(resultado, perfil) {
  const filas = resultado.escalas.map((e) => {
    const [deseado, peso] = (perfil && perfil[e.id]) || [e.nivel, 1];
    const dif = Math.abs(e.nivel - deseado);
    const pts = dif === 0 ? 1 : dif === 1 ? 0.5 : 0;
    return { id: e.id, nombre: e.nombre, grupo: e.grupo, nivel: e.nivel, deseado, peso, pts, estado: dif === 0 ? 'Coincide' : dif === 1 ? 'Cercano' : 'Distante' };
  });
  const pesoTotal = filas.reduce((s, f) => s + f.peso, 0) || 1;
  const pct = Math.round((filas.reduce((s, f) => s + f.pts * f.peso, 0) / pesoTotal) * 100);
  return { pct, filas, coinciden: filas.filter((f) => f.pts === 1).length, cercanas: filas.filter((f) => f.pts === 0.5).length, distantes: filas.filter((f) => f.pts === 0).length, veredicto: veredictoMatch(pct) };
}
