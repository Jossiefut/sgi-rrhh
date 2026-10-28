/* Amonestaciones por literal del artículo 79 de la LOTTT (Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras).
   Un modelo por cada literal: quien emite solo escribe los hechos y el sistema redacta el documento citando el literal que los describe.
   Los títulos de los literales siguen el texto público del artículo 79; validar con Asesoría Legal contra la Gaceta Oficial antes del uso oficial. */
export const ARTICULO_AMONESTACION = 'artículo 79';
export const NORMA_AMONESTACION = 'Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)';
export const AVISO_GRAVE = 'Este literal es de especial gravedad y puede configurar causa justificada de despido. Antes de emitir una amonestación, consulte con Recursos Humanos y con Asesoría Legal.';

export const LITERALES_79 = [
  { letra: 'a', titulo: 'Falta de probidad o conducta inmoral en el trabajo', grave: true,
    cuando: 'Actos deshonestos: apropiarse de dinero o mercancía, alterar registros o facturas, engañar a la empresa o a un cliente, conducta contraria a la moral en el centro de trabajo.',
    ejemplo: 'registró una venta con un precio menor al de etiqueta sin autorización para beneficiar a un tercero.',
    cierre: 'Se espera de todo trabajador un comportamiento honesto y apegado a la ética en el desempeño de sus funciones.' },
  { letra: 'b', titulo: 'Vías de hecho, salvo en legítima defensa', grave: true,
    cuando: 'Agresión física, empujones o golpes contra compañeros, clientes u otras personas dentro del centro de trabajo.',
    ejemplo: 'empujó a un compañero de trabajo durante una discusión en el área de ventas.',
    cierre: 'El respeto a la integridad física de compañeros, clientes y terceros es un deber esencial en el centro de trabajo.' },
  { letra: 'c', titulo: 'Injuria o falta grave al respeto y consideración debidos al patrono o a la patrona, a sus representantes o a los miembros de su familia que habiten con él o ella',
    cuando: 'Insultos, gritos o trato irrespetuoso hacia el Gerente, el Subgerente, un supervisor u otro representante de la empresa.',
    ejemplo: 'se dirigió a la Gerente de Tienda con gritos y palabras ofensivas frente al personal y a los clientes.',
    cierre: 'Se exige un trato respetuoso hacia el patrono, sus representantes y demás personas en el centro de trabajo.' },
  { letra: 'd', titulo: 'Hecho intencional o negligencia grave que afecte a la salud y la seguridad laboral',
    cuando: 'Actos o descuidos graves que pongan en riesgo la salud o la seguridad de las personas: bloquear salidas de emergencia, manipular equipos sin precaución, ignorar advertencias de riesgo.',
    ejemplo: 'dejó mercancía obstruyendo la salida de emergencia de la tienda a pesar de las instrucciones recibidas.',
    cierre: 'Se debe actuar con la diligencia necesaria para resguardar la salud y la seguridad de todas las personas en la tienda.' },
  { letra: 'e', titulo: 'Omisiones o imprudencias que afecten gravemente a la seguridad o higiene del trabajo',
    cuando: 'No usar o no seguir las medidas y procedimientos de prevención de accidentes y enfermedades indicados por la empresa.',
    ejemplo: 'no acató el procedimiento indicado para el uso de la escalera en el depósito, a pesar de habérsele instruido.',
    cierre: 'Es obligatorio cumplir las medidas de prevención y los procedimientos de seguridad e higiene establecidos.' },
  { letra: 'f', titulo: 'Inasistencia injustificada al trabajo durante tres días hábiles en el período de un mes',
    cuando: 'Ausencias sin justificar que sumen tres días hábiles dentro de un mes. Una falta aislada suele documentarse con el literal i.',
    ejemplo: 'faltó sin justificación a su jornada los días 5, 12 y 19 del mes y no presentó constancia alguna.',
    cierre: 'La asistencia al puesto de trabajo es indispensable para la continuidad de la operación; las ausencias deben justificarse oportunamente.' },
  { letra: 'g', titulo: 'Perjuicio material causado intencionalmente o con negligencia grave en las máquinas, herramientas, materias primas, productos elaborados y demás objetos relacionados inmediatamente con el trabajo',
    cuando: 'Daño o pérdida de mercancía, equipos, cajas registradoras u otros bienes de la empresa por descuido grave o a propósito.',
    ejemplo: 'dañó mercancía por manipularla sin el cuidado indicado y no reportó la novedad a su supervisor.',
    cierre: 'Los bienes, mercancía, equipos y herramientas de la empresa deben cuidarse y usarse de forma responsable.' },
  { letra: 'h', titulo: 'Revelación de secretos de manufactura, fabricación o procedimiento', grave: true,
    cuando: 'Divulgar información reservada de la empresa: procedimientos, estrategias, precios no publicados, datos internos.',
    ejemplo: 'compartió con personas ajenas a la empresa información reservada sobre precios y colecciones aún no lanzadas.',
    cierre: 'La información reservada de la empresa y sus procedimientos debe mantenerse en confidencialidad.' },
  { letra: 'i', titulo: 'Falta grave a las obligaciones que impone la relación de trabajo',
    cuando: 'Es el literal más usado en tienda: llegadas tarde, incumplir el horario o un acuerdo, uso del teléfono en el piso de ventas, tareas asignadas sin cumplir, descuido del visual, errores reiterados en caja, falta aislada sin justificar.',
    ejemplo: 'llegó 31 minutos tarde a su jornada sin justificación.',
    cierre: 'El cumplimiento de las obligaciones del cargo, del horario y de las normas internas es un deber de todo trabajador, y su incumplimiento afecta los objetivos de la organización.' },
  { letra: 'j', titulo: 'Abandono del trabajo', grave: true,
    cuando: 'Salir de la tienda durante la jornada sin permiso, negarse a hacer las tareas asignadas propias del cargo, o faltar quien tiene a cargo una tarea o equipo y afectar la operación.',
    ejemplo: 'se retiró de la tienda a las 6:00 p. m. sin autorización, antes de culminar su jornada.',
    cierre: 'Permanecer en el puesto durante la jornada y cumplir las tareas asignadas es una obligación de la relación de trabajo.' },
  { letra: 'k', titulo: 'Acoso laboral o acoso sexual', grave: true,
    cuando: 'Hostigamiento, maltrato reiterado o conductas de naturaleza sexual no deseadas hacia compañeros o subordinados.',
    ejemplo: 'dirigió comentarios de carácter sexual no deseados a una compañera de trabajo.',
    cierre: 'La empresa no tolera el acoso laboral ni sexual y garantiza un ambiente de trabajo respetuoso.' },
];

export function literal79(letra) {
  const l = String(letra || '').toLowerCase();
  return LITERALES_79.find((x) => x.letra === l) || null;
}
export function textoLiteral79(letra, corto = false) {
  const x = literal79(letra);
  if (!x) return '';
  return corto ? `Art. 79 lit. “${x.letra}”` : `Art. 79 lit. “${x.letra}” · ${x.titulo}`;
}
/* Redacción del documento: devuelve los párrafos en texto plano (el HTML lo arma la aplicación) */
export function redactarAmonestacion({ letra, fechaTexto, hechos, tipo }) {
  const x = literal79(letra);
  if (!x) return null;
  const h = String(hechos || '').trim().replace(/\s+/g, ' ');
  const hechosTxt = /[.!?]$/.test(h) ? h : `${h}.`;
  const verbal = String(tipo || '').toLowerCase().includes('verbal');
  return {
    titulo: verbal ? 'Constancia de amonestación verbal' : 'Amonestación',
    parrafos: [
      `Por medio de la presente nos dirigimos a usted con la finalidad de ${verbal ? 'dejar constancia de la amonestación verbal que se le hizo' : 'amonestarle formalmente'}, por los siguientes hechos ocurridos el ${fechaTexto}: ${hechosTxt}`,
      `Los hechos descritos encuadran en el ${ARTICULO_AMONESTACION}, literal “${x.letra}” (${x.titulo}), de la ${NORMA_AMONESTACION}. ${x.cierre}`,
      'Se le exhorta a rectificar su actuar y a que hechos de esta naturaleza no vuelvan a ocurrir. La reincidencia será evaluada conforme al reglamento interno de la empresa y a la normativa laboral vigente.',
    ],
    grave: Boolean(x.grave),
  };
}

/* Firmantes del documento (los configura el Administrador en Configuración › Firmantes de amonestaciones).
   EMISOR = quien emite el documento en el sistema (o una persona fija si se desmarca «usarEmisor»); FIJO = persona que se escribe en la configuración;
   TRABAJADOR = el trabajador amonestado (siempre firma). */
export const FIRMANTES_AMON_INICIAL = [
  { id: 'EMISOR', tipo: 'EMISOR', rol: 'QUIEN AMONESTA', nombre: '', cargo: '', usarEmisor: true, activo: true },
  { id: 'RRHH', tipo: 'FIJO', rol: 'GERENTE DE RECURSOS HUMANOS', nombre: '', cargo: '', activo: true },
  { id: 'TRABAJADOR', tipo: 'TRABAJADOR', rol: 'RECIBIDO POR EL TRABAJADOR', nombre: '', cargo: '', activo: true },
];
export const MAX_FIRMANTES_AMON = 5;
export function firmantesAmon(config) {
  const l = config && config.firmantesAmonestacion;
  return Array.isArray(l) && l.length ? l : FIRMANTES_AMON_INICIAL;
}
