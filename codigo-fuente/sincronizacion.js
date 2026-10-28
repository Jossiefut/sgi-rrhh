/* Lectura del formulario "Jornada de Actualización de datos Futura Retail" y de la
   plantilla de BI. Funciones puras: se usan en la app y en la carga inicial. */

/* Nombre de tienda siempre con la marca al inicio: "Balú Propatria", "Planeta Sambil Valencia", "Balú Oficinas administrativas" */
const NOMBRE_MARCA = { BALU: 'Balú', PLANETA: 'Planeta' };
export function nombreConMarca(t) {
  const m = NOMBRE_MARCA[t && t.marca];
  const crudo = String((t && t.nombre) || '').trim();
  if (!m || !crudo) return crudo;
  const limpio = crudo.replace(/^(bal[uú]|planeta)\s+/i, '').replace(/\s+(bal[uú]|planeta)$/i, '').trim();
  return `${m} ${limpio}`;
}
export const TIENDAS_REALES = [
  { id: 'T01', marca: 'BALU', nombre: 'Propatria', formato: 'OUTLET', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'T02', marca: 'BALU', nombre: 'Lido', formato: 'D', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'T03', marca: 'BALU', nombre: 'La Cascada', formato: 'D', ciudad: 'Carrizal' , estado: 'Miranda' },
  { id: 'T04', marca: 'BALU', nombre: 'Sambil San Cristóbal', formato: 'SAN_CRISTOBAL', ciudad: 'San Cristóbal' , estado: 'Táchira' },
  { id: 'T05', marca: 'BALU', nombre: 'Sambil Valencia', formato: 'POR_DEFINIR', ciudad: 'Valencia' , estado: 'Carabobo' },
  { id: 'T06', marca: 'BALU', nombre: 'Orinokia Mall', formato: 'POR_DEFINIR', ciudad: 'Puerto Ordaz' , estado: 'Bolívar' },
  { id: 'T07', marca: 'BALU', nombre: 'Sabana Grande', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'T08', marca: 'BALU', nombre: 'Las Delicias (Chacaíto)', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'T09', marca: 'BALU', nombre: 'Sambil La Candelaria', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'T10', marca: 'BALU', nombre: 'El Recreo', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'T11', marca: 'BALU', nombre: 'Sambil Barquisimeto', formato: 'POR_DEFINIR', ciudad: 'Barquisimeto' , estado: 'Lara' },
  { id: 'T12', marca: 'BALU', nombre: 'Líder', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'T13', marca: 'BALU', nombre: 'Millenium', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'T14', marca: 'BALU', nombre: 'Tolón', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'T15', marca: 'BALU', nombre: 'Sambil Caracas', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'T16', marca: 'BALU', nombre: 'Sambil Margarita', formato: 'POR_DEFINIR', ciudad: 'Pampatar' , estado: 'Nueva Esparta' },
  { id: 'T17', marca: 'BALU', nombre: 'Sambil Maracaibo', formato: 'POR_DEFINIR', ciudad: 'Maracaibo' , estado: 'Zulia' },
  { id: 'T18', marca: 'BALU', nombre: 'San Francisco Mall', formato: 'POR_DEFINIR', ciudad: 'San Francisco' , estado: 'Zulia' },
  { id: 'T19', marca: 'BALU', nombre: 'Aviadores', formato: 'POR_DEFINIR', ciudad: 'Maracay' , estado: 'Aragua' },
  { id: 'P01', marca: 'PLANETA', nombre: 'Planeta Orinokia Mall', formato: 'POR_DEFINIR', ciudad: 'Puerto Ordaz' , estado: 'Bolívar' },
  { id: 'P02', marca: 'PLANETA', nombre: 'Planeta Sambil Valencia', formato: 'POR_DEFINIR', ciudad: 'Valencia' , estado: 'Carabobo' },
  { id: 'P03', marca: 'PLANETA', nombre: 'Planeta Sambil La Candelaria', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Distrito Capital' },
  { id: 'P04', marca: 'PLANETA', nombre: 'Planeta Sambil Barquisimeto', formato: 'POR_DEFINIR', ciudad: 'Barquisimeto' , estado: 'Lara' },
  { id: 'P05', marca: 'PLANETA', nombre: 'Planeta Ciudad Tamanaco', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'P06', marca: 'PLANETA', nombre: 'Planeta Sambil Chacao NA', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'P07', marca: 'PLANETA', nombre: 'Planeta Sambil San Cristóbal', formato: 'POR_DEFINIR', ciudad: 'San Cristóbal' , estado: 'Táchira' },
  { id: 'P08', marca: 'PLANETA', nombre: 'Planeta Sambil Maracaibo', formato: 'POR_DEFINIR', ciudad: 'Maracaibo' , estado: 'Zulia' },
  { id: 'P09', marca: 'PLANETA', nombre: 'Planeta San Francisco Mall', formato: 'POR_DEFINIR', ciudad: 'San Francisco' , estado: 'Zulia' },
  { id: 'P10', marca: 'PLANETA', nombre: 'Planeta Sambil Chacao NL', formato: 'POR_DEFINIR', ciudad: 'Caracas' , estado: 'Miranda' },
  { id: 'P11', marca: 'PLANETA', nombre: 'Planeta Centro Nacional de Tenis', formato: 'POR_DEFINIR', ciudad: 'Puerto Cabello' , estado: 'Carabobo' },
  { id: 'P12', marca: 'PLANETA', nombre: 'Planeta Sambil Margarita', formato: 'POR_DEFINIR', ciudad: 'Pampatar' , estado: 'Nueva Esparta' },
  { id: 'OFB', marca: 'BALU', nombre: 'Oficinas administrativas Balú', formato: 'OFICINA', administrativa: true, ciudad: 'Caracas', estado: 'Miranda', direccion: 'Avenida Principal, Centro Comercial Sambil, Nivel Libertador, Local C43/44, Sector Plaza El Arte, Caracas, Chacao, Miranda' },
  { id: 'OFP', marca: 'PLANETA', nombre: 'Planeta Oficinas administrativas', formato: 'OFICINA', administrativa: true, ciudad: 'Caracas', estado: 'Miranda', direccion: 'Torre Gelomaca, Caracas, Miranda' },
].map((t) => ({ ...t, activa: true, nombre: nombreConMarca(t) }));

/* Palabras clave del texto de tienda del formulario → id por marca (en orden de prioridad) */
const CLAVES_TIENDA = [
  ['chacao nl', '', 'P10'], ['chacao na', '', 'P06'], ['centro nacional de tenis', '', 'P11'], ['tenis', '', 'P11'], ['puerto cabello', '', 'P11'],
  ['san cristobal', 'T04', 'P07'], ['tamanaco', '', 'P05'], ['aviadores', 'T19', ''], ['orinokia', 'T06', 'P01'],
  ['sambil valencia', 'T05', 'P02'], ['valencia', 'T05', 'P02'], ['recreo', 'T10', ''], ['propatria', 'T01', ''],
  ['candelaria', 'T09', 'P03'], ['delicias', 'T08', ''], ['chacaito', 'T08', ''], ['sabana grande', 'T07', ''],
  ['barquisimeto', 'T11', 'P04'], ['cascada', 'T03', ''], ['lido', 'T02', ''], ['lider', 'T12', ''],
  ['millenium', 'T13', ''], ['millennium', 'T13', ''], ['tolon', 'T14', ''], ['sambil caracas', 'T15', 'P06'],
  ['margarita', 'T16', 'P12'], ['chacao', 'T15', 'P06'], ['maracaibo', 'T17', 'P08'], ['san francisco', 'T18', 'P09'],
];
const CARGOS_FORMULARIO = [
  ['subgerente', 'SUB'], ['sub gerente', 'SUB'], ['gerente de tienda', 'GT'], ['cajero principal', 'CAJT'], ['cajera principal', 'CAJT'],
  ['cajero titular', 'CAJT'], ['cajera titular', 'CAJT'], ['cajer', 'CAJ'],
  ['asesor', 'ASE'], ['jefe de almacen', 'JALM'], ['jefa de almacen', 'JALM'], ['almacenista', 'ALM'], ['ayudante', 'ALM'], ['depositario', 'ALM'],
  ['visual', 'VM'], ['seguridad', 'SEG'],
];

export function normalizar(t) {
  return String(t === null || t === undefined ? '' : t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/* ---------- Ortografía de la data importada ----------
   Corrección conservadora y sin diccionario externo: espacios, signos, mayúsculas/minúsculas y tildes de las palabras conocidas
   del ámbito de RRHH, tiendas y geografía venezolana. Los nombres y apellidos NO se tildan: se respeta la escritura del documento de identidad. */
const TILDES = {
  administracion: 'administración', almacen: 'almacén', educacion: 'educación', tecnico: 'técnico', tecnica: 'técnica', ingenieria: 'ingeniería', contaduria: 'contaduría',
  gestion: 'gestión', comunicacion: 'comunicación', remuneracion: 'remuneración', supervision: 'supervisión', informatica: 'informática', capacitacion: 'capacitación',
  formacion: 'formación', direccion: 'dirección', seleccion: 'selección', nomina: 'nómina', logistica: 'logística', mercadeo: 'mercadeo', economia: 'economía',
  psicologia: 'psicología', sociologia: 'sociología', mecanica: 'mecánica', electronica: 'electrónica', electrica: 'eléctrica', electricista: 'electricista', quimica: 'química',
  matematica: 'matemática', biologia: 'biología', arquitectura: 'arquitectura', publicidad: 'publicidad', turismo: 'turismo', comercializacion: 'comercialización',
  produccion: 'producción', operacion: 'operación', operaciones: 'operaciones', atencion: 'atención', relacion: 'relación', relaciones: 'relaciones', condicion: 'condición', condiciones: 'condiciones',
  gerencia: 'gerencia', secretaria: 'secretaría', auxiliar: 'auxiliar', seguridad: 'seguridad', prevencion: 'prevención', evaluacion: 'evaluación', ubicacion: 'ubicación', informacion: 'información',
  telefono: 'teléfono', numero: 'número', codigo: 'código', cedula: 'cédula', nacion: 'nación', beneficios: 'beneficios', horarios: 'horarios', salarial: 'salarial', salariales: 'salariales',
  ambiente: 'ambiente', reconocimiento: 'reconocimiento', trato: 'trato', dias: 'días', dia: 'día', tambien: 'también', mas: 'más', ademas: 'además', aqui: 'aquí', asi: 'así', unico: 'único', unica: 'única',
  esta: 'está', estan: 'están', mejoria: 'mejoría', companeros: 'compañeros', companera: 'compañera', companero: 'compañero', compania: 'compañía', ano: 'año', anos: 'años',
  /* geografía */
  tachira: 'Táchira', merida: 'Mérida', bolivar: 'Bolívar', anzoategui: 'Anzoátegui', falcon: 'Falcón', guarico: 'Guárico', monagas: 'Monagas', sucre: 'Sucre', trujillo: 'Trujillo',
  carabobo: 'Carabobo', miranda: 'Miranda', aragua: 'Aragua', lara: 'Lara', zulia: 'Zulia', yaracuy: 'Yaracuy', portuguesa: 'Portuguesa', barinas: 'Barinas', apure: 'Apure', amazonas: 'Amazonas',
  cristobal: 'Cristóbal', maturin: 'Maturín', cumana: 'Cumaná', cabimas: 'Cabimas', maracay: 'Maracay', barcelona: 'Barcelona', guarenas: 'Guarenas', guatire: 'Guatire', valera: 'Valera',
  chacaito: 'Chacaíto', chacao: 'Chacao', tolon: 'Tolón', lider: 'Líder', recreo: 'Recreo', lido: 'Lido', cascada: 'Cascada', candelaria: 'Candelaria', propatria: 'Propatria', aviadores: 'Aviadores',
  tamanaco: 'Tamanaco', orinokia: 'Orinokia', millenium: 'Millenium', sambil: 'Sambil', balu: 'Balú', tenis: 'Tenis', margarita: 'Margarita', caracas: 'Caracas', valencia: 'Valencia',
  maracaibo: 'Maracaibo', barquisimeto: 'Barquisimeto', libertador: 'Libertador', baruta: 'Baruta', hatillo: 'Hatillo', carrizal: 'Carrizal', 'puerto cabello': 'Puerto Cabello',
};
const CONECTORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'o', 'u', 'en', 'a', 'al', 'con', 'por', 'para']);
const sinTilde = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function conTildes(palabra, cap) {
  const r = TILDES[sinTilde(palabra)];
  if (!r) return palabra;
  /* Conserva la mayúscula inicial o el texto todo en mayúsculas que traía la palabra */
  if (palabra === palabra.toUpperCase() && palabra.length > 1 && !cap) return r.toUpperCase();
  return palabra.charAt(0) === palabra.charAt(0).toUpperCase() && palabra.charAt(0) !== palabra.charAt(0).toLowerCase() ? r.charAt(0).toUpperCase() + r.slice(1) : r;
}
/* modo 'titulo': direcciones, lugares, cargos (cada palabra con inicial mayúscula) · 'oracion': títulos, motivos y comentarios (primera letra mayúscula) */
export function corregirTexto(t, modo = 'oracion') {
  let x = String(t === null || t === undefined ? '' : t).replace(/\s+/g, ' ').trim();
  if (!x) return '';
  x = x.replace(/\s+([,.;:!?])/g, '$1').replace(/([,;:])(?=\S)/g, '$1 ').replace(/\s+/g, ' ').replace(/[;,]\s*$/, '').trim();
  const todoMin = x === x.toLowerCase(); const todoMay = x === x.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(x);
  if (modo === 'titulo') {
    x = x.toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => `${a}${b.toUpperCase()}`);
    x = x.replace(/\s(\p{Lu})(\p{L}*)/gu, (m, a, b) => (CONECTORES.has((a + b).toLowerCase()) ? ` ${(a + b).toLowerCase()}` : m));
  } else if (todoMin || todoMay) {
    x = x.toLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, (m, a, b) => `${a}${b.toUpperCase()}`);
  } else {
    x = x.replace(/^(\p{Ll})/u, (m) => m.toUpperCase());
  }
  /* Siglas habituales que deben quedar en mayúsculas */
  x = x.replace(/\b(c\.?c\.?|ci|rif|tsu|c\.a\.|s\.a\.|rrhh)\b/gi, (m) => m.toUpperCase());
  return x.replace(/\p{L}+/gu, (w) => conTildes(w, modo === 'titulo'));
}
export function soloDigitos(t) { return String(t === null || t === undefined ? '' : t).replace(/\D/g, ''); }
const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'da', 'van', 'von']);
export function tituloNombre(t) {
  return String(t || '').trim().replace(/\s+/g, ' ').toLowerCase().split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1))).join(' ');
}
export function tiendaDesdeTexto(texto, marca) {
  const crudo = normalizar(texto);
  if (marca === 'PLANETA' && /(^|[^a-z])c\.?\s?c\.?\s?c\.?\s?t(\.|$|[^a-z])/.test(crudo)) return 'P05';
  const n = crudo.replace(/c\.\s?c\./g, '').replace(/centro comercial/g, '');
  if (!n) return '';
  for (const [clave, balu, planeta] of CLAVES_TIENDA) {
    if (n.includes(clave)) return (marca === 'PLANETA' ? planeta : balu) || '';
  }
  return '';
}
export function cargoDesdeTexto(texto) {
  /* "SUB-GERENTE DE TIENDA", "ASESOR (A) DE VENTAS", "JEFE (A) DE ALMACÉN": se quitan guiones y la marca de género (a)/(o) */
  const n = normalizar(texto).replace(/\s?\((a|o|as|os)\)/g, '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  if (!n) return '';
  for (const [clave, id] of CARGOS_FORMULARIO) if (n.includes(clave)) return id;
  return '';
}
function pad2(n) { return String(n).padStart(2, '0'); }
/* Fecha a ISO: número serial de Excel, "dd/mm/aaaa", "dd/mm/aaaa hh:mm", "aaaa-mm-dd" o Date */
export function fechaISO(v) {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}`;
  if (typeof v === 'number' && v > 10000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) {
    let y = Number(m[3]); if (y < 100) y += y > 40 ? 1900 : 2000;
    const dia = Number(m[1]); const mes = Number(m[2]);
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return '';
    return `${y}-${pad2(mes)}-${pad2(dia)}`;
  }
  return '';
}

/* Marca de tiempo numerica (fecha y hora) de una respuesta del formulario; sirve para saber cual registro repetido es el ultimo */
export function marcaDeTiempo(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.getTime();
  if (typeof v === 'number' && v > 10000 && v < 80000) return Math.round((v - 25569) * 86400000);
  const s = String(v).trim();
  const hora = (t) => { const h = (t || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?m\.?)?/i); if (!h) return 0; let hh = Number(h[1]); const ap = (h[4] || '').toLowerCase(); if (ap.startsWith('p') && hh < 12) hh += 12; if (ap.startsWith('a') && hh === 12) hh = 0; return ((hh * 60 + Number(h[2])) * 60 + Number(h[3] || 0)) * 1000; };
  const f = fechaISO(s);
  if (!f) return 0;
  const [y, m, d] = f.split('-').map(Number);
  return Date.UTC(y, m - 1, d) + hora(s.replace(/^\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}/, ''));
}

/* Matriz (primera fila = encabezados) → fichas. No toma datos bancarios ni de salud. */
export function fichasDesdeFormulario(matriz, fuente = 'Formulario de actualización de datos') {
  const avisos = [];
  if (!matriz || matriz.length < 2) return { fichas: [], avisos: ['El archivo no tiene filas de datos.'] };
  const enc = matriz[0].map((h) => normalizar(h));
  const col = (inicio) => enc.findIndex((h) => h === inicio || h.startsWith(inicio));
  const idx = {
    fin: col('hora de finalizacion'), nombres: col('coloque sus nombres'), apellidos: col('coloque sus apellidos'), genero: col('genero'),
    cedula: col('cedula de identidad'), nacionalidad: col('nacionalidad'), zurdo: col('zurdo'), rif: col('numero de rif'), nacimiento: col('fecha de nacimiento'),
    vivienda: col('tipo de vivienda'), civil: col('estado civil'), conyuge: col('nombre del conyugue'), cedConyuge: col('numero de cedula del conyugue'),
    padresViven: col('padres viven'), padre: col('datos de padre'), madre: col('datos de madre'), cantHijos: col('cantidad de hijos'),
    correo: col('correo electronico de contacto'), correoGerente: col('correo electronico alternativo'), estadoReside: col('¿en que estado reside'),
    calle: col('direccion: (calle'), sector: col('direccion: (nombre sector'), edificio: col('direccion: (nombre/numero'), municipio: col('direccion: (municipio'),
    telefono: col('numero de telefonos'), postal: col('codigo postal'), entorno: col('entorno de trabajo'),
    educacion: col('educacion: ultimo titulo'), educacionComp: col('educacion complementaria'), emergencia1: col('a quien llamar en caso de emergencia'),
    camisa: col('talla de camisa'), pantalon: col('talla de pantalon'), calzado: col('talla de calzado'),
    nacionalidad2: enc.findIndex((h) => h === 'nacionalidad1'), tieneHijos: enc.findIndex((h) => h === 'hijos'),
    discapacidad: col('personal con discapacidad'), conapdis: col('¿inscrito en el conapdis'),
  };
  if (idx.cedula < 0 || idx.nombres < 0) return { fichas: [], avisos: ['No se reconocen las columnas del formulario (falta "Cédula de Identidad" o "Coloque sus nombres completos").'] };
  const emergencia2 = enc.findIndex((h) => h.startsWith('a quien llamar en caso de emergencia (2)'));
  const varias = (prefijo) => enc.map((h, i) => (h.startsWith(prefijo) ? i : -1)).filter((i) => i >= 0);
  const colsUnidad = varias('unidad de negocio');
  const colsCargo = varias('cargo');
  const colsEstado = varias('¿en que estado labora');
  const colsTienda = varias('tienda en ');
  const hijosCols = [1, 2, 3, 4].map((n) => ({ nombre: col(`nombre de hijo (${n})`), fecha: col(`fecha de nacimiento de hijo (${n})`), cedula: col(`cedula de hijo (${n})`) }));
  const v = (fila, i) => (i >= 0 && fila[i] !== undefined && fila[i] !== null ? String(fila[i]).trim() : '');
  const primero = (fila, cols) => { for (const i of cols) { const x = v(fila, i); if (x) return x; } return ''; };
  const porCedula = new Map();
  const duplicadas = new Map();
  matriz.slice(1).forEach((fila, n) => {
    if (!fila || !fila.some((x) => String(x === null || x === undefined ? '' : x).trim())) return;
    const ced = soloDigitos(v(fila, idx.cedula));
    if (ced.length < 5 || ced.length > 10) { avisos.push(`Fila ${n + 2}: cédula no válida ("${v(fila, idx.cedula)}").`); return; }
    const unidad = primero(fila, colsUnidad);
    const marca = /planeta/i.test(unidad) ? 'PLANETA' : /bal/i.test(unidad) ? 'BALU' : '';
    const tiendaTexto = primero(fila, colsTienda);
    const cargoTexto = primero(fila, colsCargo);
    const entorno = v(fila, idx.entorno);
    const extranjero = /extranjer/i.test(v(fila, idx.nacionalidad));
    const ficha = {
      id: ced, cedula: ced, letra: extranjero ? 'E' : 'V', fuente, respuesta: fechaISO(v(fila, idx.fin)) || '', respuestaTs: marcaDeTiempo(idx.fin >= 0 ? fila[idx.fin] : ''),
      nombres: tituloNombre(v(fila, idx.nombres)), apellidos: tituloNombre(v(fila, idx.apellidos)), genero: v(fila, idx.genero),
      nacionalidad: v(fila, idx.nacionalidad), nacionalidadDetalle: v(fila, idx.nacionalidad2), tieneHijos: corregirTexto(v(fila, idx.tieneHijos)), zurdo: v(fila, idx.zurdo), rif: v(fila, idx.rif).toUpperCase(), fechaNacimiento: fechaISO(fila[idx.nacimiento]),
      tipoVivienda: corregirTexto(v(fila, idx.vivienda)), estadoCivil: corregirTexto(v(fila, idx.civil)),
      conyuge: { nombre: tituloNombre(v(fila, idx.conyuge)), cedula: soloDigitos(v(fila, idx.cedConyuge)) },
      padresViven: corregirTexto(v(fila, idx.padresViven)), padre: corregirTexto(v(fila, idx.padre)), madre: corregirTexto(v(fila, idx.madre)),
      hijos: hijosCols.map((h) => ({ nombre: tituloNombre(v(fila, h.nombre)), fechaNacimiento: fechaISO(fila[h.fecha]), cedula: soloDigitos(v(fila, h.cedula)) })).filter((h) => h.nombre),
      cantidadHijos: v(fila, idx.cantHijos), correo: v(fila, idx.correo).toLowerCase(), correoGerente: v(fila, idx.correoGerente).toLowerCase(),
      estadoResidencia: corregirTexto(v(fila, idx.estadoReside), 'titulo'),
      direccion: { calle: corregirTexto(v(fila, idx.calle), 'titulo'), sector: corregirTexto(v(fila, idx.sector), 'titulo'), edificio: corregirTexto(v(fila, idx.edificio), 'titulo'), municipio: corregirTexto(v(fila, idx.municipio), 'titulo') },
      telefono: soloDigitos(v(fila, idx.telefono)), codigoPostal: v(fila, idx.postal),
      entorno: corregirTexto(entorno), unidadNegocio: corregirTexto(unidad), marca, cargoTexto: corregirTexto(cargoTexto, 'titulo'), cargoId: /oficina/i.test(entorno) ? 'ADM' : cargoDesdeTexto(cargoTexto), estadoLabora: corregirTexto(primero(fila, colsEstado), 'titulo'), tiendaTexto: corregirTexto(tiendaTexto, 'titulo'),
      tiendaId: /oficina/i.test(entorno) ? (marca === 'PLANETA' ? 'OFP' : 'OFB') : tiendaDesdeTexto(tiendaTexto, marca),
      educacion: corregirTexto(v(fila, idx.educacion)), educacionComplementaria: corregirTexto(v(fila, idx.educacionComp)),
      emergencia1: corregirTexto(v(fila, idx.emergencia1), 'titulo'), emergencia2: corregirTexto(v(fila, emergencia2), 'titulo'),
      tallas: { camisa: v(fila, idx.camisa), pantalon: v(fila, idx.pantalon), calzado: v(fila, idx.calzado) },
      /* Datos sensibles: solo los ve RRHH; en la nube viajan a una tabla aparte con acceso exclusivo de RRHH */
      discapacidad: { tiene: corregirTexto(v(fila, idx.discapacidad)), conapdis: corregirTexto(v(fila, idx.conapdis)) },
    };
    /* Más de un registro por cédula: se toma el más reciente (el segundo) y se informa cuántos hay y de qué fechas */
    const previa = porCedula.get(ced);
    if (!previa) { ficha.numRegistros = 1; ficha.respuestasPrevias = []; porCedula.set(ced, ficha); return; }
    const total = (previa.numRegistros || 1) + 1;
    const fechas = (p) => [...(p.respuestasPrevias || []), p.respuesta].filter(Boolean);
    const campos = ['telefono', 'correo', 'estadoResidencia', 'direccion', 'tiendaId', 'cargoTexto', 'educacion', 'estadoCivil', 'emergencia1', 'tallas'];
    const nuevaGana = (ficha.respuestaTs || 0) >= (previa.respuestaTs || 0); /* gana siempre la ultima respuesta (fecha y hora); en empate, la que aparece despues */
    const gana = nuevaGana ? ficha : previa; const pierde = nuevaGana ? previa : ficha;
    gana.numRegistros = total;
    gana.respuestasPrevias = nuevaGana ? fechas(previa) : [...(previa.respuestasPrevias || []), ficha.respuesta].filter(Boolean);
    const cambios = campos.filter((k) => JSON.stringify(gana[k] || '') !== JSON.stringify(pierde[k] || ''));
    const dup = duplicadas.get(ced) || { cedula: ced, nombre: `${gana.nombres} ${gana.apellidos}`.trim(), anterior: pierde, cambios: [] };
    dup.cambios = [...new Set([...dup.cambios, ...cambios])]; dup.registros = total; dup.fechas = [...gana.respuestasPrevias, gana.respuesta].filter(Boolean);
    duplicadas.set(ced, dup);
    porCedula.set(ced, gana);
  });
  return { fichas: Array.from(porCedula.values()), avisos, duplicadas: Array.from(duplicadas.values()) };
}

/* Plantilla de BI: columnas cedula y fecha de ingreso (cargo y tienda opcionales) */
/* Plantilla mínima aprobada 2026 de Planeta (reporte "Estructura de tienda", HC APROBADO; 161 cupos en 11 tiendas).
   Es el valor inicial de "HC necesario" por tienda; se actualiza cargando un reporte nuevo en Configuración › HC necesario. */
export const HC_APROBADO_PLANETA_2026 = {
  P01: {GT: 1, SUB: 1, CAJT: 0, CAJ: 2, ASE: 6, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P02: {GT: 1, SUB: 1, CAJT: 0, CAJ: 2, ASE: 6, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P03: {GT: 1, SUB: 2, CAJT: 0, CAJ: 4, ASE: 18, JALM: 0, ALM: 3, VM: 1, SEG: 0},
  P04: {GT: 1, SUB: 1, CAJT: 0, CAJ: 4, ASE: 14, JALM: 0, ALM: 3, VM: 0, SEG: 0},
  P05: {GT: 1, SUB: 1, CAJT: 0, CAJ: 2, ASE: 3, JALM: 0, ALM: 1, VM: 0, SEG: 0},
  P06: {GT: 1, SUB: 1, CAJT: 0, CAJ: 2, ASE: 5, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P07: {GT: 1, SUB: 1, CAJT: 0, CAJ: 3, ASE: 7, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P08: {GT: 0, SUB: 2, CAJT: 0, CAJ: 3, ASE: 10, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P10: {GT: 1, SUB: 1, CAJT: 0, CAJ: 3, ASE: 6, JALM: 0, ALM: 2, VM: 0, SEG: 0},
  P11: {GT: 0, SUB: 1, CAJT: 0, CAJ: 0, ASE: 1, JALM: 0, ALM: 0, VM: 0, SEG: 0},
  P12: {GT: 0, SUB: 3, CAJT: 0, CAJ: 3, ASE: 12, JALM: 0, ALM: 2, VM: 0, SEG: 0},
};

/* Primera fila (entre las 8 primeras) que parece de encabezados: el reporte de BI antepone una línea "Filtros aplicados". */
function filaEncabezados(matriz, tieneTodas) {
  for (let i = 0; i < Math.min(8, matriz.length); i += 1) {
    const enc = (matriz[i] || []).map((h) => normalizar(h));
    if (tieneTodas(enc)) return i;
  }
  return 0;
}
function datosPersona(texto) {
  const t = String(texto || '').trim().replace(/\s+/g, ' ');
  if (!t) return { apellidos: '', nombres: '' };
  const k = t.indexOf(',');
  if (k < 0) return { apellidos: tituloNombre(t), nombres: '' };
  return { apellidos: tituloNombre(t.slice(0, k)), nombres: tituloNombre(t.slice(k + 1)) };
}
export function ingresosDesdeBI(matriz) {
  if (!matriz || matriz.length < 2) return { filas: [], avisos: ['El archivo no tiene filas de datos.'] };
  const h0 = filaEncabezados(matriz, (enc) => enc.some((h) => h.includes('cedula')) && enc.some((h) => h.includes('ingreso')));
  const enc = (matriz[h0] || []).map((h) => normalizar(h));
  const buscar = (...ops) => enc.findIndex((h) => ops.some((o) => h === o || h.includes(o)));
  const iCed = buscar('cedula', 'c.i', 'documento');
  const iFecha = enc.findIndex((h) => h === 'ingreso' || h.includes('fecha de ingreso') || h.includes('fecha ingreso') || h === 'fecha_ingreso');
  const iCargo = buscar('cargo', 'puesto');
  const iTienda = buscar('tienda', 'sucursal', 'centro de costo', 'ubicacion');
  const iMarca = buscar('marca', 'unidad de negocio');
  const iNombre = buscar('apellido y nombre', 'apellidos y nombres', 'nombre');
  const iGenero = buscar('genero', 'sexo');
  const iEstatus = buscar('estatus', 'estado del trabajador');
  if (iCed < 0 || iFecha < 0) return { filas: [], avisos: ['El archivo debe tener las columnas "Cédula" y "Fecha de ingreso".'] };
  const avisos = []; const filas = [];
  matriz.slice(h0 + 1).forEach((f, n) => {
    if (!f || !f.some((x) => String(x === null || x === undefined ? '' : x).trim())) return;
    if (iEstatus >= 0 && /egres|inactiv|retir/i.test(String(f[iEstatus] || ''))) return;
    const ced = soloDigitos(f[iCed]); const fecha = fechaISO(f[iFecha]);
    if (ced.length < 5) { avisos.push(`Fila ${h0 + n + 2}: cédula no válida.`); return; }
    if (!fecha) { avisos.push(`Fila ${h0 + n + 2}: fecha de ingreso no válida (${f[iFecha]}).`); return; }
    const marcaTxt = iMarca >= 0 ? String(f[iMarca] || '') : '';
    const marca = /planeta/i.test(marcaTxt) ? 'PLANETA' : /bal/i.test(marcaTxt) ? 'BALU' : '';
    const persona = iNombre >= 0 ? datosPersona(f[iNombre]) : { apellidos: '', nombres: '' };
    const letra = /^\s*e/i.test(String(f[iCed] || '')) ? 'E' : 'V';
    filas.push({ cedula: ced, letra, fechaIngreso: fecha, cargoId: iCargo >= 0 ? cargoDesdeTexto(f[iCargo]) : '', cargoTexto: iCargo >= 0 ? String(f[iCargo] || '') : '', tiendaTexto: iTienda >= 0 ? String(f[iTienda] || '') : '', marca, apellidos: persona.apellidos, nombres: persona.nombres, genero: iGenero >= 0 ? String(f[iGenero] || '').trim().toUpperCase().slice(0, 1) : '' });
  });
  return { filas, avisos };
}

/* ───────── Plantilla mínima aprobada (reporte "Estructura de tienda") ─────────
   Hoja con una fila por tienda y el HC APROBADO por cargo (primer bloque, hasta "TOTAL").
   Los bloques "HC ACTUAL" y "Vacantes" que sigan se ignoran: el sistema los calcula. */
const CARGOS_ESTRUCTURA = [
  ['jefe de almacen', 'JALM'], ['sub gerente', 'SUB'], ['subgerente', 'SUB'], ['gerente', 'GT'], ['cajer', 'CAJ'],
  ['depositario', 'ALM'], ['visual', 'VM'], ['asesor', 'ASE'],
];
export const CARGOS_PLANTILLA = ['GT', 'SUB', 'CAJT', 'CAJ', 'ASE', 'JALM', 'ALM', 'VM', 'SEG'];
export function plantillaDesdeEstructura(matriz) {
  if (!matriz || matriz.length < 2) return { filas: [], avisos: ['El archivo no tiene filas de datos.'] };
  const h0 = filaEncabezados(matriz, (enc) => enc.some((h) => h.includes('ubicacion')) && enc.some((h) => h === 'gerente'));
  const enc = (matriz[h0] || []).map((h) => normalizar(h));
  const iUbic = enc.findIndex((h) => h.includes('ubicacion'));
  const iCiudad = enc.findIndex((h) => h === 'ciudad');
  const iMarca = enc.findIndex((h) => h === 'marca');
  const iTotal = enc.findIndex((h) => h === 'total');
  if (iUbic < 0 || iTotal < 0) return { filas: [], avisos: ['No se reconoce el reporte: deben existir las columnas "Ubicación", los cargos y "Total".'] };
  const cols = {};
  for (let c = iUbic + 1; c < iTotal; c += 1) {
    const par = CARGOS_ESTRUCTURA.find(([clave]) => enc[c] === clave || enc[c].replace(/-/g, ' ').includes(clave));
    if (par && cols[par[1]] === undefined) cols[par[1]] = c;
  }
  if (!Object.keys(cols).length) return { filas: [], avisos: ['No se encontraron columnas de cargos antes de "Total".'] };
  const avisos = []; const filas = [];
  matriz.slice(h0 + 1).forEach((f, n) => {
    const ubic = String(f && f[iUbic] !== undefined && f[iUbic] !== null ? f[iUbic] : '').trim();
    if (!ubic) return;
    const marcaTxt = iMarca >= 0 ? String(f[iMarca] || '') : '';
    const marca = /planeta/i.test(marcaTxt) ? 'PLANETA' : /bal/i.test(marcaTxt) ? 'BALU' : '';
    const hc = {}; CARGOS_PLANTILLA.forEach((c) => { hc[c] = 0; });
    let suma = 0;
    Object.keys(cols).forEach((c) => { const v = Number(f[cols[c]]); const q = Number.isFinite(v) && v > 0 ? Math.round(v) : 0; hc[c] = q; suma += q; });
    const total = Number(f[iTotal]);
    if (Number.isFinite(total) && total !== suma) avisos.push(`${ubic}: el total del archivo (${total}) no coincide con la suma de cargos (${suma}).`);
    filas.push({ fila: h0 + n + 2, marca, ubicacion: ubic, ciudad: iCiudad >= 0 ? String(f[iCiudad] || '').trim() : '', tiendaId: tiendaDesdeTexto(ubic, marca || 'PLANETA'), hc, total: suma });
  });
  return { filas, avisos };
}
