/* Documentos de ingreso del personal administrativo (Futura Retail, C.A.).
 * Cada página es la imagen del original (documentos-adm.js, generado por docs-adm/construir-docs-adm.py) y los campos
 * personales se escriben encima con los datos del trabajador. Las firmas, huellas y fechas de firma quedan en blanco. */
import { DOCS_ADM } from './documentos-adm.js';

export { DOCS_ADM };
export const CLAVES_ADM = DOCS_ADM.map((d) => d.clave);
export const DIAS_GENERACION_ADM = 1; /* se generan al segundo día de ingreso: fecha de ingreso + 1 */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function puntosMiles(digitos) { return String(digitos || '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
export function fechaDMA(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; }
export function fechaCartaAdm(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `Caracas, ${Number(m[3])} de ${MESES[Number(m[2]) - 1]} del ${m[1]}` : 'Caracas';
}
/* Fecha desde la que se generan: ingreso + 1 día (se calcula sin zona horaria) */
export function fechaGeneracionAdm(fechaIngreso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaIngreso || ''));
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + DIAS_GENERACION_ADM));
  return d.toISOString().slice(0, 10);
}

/* Logos de las marcas (los registra la aplicación): { BALU: { src, ratio }, PLANETA: { src, ratio } } */
let LOGOS_MARCA = {};
export function registrarLogosAdm(mapa) { LOGOS_MARCA = mapa || {}; }
/* Personal de tiendas: el original es de Futura Retail; con una marca (BALU o PLANETA) el logo, la razón social, el RIF, el domicilio y el firmante pasan a ser los de esa marca */
const esTienda = (vars) => Boolean(vars && vars.MARCA);
const rellenar = (tx, vars) => String(tx).replace(/\{([A-Z_]+)\}/g, (m, k) => (vars[k] == null ? '' : String(vars[k])));
/* Recuadro y tamaño del logo de la marca dentro del espacio del logo de Futura (misma altura máxima, hasta 25% más ancho) */
export function ubicarLogo(rect, ratio) {
  const [x0, y0, x1, y1] = rect; const W = x1 - x0; const H = y1 - y0;
  let w = W * 1.25; let h = w / ratio;
  if (h > H) { h = H; w = h * ratio; }
  return { x: x0, y: y0 + (H - h) / 2, w, h };
}

/* Variables que alimentan los campos de los documentos. marca/entidad/firmante: solo para personal de tiendas */
export function variablesDocsAdm({ nombres = '', apellidos = '', cedula = '', cargo = '', direccion = '', telefono = '', fecha = '', marca = '', entidad = null, firmante = null }) {
  const n = String(nombres).trim(); const a = String(apellidos).trim();
  const letra = (/^[A-Za-z]/.exec(String(cedula).trim()) || ['V'])[0].toUpperCase();
  const dig = puntosMiles(cedula);
  const ced = dig ? `${letra}-${dig}` : '';
  return {
    NOMBRES: n, APELLIDOS: a, NOMBRES_APELLIDOS: `${n} ${a}`.trim(), APELLIDOS_NOMBRES: `${a} ${n}`.trim(),
    CEDULA: ced, CEDULA_SIMPLE: dig, CEDULA_CI: ced ? `C.I. ${ced}` : 'C.I.', CARGO: String(cargo).trim(),
    DIRECCION: String(direccion).trim(), TELEFONO: String(telefono).trim(), FECHA: fechaDMA(fecha), FECHA_CARTA: fechaCartaAdm(fecha), PRESENTE: 'Presente.',
    ...(marca ? {
      MARCA: marca, RAZON_SOCIAL: entidad ? entidad.razonSocial : '', RIF: entidad ? entidad.rif : '', DOMICILIO: entidad ? entidad.domicilio : '',
      FIRMANTE_NOMBRE: firmante ? firmante.nombre : '', FIRMANTE_CARGO: firmante ? firmante.cargo : '',
    } : {}),
  };
}
function textoCampo(c, vars) { const t = c.tx ? rellenar(c.tx, vars) : String(vars[c.v] == null ? '' : vars[c.v]); return c.m ? t.toUpperCase() : t; }
/* Campos que se aplican: los marcados t=1 solo con una marca de tienda */
const camposActivos = (p, vars) => p.campos.filter((c) => !c.t || esTienda(vars));
/* Logo de la marca de la página (o null si es el original administrativo o la página no lleva logo) */
function logoDePagina(p, vars) { const l = esTienda(vars) && p.logo ? LOGOS_MARCA[vars.MARCA] : null; return l ? { rect: p.logo, ...l } : null; }

/* Reparte un texto largo en el recuadro principal y, si existe, en un segundo recuadro (ej. el cargo en el acuse) */
export function repartirTexto(texto, anchoMedido, w1, w2, tamanos = [8, 7, 6.5, 6, 5.5]) {
  const palabras = String(texto).split(/\s+/).filter(Boolean);
  for (const s of tamanos) {
    if (anchoMedido(palabras.join(' '), s) <= w1) return { l1: palabras.join(' '), l2: '', s };
    for (let i = palabras.length - 1; i >= 1; i -= 1) {
      const l1 = palabras.slice(0, i).join(' '); const l2 = palabras.slice(i).join(' ');
      if (w2 && anchoMedido(l1, s) <= w1 && anchoMedido(l2, s) <= w2) return { l1, l2, s };
    }
  }
  const s = tamanos[tamanos.length - 1]; const m = Math.ceil(palabras.length / 2);
  return { l1: palabras.slice(0, m).join(' '), l2: palabras.slice(m).join(' '), s };
}

/* Vista en pantalla (y texto verificable): la imagen del original con los campos encima */
export function htmlDocAdm(clave, vars) {
  const doc = DOCS_ADM.find((d) => d.clave === clave);
  if (!doc) return '';
  const paginas = doc.paginas.map((p, i) => {
    const capas = [];
    const lg = logoDePagina(p, vars);
    if (lg) {
      const [a, b, c2, d2] = lg.rect; const q = ubicarLogo(lg.rect, lg.ratio);
      capas.push(`<span style="position:absolute;left:${((a - 2) / p.w) * 100}%;top:${((b - 2) / p.h) * 100}%;width:${((c2 - a + 4) / p.w) * 100}%;height:${((d2 - b + 4) / p.h) * 100}%;background:#fff;"></span>`);
      capas.push(`<img data-logo="${esc(vars.MARCA)}" alt="${esc(lg.alt || vars.MARCA)}" src="${lg.src}" style="position:absolute;left:${(q.x / p.w) * 100}%;top:${(q.y / p.h) * 100}%;width:${(q.w / p.w) * 100}%;height:auto;"/>`);
    }
    camposActivos(p, vars).forEach((c) => {
      if (c.c) { const [x0, y0, x1, y1] = c.c; capas.push(`<span style="position:absolute;left:${(x0 / p.w) * 100}%;top:${(y0 / p.h) * 100}%;width:${((x1 - x0) / p.w) * 100}%;height:${((y1 - y0) / p.h) * 100}%;background:#fff;"></span>`); }
    });
    camposActivos(p, vars).forEach((c) => {
      const t = textoCampo(c, vars);
      if (!t) return;
      const fs = (c.s / p.w) * 100;
      const pos = c.a === 'der' ? `right:${((p.w - c.x) / p.w) * 100}%;` : `left:${(c.x / p.w) * 100}%;`;
      if (c.lh) { capas.push(`<span data-campo="${esc(c.v)}" style="position:absolute;${pos}top:${((c.y - c.s * 0.86) / p.h) * 100}%;width:${(c.w / p.w) * 100}%;font:${c.b ? 'bold ' : ''}${fs}cqw/${(c.lh / c.s).toFixed(3)} Helvetica,Arial,sans-serif;color:#111;${c.n === 1 ? 'white-space:nowrap;' : ''}">${esc(t)}</span>`); return; }
      capas.push(`<span data-campo="${esc(c.v)}" style="position:absolute;${pos}top:${((c.y - c.s * 0.86) / p.h) * 100}%;font:${c.i ? 'italic ' : ''}${c.b ? 'bold ' : ''}${fs}cqw/1 Helvetica,Arial,sans-serif;color:#111;white-space:nowrap;">${esc(t)}</span>`);
    });
    return `<div style="position:relative;width:100%;container-type:inline-size;margin:0 0 10px;box-shadow:0 0 0 1px #ddd;"><img src="${p.img}" alt="${esc(doc.nombre)} · página ${i + 1}" style="width:100%;height:auto;display:block;"/>${capas.join('')}</div>`;
  });
  return `<div class="adm-doc" data-adm="${esc(clave)}">${paginas.join('')}</div>`;
}

/* Imagen WebP → JPEG (jsPDF la incrusta sin depender del soporte WebP) */
const cacheJpeg = new Map();
function aJpeg(uri) {
  if (cacheJpeg.has(uri)) return Promise.resolve(cacheJpeg.get(uri));
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0);
      const j = c.toDataURL('image/jpeg', 0.9); cacheJpeg.set(uri, j); resolve(j);
    };
    im.onerror = () => reject(new Error('No se pudo leer la imagen del documento'));
    im.src = uri;
  });
}

/* PDF con una página por hoja original, en su tamaño y orientación reales. JsPDF: clase de jsPDF. items: [{clave, vars}] */
export async function generarPdfAdm(JsPDF, items) {
  let pdf = null;
  for (const it of items) {
    const doc = DOCS_ADM.find((d) => d.clave === it.clave);
    if (!doc) continue;
    for (const p of doc.paginas) {
      const orient = p.w > p.h ? 'landscape' : 'portrait';
      if (!pdf) pdf = new JsPDF({ unit: 'pt', format: [p.w, p.h], orientation: orient, compress: true });
      else pdf.addPage([p.w, p.h], orient);
      pdf.addImage(await aJpeg(p.img), 'JPEG', 0, 0, p.w, p.h, undefined, 'FAST');
      const lg = logoDePagina(p, it.vars);
      if (lg) {
        const [a, b, c2, d2] = lg.rect; const q = ubicarLogo(lg.rect, lg.ratio);
        pdf.setFillColor(255, 255, 255); pdf.rect(a - 2, b - 2, c2 - a + 4, d2 - b + 4, 'F');
        try { pdf.addImage(lg.src, 'PNG', q.x, q.y, q.w, q.h, undefined, 'FAST'); } catch (e) { /* sin logo: queda el espacio en blanco */ }
      }
      const campos = camposActivos(p, it.vars);
      campos.filter((c) => c.c).forEach((c) => { pdf.setFillColor(255, 255, 255); pdf.rect(c.c[0], c.c[1], c.c[2] - c.c[0], c.c[3] - c.c[1], 'F'); });
      pdf.setTextColor(17, 17, 17);
      const medir = (t, s) => { pdf.setFontSize(s); return pdf.getTextWidth(t); };
      campos.forEach((c) => {
        const t = textoCampo(c, it.vars);
        if (!t) return;
        pdf.setFont('helvetica', c.b && c.i ? 'bolditalic' : c.b ? 'bold' : c.i ? 'italic' : 'normal');
        if (c.lh) {
          let s = c.s; let lineas = [];
          for (;;) { pdf.setFontSize(s); lineas = pdf.splitTextToSize(t, c.w); if (lineas.length <= (c.n || 99) || s <= 4.5) break; s -= 0.25; }
          const lhp = c.lh * (s / c.s);
          lineas.forEach((l, k) => pdf.text(l, c.x, c.y + k * lhp));
          return;
        }
        if (c.r) {
          const r = repartirTexto(t, medir, c.w, c.r[2]);
          pdf.setFontSize(r.s); pdf.text(r.l1, c.x, c.y);
          if (r.l2) pdf.text(r.l2, c.r[0], c.r[1]);
          return;
        }
        let s = c.s;
        if (c.w) while (s > 5.5 && medir(t, s) > c.w) s -= 0.25;
        pdf.setFontSize(s);
        pdf.text(t, c.x, c.y, c.a === 'der' ? { align: 'right' } : undefined);
      });
    }
  }
  return pdf ? pdf.output('blob') : null;
}
