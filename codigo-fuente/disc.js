/* =====================================================================================
   DISC: cuadernillo, clave de corrección, perfiles e interpretación.
   Cuadernillo propio del Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta),
   basado en el modelo DISC de William M. Marston (1928): Dominancia, Influencia, Estabilidad
   y Cumplimiento. No reproduce instrumentos comerciales (Everything DiSC, PPA, etc.).

   Formato: 28 grupos de 4 palabras. En cada grupo la persona marca la palabra que MÁS la
   describe y la que MENOS la describe (dos palabras distintas). Cada palabra pertenece a un
   factor; cada grupo tiene una palabra de cada factor.

   Los cortes de intensidad son PROVISIONALES: se recomienda recalcularlos con los resultados
   de la propia población (baremo local) cuando haya al menos 100 aplicaciones.
   ===================================================================================== */

export const DISC_TOTAL_GRUPOS = 28;
export const DISC_FACTORES = ['D', 'I', 'S', 'C'];
export const DISC_NOMBRES = { D: 'Dominancia', I: 'Influencia', S: 'Estabilidad', C: 'Cumplimiento' };

/* Cuadernillo y clave: [palabra, factor] en el orden en que se muestran */
export const DISC_GRUPOS = [
  [["Ordenado", "C"], ["Pacífico", "S"], ["Directo", "D"], ["Animado", "I"]],
  [["Sistemático", "C"], ["Persuasivo", "I"], ["Servicial", "S"], ["Franco", "D"]],
  [["Planificado", "C"], ["Leal", "S"], ["Alegre", "I"], ["Valiente", "D"]],
  [["Metódico", "C"], ["Buen oyente", "S"], ["Popular", "I"], ["Ejecutivo", "D"]],
  [["Retador", "D"], ["Paciente", "S"], ["Juguetón", "I"], ["Prudente", "C"]],
  [["Constante", "S"], ["Cuidadoso", "C"], ["Influyente", "I"], ["Pionero", "D"]],
  [["Extrovertido", "I"], ["Cauteloso", "C"], ["Tranquilo", "S"], ["Emprendedor", "D"]],
  [["Tolerante", "S"], ["Vigoroso", "D"], ["Correcto", "C"], ["Motivador", "I"]],
  [["Vivaz", "I"], ["Sereno", "S"], ["Formal", "C"], ["Dominante", "D"]],
  [["Concienzudo", "C"], ["Insistente", "D"], ["Moderado", "S"], ["Comunicativo", "I"]],
  [["Conciliador", "S"], ["Diplomático", "C"], ["Abierto", "I"], ["Contundente", "D"]],
  [["Considerado", "S"], ["Carismático", "I"], ["Arriesgado", "D"], ["Detallista", "C"]],
  [["Encantador", "I"], ["Determinado", "D"], ["Complaciente", "S"], ["Puntual", "C"]],
  [["Hablador", "I"], ["Preciso", "C"], ["Orientado a resultados", "D"], ["Comprensivo", "S"]],
  [["Firme", "D"], ["Minucioso", "C"], ["Convincente", "I"], ["Sencillo", "S"]],
  [["Escéptico", "C"], ["Ambicioso", "D"], ["Apacible", "S"], ["Conversador", "I"]],
  [["Elocuente", "I"], ["Rápido para decidir", "D"], ["Analítico", "C"], ["Cooperador", "S"]],
  [["Desafiante", "D"], ["Organizado", "C"], ["Predecible", "S"], ["Impulsivo", "I"]],
  [["Perseverante", "S"], ["Divertido", "I"], ["Competitivo", "D"], ["Disciplinado", "C"]],
  [["Enérgico", "D"], ["Lógico", "C"], ["Amable", "S"], ["Entusiasta", "I"]],
  [["Reflexivo", "C"], ["Tenaz", "D"], ["Generoso", "S"], ["Espontáneo", "I"]],
  [["Riguroso", "C"], ["Confiado en los demás", "I"], ["Colaborador", "S"], ["Decidido", "D"]],
  [["Resuelto", "D"], ["Accesible", "S"], ["Expresivo", "I"], ["Reservado", "C"]],
  [["Inspirador", "I"], ["Equilibrado", "S"], ["Perfeccionista", "C"], ["Exigente", "D"]],
  [["Optimista", "I"], ["Calmado", "S"], ["Crítico", "C"], ["Impaciente", "D"]],
  [["Simpático", "I"], ["Seguro de sí mismo", "D"], ["Investigador", "C"], ["Confiable", "S"]],
  [["Independiente", "D"], ["Creativo", "I"], ["Exacto", "C"], ["Estable", "S"]],
  [["Sociable", "I"], ["Audaz", "D"], ["Objetivo", "C"], ["Bondadoso", "S"]],
];

export const DISC_INSTRUCCIONES = 'En cada grupo de cuatro palabras, marque la que MÁS lo describe en el trabajo y la que MENOS lo describe. Debe elegir dos palabras distintas en cada grupo. No hay respuestas buenas ni malas: responda según cómo es usted normalmente, no según cómo cree que debería ser. Tiempo sugerido: 15 minutos.';

/* ---------- Cortes de intensidad (segmentos 1 a 7; 4 = línea media) — PROVISIONALES ---------- */
/* Gráfico I (MÁS) y Gráfico II (MENOS, invertido): conteos de 0 a 28; promedio esperado 7. */
export const DISC_CORTES_CONTEO = [[0, 1], [3, 2], [5, 3], [7, 4], [8, 5], [10, 6], [13, 7]]; // [mínimo, segmento]
/* Gráfico III (MÁS − MENOS): de −28 a +28; promedio esperado 0. */
export const DISC_CORTES_DIFERENCIA = [[-28, 1], [-8, 2], [-4, 3], [-1, 4], [2, 5], [5, 6], [9, 7]];
const segmento = (v, cortes) => { let s = 1; cortes.forEach(([min, seg]) => { if (v >= min) s = seg; }); return s; };
export const DISC_NIVEL_SEGMENTO = (s) => (s >= 6 ? 'Alto' : s === 5 ? 'Moderado alto' : s === 4 ? 'Medio' : s === 3 ? 'Moderado bajo' : 'Bajo');

/* ---------- Corrección ----------
   respuestas: { 1: { mas: 'Directo', menos: 'Pacífico' }, ... } (también acepta el índice 0-3 de la palabra) */
function factorDe(n, valor) {
  const g = DISC_GRUPOS[n - 1];
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor === 'number') return g[valor] ? g[valor][1] : null;
  const p = g.find(([w]) => w.toLowerCase() === String(valor).trim().toLowerCase());
  return p ? p[1] : null;
}

export function validarRespuestasDISC(respuestas) {
  const faltantes = []; const repetidas = [];
  for (let n = 1; n <= DISC_TOTAL_GRUPOS; n += 1) {
    const r = respuestas?.[n] || {};
    const fm = factorDe(n, r.mas); const fl = factorDe(n, r.menos);
    if (!fm || !fl) faltantes.push(n);
    else if (String(r.mas).toLowerCase() === String(r.menos).toLowerCase()) repetidas.push(n);
  }
  return { valida: !faltantes.length && !repetidas.length, faltantes, repetidas };
}

export function corregirDISC(respuestas) {
  const mas = { D: 0, I: 0, S: 0, C: 0 }; const menos = { D: 0, I: 0, S: 0, C: 0 };
  for (let n = 1; n <= DISC_TOTAL_GRUPOS; n += 1) {
    const r = respuestas?.[n] || {};
    const fm = factorDe(n, r.mas); const fl = factorDe(n, r.menos);
    if (fm && fl && String(r.mas).toLowerCase() !== String(r.menos).toLowerCase()) { mas[fm] += 1; menos[fl] += 1; }
  }
  const factores = DISC_FACTORES.map((f) => {
    const dif = mas[f] - menos[f];
    const g1 = segmento(mas[f], DISC_CORTES_CONTEO);
    const g2 = 8 - segmento(menos[f], DISC_CORTES_CONTEO); // invertido: muchas "menos" = intensidad baja
    const g3 = segmento(dif, DISC_CORTES_DIFERENCIA);
    return { factor: f, nombre: DISC_NOMBRES[f], mas: mas[f], menos: menos[f], diferencia: dif, grafico1: g1, grafico2: g2, grafico3: g3, nivel: DISC_NIVEL_SEGMENTO(g3) };
  });
  const perfil = codigoPerfil(factores, 'grafico3', 'diferencia');
  const perfilPublico = codigoPerfil(factores, 'grafico1', 'mas');
  const perfilNatural = codigoPerfil(factores, 'grafico2', null);
  const validacion = validarRespuestasDISC(respuestas);
  const alertas = [];
  if (factores.every((x) => x.grafico3 >= 3 && x.grafico3 <= 5)) alertas.push('Perfil plano: ningún factor se diferencia con claridad. Puede indicar respuestas al azar, una etapa de transición o poca claridad sobre el rol. Confirme en la entrevista antes de usar el resultado.');
  if (factores.filter((x) => x.grafico3 >= 6).length >= 3) alertas.push('Tres o más factores altos: perfil poco definido o respuestas orientadas a «quedar bien». Interprete con cautela.');
  if (perfilPublico.codigo && perfilNatural.codigo && perfilPublico.codigo[0] !== perfilNatural.codigo[0]) alertas.push(`Diferencia entre cómo se muestra (${perfilPublico.codigo}) y cómo responde bajo presión (${perfilNatural.codigo}): la persona puede estar adaptándose de forma importante a las exigencias de su entorno actual.`);
  return {
    factores, perfil: perfil.codigo, estilo: DISC_ESTILOS[perfil.codigo] || DISC_ESTILOS.PLANO,
    perfilPublico: perfilPublico.codigo, perfilNatural: perfilNatural.codigo,
    alertas, validacion, completa: validacion.valida,
  };
}

/* Código del perfil: factor más alto por encima de la línea media (segmento ≥ 5) y, si existe, el segundo */
function codigoPerfil(factores, campoSeg, campoDesempate) {
  const orden = [...factores].sort((a, b) => b[campoSeg] - a[campoSeg] || (campoDesempate ? b[campoDesempate] - a[campoDesempate] : a.menos - b.menos));
  const sobre = orden.filter((x) => x[campoSeg] >= 5);
  if (!sobre.length) return { codigo: 'PLANO' };
  return { codigo: sobre.slice(0, 2).map((x) => x.factor).join('') };
}

/* ---------- Interpretación por factor ---------- */
export const DISC_FACTOR_TEXTOS = {
  D: {
    alto: 'Orientado a resultados y a la acción. Decide rápido, asume retos y busca el control de la situación. Puede mostrarse impaciente o poco tolerante con la lentitud.',
    bajo: 'Prefiere el acuerdo antes que la confrontación. Evita imponer su criterio y busca consenso antes de decidir. Puede tardar en asumir riesgos o en tomar decisiones difíciles.',
  },
  I: {
    alto: 'Comunicativo, optimista y persuasivo. Crea relaciones con facilidad y motiva a otros. Puede descuidar los detalles y el seguimiento de las tareas.',
    bajo: 'Reservado y centrado en los hechos más que en las relaciones. Se comunica de forma breve y concreta. Puede parecer distante en el trato inicial.',
  },
  S: {
    alto: 'Paciente, constante y leal. Trabaja bien en equipo, escucha y aporta estabilidad. Le cuestan los cambios bruscos y decir que no.',
    bajo: 'Inquieto y flexible ante el cambio. Se adapta rápido a situaciones nuevas y le aburre la rutina. Puede mostrarse impaciente con tareas repetitivas.',
  },
  C: {
    alto: 'Preciso, analítico y cuidadoso con la calidad y las normas. Revisa los detalles y se basa en datos. Puede ser autocrítico y demorar decisiones por buscar exactitud.',
    bajo: 'Independiente de las normas y procedimientos detallados. Prioriza la visión general y la rapidez. Puede pasar por alto detalles o controles.',
  },
};

/* ---------- Interpretación por estilo (factor principal + secundario) ---------- */
const E = (nombre, descripcion, fortalezas, desarrollo, presion, comoDirigir, tienda) => ({ nombre, descripcion, fortalezas, desarrollo, presion, comoDirigir, tienda });
export const DISC_ESTILOS = {
  D: E('Ejecutor', 'Directo, competitivo y enfocado en metas. Busca resultados rápidos y le motivan los retos y la autonomía.', 'Toma de decisiones, iniciativa, manejo de crisis.', 'Escuchar más, delegar con paciencia y cuidar el trato con el equipo.', 'Se vuelve autoritario e impaciente.', 'Metas claras, autonomía y comunicación directa centrada en resultados.', 'Apoyo en metas de venta, cierres de temporada y situaciones que exigen decisión inmediata.'),
  I: E('Promotor', 'Sociable, entusiasta y persuasivo. Le motivan el reconocimiento y el contacto con la gente.', 'Atención al cliente, ventas, motivación del equipo.', 'Orden, seguimiento y cumplimiento de procedimientos.', 'Se desorganiza y habla de más; evita los temas difíciles.', 'Reconocimiento público, ambiente positivo y recordatorios concretos de tareas y plazos.', 'Piso de venta, recepción del cliente, eventos y activaciones de marca.'),
  S: E('Colaborador', 'Paciente, leal y constante. Prefiere un ambiente estable, rutinas claras y buenas relaciones.', 'Trabajo en equipo, servicio, constancia en tareas repetitivas.', 'Adaptarse a cambios, expresar desacuerdos y tomar iniciativa.', 'Se vuelve pasivo o terco; evita el conflicto.', 'Anticiparle los cambios, explicar el porqué y darle apoyo y seguridad.', 'Caja, almacén y tareas de servicio que requieren constancia.'),
  C: E('Analista', 'Preciso, ordenado y apegado a las normas. Le motivan la calidad, la información y hacer las cosas bien.', 'Control, exactitud, cumplimiento de procesos.', 'Agilidad para decidir, tolerancia al error y comunicación con el equipo.', 'Se vuelve crítico, rígido o se aísla.', 'Instrucciones claras, datos y tiempo para preparar su trabajo.', 'Caja, inventarios, control de mercancía y auditoría de procesos.'),
  DI: E('Impulsor', 'Combina el empuje por resultados con la capacidad de convencer. Moviliza a otros hacia metas exigentes.', 'Liderazgo comercial, negociación, arranque de proyectos.', 'Seguimiento de detalles y paciencia con los procesos.', 'Presiona en exceso y puede imponerse.', 'Retos visibles, libertad para actuar y metas medibles.', 'Gerencia de tienda en plazas de alta venta, aperturas y relanzamientos.'),
  DS: E('Perseverante', 'Orientado a resultados pero con constancia y sentido de equipo. Sostiene el esfuerzo en el tiempo.', 'Cumplimiento sostenido, firmeza con calma.', 'Flexibilidad ante cambios y expresión de emociones.', 'Puede volverse obstinado.', 'Objetivos claros a mediano plazo y respaldo del equipo.', 'Subgerencia y supervisión operativa.'),
  DC: E('Estratega', 'Exigente y orientado a la calidad del resultado. Decide con base en análisis y altos estándares.', 'Planificación, control de resultados, solución de problemas.', 'Calidez en el trato y tolerancia a la imperfección de otros.', 'Se vuelve frío y excesivamente crítico.', 'Retos complejos, información completa y autonomía.', 'Gestión de inventarios, indicadores de tienda y mejora de procesos.'),
  ID: E('Persuasor', 'Entusiasta y convincente, con iniciativa para alcanzar metas a través de las personas.', 'Venta, influencia, energía para el equipo.', 'Constancia y atención al detalle.', 'Promete más de lo que puede cumplir.', 'Reconocimiento, metas desafiantes y seguimiento cercano de compromisos.', 'Liderazgo de piso de venta y metas comerciales.'),
  IS: E('Consejero', 'Cálido, cercano y servicial. Construye relaciones de confianza duraderas con clientes y compañeros.', 'Servicio al cliente, fidelización, clima del equipo.', 'Firmeza, manejo de conflictos y orientación a metas.', 'Evita decir que no y cede para no generar conflicto.', 'Trato cordial, metas concretas y apoyo para conversaciones difíciles.', 'Asesoría de venta y servicio posventa (cambios y devoluciones).'),
  IC: E('Evaluador', 'Comunicativo pero cuidadoso con la forma y la calidad. Une creatividad con criterio.', 'Presentación, comunicación clara, visual y exhibición.', 'Rapidez para decidir y tolerancia a la presión.', 'Se preocupa en exceso por la imagen y la opinión de otros.', 'Espacio para proponer ideas y criterios de calidad claros.', 'Visual merchandising y capacitación de producto.'),
  SD: E('Especialista firme', 'Constante y confiable, con capacidad de asumir el control cuando hace falta.', 'Estabilidad del equipo, cumplimiento, firmeza serena.', 'Adaptación rápida y comunicación de ideas nuevas.', 'Se resiste a los cambios impuestos.', 'Roles claros, tiempo para adaptarse y responsabilidad concreta.', 'Jefatura de almacén y coordinación de turnos.'),
  SI: E('Facilitador', 'Amable, paciente y sociable. Crea un ambiente armonioso y apoya a los demás.', 'Integración de equipos, servicio, escucha.', 'Iniciativa, firmeza y orientación a resultados.', 'Se vuelve complaciente y evita confrontar.', 'Ambiente estable, reconocimiento y metas acompañadas.', 'Servicio al cliente, inducción de personal nuevo y caja.'),
  SC: E('Especialista', 'Metódico, constante y cuidadoso. Ejecuta con precisión las tareas que conoce bien.', 'Precisión, constancia, cumplimiento de procedimientos.', 'Flexibilidad, iniciativa y manejo de la presión.', 'Se bloquea ante cambios o presión de tiempo.', 'Procedimientos claros, capacitación paso a paso y estabilidad.', 'Caja, almacén y control de inventario.'),
  CD: E('Perfeccionista exigente', 'Analítico y con altos estándares, con firmeza para hacerlos cumplir.', 'Control de calidad, auditoría, resolución de problemas técnicos.', 'Empatía y comunicación con el equipo.', 'Se vuelve inflexible y crítico.', 'Objetivos de calidad, datos y autonomía.', 'Control de inventarios, auditoría de caja y cumplimiento de normas.'),
  CI: E('Analista comunicador', 'Cuidadoso con la calidad y capaz de explicar con claridad. Equilibra datos y relación.', 'Formación, presentación de información, orden con buen trato.', 'Decisión bajo presión y asumir riesgos.', 'Se vuelve indeciso por exceso de análisis.', 'Información completa, tiempo de preparación y reconocimiento por la calidad.', 'Formación de cajeros, visual y control administrativo de tienda.'),
  CS: E('Analista metódico', 'Ordenado, paciente y preciso. Prefiere procesos estables y bien definidos.', 'Exactitud, constancia, cumplimiento.', 'Rapidez, iniciativa y comunicación espontánea.', 'Se aísla y evita el conflicto.', 'Normas claras, estabilidad y tiempo para hacer bien su trabajo.', 'Caja, almacén e inventarios.'),
  PLANO: E('Perfil no diferenciado', 'Ningún factor se diferencia con claridad.', '—', '—', '—', 'Confirmar en entrevista y, si es necesario, repetir la prueba.', 'No usar el resultado para decidir hasta confirmarlo.'),
};

/* ---------- Perfil deseado por cargo (PROPUESTA; editable en Configuración) ----------
   Nivel esperado por factor en el Gráfico III: 'alto' (segmento ≥ 5), 'medio' (3 a 5), 'bajo' (≤ 4), o null (indiferente). */
export const DISC_PERFIL_CARGO_INICIAL = {
  ASE: { D: 'medio', I: 'alto', S: 'medio', C: null },
  CAJ: { D: null, I: 'medio', S: 'alto', C: 'alto' },
  CAJT: { D: 'medio', I: 'medio', S: 'alto', C: 'alto' },
  ALM: { D: null, I: null, S: 'alto', C: 'alto' },
  JALM: { D: 'medio', I: null, S: 'alto', C: 'alto' },
  VM: { D: null, I: 'alto', S: null, C: 'alto' },
  SUB: { D: 'alto', I: 'medio', S: 'medio', C: 'medio' },
  GT: { D: 'alto', I: 'alto', S: 'medio', C: 'medio' },
};
const cumple = (esperado, seg) => (esperado === 'alto' ? seg >= 5 : esperado === 'bajo' ? seg <= 4 : seg >= 3 && seg <= 5);
const cercano = (esperado, seg) => (esperado === 'alto' ? seg === 4 : esperado === 'bajo' ? seg === 5 : seg === 2 || seg === 6);
/* Coincidencia con el cargo: 100 si cumple, 50 si queda a un segmento, 0 si no; promedio de los factores definidos */
export function matchDISC(resultado, perfilCargo) {
  const defs = DISC_FACTORES.filter((f) => perfilCargo && perfilCargo[f]);
  if (!defs.length) return null;
  const detalle = defs.map((f) => {
    const seg = resultado.factores.find((x) => x.factor === f).grafico3;
    const pts = cumple(perfilCargo[f], seg) ? 100 : cercano(perfilCargo[f], seg) ? 50 : 0;
    return { factor: f, esperado: perfilCargo[f], segmento: seg, puntos: pts };
  });
  const pct = Math.round(detalle.reduce((a, x) => a + x.puntos, 0) / detalle.length);
  return { porcentaje: pct, nivel: pct >= 80 ? 'Alto' : pct >= 65 ? 'Medio' : 'Bajo', detalle };
}
