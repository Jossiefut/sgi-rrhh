/* Documentación de ingreso del PERSONAL DE TIENDA (Balú y Planeta).
 * Textos de los formatos oficiales entregados por RRHH (hoja de vida, antecedente clínico, normas y reglamento de tienda,
 * notificación de riesgos, normativa SST-02, ruta habitual, trípticos de SST, acuse de recibo, carta de prestaciones y ficha RNET).
 * Cada documento se arma como HTML con los datos del trabajador y de la empresa de su marca; la firma, la huella y las fechas
 * de firma quedan en blanco para que el trabajador las estampe. El personal administrativo conserva su propio kit (docsadm.js).
 * La ruta habitual de traslado la arma la aplicación (rutaHabitualHTML), por eso aquí figura como documento externo. */
import { variablesDocsAdm } from './docsadm.js';

const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const DOCS_TIENDA = [
  { clave: 'hoja-de-vida', nombre: 'Hoja de vida', orden: 1 },
  { clave: 'antecedente-clinico', nombre: 'Antecedente clínico', orden: 2 },
  { clave: 'normas-reglamento-tienda', nombre: 'Normas y reglamento de tienda', orden: 3 },
  { clave: 'notificacion-de-riesgos', nombre: 'Notificación de riesgos', orden: 4 },
  { clave: 'normativa-trabajo-seguro', nombre: 'Normativa interna de trabajo seguro (SST-02)', orden: 5 },
  { clave: 'ruta-habitual', nombre: 'Ruta habitual de traslado', orden: 6, externo: true },
  { clave: 'triptico-fuego-terremoto', nombre: 'Tríptico: actuación en caso de fuego o terremoto', orden: 7 },
  { clave: 'triptico-primeros-auxilios', nombre: 'Tríptico: primeros auxilios básicos', orden: 8 },
  { clave: 'acuse-de-recibo', nombre: 'Acuse de recibo', orden: 9 },
  { clave: 'carta-de-prestaciones', nombre: 'Carta de prestaciones sociales', orden: 10 },
  { clave: 'ficha-trabajador', nombre: 'Ficha del trabajador (RNET)', orden: 11 },
];
export const CLAVES_TIENDA = DOCS_TIENDA.map((d) => d.clave);

/* Datos de la notificación de riesgos por empresa. Balú: según el documento oficial. Planeta: pendiente de confirmar por RRHH. */
export const REPRESENTANTE_NOTIFICACION = {
  BALU: {
    nombre: 'GENNIVIRG HERRERA', cedula: 'V-12.358.108', nacionalidad: 'Venezolana',
    registro: 'registro Mercantil Tercero de la Circunscripción Judicial del Distrito Capital y Estado Bolivariano de Miranda, en fecha 05 de Marzo de 2024, bajo el No. 23, Tomo 23-A',
  },
  PLANETA: { nombre: '', cedula: '', nacionalidad: '', registro: '' },
};
/* Beneficio de descuento de empleado que cita el reglamento (Dirección de Marca) */
export const DESCUENTO_EMPLEADO = { BALU: { porcentaje: 30, piezas: 5 }, PLANETA: { porcentaje: 30, piezas: 5 } };

/* Variables de los documentos de tienda. Reutiliza las de la documentación administrativa y agrega edad, tienda y fecha de nacimiento */
export function variablesDocsTienda({ nombres = '', apellidos = '', cedula = '', cargo = '', direccion = '', telefono = '', fecha = '', marca = 'BALU', entidad = null, tienda = '', fechaNacimiento = '', hoy = '', logo = '' }) {
  const base = variablesDocsAdm({ nombres, apellidos, cedula, cargo, direccion, telefono, fecha, marca, entidad });
  let edad = '';
  const nac = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaNacimiento || ''));
  const ref = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(hoy || fecha || ''));
  if (nac && ref) { edad = Number(ref[1]) - Number(nac[1]); if (Number(ref[2]) * 100 + Number(ref[3]) < Number(nac[2]) * 100 + Number(nac[3])) edad -= 1; if (edad < 0 || edad > 110) edad = ''; }
  return { ...base, TIENDA: String(tienda || ''), EDAD: edad === '' ? '' : String(edad), FECHA_NAC: nac ? `${nac[3]}/${nac[2]}/${nac[1]}` : '', LOGO: logo };
}

/* ---------- Piezas de maquetación ---------- */
const FUENTE = 'font-family:Arial,Helvetica,sans-serif;color:#111;';
const SALTO = '<div class="html2pdf__page-break"></div>';
const L = '1px solid #222';
const raya = (ancho = '40mm', texto = '') => `<span style="display:inline-block;min-width:${ancho};border-bottom:${L};padding:0 2px;line-height:1.3;">${texto ? esc(texto) : '&nbsp;'}</span>`;
const caja = (marcada = false) => `<span style="display:inline-block;width:3.2mm;height:3.2mm;border:${L};vertical-align:middle;margin:0 1.5mm;">${marcada ? '✓' : ''}</span>`;
const p = (t, e = '') => `<p style="margin:0 0 4px;${e}">${t}</p>`;
const envoltura = (clave, cuerpo) => `<div class="doc-tienda" data-tienda="${esc(clave)}" style="${FUENTE}font-size:9.5pt;line-height:1.3;width:100%;">${cuerpo}</div>`;

/* Membrete: logo de la marca y datos de la empresa */
function membrete(v, extra = '') {
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 8px;${FUENTE}"><tr>
    <td style="vertical-align:bottom;">${v.LOGO || `<b style="font-size:16pt;font-family:Georgia,serif;">${esc(v.MARCA === 'PLANETA' ? 'PLANETA' : 'BALÚ')}</b>`}
      <div style="font-size:7.5pt;font-weight:bold;margin-top:3px;">${esc(v.RAZON_SOCIAL)}<br/>RIF ${esc(v.RIF)}</div></td>
    <td style="vertical-align:bottom;text-align:right;font-size:8.5pt;">${extra}</td></tr></table>`;
}
/* Firma y huella dactilar del trabajador */
function bloqueFirma(v, { fecha = false, etiqueta = 'FIRMA DEL TRABAJADOR', ci = true, compacto = false } = {}) {
  return `<table style="width:100%;border-collapse:collapse;margin:${compacto ? 6 : 18}px 0 0;page-break-inside:avoid;${FUENTE}"><tr>
    <td style="vertical-align:bottom;font-size:9pt;">
      <div style="margin:26px 0 0;">${etiqueta}: ${raya('62mm')}</div>
      ${ci ? `<div style="margin:8px 0 0;">C.I.: ${raya('40mm', v.CEDULA)}</div>` : ''}
      ${fecha ? `<div style="margin:8px 0 0;">FECHA: ${raya('40mm')}</div>` : ''}
    </td>
    <td style="width:32mm;vertical-align:bottom;text-align:center;font-size:8pt;"><div style="width:26mm;height:${compacto ? 22 : 30}mm;border:${L};border-radius:3mm;margin:0 auto 2px;"></div>Huella dactilar</td></tr></table>`;
}

/* ---------- 1. Hoja de vida ---------- */
function celda(etiqueta, valor = '', { ancho = '', colspan = 1, alto = '' } = {}) {
  return `<td colspan="${colspan}" style="border:${L};padding:2px 4px;vertical-align:top;font-size:7.5pt;${ancho ? `width:${ancho};` : ''}${alto ? `height:${alto};` : ''}"><b>${etiqueta}</b> ${valor ? `<span style="font-size:9pt;">${esc(valor)}</span>` : ''}</td>`;
}
const banda = (t, cols = 6) => `<tr><td colspan="${cols}" style="background:#4a4a4a;color:#fff;text-align:center;letter-spacing:3px;font-size:8pt;font-weight:bold;padding:1px;border:${L};">${t}</td></tr>`;
function hojaDeVida(v) {
  const t = (filas) => `<table style="width:100%;border-collapse:collapse;table-layout:fixed;${FUENTE}">${filas}</table>`;
  const pag1 = `
  <table style="width:100%;border-collapse:collapse;margin:0 0 6px;"><tr>
    <td style="vertical-align:bottom;">${membrete(v)}<div style="font-size:14pt;font-family:Georgia,serif;">HOJA DE VIDA</div><div style="font-size:8pt;">Escribir en letra molde y sin tachaduras</div></td>
    <td style="width:32mm;"><div style="width:26mm;height:30mm;border:${L};text-align:center;font-size:8pt;padding-top:11mm;box-sizing:border-box;margin-left:auto;">FOTO</div></td></tr></table>
  ${t(`${banda('DATOS PERSONALES')}
    <tr>${celda('APELLIDOS Y NOMBRES:', v.APELLIDOS_NOMBRES, { colspan: 4 })}${celda('CÉDULA DE IDENTIDAD:', v.CEDULA, { colspan: 2 })}</tr>
    <tr>${celda('DIRECCIÓN DE HABITACIÓN: CALLE/AVENIDA:', '', { colspan: 6, alto: '5mm' })}</tr>
    <tr>${celda('URBANIZACIÓN / SECTOR:', '', { colspan: 3, alto: '5mm' })}${celda('EDIFICIO:', '', { colspan: 3 })}</tr>
    <tr>${celda('NÚMERO DE CASA/QUINTA/PISO:', '', { colspan: 6, alto: '5mm' })}</tr>
    <tr>${celda('PARROQUIA:', '', { colspan: 2, alto: '5mm' })}${celda('MUNICIPIO:', '', { colspan: 2 })}${celda('CIUDAD:', '')}${celda('ESTADO:', '')}</tr>
    <tr>${celda('CONDICIÓN DE HABITACIÓN:', 'ALQUILADA ☐   PROPIA ☐   OTROS ☐', { colspan: 6 })}</tr>
    <tr>${celda('TELÉFONO DE HABITACIÓN:', '', { colspan: 2, alto: '5mm' })}${celda('CELULAR:', v.TELEFONO, { colspan: 2 })}${celda('E-MAIL:', '', { colspan: 2 })}</tr>
    <tr>${celda('EDAD:', v.EDAD, { alto: '5.5mm' })}${celda('FECHA DE NACIMIENTO:', v.FECHA_NAC, { colspan: 2 })}${celda('LUGAR:', '')}${celda('NACIONALIDAD:', '', { colspan: 2 })}</tr>
    <tr>${celda('DESTREZA MANUAL:', 'ZURDO ☐   DERECHO ☐', { colspan: 2, alto: '5mm' })}${celda('EDO CIVIL:', 'S ☐  C ☐  V ☐  D ☐', { colspan: 2 })}${celda('SEXO:', 'M ☐   F ☐', { colspan: 2 })}</tr>
    ${banda('TALLAS')}
    <tr>${celda('SWEATER:', '', { colspan: 2, alto: '5mm' })}${celda('CAMISA:', '')}${celda('PANTALÓN:', '', { colspan: 2 })}${celda('ZAPATOS:', '')}</tr>
    ${banda('GRUPO FAMILIAR QUE DEPENDA DE USTED')}
    <tr><td colspan="3" style="border:${L};"></td>${celda('PARENTESCO', '')}${celda('EDAD', '')}${celda('FECHA DE NACIMIENTO', '')}</tr>
    ${[1, 2, 3, 4, 5].map(() => `<tr>${celda('NOMBRE Y APELLIDO:', '', { colspan: 3, alto: '5mm' })}<td style="border:${L};"></td><td style="border:${L};"></td><td style="border:${L};"></td></tr>`).join('')}`)}
  <div style="height:4px;"></div>
  ${t(`<tr>${celda('CARGO AL QUE ASPIRA:', v.CARGO, { colspan: 2, alto: '6mm' })}${celda('DISPONIBILIDAD:', '', { colspan: 2 })}${celda('EXPECTATIVA SALARIAL:', '', { colspan: 2 })}</tr>
    <tr>${celda('¿TIENE CUENTA ACTIVA?', 'SÍ ☐   NO ☐', { colspan: 2, alto: '6mm' })}${celda('BANCO:', '', { colspan: 4 })}</tr>
    <tr>${celda('INDIQUE NÚMERO DE CUENTA:', '', { colspan: 4, alto: '5.5mm' })}${celda('TIPO DE CUENTA:', '', { colspan: 2 })}</tr>
    ${banda('ESTUDIOS REALIZADOS')}
    <tr>${celda('NIVEL', '', { colspan: 1 })}${celda('INSTITUCIÓN', '', { colspan: 2 })}${celda('AÑO EGRESO', '')}${celda('TÍTULO OBTENIDO', '', { colspan: 2 })}</tr>
    ${['EDUC. PRIMARIA', 'EDUC. SECUNDARIA', 'EDUC. SUPERIOR', 'OTROS (POSTGRADO,', 'MAESTRÍA, DOCT)'].map((n) => `<tr>${celda(n, '', { alto: '5.5mm' })}<td colspan="2" style="border:${L};"></td><td style="border:${L};"></td><td colspan="2" style="border:${L};"></td></tr>`).join('')}`)}`;

  const empleo = () => `
    <tr>${celda('.-NOMBRE DE LA EMPRESA O INSTITUCIÓN:', '', { colspan: 6, alto: '5mm' })}</tr>
    <tr>${celda('TELÉFONOS:', '', { colspan: 2, alto: '6mm' })}${celda('FECHA INGRESO Y EGRESO:', '', { colspan: 2 })}${celda('CARGO:', '', { colspan: 2 })}</tr>
    <tr>${celda('SUELDO:', '', { colspan: 2, alto: '6mm' })}${celda('SUPERVISOR INMEDIATO:', '', { colspan: 2 })}${celda('MOTIVO DEL RETIRO:', '', { colspan: 2 })}</tr>`;
  const pag2 = `${t(`${banda('EXPERIENCIA LABORAL')}
    <tr>${celda('EMPLEOS ANTERIORES (COMIENCE CON EL ÚLTIMO)', '', { colspan: 6 })}</tr>
    ${empleo()}${empleo()}
    <tr>${celda('OTRAS ACTIVIDADES PARALELAS A LOS EMPLEOS INDICADOS (DOCENTES, PROFESIONALES, DEPORTIVAS, CULTURALES, MUSICAL, ENTRE OTROS):', '', { colspan: 6, alto: '8mm' })}</tr>
    <tr>${celda('¿CÓMO SE ENTERÓ DE NUESTRAS BÚSQUEDAS?', 'PUBLICACIÓN INTERNET ☐   PUBLICIDAD EN TIENDA ☐   OTROS ☐', { colspan: 6, alto: '6mm' })}</tr>
    <tr>${celda('A QUIÉN LLAMAR EN CASO DE EMERGENCIA:', '', { colspan: 6 })}</tr>
    <tr>${celda('NOMBRE Y APELLIDO:', '', { colspan: 3, alto: '5.5mm' })}${celda('NÚMERO TLF:', '', { colspan: 2 })}${celda('PARENTESCO:', '')}</tr>
    <tr>${celda('NOMBRE Y APELLIDO:', '', { colspan: 3, alto: '5.5mm' })}${celda('NÚMERO TLF:', '', { colspan: 2 })}${celda('PARENTESCO:', '')}</tr>
    ${banda('INFORMACIÓN COMPLEMENTARIA')}
    <tr>${celda('SABE CONDUCIR', '☐', { colspan: 2, alto: '6mm' })}${celda('GRADO LICENCIA', '', { colspan: 2 })}${celda('POSEE VEHÍCULO', '☐', { colspan: 2 })}</tr>
    <tr>${celda('INFORMACIÓN ADICIONAL', '', { colspan: 6 })}</tr>
    <tr>${celda('¿ES UD. ALÉRGICO A ALGÚN MEDICAMENTO?', 'SÍ ☐  NO ☐  Indique: ________', { colspan: 3, alto: '6.5mm' })}${celda('TIPO DE SANGRE', '', { colspan: 1 })}${celda('¿FUMA?', 'SÍ ☐ NO ☐', { colspan: 1 })}${celda('¿BEBE?', 'SÍ ☐ NO ☐ Ocasional ☐', { colspan: 1 })}</tr>
    <tr>${celda('¿PADECE UD. DE ALGUNA ENFERMEDAD?', 'SÍ ☐  NO ☐  Indique: ________', { colspan: 6, alto: '6mm' })}</tr>
    <tr>${celda('SI TRABAJÓ ANTERIORMENTE EN ESTA ORGANIZACIÓN, INDIQUE EL CARGO OCUPADO, LAS FECHAS DE INGRESO/EGRESO Y LOS MOTIVOS POR LOS CUALES EGRESÓ:', '', { colspan: 6, alto: '8mm' })}</tr>
    <tr>${celda('REFERENCIAS PERSONALES: INDIQUE 3 PERSONAS QUE LO CONOZCAN Y NO SEAN FAMILIARES', '', { colspan: 6 })}</tr>
    ${[1, 2, 3].map(() => `<tr>${celda('NOMBRE Y APELLIDO:', '', { colspan: 2, alto: '6mm' })}${celda('TELÉFONO:', '')}${celda('DIRECCIÓN:', '', { colspan: 2 })}${celda('OCUPACIÓN:', '')}</tr>`).join('')}`)}
  <p style="margin:8px 0;font-size:8pt;font-weight:bold;text-align:justify;">DECLARACIÓN QUE LA INFORMACIÓN SUMINISTRADA EN ESTA SOLICITUD ES VERDADERA Y EXACTA Y AUTORIZO LA INVESTIGACIÓN DE ESTAS DECLARACIONES. CONVENGO EN QUE SI SOY CONTRATADO (A) Y POSTERIORMENTE SE LLEGARÁ A CONOCER QUE HE INCURRIDO EN INEXACTITUD O FALSEDAD EN LOS DATOS AQUÍ SUMINISTRADOS, SE CONSIDERARÁ COMO CAUSA JUSTIFICADA PARA DAR POR TERMINADO EL CONTRATO DE TRABAJO.</p>
  <table style="width:100%;border-collapse:collapse;${FUENTE}"><tr>
    <td style="vertical-align:bottom;font-size:8.5pt;width:60%;">FECHA: ${raya('30mm')}<br/><br/>FIRMA Y HUELLA: <span style="display:inline-block;width:34mm;height:22mm;border:${L};vertical-align:bottom;"></span></td>
    <td style="vertical-align:top;font-size:8pt;"><b>APROBACIÓN</b><div style="border:${L};height:11mm;padding:2px;margin-top:2px;">ANALISTA DE R&amp;S</div><div style="border:${L};height:11mm;padding:2px;">ANALISTA NÓMINA</div></td></tr></table>`;
  return (pag1 + SALTO + pag2).replace(/☐/g, caja());
}

/* ---------- 2. Antecedente clínico ---------- */
const ANTECEDENTES = ['VIH/SIDA', 'Obesidad', 'Anemia', 'Trastornos hemorrágicos o coagulopatías', 'Enfermedad vascular periférica', 'Artritis reumatoide', 'Insuficiencia cardíaca', 'Insuficiencia renal', 'Enfermedad coronaria', 'Asma bronquial', 'Enfermedad Pulmonar Obstructiva Crónica', 'Trastorno de circulación pulmonar', 'Depresión', 'Diabetes', 'Hipertensión arterial', 'Hipotiroidismo', 'Enfermedad Hepática', 'Linfoma', 'Trastornos neurológicos', 'Cáncer', 'Parálisis', 'Fumador', 'Abuso del alcohol', 'Abuso de drogas', 'En estado de gestación', 'Lactando', 'Discapacidad severa o crónica'];
const SINTOMAS = ['Fiebre mayor de 37.5ºC', 'Dificultad para respirar', 'Tos seca', 'Tos con flema', 'Congestión nasal con moco', 'Congestión nasal seca', 'Malestar General', 'Dolor de garganta', 'Diarrea', 'Dolor de Cabeza', 'Pérdida o alteración de olfato y gusto', 'Erupción en la piel', 'Cambio de coloración en los dedos de pies y manos'];
const CONTACTOS = ['Ha viajado el último mes', 'Ha tenido contacto con alguien con COVID 2019', 'Ha tenido contacto con alguien que ha viajado', 'Ha asistido a algún centro de salud por patología familiar', 'Ha asistido a algún centro de salud por sospecha de diagnóstico de COVID - 19', '¿Está usted vacunado Contra el COVID?'];
function antecedenteClinico(v) {
  const c = `border:${L};padding:1px 3px;font-size:7.5pt;`;
  const fila = (t) => `<tr><td style="${c}">${t}</td><td style="${c}width:9mm;"></td><td style="${c}width:9mm;"></td></tr>`;
  return `${membrete(v)}
  <p style="text-align:center;font-size:11pt;margin:0 0 4px;">Antecedente Clínico</p>
  <table style="width:100%;border-collapse:collapse;${FUENTE}font-size:8pt;margin-bottom:4px;">
    <tr style="text-align:center;font-weight:bold;"><td style="${c}">NOMBRE</td><td style="${c}">APELLIDO</td><td style="${c}">CÉDULA</td><td style="${c}">EDAD</td><td style="${c}">TIENDA</td><td style="${c}">FECHA</td></tr>
    <tr style="text-align:center;"><td style="${c}">${esc(v.NOMBRES)}</td><td style="${c}">${esc(v.APELLIDOS)}</td><td style="${c}">${esc(v.CEDULA)}</td><td style="${c}">${esc(v.EDAD)}</td><td style="${c}">${esc(v.TIENDA)}</td><td style="${c}">${esc(v.FECHA)}</td></tr>
    <tr><td colspan="6" style="${c}"><b>DIRECCIÓN:</b> ${esc(v.DIRECCION)}</td></tr>
    <tr><td colspan="6" style="${c}"><b>TELÉFONO:</b> ${esc(v.TELEFONO)}</td></tr></table>
  <table style="width:100%;border-collapse:collapse;${FUENTE}"><tr>
    <td style="width:52%;vertical-align:top;padding-right:6px;">
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${c}font-weight:bold;text-align:center;">ANTECEDENTES DE SALUD</td><td style="${c}font-weight:bold;">SÍ</td><td style="${c}font-weight:bold;">NO</td></tr>
      ${ANTECEDENTES.map(fila).join('')}
      <tr><td colspan="3" style="${c}font-weight:bold;text-align:center;">SÍNTOMAS</td></tr>
      <tr><td style="${c}font-weight:bold;">¿Tienes síntomas?</td><td style="${c}"></td><td style="${c}"></td></tr>
      ${SINTOMAS.map(fila).join('')}</table></td>
    <td style="vertical-align:top;">
      <table style="width:100%;border-collapse:collapse;"><tr><td style="${c}font-weight:bold;text-align:center;">CONTACTOS</td><td style="${c}font-weight:bold;">SÍ</td><td style="${c}font-weight:bold;">NO</td><td style="${c}font-weight:bold;">FECHA Y LUGAR DE VIAJE</td></tr>
      ${CONTACTOS.map((t) => `<tr><td style="${c}">${t}</td><td style="${c}width:7mm;"></td><td style="${c}width:7mm;"></td><td style="${c}"></td></tr>`).join('')}
      <tr><td style="${c}">De ser afirmativa la respuesta anterior indique cuantas dosis:</td><td colspan="3" style="${c}">1ra. ☐   2da. ☐   3ra. / 4ta. ☐</td></tr></table>
      <p style="font-size:7.5pt;font-weight:bold;text-align:justify;margin:14px 0 8px;">Declaro que los datos aportados en este formulario son actualizados y veraces, comprendiendo la importancia de los mismos para el control de la situación sanitaria de la República Bolivariana de Venezuela. Soy consciente además de la responsabilidad civil relacionada con la calidad de los datos que aporto, en cumplimiento del deber de cooperación con las autoridades competentes, según lo establecido en el artículo 17 de la Ley Orgánica sobre Estados de Excepción.</p>
      ${bloqueFirma(v, { etiqueta: 'FIRMA', ci: false })}
      <p style="font-size:8pt;margin:10px 0 2px;">( ) TELECONSULTA.</p><p style="font-size:8pt;font-weight:bold;margin:6px 0 0;">MÉDICO FIJO</p></td></tr></table>
  <p style="font-size:7.5pt;margin:10px 0 0;text-align:justify;"><b><u>RECOMENDACIONES:</u></b> se indica uso estricto y universal del tapa bocas o mascarilla fuera de casa, mantener distanciamiento físico-social de 1.5 mts, evitar reuniones y sitios cerrados, exacerbar la higiene de las manos y protección ocular (dependiendo del riesgo individual).</p>`.replace(/☐/g, caja());
}

/* ---------- 3. Normas y reglamento de tienda ---------- */
function normasTienda(v) {
  const d = DESCUENTO_EMPLEADO[v.MARCA === 'PLANETA' ? 'PLANETA' : 'BALU'];
  const norma = [
    'Es obligatorio el cumplimiento del horario de trabajo, se darán solo 10 minutos pasada la hora de entrada con notificación previa.',
    'Se debe mantener limpia y ordenada la tienda en todo momento; para lo cual se asignan bajo cronograma funciones diarias a todos los integrantes de la fuerza de ventas y cajeros.',
    'Se exige buena presencia en todo momento y para la permanencia de la jornada laboral; prohibido uso de shorts, franelillas, cholas o sandalias que representen un riesgo laboral; se debe respetar el uso del uniforme.',
    'Mantener la buena apariencia y actitud durante toda la jornada de trabajo; no estar recostados de las paredes, mobiliario de tienda ni ningún área de la caja.',
    'Se prohíbe masticar chicle o comer caramelos. Se recuerda que somos la imagen de una de las mejores marcas a nivel mundial.',
    'Está prohibido ingerir cualquier alimento en piso de venta de la tienda ni en área de caja conservar ningún alimento; muchísimo menos bebidas ya que pueden acarrear accidentes de los equipos.',
    'Está prohibido fumar durante su jornada de trabajo (solo en su hora de break y fuera de las instalaciones de tienda).',
    'Se prohíbe el uso de celulares, DS o juegos de video; dentro de las instalaciones de la tienda. Solo puede ser usado en su break o en casos de emergencias (celulares) previa notificación al Gerente de Marca.',
    'Se prohíbe ingresar a redes sociales y navegar por internet en páginas que no estén autorizadas.',
    'Recordar que la buena atención al cliente es primordial, brindarle una asesoría completa sin mentiras y siendo bastante claros.',
    'Será revisado el personal antes de salir de la tienda; seguridad deberá visualizar los bolsos o carteras y deben avisar 10 minutos antes de retirarse de la tienda.',
    'El tiempo de break es 1 una hora por cada 8 h de trabajo; importante estar pendiente de su hora de break.',
    'Se prohíbe hacer círculos de reuniones en la tienda ni conversar en el área de caja, personal de seguridad a menos que la ocasión lo haga indispensable (suceso en tienda).',
    'Se prohíbe estar dentro del área de caja a asesores y seguridad a menos que la encargada lo permita bajo circunstancia especial.',
    'No se permite la permanencia de asesores en almacén sin motivo justificado (exclusivamente recepción de mercancía, conteo, inventario o surtido de producto).',
    'Los cajeros deberán estar solo en su área de trabajo ya que son responsables de lo que pase en su caja asignada; solo saldrán si el encargado lo autoriza para labores determinadas.',
    'Las faltas injustificadas serán sancionadas con una amonestación.',
    'Todo el producto ubicado en piso de venta debe tener el precio visible y debe encontrarse alarmado correctamente.',
    'Las vitrinas deben tener exhibidos los precios por cada uno de los maniquíes.',
    'Se prohíbe recibir visitas en su horario de trabajo a todo el personal de la tienda.',
    'Es obligación de los asesores de ventas, etiquetar, exhibir y ordenar la mercancía tanto en piso de venta como almacén.',
    'Recordando que la apariencia de la tienda es indispensable; se prohíbe mantener cajas en el piso de ventas, mantenerlas en depósito.',
    `El % de descuento de empleado es el correspondiente a ${d.porcentaje}% valido para compra de ${d.piezas} piezas mensuales únicamente; este beneficio NO es transferible. (Debe estar en activo el uso del mismo por Dirección de Marca)`,
    'Indispensable el cumplimiento del uniforme en caso de no tenerlo el vestuario empleado debe respetar las normativas de no presentar escotes exagerados, no emplear shorts a menos que se usen con medias panties oscuras o leggins debajo.',
    'Mantener trato cordial y amable con sus compañeros de trabajo y superiores.',
    'Respetar y cumplir sus funciones (indicadas en contrato).',
  ];
  const lista = (a) => `<ul style="margin:0;padding-left:6mm;">${a.map((t) => `<li style="margin:0 0 10px;text-align:justify;font-size:10pt;">${esc(t)}</li>`).join('')}</ul>`;
  return `${membrete(v)}
    <p style="text-align:center;font-weight:bold;font-size:11pt;margin:14px 0 14px;">NORMAS Y REGLAMENTO DE TIENDA</p>
    ${lista(norma.slice(0, 13))}
    ${bloqueFirma(v)}
    ${SALTO}${membrete(v)}
    ${lista(norma.slice(13))}
    <p style="font-weight:bold;text-align:justify;font-size:10pt;margin:10px 0 0;">El empleo de las chapas y/o STAFF de la Marca es de carácter obligatorio para asesores, encargados, cajeros, coordinación de visual y deben permanecer en tiendas (por ningún motivo al culminar su jornada laboral deben llevárselas).</p>
    ${bloqueFirma(v, { etiqueta: 'FIRMA' })}`;
}

/* ---------- 4. Notificación de riesgos ---------- */
const MEDIDAS_ESTANTERIA = 'Cuando levante objetos del piso agáchese doblando las rodillas, mantenga la espalda erguida, mantenga el objeto lo más cerca de su cuerpo y emplee la fuerza de sus piernas para el levantamiento';
const MEDIDAS_CARGA = ['No traslade objetos pesados o voluminosos manualmente si puede hacerlo con ayudas mecánicas (carretillas)', 'Solicite ayuda para levantar cargas pesadas', 'Mantenga la espalda erguida, las rodillas dobladas, la carga cerca de su cuerpo y emplee la fuerza de sus piernas para el levantamiento', 'Observe posibles obstáculos en la vía mientras transporta mercancía en carretillas o burros.'];
const MEDIDAS_ALTO = ['Circule por su derecha en todas las áreas de tienda', 'Traslade la carga lo más cerca de su cuerpo a la altura de la cintura', 'Realice pausas activas', 'Al colocar prendas en sitios bajos apoye su cuerpo en una rodilla y mantenga la espalda erguida, evite flexionar el tronco', 'Utilice siempre escaleras para alcanzar sitios altos y jamás emplee sillas o taburetes.'];
export const RIESGOS_TIENDA = [
  [{ tarea: 'APOYO EN EL PROCESO DE FACTURACIÓN', desc: 'Realizar actividades frente al computador. Transcripción de datos. Notas de crédito y devoluciones. Procesar facturas, Manejo de caja. Arqueo de caja apertura y cierre de puntos de ventas.',
    tipo: ['Físico', 'Ergonómico', 'Psicosocial', 'Biológico'], riesgo: ['Estrés', 'Bipedestación prolongada', 'Fatiga física', 'Posturas forzadas', 'Contacto eléctrico', 'Contacto con agentes infecciosos, virus y bacterias.'],
    efectos: ['Fatiga visual', 'Estrés muscular', 'Problemas musculoesqueléticos', 'Cansancio', 'Infecciones bacterianas', 'Gripe', 'Covid-19', 'Conjuntivitis'],
    medidas: ['Trabajar con la iluminación adecuada', 'Indicar cualquier condición insegura observada en su área.', 'Recibir capacitación para el uso de equipos y utensilios necesarios para llevar a cabo sus actividades.', 'Evite la acumulación excesiva de papeles y otros objetos sobre su lugar de trabajo', 'Asegúrese que dispone de espacio suficiente para manejar el mouse (ratón) con comodidad. Si es zurdo coloque el mouse a la izquierda y cambie el accionamiento de los botones en el menú de configuración del computador', 'Coloque el teclado de forma que no se encuentre justo en el borde de la mesa', 'Entre el teclado y el borde de la mesa debe quedar un espacio de al menos 10 cm para apoyar las muñecas', 'Lavado de manos.', 'Uso de gel antibacterial', 'No tocarse la cara con las manos sin lavar.'] }],
  [{ tarea: 'ACTIVIDADES ADMINISTRATIVAS', desc: 'Operatividad en centrales telefónicas, enviar y recibir correspondencia. Manejo de carpetas, cajas y volumen de documentación, Manipulación de materiales de oficina y equipos de oficina (perforadoras, tijeras, engrapadoras, ganchos para carpetas) uso de gavetas, estantes, archivos.',
    tipo: ['Físico', 'Ergonómico', 'Psicosocial'], riesgo: ['Estrés', 'Bipedestación prolongada', 'Posturas forzadas', 'Contacto eléctrico', 'Golpeado por', 'Atrapado entre', 'Caída en el mismo nivel'], efectos: ['Fatiga visual', 'Contusiones', 'Hematomas', 'Magulladuras'],
    medidas: ['Realice pausas activas', 'Emplee la escalerilla para colocar ropa en espacios por encima de la altura de sus hombros, jamás utilice sillas o taburetes.', 'Trabaje con precaución cuando coloque o retire ropa de las estanterías (posibles cortes con bordes filosos sin protección)', 'Realice frecuentes pausas descansando los brazos', 'Mantenga en orden y limpieza su área de trabajo', 'Reportar cualquier equipo eléctrico en malas condiciones.', 'Repasar normativa de trabajo seguro', 'Trabajar con la iluminación adecuada', 'Indicar cualquier condición insegura observada en su área.', 'Mantenga las gavetas y puertas cerradas', 'Al iniciar el cierre de gavetas o archivos, tenga extremo cuidado en no colocar los dedos de las manos en el área de trayectoria o tope final de cierre de los mismos.', 'Evite distracciones'] }],
  [{ tarea: 'ATENCIÓN AL CLIENTE', desc: 'Trato directo y físico con clientes, visitantes. Embolsado de compra del cliente y entrega de la factura, Mantener los exhibidores de área de caja con los productos.',
    tipo: ['Físico', 'Psicosocial', 'Ergonómico'], riesgo: ['Violencia', 'Estrés', 'Bipedestación prolongada', 'Fatiga física', 'Robo', 'Secuestro'], efectos: ['Lesiones musculoesqueléticas', 'Várices', 'Enfermedades psicosomáticas derivadas de la exposición a situaciones de estrés'],
    medidas: ['Absténgase de discutir con clientes violentos', 'Mantenga una distancia prudencial de ellos.', 'No toque al cliente', 'Poner en práctica la escucha activa', 'Evite dar opiniones o hacer juicios', 'Evite en lo posible gesticular o tener posturas agresivas', 'Comuníquese con el personal de Seguridad', 'Realice pausas activas', 'Esté atento en todo momento de lo que sucede a su alrededor', 'Esté atento a situaciones sospechosas', 'No dé datos de la compañía a extraños', 'Evite mantener conversaciones con desconocidos'] },
  { tarea: 'REPOSICIÓN DE MERCANCÍA', desc: 'Verificar alarmado y etiquetado, acomodar prendas por talla, modelo y color, perfilar.',
    tipo: ['Físico', 'Ergonómico'], riesgo: ['Golpeado por', 'Golpeado contra', 'Caída de altura', 'Caída al mismo nivel', 'Bipedestación prolongada'], efectos: ['Desórdenes musculoesqueléticos', 'Várices', 'Movimientos repetitivos, fracturas, esguinces'], medidas: MEDIDAS_ALTO }],
  [{ tarea: 'APOYO EN EL ALMACÉN', desc: 'Recepción de mercancía proceso de inventario mensual. Alarmado de prendas. Llevar el control de las salidas de productos del almacén.',
    tipo: ['Físico', 'Ergonómico'], riesgo: ['Golpeado por', 'Golpeado contra', 'Sobreesfuerzo', 'Fatiga física', 'Posturas forzadas', 'Movimientos repetitivos'], efectos: ['Desórdenes musculoesqueléticos', 'Hernias inguinales y discales', 'Fatiga visual'], medidas: [...MEDIDAS_CARGA, ...MEDIDAS_ALTO] }],
  [{ tarea: 'LABORES DE LIMPIEZA', desc: 'Manejo y uso de artículos y productos de limpieza, retirar desperdicios de papeleras.',
    tipo: ['Físico', 'Ergonómico', 'Biológico'], riesgo: ['Golpeado por', 'Golpeado contra', 'Sobreesfuerzo', 'Fatiga física', 'Posturas forzadas', 'Contacto con agentes químicos', 'Contacto con desperdicios', 'Caída al mismo nivel'], efectos: ['Desórdenes musculoesqueléticos', 'Enfermedades en la piel, mucosas, uñas, manos', 'Virus, bacterias'],
    medidas: ['Uso de equipos de protección personal: guantes, lentes.', 'Lavado correcto de manos.', 'Pausas activas.', 'Mantener área de trabajo ordenada.', 'Uso de conos de seguridad.', 'Prestar atención a su entorno', 'Orden y limpieza', 'Secar cualquier superficie que presente derrame de líquido'] },
  { tarea: 'EMPLEO DE ESCALERA', desc: '', tipo: ['Físico'], riesgo: ['Caída de altura'], efectos: ['Lesiones traumáticas', 'Heridas', 'Muerte', 'Fracturas', 'Hematomas', 'Esguinces', 'Cortaduras'],
    medidas: ['Abra la escalera con cuidado de no pillarse los dedos.', 'Verifique el estado de la escalera y que la misma se encuentre firme y estable', 'Emplee siempre la escalera del largo adecuado.', 'Mantenga siempre tres puntos de contacto: una mano y dos pies o dos pies y una mano.', 'Jamás se pare sobre el último o penúltimo peldaño de la escalera.', 'No trate de alcanzar objetos lejanos sin mover la escalera', 'Abra siempre la escalera, no la apoye en nada', 'Eliminar bordes cortantes.'] }],
  [{ tarea: 'COLOCACIÓN DE MERCANCÍA EN ESTANTERÍA', desc: '', tipo: ['Físico', 'Ergonómico'], riesgo: ['Caída de altura', 'Posturas forzadas'], efectos: ['Lesiones traumáticas', 'Desórdenes musculoesqueléticos', 'Muerte'],
    medidas: [MEDIDAS_ESTANTERIA, 'Emplee la escalera para colocar ropa en espacios por encima de la altura de sus hombros.', 'Trabaje con precaución cuando coloque o retire ropa de las estanterías (posibles cortes con bordes filosos sin protección).'] },
  { tarea: 'PERCHADO DE PRENDAS', desc: '', tipo: ['Ergonómico'], riesgo: ['Movimientos repetitivos'], efectos: ['Lesiones musculoesqueléticas'], medidas: ['Haga frecuentes pausas.'] },
  { tarea: 'EMPLEO DE CUCHILLA TIPO EXACTO', desc: '', tipo: ['Físico'], riesgo: ['Contacto con agentes filosos'], efectos: ['Heridas', 'Cortaduras'], medidas: ['Extienda la cuchilla lo mínimo suficiente para realizar el corte deseado.', 'Guarde la cuchilla cuando no la esté empleando', 'Realice siempre el corte en dirección opuesta a su cuerpo.'] }],
  [{ tarea: 'EMPLEO DE VAPORETA', desc: '', tipo: ['Físico'], riesgo: ['Contacto con temperaturas extremas'], efectos: ['Escaldaduras'], medidas: ['Mantenga la vaporeta desenchufada cuando no esté en uso', 'Tenga precaución con el vapor que sale del equipo, sostenga siempre la manguera por el mango.'] },
  { tarea: 'ACTUACIÓN EN CASO DE DESALOJO / ACTUACIÓN EN CASO DE FUEGO', desc: '', tipo: ['Físico', 'Químico'], riesgo: ['Caídas de altura', 'Caída del mismo nivel', 'Golpeado por objetos que caen', 'Contacto con temperaturas extremas'], efectos: ['Traumatismos', 'Quemaduras', 'Escaldaduras', 'Muerte'],
    medidas: ['Si percibe olor a humo, abandone inmediatamente el área junto a las otras personas presentes y dé aviso al personal de Seguridad y al Encargado.', 'En caso de evacuación general del centro comercial siga la ruta de escape establecida, sin emplear los ascensores ni escaleras mecánicas y diríjase al punto de reunión o lugar seguro.', 'En caso de producirse algún lesionado dé aviso al encargado o vigilante antes de intentar cualquier acción.', 'Siga las instrucciones de su supervisor y ruta establecida como vía de escape, rápidamente, pero con seguridad, sin correr.'] }],
  [{ tarea: 'LEVANTAMIENTO Y TRANSPORTE DE OBJETOS', desc: '', tipo: ['Físico', 'Ergonómico'], riesgo: ['Golpeado por', 'Golpeado contra', 'Sobreesfuerzos'], efectos: ['Lesiones musculoesqueléticas', 'Hernias inguinales y discales'], medidas: MEDIDAS_CARGA },
  { tarea: 'DOBLADO DE PRENDAS', desc: '', tipo: ['Ergonómico'], riesgo: ['Movimientos repetitivos', 'Posturas inadecuadas'], efectos: ['Lesiones musculoesqueléticas'], medidas: ['Si dobla sobre una mesa, esta debe ser alta, mantenga la espalda erguida', 'Si dobla de pie hágalo sobre su pecho, mantenga la espalda erguida.', 'Realice pausas activas'] },
  { tarea: 'DESPLAZAMIENTO EN TIENDA', desc: '', tipo: ['Físico', 'Ergonómico'], riesgo: ['Golpeado por', 'Golpeado contra', 'Caída al mismo nivel', 'Caída a distinto nivel', 'Bipedestación prolongada'], efectos: ['Traumatismos', 'Heridas', 'Esguinces', 'Fracturas', 'Torceduras'],
    medidas: ['Circule por su derecha en todas las áreas de tienda', 'Tenga cuidado al aproximarse a las puertas y siempre abra y cierre estas lentamente', 'Verifique que no haya obstáculos en el camino y si identifica algún derrame de líquido repórtelo inmediatamente.', 'Realice pausas activas', 'Use los pasamanos de las escaleras', 'Evite dejar obstáculos en los pasillos de circulación, escaleras, salidas.'] }],
  [{ tarea: 'REETIQUETADO', desc: '', tipo: ['Ergonómico'], riesgo: ['Movimientos repetitivos'], efectos: ['Desórdenes musculoesqueléticos'], medidas: ['Realice frecuentes pausas descansando los brazos'] },
  { tarea: 'ARMADO DE ESTRUCTURA DE PARED', desc: '', tipo: ['Físico', 'Ergonómico'], riesgo: ['Caída de altura', 'Contacto con bordes filosos', 'Golpeado por objetos que caen'], efectos: ['Traumatismos', 'Heridas'], medidas: ['Emplee escaleras exclusivamente', 'En caso de manipular objetos pesados solicite la asistencia de un compañero', 'Preste atención a que los soportes hayan quedado bien encajados'] }],
  [{ tarea: 'RIESGOS "IN ITINERE" (DURANTE EL TRAYECTO)', desc: '', tipo: ['Físico', 'Psicosocial'], riesgo: ['Accidentes de tránsito y en la vía pública', 'Accidente', 'Robo', 'Atraco', 'Estrés'], efectos: ['Heridas por arma blanca y arma de fuego', 'Lesiones traumáticas', 'Intoxicaciones', 'Muerte', 'Enfermedades psicosomáticas derivadas de situaciones de estrés'],
    medidas: ['Respete las leyes de Tránsito.', 'Evite contratar mototaxis', 'Cruce calles y avenidas solo por el rayado para peatones', 'Utilice el cinturón de seguridad en asientos delanteros y traseros.', 'No utilice el teléfono móvil celular mientras conduce, e igualmente evite maquillarse, cambiar de emisora de radio o comer mientras conduce.', 'No conduzca después de haber ingerido licor', 'No acepte trasladar desconocidos en su vehículo.', 'Tenga precaución cuando conduzca sobre el pavimento húmedo', 'Estaciónese en lugares iluminados y seguros', 'Utilice los puentes peatonales.', 'Circule por áreas concurridas y bien iluminadas.', 'Nunca vea al asaltante a los ojos.', 'No ofrezca resistencia al robo, mantenga la calma, y no hable más de lo necesario.', 'Evite ostentar prendas lujosas o mostrar dinero en efectivo en la calle.', 'Manténgase alerta cuando camine por la calle, observe a su alrededor. Si nota que es seguido, entre a un lugar concurrido.', 'Evite paradas de buses desiertas o mal iluminadas.', 'No ingiera alimentos o bebidas ofrecidas por desconocidos', 'Donde quiera que se encuentre permanezca alerta y vigile los alrededores', 'Proyecte serenidad, seguridad y que sabe adónde va.'] }],
];
function textoIntroRiesgos(v) {
  const marca = v.MARCA === 'PLANETA' ? 'PLANETA' : 'BALU';
  const r = REPRESENTANTE_NOTIFICACION[marca];
  const emp = `<b>${esc(v.RAZON_SOCIAL)}</b>`;
  const pendiente = (t) => `<b style="background:#fff3cd;">[${t} PENDIENTE]</b>`;
  const quien = r.nombre
    ? `representada legalmente por quien plenamente se identifica y suscribe el presente documento, <b>${esc(r.nombre)}</b>, ${esc(r.nacionalidad)}, mayor de edad, de éste domicilio y titular de la Cédula de Identidad <b>N° ${esc(r.cedula)}</b> en su carácter de Representante Legal`
    : `representada legalmente por ${pendiente('REPRESENTANTE LEGAL Y SUS DATOS')}, en su carácter de Representante Legal`;
  const reg = r.registro ? `debidamente inscrita en el ${esc(r.registro)}, e inscrita en el Registro de Información Fiscal-RIF <b>${esc(v.RIF)}</b>` : `inscrita en el Registro de Información Fiscal-RIF <b>${esc(v.RIF)}</b> ${pendiente('DATOS DE REGISTRO MERCANTIL')}`;
  return `${emp} ${reg}, ${quien}, a fin de dar cumplimiento a lo preceptuado en los artículos Cincuenta y tres (53) y Cincuenta y seis (56) de la Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (LOPCYMAT), cumplo con informarle que con motivo del desempeño de sus labores como <b>${esc(String(v.CARGO || 'TRABAJADOR(A) DE TIENDA').toUpperCase())}</b> en ${emp} usted puede estar expuesta/o a riesgos que más abajo se describen, así como los medios y medidas para prevenirlos y mitigarlos.`;
}
const lista2 = (a, s = '') => a.map((t) => `<div style="margin:0 0 2px;${s}">${esc(t)}</div>`).join('');
function notificacionRiesgos(v) {
  const c = `border:${L};padding:3px 4px;vertical-align:top;font-size:7.5pt;`;
  const pie = `<table style="width:100%;border-collapse:collapse;margin-top:8px;${FUENTE}font-size:7.5pt;page-break-inside:avoid;">
    <tr><td style="${c}background:#d9d9d9;"><b>Nombre y Apellido del Trabajador:</b><br/>${esc(v.NOMBRES_APELLIDOS)}</td><td style="${c}background:#d9d9d9;"><b>Cédula de Identidad:</b><br/>${esc(v.CEDULA)}</td><td style="${c}background:#d9d9d9;width:34mm;height:11mm;"><b>Firma del Trabajador</b></td><td style="${c}background:#d9d9d9;"><b>Fecha:</b></td><td rowspan="2" style="${c}width:22mm;text-align:center;vertical-align:bottom;background:#d9d9d9;"><div style="height:16mm;"></div><b>Huella Digital</b></td></tr>
    <tr><td style="${c}background:#d9d9d9;height:11mm;"><b>Nombre y Apellido del Supervisor:</b></td><td style="${c}background:#d9d9d9;"><b>Cédula de Identidad:</b></td><td style="${c}background:#d9d9d9;"><b>Firma del Supervisor</b></td><td style="${c}background:#d9d9d9;"></td></tr></table>`;
  const encabezado = `<table style="width:100%;border-collapse:collapse;${FUENTE}margin-bottom:6px;"><tr>
    <td style="${c}width:46mm;background:#d9d9d9;vertical-align:middle;">${v.LOGO || `<b>${esc(v.MARCA === 'PLANETA' ? 'PLANETA' : 'BALÚ')}</b>`}</td>
    <td style="${c}background:#d9d9d9;vertical-align:middle;"><b style="font-size:11pt;">NOTIFICACIÓN DE RIESGOS</b><br/><span style="font-size:8pt;">Centro de Trabajo <b>${esc(v.RAZON_SOCIAL)}</b></span></td></tr></table>`;
  const cab = `<tr>${['TAREA', 'TIPO DE RIESGO', 'RIESGO', 'POSIBLES EFECTOS SOBRE LA SALUD', 'MEDIDAS PREVENTIVAS'].map((t, i) => `<td style="${c}background:#d9d9d9;text-align:center;font-weight:bold;${i === 4 ? 'width:62mm;' : i === 0 ? 'width:28mm;' : ''}">${t}</td>`).join('')}</tr>`;
  const paginas = RIESGOS_TIENDA.map((tareas, i) => `${i === 0 ? `${encabezado}<p style="text-align:justify;font-size:8pt;margin:0 0 6px;">${textoIntroRiesgos(v)}</p>` : `${encabezado}`}
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;${FUENTE}">${cab}
    ${tareas.map((t) => `<tr><td style="${c}"><b>${esc(t.tarea)}</b>${t.desc ? `<div style="margin-top:6px;">${esc(t.desc)}</div>` : ''}</td><td style="${c}">${lista2(t.tipo)}</td><td style="${c}">${lista2(t.riesgo)}</td><td style="${c}">${lista2(t.efectos)}</td><td style="${c}">${t.medidas.map((m) => `<div style="margin:0 0 2px;">*${esc(m)}</div>`).join('')}</td></tr>`).join('')}</table>${pie}`);
  return paginas.join(SALTO);
}

/* ---------- 5. Normativa interna de trabajo seguro (SST-02) ---------- */
const NORMATIVA_SST = [
  'Las fallas observadas en tienda que pudieran afectar la salud o la seguridad de los trabajadores deberán ser comunicadas inmediatamente al Encargado y/o Delegado de Prevención.',
  'Se deberá reportar al encargado cualquier incidencia dentro de su área laboral, haya o no causado lesión.',
  'Los trabajadores no deberán operar ningún equipo si no han sido debidamente entrenados y autorizados para ello. Queda restringido al personal, no supervisor o técnico, el acceso al cuarto eléctrico o de cualquier otro servicio.',
  'Se deberá secar inmediatamente cualquier derrame de líquidos en las superficies de tránsito o pasillos.',
  'Los desperdicios deberán ser depositados en los recipientes dispuestos para tal fin.',
  'Los trabajadores deberán colaborar en el mantenimiento del orden y la limpieza de todas las áreas de tienda.',
  'Se debe recoger inmediatamente cualquier objeto que haya caído en un área de circulación.',
  'Las puertas deberán ser abiertas siempre con precaución. Los empleados deberán tener especial cuidado al aproximarse a una puerta que abra en dirección a ellos.',
  'Queda terminantemente prohibido correr en el área de trabajo. Tampoco están permitidas las bromas pesadas.',
  'Las salidas de emergencia, rutas de evacuación y equipos de control de incendios deberán permanecer libres de obstáculos.',
  'Las puertas de emergencia deberán permanecer habilitadas y no tener ninguna traba que impida su rápida apertura.',
  'No se deberá apilar mercancía a menos de 50 cm por debajo de los detectores de incendio.',
  'No debe haber mercancía o cualquier objeto combustible a menos de 45 cm de distancia por debajo de las cabezas de los rociadores de agua contra incendios, o a menos de 60 cm de distancia de cualquier bombillo o luminaria eléctrica.',
  'Los equipos eléctricos portátiles como vaporeras y ventiladores deberán ser desenchufados cuando no estén en uso y las primeras deben ser operadas por personal entrenado y autorizado.',
  'Los equipos eléctricos deben ser desenchufados tomando el enchufe con la mano y no tirando del cable.',
  'El cuarto de electricidad deberá permanecer libre de materiales combustibles (cajas, papel, cartón, plásticos, solventes). Tampoco deberá haber ningún objeto, de cualquier tipo, a menos de 90 cm de los tableros de distribución o transformadores eléctricos.',
  'Las tapas de los tableros eléctricos deben permanecer cerradas, y estos equipos deberán ser operados solamente por personal autorizado.',
  'No deberán emplearse extensiones eléctricas de forma permanente.',
  'No deberá haber ningún material combustible a menos de 30 cm de los tomacorrientes.',
  'Los extintores de fuego y los gabinetes de manguera deberán permanecer libres de obstáculos.',
  'Las lámparas de emergencia no deberán ser obstaculizadas por ningún objeto.',
  'No deberá haber mercancía almacenada debajo de las escaleras de Tienda.',
  'Los objetos y equipos en desuso, cuya permanencia no se justifique en Tienda, así como los materiales innecesarios deben ser removidos.',
  'Para levantar cargas el trabajador deberá agacharse manteniendo la columna lo más vertical que le sea naturalmente posible, mantener los codos pegados al cuerpo y emplear la fuerza de las piernas para levantarlo.',
  'No se debe apilar sobre el piso materiales a una altura mayor de 1.80 m.',
  'Los objetos con un peso superior a los 3 kg deberán ser almacenados en las estanterías a una altura máxima de 1,80 m.',
  'No se deberá levantar ni transportar individualmente objetos con peso superior a 20 kg los hombres, y 12 kg las mujeres. Tampoco los muy voluminosos; para estos casos se deberán emplear medios mecánicos como carretillas, plataformas con ruedas, o solicitar la ayuda de algún compañero. El objeto transportado nunca deberá obstaculizar la visión del trabajador.',
  'No deberán emplearse escaleras portátiles con deformaciones que afecten su estabilidad.',
  'Cada trabajador que tenga que usar escaleras portátiles, deberá examinarlas previamente para verificar si tienen algún defecto que afecte la seguridad en su empleo.',
  'El trabajador deberá abstenerse de subir a las escaleras portátiles empleando zapatos de tacón alto.',
  'Los trabajadores no deberán subir la escalera por encima del antepenúltimo peldaño de abajo hacia arriba en las escaleras portátiles y la longitud de esta dependerá de la altura del objeto a alcanzar.',
  'Al emplear el exacto para abrir cajas, se deberá sacar sólo 5 cm de la hoja y efectuar los cortes en sentido opuesto al cuerpo. Mientras no esté en uso el exacto se deberá guardar la hoja.',
  'Queda terminantemente prohibido emplear mesas, taburetes o bancos a manera de escalera al igual que trepar las estanterías metálicas.',
  'Las escaleras portátiles deben ser subidas y bajadas cautelosamente siempre de cara a la escalera y manteniendo tres puntos de contacto con la misma (dos pies y una mano o dos manos y un pie). La mercancía debe colocarse provisionalmente en la repisa mientras se sube o baja la escalera. Antes de montarse en la escalera, el trabajador deberá verificar el buen estado y la estabilidad de la misma.',
  'Los empleados que se encuentren tomando medicamentos que pudieran afectar de manera significativa su habilidad para desarrollar su trabajo deben notificarlo a su supervisor.',
  'El trabajador deberá evitar el contacto de su cuerpo con cualquier tipo de bombillo o luminaria.',
  'Bajo ningún concepto un trabajador tendrá contacto con cualquier fluido corporal de un herido, para lo cual deberá emplear guantes de látex.',
  'Los vasos desechables empleados para beber agua no deberán ser reutilizados y se prohíbe el uso de vasos de uso común.',
  'El botiquín de primeros auxilios únicamente deberá contener los siguientes insumos: 2 pares de guantes estériles, 4 vendas de gasa, 10 curitas, 5 apósitos de gasa, agua oxigenada y un antiséptico.',
  'Las papeleras de los baños deberán permanecer por debajo de su límite máximo de capacidad.',
  'En caso de tener que confrontar a un cliente violento, el trabajador deberá alejarse del mismo y notificar al encargado o al vigilante.',
  'El encargado deberá, antes del cierre, recorrer todas las áreas de Tienda y verificar que no haya quedado ninguna luz encendida o vaporetas o ventiladores enchufados.',
];
function normativaSST(v) {
  const c = `border:${L};padding:2px 4px;`;
  const cab = (n) => `<table style="width:100%;border-collapse:collapse;margin-bottom:6px;${FUENTE}"><tr>
    <td style="${c}width:96mm;vertical-align:middle;">${v.LOGO || ''}<div style="font-size:7pt;font-weight:bold;">${esc(v.RAZON_SOCIAL)} · RIF ${esc(v.RIF)}</div><div style="font-size:12pt;font-weight:bold;margin-top:8px;">Normativa Interna de Trabajo Seguro</div></td>
    <td style="${c}text-align:center;font-size:9pt;"><b>Versión:</b><br/><br/>10/2021</td>
    <td style="${c}text-align:center;font-size:9pt;"><b>Código: SST-02</b><br/><br/>Página ${n}-2<br/><b>Seguridad y Salud en el Trabajo</b></td></tr></table>`;
  const filas = (desde, hasta) => `<table style="width:100%;border-collapse:collapse;${FUENTE}">${NORMATIVA_SST.slice(desde, hasta).map((t, i) => `<tr><td style="${c}font-size:8pt;font-weight:bold;text-align:justify;"> ${desde + i + 1}.- ${esc(t)}</td></tr>`).join('')}</table>`;
  return `${cab(1)}
    <div style="border:${L};padding:6px 8px;font-size:9.5pt;text-align:justify;margin-bottom:6px;">Con el propósito de proveer a sus trabajadores un ambiente de trabajo seguro y saludable, <b>La Empresa</b> establece la <b>Normativa Interna de Trabajo Seguro</b> que será comunicada a su personal para garantizar la prevención de accidentes y enfermedades ocupacionales. La Normativa de Trabajo Seguro intenta especificar métodos de trabajo para el desempeño de las funciones de los empleados de tienda. La violación de estas normas pudiera resultar en acciones disciplinarias. El éxito en el mantenimiento de un trabajo seguro dependerá de la cooperación continua de todos los trabajadores en la observación de esta Normativa.</div>
    ${filas(0, 19)}${bloqueFirma(v, { etiqueta: 'FIRMA' })}
    ${SALTO}${cab(2)}${filas(19, 42)}${bloqueFirma(v, { etiqueta: 'FIRMA' })}`;
}

/* ---------- 7 y 8. Trípticos de seguridad y salud en el trabajo ---------- */
function panelTriptico(titulo, cuerpo) {
  return `<div style="border:${L};margin:0 0 5px;page-break-inside:avoid;"><div style="background:#d9d9d9;border-bottom:${L};padding:2px 6px;font-weight:bold;font-size:9.5pt;">${esc(titulo)}</div><div style="padding:3px 8px;font-size:8.5pt;text-align:justify;">${cuerpo}</div></div>`;
}
function portadaTriptico(v, titulo) {
  return `${membrete(v)}<p style="text-align:center;font-size:15pt;font-weight:bold;margin:8px 0 2px;">${esc(titulo)}</p><p style="text-align:center;font-weight:bold;margin:0 0 12px;">Seguridad y Salud en el Trabajo (SST)</p>`;
}
function tripticoFuego(v) {
  return `${portadaTriptico(v, 'Actuación en caso de Fuego o Terremoto')}
  ${panelTriptico('Estaciones manuales', p('Acciona en caso de fuego: rompa el vidrio de la estación manual (<i>"En caso de incendio rompa el vidrio"</i>) y de aviso.', 'margin:0;'))}
  ${panelTriptico('Uso de extintor', `<ol style="margin:0;padding-left:6mm;"><li>Sujetar la boquilla. Tirar de la anilla.</li><li>Colocarse a 2-3 m. Apuntar a la base del fuego.</li><li>Presionar la palanca.</li></ol>${p('Hasta que desaparezca el fuego.', 'margin:6px 0 0;')}`)}
  ${panelTriptico('Si se produce un fuego', `${p('Mantén la calma.')}${p('Ponte en un lugar seguro.')}${p('Da aviso verbal a algún compañero para que accione la estación manual y avise a las demás personas o al centro de Control de Emergencias.')}${p('Si la magnitud del fuego lo permite, dispones de conocimientos en lucha contra incendios y sin ponerte en peligro, inicia la extinción con los extintores portátiles de tu zona.')}${p('Familiarízate con la ubicación y operación de los extintores.', 'margin:0;')}`)}
  ${panelTriptico('Normas de evacuación', `<ul style="margin:0;padding-left:6mm;"><li>Si el fuego no se puede controlar, por la magnitud que ha desarrollado, evacua el área y cierra las puertas que vayas traspasando.</li><li>Al activarse la señal de evacuación, abandona lo que estés haciendo, no recojas tus pertenencias y dirígete al Lugar Seguro o Punto de reunión.</li><li>Recuerda que en caso de haber gran cantidad de humo y fuego en los accesos, lo mejor es esperar en el interior de tu local o dependencia.</li><li>No uses los ascensores. Familiarízate con las vías de evacuación y salidas de emergencia, así como con la localización de los medios de emergencia (extintores portátiles, pulsadores de alarma, etc.).</li></ul>`)}
  ${panelTriptico('Tipos de extintores', `<ul style="margin:0;padding-left:6mm;"><li><b>Polvo Químico Seco (PQS):</b> especial para fuegos en madera, plástico, papeles, cartones, muebles…</li><li><b>Dióxido de Carbono</b> (carecen de “relojito"): especial para equipos eléctricos: lámparas, computadoras, fotocopiadoras, cables eléctricos…</li></ul>`)}
  ${panelTriptico('Terremoto', `${p('<b>¡AGÁCHESE! ¡CÚBRASE! ¡SUJÉTESE!</b>')}${p('<b>Haz esto:</b> después de que haya terminado el movimiento, permanezca en su sitio y espere instrucciones.', 'margin:0;')}`)}
  ${bloqueFirma(v, { etiqueta: 'FIRMA', compacto: true })}`;
}
function tripticoPrimerosAuxilios(v) {
  return `${portadaTriptico(v, 'Primeros auxilios básicos')}
  ${panelTriptico('Ante un accidente: P · A · S', `${p('<b>PROTEGE:</b> antes de intentar cualquier ayuda, verifica que la escena sea segura para ti, así evitarás resultar lesionado también.')}${p('<b>AVISA:</b> a tu supervisor, y a los Servicios de Emergencia.')}${p('<b>SOCORRE:</b> si posees conocimientos necesarios.', 'margin:0;')}`)}
  ${panelTriptico('Quemaduras', `${p('Aplica agua corriente de inmediato sobre el área afectada durante 10 minutos. Si no tienes agua, puedes emplear jugos, leche, cerveza; lo importante es enfriar la piel lo más pronto posible, busca ayuda médica.')}${p('Recordemos que existen diferentes tipos de quemaduras: de 1er grado, de 2do grado y de 3er grado, cuyo grado es determinado por un especialista de la salud.', 'margin:0;')}`)}
  ${panelTriptico('Atragantamiento · Maniobra de Heimlich', `${p('Siga estos pasos:')}${p('Empuña la mano. Coloca el puño en el abdomen por encima del ombligo. Sujeta el puño con la mano dominante. Presione en la zona con un movimiento rápido hacia atrás y hacia arriba. Si es necesario, repita este movimiento hasta que el objeto que obstruye las vías respiratorias salga.', 'margin:0;')}`)}
  ${panelTriptico('Hemorragia', `${p('Presiona sobre la herida hasta que cese la hemorragia. Aplica un vendaje compresivo.')}${p('La pérdida <b>masiva</b> de sangre, por hemorragias arteriales (arterias que recorren brazos y piernas) puede provocar la muerte en pocos minutos, por lo tanto, la hemorragia debe ser detenida lo antes posible. Procure atención médica.', 'margin:0;')}`)}
  ${panelTriptico('Desmayo', `${p('Generalmente ocurren por falta de oxígeno en el cerebro por mala circulación de sangre en el cerebro.')}${p('Afloja la ropa de la víctima y elévale los pies hasta que recupere el conocimiento. Procure atención médica. No le dé nada de comer ni de beber.', 'margin:0;')}`)}
  ${bloqueFirma(v, { etiqueta: 'FIRMA', compacto: true })}`;
}

/* ---------- 9. Acuse de recibo ---------- */
function acuseRecibo(v) {
  const c = `border:${L};padding:6px 8px;font-size:10pt;`;
  return `${membrete(v)}
  <p style="text-align:justify;font-size:10.5pt;margin:20px 0 12px;line-height:1.7;">Yo ${raya('62mm', v.NOMBRES_APELLIDOS)} C.I. N° ${raya('34mm', v.CEDULA)}; quien ingresó a la empresa <b>${esc(v.RAZON_SOCIAL)} RIF ${esc(v.RIF)}</b> en calidad de: ${raya('62mm', v.CARGO)}, hago constar que he recibido un ejemplar de los siguientes documentos:</p>
  <table style="border-collapse:collapse;margin:0 auto 16px;width:112mm;${FUENTE}">
    <tr><td style="${c}background:#555;color:#fff;text-align:center;font-weight:bold;">Documento</td><td style="${c}background:#555;color:#fff;width:16mm;text-align:center;">Recibido</td></tr>
    ${['Notificación de Riesgos', 'Normativa de Trabajo Seguro', 'Rutagrama'].map((t) => `<tr><td style="${c}text-align:center;">${t}</td><td style="${c}"></td></tr>`).join('')}
    <tr><td style="${c}">Trípticos de:<ul style="margin:4px 0 0;padding-left:14mm;"><li>Primeros Auxilios</li><li>Incendios</li><li>Evacuación de emergencia</li></ul></td><td style="${c}"></td></tr>
    <tr><td style="${c}height:12mm;">Otros:</td><td style="${c}"></td></tr></table>
  <p style="text-align:justify;font-size:10.5pt;margin:12px 0;">y firmo el presente documento, en reconocimiento de haber sido informado, haber recibido y comprendido el contenido de éstos, comprometiéndome a llevar a cabo las prescripciones contenidas en los mismos de conformidad con lo establecido en la Ley Orgánica de Prevención, Condiciones y Medio Ambiente del Trabajo (LOPCYMAT)</p>
  ${bloqueFirma(v, { etiqueta: 'FIRMA DEL TRABAJADOR', ci: false, fecha: true })}`;
}

/* ---------- 10. Carta de prestaciones sociales (Art. 143 LOTTT) ---------- */
function cartaPrestaciones(v) {
  return `${membrete(v)}
  <p style="margin:18px 0 4px;">Señores:</p><p style="margin:0 0 18px;"><b>${esc(v.RAZON_SOCIAL)}</b></p>
  <p style="text-align:justify;line-height:1.8;font-size:10.5pt;">Yo, ${raya('72mm', v.NOMBRES_APELLIDOS)}, titular de la cédula de identidad N° ${raya('36mm', v.CEDULA)}, en mi carácter de trabajador(a) de esta empresa, por medio de la presente manifiesto a ustedes; que en cumplimiento del Artículo 143 de la Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras, autorizo que el depósito de garantías de prestaciones sociales sean acreditadas en:</p>
  <div style="margin:14px 0 14px 12mm;line-height:2.4;font-size:10.5pt;">${caja()} Fideicomiso Individual<br/>${caja()} Fondo Nacional de Prestaciones Sociales<br/>${caja()} Contabilidad de la Empresa</div>
  <p style="font-size:10.5pt;">Así mismo, autorizo que los Intereses generados durante Un (1) Año sean:</p>
  <div style="margin:10px 0 18px 12mm;line-height:2.4;font-size:10.5pt;">${caja()} Pagados al cumplir cada Año de Servicio<br/>${caja()} Capitalizados</div>
  <table style="width:100%;border-collapse:collapse;${FUENTE}margin-top:22px;"><tr>
    <td style="vertical-align:bottom;font-size:10pt;line-height:2;">Nombre y Apellido: ${raya('62mm', v.NOMBRES_APELLIDOS)}<br/>Cedula: ${raya('40mm', v.CEDULA)}<div style="margin-top:42px;text-align:center;width:70mm;border-top:${L};">Firma</div></td>
    <td style="width:36mm;vertical-align:bottom;text-align:center;font-size:8.5pt;"><div style="width:30mm;height:34mm;border:${L};margin:0 auto 3px;"></div>Huella</td></tr></table>`;
}

/* ---------- 11. Ficha del trabajador (RNET) ---------- */
function fichaTrabajador(v) {
  const c = `border:${L};padding:3px 5px;vertical-align:top;font-size:8pt;`;
  const sn = (t) => `${t}<div style="margin-top:3px;">SÍ ${caja()}&nbsp;&nbsp;&nbsp;NO ${caja()}</div>`;
  const nivel = '<div style="font-size:7.5pt;margin-top:3px;">En caso de ser positivo indique el nivel:<br/>Leve ' + caja() + ' Moderado ' + caja() + ' Grave ' + caja() + '</div>';
  const preg = (t) => `<td style="${c}">${sn(t)}${nivel}</td>`;
  const sub = (t) => `<td style="${c}"><b>${t}</b>`;
  const variables = `
  <p style="text-align:center;font-weight:bold;font-size:9.5pt;background:#d9d9d9;border:${L};margin:0;padding:4px;">EXCLUSIVO PARA EL LLENADO DEL DEPARTAMENTO DE RECLUTAMIENTO Y SELECCIÓN<br/>(DATOS VARIABLES)</p>
  <table style="width:100%;border-collapse:collapse;table-layout:fixed;${FUENTE}">
    <tr><td style="${c}"><b>Tipo de trabajador:</b><br/>${['De Dirección', 'De Inspección o Vigilancia', 'Aprendiz INCES', 'Pasante', 'Trabajador Calificado', 'Trabajador no Calificado'].map((t) => `${t} ${caja()}`).join('<br/>')}</td>
      <td style="${c}"><b>Tipo de Jornada:</b><br/>${['DIURNA', 'NOCTURNA', 'MIXTA'].map((t) => `<div style="margin:5px 0;">${t} ${caja()}</div>`).join('')}</td>
      <td style="${c}"><b>Tipo de Contrato:</b><br/>${['Tiempo Determinado', 'Tiempo Indeterminado', 'Obra Determinada'].map((t) => `<div style="margin:5px 0;">${t} ${caja()}</div>`).join('')}</td></tr>
    <tr><td style="${c}"><b>Horas semanales</b><br/>Horas laboradas: ${raya('14mm')}<br/>Horas Extras Laboradas: ${raya('14mm')}<br/>Horas Nocturnas Laboradas: ${raya('14mm')}</td>
      <td style="${c}"><b>¿Labora los días Domingos?:</b><br/>SÍ ${caja()}&nbsp;&nbsp;NO ${caja()}</td>
      <td style="${c}"><b>Información RNET</b><br/>ESPECIALIZACIÓN: ${raya('26mm')}<br/>COD. OCUPACIÓN: ${raya('26mm')}<br/>SUB-PROCESO: ${raya('26mm')}</td></tr>
    <tr><td colspan="2" style="${c}"><b>¿Cantidad de Carga Familiar?</b> ${raya('20mm')}<br/><br/>De acuerdo a la Gaceta Oficial Nro. 40655 publicada 7 de mayo de 2015 resolución Nro. 9108 en el art. 9, solicitamos al personal femenino indicar: ¿Está Embarazada? SÍ ${caja()} NO ${caja()}<br/>Tiempo de Embarazo: ${raya('30mm')}</td>
      <td style="${c}"></td></tr>
    <tr><td style="${c}">N° de hijos beneficiarios Educación Inicial: ${raya('12mm')}</td><td style="${c}">Monto mensual por Educación Inicial: ${raya('18mm')}</td><td style="${c}">Cantidad de familiar con Discapacidad: ${raya('12mm')}<br/><b>Datos Sindicales</b> ¿está sindicalizado? SÍ ${caja()} NO ${caja()}</td></tr></table>`;
  const fija = `
  <p style="text-align:center;font-weight:bold;font-size:13pt;margin:0 0 6px;">FICHA DEL TRABAJADOR</p>
  <table style="width:100%;border-collapse:collapse;${FUENTE}font-size:8.5pt;margin-bottom:4px;">
    <tr><td style="${c}"><b>RAZÓN SOCIAL: ${esc(v.RAZON_SOCIAL)}</b></td><td style="${c}"><b>CARGO:</b> ${esc(v.CARGO)}</td></tr>
    <tr><td style="${c}"><b>APELLIDOS Y NOMBRES:</b> ${esc(v.APELLIDOS_NOMBRES)}</td><td style="${c}"><b>CÉDULA:</b> ${esc(v.CEDULA)}</td></tr></table>
  <p style="font-size:8pt;font-weight:bold;margin:4px 0;">Para dar cumplimiento al decreto emitido en la Gaceta oficial Nro. 40655 publicada el 7 de Mayo de 2015 resolución Nro. 9108 en el Art. 9, solicitamos al personal indicar:</p>
  <p style="text-align:center;font-weight:bold;font-size:9pt;margin:4px 0;">EXCLUSIVO PARA EL LLENADO DEL TRABAJADOR (DATOS FIJOS)</p>
  <table style="width:100%;border-collapse:collapse;table-layout:fixed;${FUENTE}">
    <tr><td style="${c}height:11mm;">Indique N° de certificación antes el CONAPDIS:</td><td style="${c}">Indique Nro. de Carnet de Discapacidad:</td><td style="${c}">Fecha de vencimiento:</td></tr>
    <tr>${preg('¿Posee alguna enfermedad ocupacional?:')}${preg('¿Posee discapacidad auditiva?:')}${preg('¿Posee discapacidad visual?:')}</tr>
    <tr>${preg('¿Posee discapacidad intelectual?:')}${preg('¿Posee discapacidad Mental?:')}${preg('¿Posee discapacidad músculo esquelética?:')}</tr>
    <tr>${preg('¿Posee discapacidad por accidente de trabajo?:')}${preg('¿Posee otro tipo de discapacidad?:')}<td style="${c}"><b>Pertenece alguna Etnia Indígena:</b><div style="margin-top:3px;">SÍ ${caja()}&nbsp;&nbsp;&nbsp;NO ${caja()}</div><div style="margin-top:14px;">Especifique:</div></td></tr>
    <tr><td colspan="2" style="${c}height:14mm;">¿Asiste actualmente a alguna terapia? Especifique:</td><td style="${c}">¿Desde hace cuánto padece la discapacidad?</td></tr>
    <tr><td colspan="2" style="${c}height:22mm;">¿Cuál fue el origen de la discapacidad? Especifique:</td><td style="${c}">¿Tiene algún familiar con discapacidad a su cargo?<div style="margin:3px 0;">SÍ ${caja()} NO ${caja()}</div><div style="font-size:7.5pt;">De ser positivo Especifique:<br/>Nombres y Apellidos: ${raya('26mm')}<br/>Edad: ${raya('10mm')} Sexo: ${raya('10mm')}<br/>Tipo de Discapacidad y nivel: ${raya('18mm')}<br/>Nro. de Certificación Conapdis: ${raya('14mm')}</div></td></tr></table>
  <p style="font-size:8.5pt;margin:12px 0 4px;">Certifico que todos los datos aquí suministrados son verdaderos. Firma: ${raya('44mm')} C.I.: ${raya('30mm', v.CEDULA)}</p>
  <p style="font-size:8.5pt;margin:4px 0 10px;">En la ciudad de ${raya('36mm')} a los ${raya('10mm')} del mes de ${raya('28mm')} de ${raya('18mm')}.</p>
  <table style="width:100%;border-collapse:collapse;${FUENTE}"><tr><td style="text-align:center;font-size:8pt;"><div style="width:28mm;height:30mm;border:${L};margin:0 auto 2px;"></div>Huella Pulgar Izquierdo</td><td style="text-align:center;font-size:8pt;"><div style="width:28mm;height:30mm;border:${L};margin:0 auto 2px;"></div>Huella Pulgar Derecho</td></tr></table>`;
  return `${membrete(v)}${variables}${SALTO}${fija}`;
}

const CONSTRUCTORES = {
  'hoja-de-vida': hojaDeVida,
  'antecedente-clinico': antecedenteClinico,
  'normas-reglamento-tienda': normasTienda,
  'notificacion-de-riesgos': notificacionRiesgos,
  'normativa-trabajo-seguro': normativaSST,
  'triptico-fuego-terremoto': tripticoFuego,
  'triptico-primeros-auxilios': tripticoPrimerosAuxilios,
  'acuse-de-recibo': acuseRecibo,
  'carta-de-prestaciones': cartaPrestaciones,
  'ficha-trabajador': fichaTrabajador,
};
/* HTML de un documento de tienda con los datos del trabajador (vars de variablesDocsTienda). Para la ruta habitual devuelve '' (la arma la aplicación). */
export function htmlDocTienda(clave, vars) {
  const f = CONSTRUCTORES[clave];
  return f ? envoltura(clave, f(vars)) : '';
}
/* Texto plano de un documento (para pruebas y búsquedas) */
export function textoDocTienda(clave, vars) {
  return htmlDocTienda(clave, vars).replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
export const FECHA_MESES = MESES;
