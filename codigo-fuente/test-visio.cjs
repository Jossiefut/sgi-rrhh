/* Organigrama administrativo desde Visio (.vsdx): lectura del archivo, jerarquía, vista previa, diagrama y conservación de la compensación (v1.24.0) */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const zlib = require('zlib');
const html = '<!doctype html><html><head></head><body>' + fs.readFileSync('talento-balu.html', 'utf8') + '</body></html>';
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) process.exitCode = 1; };
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));

/* --- Constructor de archivos .vsdx de prueba (ZIP con XML) --- */
const TABLA = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = TABLA[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(archivos, metodo) {
  const partes = []; const central = []; let offset = 0;
  Object.keys(archivos).forEach((nombre) => {
    const datos = Buffer.from(archivos[nombre], 'utf8'); const comp = metodo === 0 ? datos : zlib.deflateRawSync(datos); const nom = Buffer.from(nombre, 'utf8'); const crc = crc32(datos);
    const loc = Buffer.alloc(30); loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(0, 6); loc.writeUInt16LE(metodo === 0 ? 0 : 8, 8); loc.writeUInt32LE(crc, 14); loc.writeUInt32LE(comp.length, 18); loc.writeUInt32LE(datos.length, 22); loc.writeUInt16LE(nom.length, 26);
    partes.push(loc, nom, comp);
    const cen = Buffer.alloc(46); cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(metodo === 0 ? 0 : 8, 10); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(datos.length, 24); cen.writeUInt16LE(nom.length, 28); cen.writeUInt32LE(offset, 42);
    central.push(cen, nom); offset += 30 + nom.length + comp.length;
  });
  const cd = Buffer.concat(central); const fin = Buffer.alloc(22); fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(Object.keys(archivos).length, 8); fin.writeUInt16LE(Object.keys(archivos).length, 10); fin.writeUInt32LE(cd.length, 12); fin.writeUInt32LE(offset, 16);
  return Buffer.concat([...partes, cd, fin]);
}
const forma = (id, x, y, texto, extra) => `<Shape ID="${id}" Type="Shape"><Cell N="PinX" V="${x}"/><Cell N="PinY" V="${y}"/><Cell N="Width" V="2"/><Cell N="Height" V="1"/>${extra || ''}<Text>${texto}</Text></Shape>`;
const conector = (id) => `<Shape ID="${id}" Type="Shape" NameU="Dynamic connector"><Cell N="PinX" V="0"/><Cell N="PinY" V="0"/></Shape>`;
const conex = (c, ini, fin) => `<Connect FromSheet="${c}" FromCell="BeginX" ToSheet="${ini}" ToCell="PinX"/><Connect FromSheet="${c}" FromCell="EndX" ToSheet="${fin}" ToCell="PinX"/>`;
function paginaXml() {
  const props = '<Section N="Property"><Row N="Nombre"><Cell N="Value" V="María Muestra"/></Row></Section>';
  return `<?xml version="1.0" encoding="utf-8"?><PageContents xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><Shapes>`
    + forma(1, 6, 10, 'Director General<cp IX="0"/>\nAna Prueba')
    + forma(2, 3, 8, 'Gerente Comercial Balú\nLuis Ejemplo')
    + forma(3, 9, 8, 'Gerente de Compras\nVACANTE')
    + forma(4, 9, 6, 'Analista de Compras', props)
    + forma(5, 0, 12, 'ORGANIGRAMA DE PRUEBA 2026')
    + forma(10, 3, 6, 'Carlos Dato\nAnalista Comercial')
    + conector(6) + conector(7) + conector(8) + conector(9) + conector(11)
    + '</Shapes><Connects>' + conex(6, 1, 2) + conex(7, 1, 3) + conex(8, 4, 3) + conex(11, 2, 10) + '</Connects></PageContents>';
}
const vsdx = (metodo) => zip({
  '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
  'visio/pages/pages.xml': '<Pages xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><Page ID="0" NameU="Organigrama"><Rel r:id="rId1"/></Page></Pages>',
  'visio/pages/_rels/pages.xml.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="page1.xml"/></Relationships>',
  'visio/pages/page1.xml': paginaXml(),
}, metodo);

(async () => {
  /* --- módulo puro (con el analizador de XML de jsdom) --- */
  const V = await import('./visio.js');
  const pj = new JSDOM('').window;
  const parser = new pj.DOMParser();
  const grande = Buffer.from('<a>' + 'abcdefghij'.repeat(5000) + '</a>');
  ok(Buffer.compare(Buffer.from(V.inflarRaw(zlib.deflateRawSync(grande))), grande) === 0, 'La descompresión propia reproduce un archivo comprimido grande');
  ok(Buffer.compare(Buffer.from(V.inflarRaw(zlib.deflateRawSync(grande, { level: 0 }))), grande) === 0 && Buffer.compare(Buffer.from(V.inflarRaw(zlib.deflateRawSync(Buffer.from('hola hola hola', 'utf8'), { strategy: zlib.constants.Z_FIXED }))), Buffer.from('hola hola hola')) === 0, 'Funciona con bloques sin comprimir y con tabla fija');
  const lleno = Array.from({ length: 4000 }, (_, i) => `Fila ${i}: ${(i * 7919) % 1000}`).join('\n');
  ok(Buffer.compare(Buffer.from(V.inflarRaw(zlib.deflateRawSync(Buffer.from(lleno)))), Buffer.from(lleno)) === 0, 'Funciona con tablas dinámicas (texto variado)');
  const z = V.leerZip(vsdx());
  ok(z.nombres.includes('visio/pages/page1.xml') && /PageContents/.test(z.texto('visio/pages/page1.xml')), 'Se abre el ZIP y se lee la página');
  ok(V.leerZip(vsdx(0)).texto('visio/pages/page1.xml').includes('Analista de Compras'), 'También se leen archivos guardados sin compresión');
  let err = ''; try { V.leerZip(Buffer.from('esto no es un zip')); } catch (e) { err = e.message; }
  ok(/Visio válido/.test(err), 'Un archivo que no es Visio da un mensaje claro');
  const r = V.organigramaDesdeVsdx(vsdx(), { parser });
  const por = (c) => r.posiciones.find((p) => p.cargo === c);
  ok(r.posiciones.length === 5 && r.resumen.omitidas === 1 && /sin conexión/.test(r.avisos.join(' ')), 'Lee 5 cargos conectados y omite el título suelto avisando');
  ok(!por('Director General').jefeId && por('Director General').nombre === 'Ana Prueba', 'Cima del organigrama con su nombre (auto-detecta cargo por palabras como «Director»)');
  ok(por('Gerente Comercial Balú').jefeId === por('Director General').id && por('Gerente de Compras').jefeId === por('Director General').id, 'Los gerentes reportan al Director General');
  ok(por('Analista de Compras').jefeId === por('Gerente de Compras').id, 'Un conector dibujado al revés (de abajo hacia arriba) se corrige por la posición de los recuadros');
  ok(por('Analista de Compras').nombre === 'María Muestra', 'El nombre puede venir de los datos de la forma (propiedad «Nombre»)');
  ok(por('Gerente de Compras').vacante === true && por('Gerente de Compras').nombre === '', 'La palabra VACANTE marca el cargo como vacante');
  ok(por('Analista Comercial').nombre === 'Carlos Dato', 'Si el nombre va primero y el cargo después, se detecta');
  ok(por('Gerente Comercial Balú').areaId === 'COMBALU' && por('Analista Comercial').areaId === 'COMBALU' && por('Gerente de Compras').areaId === 'COMPRAS' && por('Analista de Compras').areaId === 'COMPRAS' && por('Director General').areaId === 'DG', 'Las áreas salen de la gerencia directa y se reconocen las áreas conocidas');
  const forzado = V.organigramaDesdeVsdx(vsdx(), { parser, orden: 'cargo-nombre' });
  ok(forzado.posiciones.find((p) => p.nombre === 'Analista Comercial'), 'Se puede forzar que la primera línea sea el cargo');
  const f = V.fusionarEstructura(r, { posiciones: [{ id: 'X1', nombre: 'Ana Prueba', cargo: 'Dir', comp: { sal: 100 }, perfilId: 'p1' }, { id: 'X2', vacante: true, cargo: 'Gerente de Compras', comp: { sal: 50 } }] });
  ok(f.conservados === 2 && f.posiciones.find((p) => p.nombre === 'Ana Prueba').comp.sal === 100 && f.posiciones.find((p) => p.cargo === 'Gerente de Compras').comp.sal === 50, 'Al volver a cargar se conserva la compensación de quien coincide');
  const L = V.disponerArbol(r.posiciones);
  const yDe = (c) => L.nodos.find((n) => n.id === por(c).id);
  ok(L.nodos.length === 5 && L.enlaces.length === 4 && yDe('Director General').y < yDe('Gerente de Compras').y && yDe('Analista de Compras').y > yDe('Gerente de Compras').y, 'El trazado ordena por niveles y une cada cargo con su jefe');

  /* --- aplicación --- */
  let dom; let w; let d;
  const crear = (estado) => {
    dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://ejemplo.test/', beforeParse(w0) { w0.scrollTo = () => {}; w0.URL.createObjectURL = () => 'blob:x'; w0.URL.revokeObjectURL = () => {}; if (estado) w0.localStorage.setItem('talento-balu-v2', estado); } });
    w = dom.window; d = w.document;
  };
  const click = async (el, ms = 120) => { const e = [...d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido'); if (e && e !== el) { e.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(100); } if (!el) throw new Error('falta elemento'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await espera(ms); };
  const boton = (t, i = 0) => [...d.querySelectorAll('button')].filter((x) => x.textContent.trim().includes(t))[i];
  const nav = (t) => [...d.querySelectorAll('aside nav button')].find((b) => b.textContent.trim().startsWith(t));
  const pest = (t) => [...d.querySelectorAll('[role=tab]')].find((x) => x.textContent.trim().startsWith(t));
  const guardado = () => JSON.parse(w.localStorage.getItem('sgi-estructura-admin-v1'));
  const subir = async (bytes, nombre) => {
    const inp = d.getElementById('adm-visio');
    Object.defineProperty(inp, 'files', { value: [new w.File([bytes], nombre)], configurable: true });
    inp.dispatchEvent(new w.Event('change', { bubbles: true })); await espera(500);
  };
  crear(); await espera(400);
  await click(boton('Gerente de RRHH'), 250);
  await click(nav('Estructura administrativa'), 300);
  ok(!!d.getElementById('adm-visio') && /Visio \(\.vsdx\)/.test(d.body.textContent), 'La pestaña Datos pide un archivo de Visio (.vsdx)');
  await subir(Buffer.from('{"areas":[]}'), 'organigrama.json');
  ok(/\.vsdx/.test([...d.querySelectorAll('[role=alert], [role=status]')].map((x) => x.textContent).join(' ') + d.body.textContent) && !guardado(), 'Un archivo que no es .vsdx se rechaza');
  await subir(Buffer.from('no es zip'), 'malo.vsdx');
  ok(/Visio válido/.test((d.querySelector('[role=dialog]') || {}).textContent || ''), 'Un .vsdx dañado muestra un error claro en la vista previa');
  await click(boton('Cancelar'), 150);
  await subir(vsdx(), 'organigrama.vsdx');
  const dlg = () => [...d.querySelectorAll('[role=dialog]')].pop();
  ok(dlg() && /5 cargos \(1 vacantes\)/.test(dlg().textContent) && /Analista de Compras/.test(dlg().textContent) && /sin conexión/.test(dlg().textContent), 'La vista previa muestra los cargos leídos y los avisos');
  ok(!guardado(), 'Hasta confirmar no se guarda nada');
  await click(d.getElementById('adm-visio-cargar'), 400);
  const g = guardado();
  ok(g && g.posiciones.length === 5 && g.origen === 'visio' && g.areas.some((a) => a.id === 'COMPRAS'), 'Al confirmar, el organigrama queda en este equipo');
  ok(!!d.getElementById('org-diagrama') && d.querySelectorAll('[data-org-nodo]').length === 5, 'El organigrama se muestra como diagrama con un recuadro por cargo');
  ok(/Vacante/.test(d.getElementById('org-diagrama').textContent) && /Ana Prueba/.test(d.getElementById('org-diagrama').textContent), 'El diagrama muestra nombres y vacantes');
  await click(d.getElementById('org-vista-lista'), 200);
  ok(!d.getElementById('org-diagrama') && /Director General/.test(d.body.textContent), 'Se puede cambiar a la vista de lista');
  await click(pest('Personal y cargos'), 250);
  const selArea = d.querySelector('select[id^=adm-area-]');
  ok(!!selArea, 'RRHH puede ajustar el área de cada cargo');
  ok((guardado().posiciones || []).every((p) => p.areaId), 'Todos los cargos tienen área');
  console.log(process.exitCode ? '\nHAY FALLAS' : '\nTodo correcto');
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('✗ Error:', e); process.exit(1); });
