/* Organigrama desde un archivo de Visio (.vsdx) y trazado del diagrama (v1.24.0).
 * Un .vsdx es un ZIP con XML. Aquí se abre sin librerías externas (descompresión propia), se leen los recuadros con su texto
 * y los conectores, y se arma la jerarquía: quién reporta a quién. Todo ocurre en el navegador; el archivo no se envía a ningún sitio. */

/* ---------- Descompresión (formato DEFLATE, RFC 1951) ---------- */
const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const ORDEN_LONG = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

function construirTabla(longitudes, n) {
  const cuenta = new Uint16Array(16); const simbolos = new Uint16Array(n);
  for (let i = 0; i < n; i++) cuenta[longitudes[i]] += 1;
  const desp = new Uint16Array(16);
  for (let l = 1; l < 15; l++) desp[l + 1] = desp[l] + cuenta[l];
  for (let i = 0; i < n; i++) if (longitudes[i]) simbolos[desp[longitudes[i]]++] = i;
  return { cuenta, simbolos };
}

export function inflarRaw(src, tamanoEsperado) {
  let pos = 0; let bitBuf = 0; let bitCnt = 0;
  let out = new Uint8Array(tamanoEsperado && tamanoEsperado > 0 ? tamanoEsperado : Math.max(1024, src.length * 4)); let n = 0;
  const bit = () => { if (bitCnt === 0) { if (pos >= src.length) throw new Error('Archivo comprimido incompleto.'); bitBuf = src[pos++]; bitCnt = 8; } const b = bitBuf & 1; bitBuf >>= 1; bitCnt -= 1; return b; };
  const bits = (k) => { let v = 0; for (let i = 0; i < k; i++) v |= bit() << i; return v; };
  const asegurar = (extra) => { if (n + extra > out.length) { const mayor = new Uint8Array(Math.max(out.length * 2, n + extra)); mayor.set(out.subarray(0, n)); out = mayor; } };
  const decodificar = (t) => {
    let code = 0; let first = 0; let index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bit();
      const count = t.cuenta[len];
      if (code - count < first) return t.simbolos[index + (code - first)];
      index += count; first += count; first <<= 1; code <<= 1;
    }
    throw new Error('Archivo comprimido dañado.');
  };
  const bloque = (tl, td) => {
    for (;;) {
      let s = decodificar(tl);
      if (s < 256) { asegurar(1); out[n++] = s; continue; }
      if (s === 256) return;
      s -= 257; if (s >= 29) throw new Error('Archivo comprimido dañado.');
      const largo = LBASE[s] + bits(LEXT[s]);
      const ds = decodificar(td); if (ds >= 30) throw new Error('Archivo comprimido dañado.');
      const dist = DBASE[ds] + bits(DEXT[ds]);
      if (dist > n) throw new Error('Archivo comprimido dañado.');
      asegurar(largo);
      for (let i = 0; i < largo; i++) { out[n] = out[n - dist]; n += 1; }
    }
  };
  let tablaFijaL = null; let tablaFijaD = null;
  let ultimo = 0;
  do {
    ultimo = bit(); const tipo = bits(2);
    if (tipo === 0) {
      bitCnt = 0;
      if (pos + 4 > src.length) throw new Error('Archivo comprimido incompleto.');
      const len = src[pos] | (src[pos + 1] << 8); pos += 4;
      if (pos + len > src.length) throw new Error('Archivo comprimido incompleto.');
      asegurar(len); out.set(src.subarray(pos, pos + len), n); n += len; pos += len;
    } else if (tipo === 1) {
      if (!tablaFijaL) {
        const l = new Uint8Array(288); for (let i = 0; i < 144; i++) l[i] = 8; for (let i = 144; i < 256; i++) l[i] = 9; for (let i = 256; i < 280; i++) l[i] = 7; for (let i = 280; i < 288; i++) l[i] = 8;
        tablaFijaL = construirTabla(l, 288); tablaFijaD = construirTabla(new Uint8Array(30).fill(5), 30);
      }
      bloque(tablaFijaL, tablaFijaD);
    } else if (tipo === 2) {
      const nlen = bits(5) + 257; const ndist = bits(5) + 1; const ncode = bits(4) + 4;
      const lengths = new Uint8Array(320);
      for (let i = 0; i < ncode; i++) lengths[ORDEN_LONG[i]] = bits(3);
      const tc = construirTabla(lengths.subarray(0, 19), 19);
      const todas = new Uint8Array(nlen + ndist); let i = 0;
      while (i < nlen + ndist) {
        const sym = decodificar(tc);
        if (sym < 16) { todas[i++] = sym; continue; }
        let previo = 0; let rep;
        if (sym === 16) { if (i === 0) throw new Error('Archivo comprimido dañado.'); previo = todas[i - 1]; rep = 3 + bits(2); } else if (sym === 17) rep = 3 + bits(3); else rep = 11 + bits(7);
        if (i + rep > nlen + ndist) throw new Error('Archivo comprimido dañado.');
        while (rep--) todas[i++] = previo;
      }
      bloque(construirTabla(todas.subarray(0, nlen), nlen), construirTabla(todas.subarray(nlen), ndist));
    } else throw new Error('Archivo comprimido dañado.');
  } while (!ultimo);
  return out.subarray(0, n);
}

/* ---------- ZIP ---------- */
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

export function utf8(bytes) {
  let s = ''; let i = 0;
  while (i < bytes.length) {
    const c = bytes[i++];
    if (c < 0x80) s += String.fromCharCode(c);
    else if (c >= 0xc0 && c < 0xe0) s += String.fromCharCode(((c & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else if (c >= 0xe0 && c < 0xf0) { const c2 = bytes[i++]; const c3 = bytes[i++]; s += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)); } else { const c2 = bytes[i++]; const c3 = bytes[i++]; const c4 = bytes[i++]; const cp = (((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f)) - 0x10000; s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff)); }
  }
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/* Devuelve { nombre: () => texto XML } con solo los archivos del ZIP que interesan (lectura perezosa) */
export function leerZip(buffer) {
  const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 0x05 && b[i + 3] === 0x06) { eocd = i; break; }
  if (eocd < 0) throw new Error('El archivo no es un documento de Visio válido (.vsdx).');
  const total = u16(b, eocd + 10); let p = u32(b, eocd + 16);
  const entradas = {};
  for (let k = 0; k < total; k++) {
    if (u32(b, p) !== 0x02014b50) throw new Error('El archivo no es un documento de Visio válido (.vsdx).');
    const metodo = u16(b, p + 10); const comp = u32(b, p + 20); const real = u32(b, p + 24);
    const ln = u16(b, p + 28); const le = u16(b, p + 30); const lc = u16(b, p + 32); const local = u32(b, p + 42);
    const nombre = utf8(b.subarray(p + 46, p + 46 + ln));
    entradas[nombre] = { metodo, comp, real, local };
    p += 46 + ln + le + lc;
  }
  const bytesDe = (nombre) => {
    const e = entradas[nombre]; if (!e) return null;
    const ini = e.local + 30 + u16(b, e.local + 26) + u16(b, e.local + 28);
    const datos = b.subarray(ini, ini + e.comp);
    if (e.metodo === 0) return datos;
    if (e.metodo === 8) return inflarRaw(datos, e.real);
    throw new Error('El archivo usa una compresión que no se puede leer.');
  };
  return { nombres: Object.keys(entradas), texto: (nombre) => { const x = bytesDe(nombre); return x ? utf8(x) : null; } };
}

/* ---------- Dibujo de Visio ---------- */
const normalizar = (s) => String(s === undefined || s === null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export { normalizar as normalizarTextoOrg };

function hijosPorNombre(el, nombre) { return Array.from(el.childNodes).filter((n) => n.nodeType === 1 && n.nodeName === nombre); }
function textoDeForma(sh) {
  const t = hijosPorNombre(sh, 'Text')[0];
  let s = '';
  if (t) Array.from(t.childNodes).forEach((n) => { if (n.nodeType === 3) s += n.nodeValue; else if (n.nodeType === 1 && n.nodeName === 'fld') s += n.textContent; });
  const grupo = hijosPorNombre(sh, 'Shapes')[0];
  if (!s.trim() && grupo) s = hijosPorNombre(grupo, 'Shape').map(textoDeForma).filter((x) => x.trim()).join('\n');
  return s.replace(/\r/g, '');
}
function celdas(sh) { const m = {}; hijosPorNombre(sh, 'Cell').forEach((c) => { m[c.getAttribute('N')] = c.getAttribute('V'); }); return m; }
function propiedades(sh) {
  const out = {};
  hijosPorNombre(sh, 'Section').filter((s) => s.getAttribute('N') === 'Property').forEach((s) => hijosPorNombre(s, 'Row').forEach((r) => {
    const v = hijosPorNombre(r, 'Cell').find((c) => c.getAttribute('N') === 'Value');
    if (v && v.getAttribute('V')) out[normalizar(r.getAttribute('N'))] = v.getAttribute('V');
  }));
  return out;
}

/* Lee las páginas del dibujo: recuadros con texto y conexiones entre ellos */
export function leerVsdx(buffer, parser) {
  const zip = leerZip(buffer);
  const P = parser || (typeof DOMParser !== 'undefined' ? new DOMParser() : null);
  if (!P) throw new Error('Este navegador no puede leer archivos de Visio.');
  const rutas = zip.nombres.filter((n) => /^visio\/pages\/page\d+\.xml$/i.test(n)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (!rutas.length) throw new Error('El archivo no tiene páginas de dibujo de Visio.');
  const nombresPagina = {};
  const indice = zip.texto('visio/pages/pages.xml');
  if (indice) {
    const docI = P.parseFromString(indice, 'application/xml');
    const rels = zip.texto('visio/pages/_rels/pages.xml.rels');
    const mapaRel = {};
    if (rels) Array.from(P.parseFromString(rels, 'application/xml').getElementsByTagName('Relationship')).forEach((r) => { mapaRel[r.getAttribute('Id')] = String(r.getAttribute('Target') || '').replace(/^\/?(visio\/pages\/)?/, ''); });
    Array.from(docI.getElementsByTagName('Page')).forEach((pg) => {
      const rel = Array.from(pg.getElementsByTagName('Rel'))[0];
      const destino = rel ? mapaRel[rel.getAttribute('r:id') || rel.getAttribute('id')] : '';
      if (destino) nombresPagina[`visio/pages/${destino}`] = pg.getAttribute('NameU') || pg.getAttribute('Name') || '';
    });
  }
  return rutas.map((ruta) => {
    const doc = P.parseFromString(zip.texto(ruta), 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('No se pudo leer una de las páginas del dibujo.');
    const raiz = doc.documentElement;
    const contenedor = hijosPorNombre(raiz, 'Shapes')[0];
    const formas = contenedor ? hijosPorNombre(contenedor, 'Shape').map((sh) => {
      const c = celdas(sh); const num = (k) => { const v = Number(c[k]); return Number.isFinite(v) ? v : 0; };
      const texto = textoDeForma(sh);
      return { id: sh.getAttribute('ID'), tipo: sh.getAttribute('Type') || 'Shape', texto, lineas: texto.split('\n').map((l) => l.trim()).filter(Boolean), props: propiedades(sh), x: num('PinX'), y: num('PinY'), ancho: num('Width'), alto: num('Height') };
    }) : [];
    const cn = hijosPorNombre(raiz, 'Connects')[0];
    const conexiones = cn ? hijosPorNombre(cn, 'Connect').map((x) => ({ conector: x.getAttribute('FromSheet'), celda: x.getAttribute('FromCell') || '', forma: x.getAttribute('ToSheet') })) : [];
    return { ruta, nombre: nombresPagina[ruta] || `Página ${rutas.indexOf(ruta) + 1}`, formas, conexiones };
  });
}

/* ---------- Del dibujo al organigrama ---------- */
const PALABRAS_CARGO = /\b(gerente|director|directora|jefe|jefa|coordinador|coordinadora|analista|asistente|asesor|asesora|especialista|lider|supervisor|supervisora|dise[nñ]ador|dise[nñ]adora|auxiliar|ejecutivo|ejecutiva|comprador|compradora|planificador|contador|contadora|abogado|abogada|ingeniero|ingeniera|programador|desarrollador|presidente|presidenta|vicepresidente|ceo|cfo|coo|gerencia|jefatura|visual|merchandiser|pasante|practicante|tesorero|tesorera|encargado|encargada)\b/i;
const VACANTE = /\b(vacante|vacant|por definir|por contratar|sin ocupar|tbd)\b/i;
const CLAVES_NOMBRE = ['nombre', 'name', 'persona', 'ocupante', 'empleado'];
const CLAVES_CARGO = ['cargo', 'puesto', 'title', 'titulo', 'posicion', 'rol'];
const CLAVES_AREA = ['area', 'departamento', 'department', 'gerencia', 'unidad'];
const AREAS_CONOCIDAS = [
  ['VISPLA', /visual.*planeta|planeta.*visual/], ['VISBALU', /visual.*balu|balu.*visual/], ['COMPLA', /comercial.*planeta|planeta.*comercial/], ['COMBALU', /comercial.*balu|balu.*comercial/],
  ['MERC', /mercadeo|marketing|publicidad/], ['DIS', /dise[nñ]o/], ['COMPRAS', /compras|abastecimiento/], ['ADM', /administraci|finanzas|contabilidad|tesorer/], ['TH', /talento|recursos humanos|rrhh/], ['DG', /direcci|presidencia|gerencia general|junta/],
];
export const areaConocidaDe = (texto) => { const n = normalizar(texto); const f = AREAS_CONOCIDAS.find(([, re]) => re.test(n)); return f ? f[0] : ''; };

function primera(props, claves) { for (const k of claves) if (props[k]) return String(props[k]).trim(); return ''; }

/* Separa el texto del recuadro en cargo y nombre. orden: 'auto' | 'cargo-nombre' | 'nombre-cargo' */
export function separarTexto(forma, orden) {
  const nombreProp = primera(forma.props, CLAVES_NOMBRE); const cargoProp = primera(forma.props, CLAVES_CARGO);
  const lineas = forma.lineas.slice();
  const vacante = lineas.some((l) => VACANTE.test(l)) || VACANTE.test(nombreProp) || /^vacante$/i.test(cargoProp);
  const limpiar = (l) => l.replace(VACANTE, '').replace(/^[\s\-–—:()·]+|[\s\-–—:()·]+$/g, '').trim();
  if (cargoProp || nombreProp) return { cargo: cargoProp || lineas.find((l) => !VACANTE.test(l)) || '', nombre: vacante ? '' : (nombreProp || ''), vacante };
  const util = lineas.map(limpiar).filter(Boolean);
  if (!util.length) return { cargo: '', nombre: '', vacante };
  if (util.length === 1) return { cargo: util[0], nombre: '', vacante };
  let cargo; let resto;
  if (orden === 'cargo-nombre') { cargo = util[0]; resto = util.slice(1); } else if (orden === 'nombre-cargo') { cargo = util[util.length - 1]; resto = util.slice(0, -1); } else {
    const iCargo = util.findIndex((l) => PALABRAS_CARGO.test(normalizar(l)));
    if (iCargo >= 0 && util.filter((l) => PALABRAS_CARGO.test(normalizar(l))).length === 1) { cargo = util[iCargo]; resto = util.filter((_, i) => i !== iCargo); } else { cargo = util[util.length - 1]; resto = util.slice(0, -1); }
  }
  return { cargo, nombre: vacante ? '' : resto.join(' '), vacante };
}

export function organigramaDesdeVsdx(buffer, opciones) {
  const { orden = 'auto', parser } = opciones || {};
  const paginas = leerVsdx(buffer, parser);
  const avisos = [];
  /* La página con más recuadros conectados es la del organigrama */
  const evaluar = (pg) => { const conectores = new Set(pg.conexiones.map((c) => c.conector)); const conectadas = new Set(pg.conexiones.filter((c) => !conectores.has(c.forma)).map((c) => c.forma)); return { pg, conectadas, n: conectadas.size }; };
  const elegida = paginas.map(evaluar).sort((a, b) => b.n - a.n)[0];
  const pg = elegida.pg;
  if (paginas.length > 1) avisos.push(`El archivo tiene ${paginas.length} páginas; se usó «${pg.nombre}», que es la que tiene más cargos conectados.`);
  const conectoresIds = new Set(pg.conexiones.map((c) => c.conector));
  const porId = new Map(pg.formas.map((f) => [f.id, f]));
  /* Aristas: cada conector une dos recuadros */
  const extremos = new Map();
  pg.conexiones.forEach((c) => { if (!extremos.has(c.conector)) extremos.set(c.conector, {}); const e = extremos.get(c.conector); if (/^begin/i.test(c.celda)) e.ini = c.forma; else if (/^end/i.test(c.celda)) e.fin = c.forma; else if (!e.ini) e.ini = c.forma; else e.fin = c.forma; });
  const aristas = [];
  extremos.forEach((e) => {
    if (!e.ini || !e.fin || e.ini === e.fin) return;
    const a = porId.get(e.ini); const b = porId.get(e.fin);
    if (!a || !b || conectoresIds.has(a.id) || conectoresIds.has(b.id)) return;
    /* En Visio el eje Y crece hacia arriba: el jefe está más arriba. Si están a la misma altura se respeta el sentido del conector. */
    let jefe = a; let sub = b;
    if (b.y > a.y + 0.01) { jefe = b; sub = a; }
    aristas.push({ jefe: jefe.id, sub: sub.id });
  });
  const conAristas = new Set(); aristas.forEach((x) => { conAristas.add(x.jefe); conAristas.add(x.sub); });
  const candidatas = pg.formas.filter((f) => !conectoresIds.has(f.id) && f.lineas.length);
  const nodos = candidatas.filter((f) => conAristas.has(f.id));
  const aisladas = candidatas.filter((f) => !conAristas.has(f.id));
  if (!nodos.length && candidatas.length) {
    avisos.push('Los recuadros no están unidos por conectores: no se puede saber quién reporta a quién. Una el organigrama con conectores en Visio y vuelva a cargarlo.');
  }
  if (aisladas.length && nodos.length) avisos.push(`Se omitieron ${aisladas.length} recuadro(s) sin conexión (títulos, notas o cargos sin conectar): ${aisladas.slice(0, 5).map((f) => f.lineas[0]).join('; ')}${aisladas.length > 5 ? '…' : ''}.`);
  const idsNodo = new Set(nodos.map((n) => n.id));
  const jefeDe = new Map(); const yaVisto = [];
  aristas.filter((x) => idsNodo.has(x.jefe) && idsNodo.has(x.sub)).forEach((x) => {
    const actual = jefeDe.get(x.sub);
    if (!actual) jefeDe.set(x.sub, x.jefe); else if (actual !== x.jefe) yaVisto.push(x.sub);
  });
  if (yaVisto.length) avisos.push(`${yaVisto.length} recuadro(s) tienen dos jefes en el dibujo; se tomó el primero que aparece.`);
  /* Evitar ciclos: si siguiendo a los jefes se vuelve al mismo recuadro, se corta ese vínculo */
  nodos.forEach((n) => { const vistos = new Set([n.id]); let cur = jefeDe.get(n.id); while (cur) { if (vistos.has(cur)) { jefeDe.delete(n.id); avisos.push('Se encontró un ciclo en las conexiones; se cortó un vínculo.'); break; } vistos.add(cur); cur = jefeDe.get(cur); } });

  const orden0 = nodos.slice().sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const hijosDe = new Map(); orden0.forEach((n) => { const j = jefeDe.get(n.id) || ''; if (!hijosDe.has(j)) hijosDe.set(j, []); hijosDe.get(j).push(n); });
  hijosDe.forEach((l) => l.sort((a, b) => a.x - b.x));
  const raices = hijosDe.get('') || [];
  if (raices.length > 1) avisos.push(`El dibujo tiene ${raices.length} cargos sin jefe (niveles superiores): ${raices.slice(0, 4).map((r) => r.lineas[0]).join('; ')}.`);

  /* Áreas: dato de forma "Departamento/Área"; si no hay, cada gerencia directa de la cima forma un área */
  const areas = []; const areaPorNodo = new Map();
  const idArea = (nombre) => {
    const conocida = areaConocidaDe(nombre);
    const id = conocida || `AREA-${normalizar(nombre).replace(/ /g, '-').slice(0, 30) || 'GENERAL'}`;
    if (!areas.some((a) => a.id === id)) areas.push({ id, nombre });
    return id;
  };
  const datosNodo = new Map(nodos.map((n) => [n.id, separarTexto(n, orden)]));
  const asignar = (n, areaId) => {
    const prop = primera(n.props, CLAVES_AREA);
    const propia = prop ? idArea(prop) : areaId;
    areaPorNodo.set(n.id, propia);
    (hijosDe.get(n.id) || []).forEach((h) => asignar(h, propia));
  };
  raices.forEach((r) => {
    const d = datosNodo.get(r.id);
    const areaRaiz = idArea(areaConocidaDe(d.cargo) === 'DG' || /direcci|presiden|general|ceo/.test(normalizar(d.cargo)) ? 'Dirección' : d.cargo);
    areaPorNodo.set(r.id, primera(r.props, CLAVES_AREA) ? idArea(primera(r.props, CLAVES_AREA)) : areaRaiz);
    (hijosDe.get(r.id) || []).forEach((h) => {
      const dh = datosNodo.get(h.id);
      const area = primera(h.props, CLAVES_AREA) ? idArea(primera(h.props, CLAVES_AREA)) : idArea(dh.cargo);
      asignar(h, area);
    });
  });
  const posiciones = nodos.map((n) => {
    const d = datosNodo.get(n.id);
    return { id: `V${n.id}`, areaId: areaPorNodo.get(n.id) || (areas[0] && areas[0].id) || 'GENERAL', cargo: d.cargo || n.lineas[0], nombre: d.nombre, vacante: Boolean(d.vacante), jefeId: jefeDe.get(n.id) ? `V${jefeDe.get(n.id)}` : '' };
  });
  if (posiciones.some((p) => !p.areaId)) avisos.push('Algunos cargos quedaron sin área.');
  return {
    posiciones, areas, avisos, pagina: pg.nombre,
    resumen: { formas: pg.formas.length, cargos: posiciones.length, vacantes: posiciones.filter((p) => p.vacante).length, raices: raices.length, areas: areas.length, omitidas: aisladas.length },
  };
}

/* Traspasa lo ya cargado (compensación, perfiles de cargo, componentes) a la estructura nueva cuando la persona o el cargo coinciden */
export function fusionarEstructura(nueva, previa) {
  if (!previa || !Array.isArray(previa.posiciones)) return { areas: nueva.areas, posiciones: nueva.posiciones, conservados: 0 };
  const usados = new Set(); let conservados = 0;
  const posiciones = nueva.posiciones.map((p) => {
    const candidatas = previa.posiciones.filter((q) => !usados.has(q.id));
    const igual = !p.vacante && p.nombre
      ? candidatas.find((q) => !q.vacante && normalizar(q.nombre) === normalizar(p.nombre))
      : candidatas.find((q) => q.vacante && normalizar(q.cargo) === normalizar(p.cargo));
    if (!igual) return p;
    usados.add(igual.id); conservados += 1;
    return { ...p, ...(igual.comp ? { comp: igual.comp } : {}), ...(igual.perfilId ? { perfilId: igual.perfilId } : {}), ...(igual.cargoAnterior ? { cargoAnterior: igual.cargoAnterior } : {}) };
  });
  return { areas: nueva.areas, posiciones, conservados };
}

/* ---------- Trazado del diagrama ---------- */
export function disponerArbol(posiciones, medidas) {
  const { ancho = 176, alto = 62, sepX = 16, sepY = 38 } = medidas || {};
  const ids = new Set(posiciones.map((p) => p.id));
  const hijos = new Map();
  posiciones.forEach((p) => { const j = p.jefeId && ids.has(p.jefeId) ? p.jefeId : ''; if (!hijos.has(j)) hijos.set(j, []); hijos.get(j).push(p); });
  const nodos = []; const enlaces = []; let cursor = 0; let maxNivel = 0;
  const colocar = (p, nivel) => {
    maxNivel = Math.max(maxNivel, nivel);
    const hs = hijos.get(p.id) || [];
    let x;
    if (!hs.length) { x = cursor; cursor += ancho + sepX; } else {
      const xs = hs.map((h) => colocar(h, nivel + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
      hs.forEach((h) => enlaces.push({ de: p.id, a: h.id }));
    }
    nodos.push({ id: p.id, x, y: nivel * (alto + sepY), nivel });
    return x;
  };
  (hijos.get('') || []).forEach((r) => colocar(r, 0));
  return { nodos, enlaces, ancho: Math.max(0, cursor - sepX), alto: (maxNivel + 1) * (alto + sepY) - sepY, medidas: { ancho, alto, sepX, sepY } };
}
