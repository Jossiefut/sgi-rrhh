/* Genera las políticas de RRHH en Word (.docx), una por política y por marca, con el logo y la razón social de la marca.
   Fuente única: politicas.js (la misma que usa la pantalla «Ayuda › Políticas»).
   Uso (desde la carpeta del código): node politicas/generar-word.mjs <carpeta-de-salida>
   Razón social por marca: la de Balú está fija; la de Planeta se indica con RAZON_PLANETA y RIF_PLANETA (si no, «razón social pendiente»). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, BorderStyle, HeadingLevel, LevelFormat, Footer, PageNumber, Header } = require('docx');

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { POLITICAS, SUBSISTEMAS, VERSION_POLITICAS, FECHA_POLITICAS, NOTA_LEGAL } = await import(path.join(raiz, 'politicas.js'));
const { LOGO_BALU, LOGO_PLANETA } = await import(path.join(raiz, 'logos.js'));
const VERSION = (fs.readFileSync(path.join(raiz, 'versiones.js'), 'utf8').match(/VERSION_ACTUAL\s*=\s*'([^']+)'/) || [])[1];
const salida = path.resolve(process.argv[2] || path.join(raiz, 'politicas', 'word'));

const MARCAS = {
  BALU: { nombre: 'Balú', razon: 'REPRESENTACIONES ULAB 24, C.A.', rif: 'J-50505660-3', logo: LOGO_BALU, ratio: 720 / 231 },
  PLANETA: { nombre: 'Planeta', razon: process.env.RAZON_PLANETA || 'Planeta (razón social pendiente)', rif: process.env.RIF_PLANETA || '', logo: LOGO_PLANETA, ratio: 720 / 147 },
};
const VINO = '6B1E3F';
const fecha = FECHA_POLITICAS.split('-').reverse().join('/');
const ANCHO = 9360; // carta con márgenes de 1 pulgada
const borde = { style: BorderStyle.SINGLE, size: 4, color: 'D9CCD3' };
const bordes = { top: borde, bottom: borde, left: borde, right: borde };

function sustituir(t, m) { return String(t || '').replace(/\[EMPRESA\]/g, m.razon).replace(/\[MARCA\]/g, m.nombre); }
const p = (texto, op = {}) => new Paragraph({ spacing: { after: 100 }, ...op, children: [new TextRun({ text: texto, font: 'Calibri', size: 21, ...(op.run || {}) })] });
const titulo = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 }, children: [new TextRun({ text: texto, font: 'Calibri', size: 24, bold: true, color: VINO })] });
const celda = (texto, ancho, op = {}) => new TableCell({ width: { size: ancho, type: WidthType.DXA }, borders: bordes, margins: { top: 60, bottom: 60, left: 100, right: 100 }, shading: op.fondo ? { type: ShadingType.CLEAR, color: 'auto', fill: op.fondo } : undefined, children: [new Paragraph({ children: [new TextRun({ text: texto, font: 'Calibri', size: 19, bold: Boolean(op.negrita) })] })] });
function tabla(filas, anchos, cabecera) {
  const rows = [];
  if (cabecera) rows.push(new TableRow({ tableHeader: true, children: cabecera.map((c, i) => celda(c, anchos[i], { negrita: true, fondo: 'F5E8EE' })) }));
  filas.forEach((f) => rows.push(new TableRow({ children: f.map((c, i) => celda(c, anchos[i], { negrita: !cabecera && i === 0 && f.length === 2 })) })));
  return new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: anchos, rows });
}
const lista = (xs, ref, m) => xs.map((x) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: sustituir(x, m), font: 'Calibri', size: 21 })] }));

function documento(pol, clave) {
  const m = MARCAS[clave];
  const img = Buffer.from(m.logo.split(',')[1], 'base64');
  const alto = 34;
  const encabezado = new Header({ children: [
    new Paragraph({ alignment: AlignmentType.LEFT, children: [new ImageRun({ type: 'png', data: img, transformation: { width: Math.round(alto * m.ratio), height: alto } })] }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: VINO, space: 4 } }, spacing: { after: 120 }, children: [new TextRun({ text: `${m.razon}${m.rif ? ` · RIF ${m.rif}` : ''} · Gerencia de Recursos Humanos`, font: 'Calibri', size: 17, color: '555555' })] }),
  ] });
  const pie = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${pol.codigo} · versión ${VERSION_POLITICAS} · ${fecha} · SGI RRHH Marcas Propias ${VERSION} · Página `, font: 'Calibri', size: 16, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16, color: '777777' })] })] });
  let n = 0;
  const sec = (t) => titulo(`${++n}. ${t}`);
  const hijos = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'POLÍTICA DE RECURSOS HUMANOS', font: 'Calibri', size: 20, bold: true, color: '555555' })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: pol.titulo, font: 'Calibri', size: 30, bold: true, color: VINO })] }),
    tabla([['Código', pol.codigo], ['Subsistema de RRHH', pol.subsistema], ['Marca', `${m.nombre} · ${m.razon}`], ['Versión', `${VERSION_POLITICAS} · ${fecha}`]], [2800, 6560]),
    sec('Objetivo'), p(sustituir(pol.objetivo, m)),
    sec('Alcance'), p(sustituir(pol.alcance, m)),
    sec('Responsables'), tabla(pol.responsables.map((r) => r.map((x) => sustituir(x, m))), [3000, 6360], ['Responsable', 'Responsabilidad']),
  ];
  if (pol.definiciones.length) hijos.push(sec('Definiciones'), tabla(pol.definiciones.map((r) => r.map((x) => sustituir(x, m))), [2800, 6560]));
  hijos.push(sec('Lineamientos'), ...lista(pol.lineamientos, 'numeros', m));
  hijos.push(sec('Procedimiento'), tabla(pol.procedimiento.map((x, i) => [String(i + 1), sustituir(x[0], m), x[1], x[2]]), [600, 4160, 2200, 2400], ['N.º', 'Paso', 'Responsable', 'Dónde en el sistema']));
  hijos.push(sec('Registros'), ...lista(pol.registros, 'vinetas', m));
  if (pol.indicadores.length) hijos.push(sec('Indicadores'), ...lista(pol.indicadores, 'vinetas', m));
  if (pol.baseLegal.length) hijos.push(sec('Base legal de referencia'), ...lista(pol.baseLegal, 'vinetas', m), p(NOTA_LEGAL, { run: { size: 18, italics: true, color: '555555' } }));
  hijos.push(sec('Aprobación'), tabla([['Elaborado por', 'Gerencia de Recursos Humanos', 'Firma y fecha: '], ['Aprobado por', 'Gerencia General', 'Firma y fecha: ']], [2400, 3480, 3480]));
  return new Document({
    creator: 'Gerencia de Recursos Humanos', title: `${pol.codigo} · ${pol.titulo}`,
    numbering: { config: [
      { reference: 'numeros', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
      { reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    ] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1200, left: 1440, right: 1440 } } }, headers: { default: encabezado }, footers: { default: pie }, children: hijos }],
  });
}

fs.mkdirSync(salida, { recursive: true });
let total = 0;
for (const clave of Object.keys(MARCAS)) {
  const dir = path.join(salida, MARCAS[clave].nombre);
  fs.mkdirSync(dir, { recursive: true });
  for (const sub of SUBSISTEMAS) {
    for (const pol of POLITICAS.filter((x) => x.subsistema === sub)) {
      const nombre = `${pol.codigo} ${pol.titulo}`.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ');
      fs.writeFileSync(path.join(dir, `${nombre} - ${MARCAS[clave].nombre}.docx`), await Packer.toBuffer(documento(pol, clave)));
      total += 1;
    }
  }
}
console.log(`Políticas en Word: ${total} archivos (${POLITICAS.length} políticas × ${Object.keys(MARCAS).length} marcas) en ${salida}`);
