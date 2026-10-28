/* Formato oficial «Evaluación de colaboradores para contratos a tiempo indeterminado» (evaluación práctica y de habilidades blandas).
   Se aplica solo al personal de tienda al terminar el segundo contrato (hito «Pase a fijo»). Escala: E, MB, B, D, MD. */
export const MODELO_FIJO_OFICIAL = 'FIJO_OFICIAL';
export const TITULO_FIJO_OFICIAL = 'Evaluación de colaboradores para contratos a tiempo indeterminado';
export const SUBTITULO_FIJO_OFICIAL = 'Evaluación práctica y de habilidades blandas';
export const SECCION_FIJO_1 = 'Módulo 1: Desempeño práctico y técnico';
export const SECCION_FIJO_2 = 'Módulo 2: Habilidades blandas y competencias conductuales';
export const PREGUNTA_FIJO_OFICIAL = '¿Recomienda al colaborador para realizarle el contrato a tiempo indeterminado?';
/* Cada sigla equivale a un valor de la escala 1 a 5 del sistema (E = 5 … MD = 1); así el puntaje en escala 10 se calcula igual que en las demás evaluaciones. */
export const ESCALA_FIJO = [
  { valor: 5, sigla: 'E', texto: 'Excelente' },
  { valor: 4, sigla: 'MB', texto: 'Muy Bueno' },
  { valor: 3, sigla: 'B', texto: 'Bueno' },
  { valor: 2, sigla: 'D', texto: 'Deficiente' },
  { valor: 1, sigla: 'MD', texto: 'Muy Deficiente' },
];
export const ITEMS_FIJO_OFICIAL = [
  { id: 'calidad', seccion: SECCION_FIJO_1, texto: 'Calidad de Trabajo', ayuda: 'Exactitud, pulcritud y claridad del trabajo realizado conforme a las exigencias y estándares. Minimiza errores y retrabajo.' },
  { id: 'volumen', seccion: SECCION_FIJO_1, texto: 'Volumen de Trabajo y Eficiencia', ayuda: 'Cumplimiento de tareas asignadas en los tiempos programados, optimizando los recursos disponibles y mejorando procesos.' },
  { id: 'horario', seccion: SECCION_FIJO_1, texto: 'Cumplimiento de Horario y Disciplina', ayuda: 'Asistencia, puntualidad y presencia en el puesto de trabajo asegurando la continuidad operativa.' },
  { id: 'equipo', seccion: SECCION_FIJO_2, texto: 'Trabajo en Equipo', ayuda: 'Participación activa en el logro de metas compartidas, colaborando de manera armónica y constructiva con otros.' },
  { id: 'comunicacion', seccion: SECCION_FIJO_2, texto: 'Comunicación', ayuda: 'Expresión clara, respetuosa y asertiva. Disposición al diálogo, escucha activa y receptividad a la retroalimentación.' },
  { id: 'iniciativa', seccion: SECCION_FIJO_2, texto: 'Iniciativa y Proactividad', ayuda: 'Capacidad para actuar de forma autónoma e independiente cuando las circunstancias lo ameriten para facilitar el trabajo.' },
  { id: 'problemas', seccion: SECCION_FIJO_2, texto: 'Resolución de Problemas', ayuda: 'Flexibilidad y enfoque práctico para afrontar imprevistos, cambios de prioridades y situaciones de trabajo bajo presión.' },
  { id: 'compromiso', seccion: SECCION_FIJO_2, texto: 'Compromiso', ayuda: 'Demuestra sentido de pertenencia, responsabilidad, ética y motivación en la ejecución de sus responsabilidades cotidianas.' },
  { id: 'imagen', seccion: SECCION_FIJO_2, texto: 'Imagen', ayuda: 'Demuestra capacidad de cuidar, gestionar y mantener una apariencia personal y conducta alineadas con los estándares y reputación de la marca (vestimenta, higiene y lenguaje corporal).' },
];
export const siglaFijo = (valor) => { const e = ESCALA_FIJO.find((x) => x.valor === Number(valor)); return e ? e.sigla : ''; };
