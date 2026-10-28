/* Genera los manuales de uso por perfil de la versión vigente.
   Uso (desde la carpeta del código, después de compilar):
     node manuales/extraer-menu.cjs > manuales/menu-por-perfil.json
     node manuales/generar-manuales.cjs <carpeta-de-salida>
   Produce, por perfil, un .md, un .html y (si hay Chromium) un .pdf. Se detiene con error si un módulo del menú
   no tiene explicación en contenido.cjs, para que ningún manual quede incompleto tras una actualización. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.join(__dirname, '..');
const argumentos = process.argv.slice(2);
const SOLO_APP = argumentos.includes('--solo-app'); /* solo actualiza manuales-app.js (sin PDF), para cada publicación */
const salida = path.resolve(argumentos.find((a) => !a.startsWith('--')) || path.join(raiz, 'manuales', 'salida'));
fs.mkdirSync(salida, { recursive: true });

const { PERFILES, GENERAL, MODULOS, EXTERNOS } = require('./contenido.cjs');
const menu = JSON.parse(fs.readFileSync(path.join(__dirname, 'menu-por-perfil.json'), 'utf8'));
const versionesTxt = fs.readFileSync(path.join(raiz, 'versiones.js'), 'utf8');
const VERSION = (versionesTxt.match(/VERSION_ACTUAL\s*=\s*'([^']+)'/) || [])[1] || '¿?';
const HISTORIAL = eval('(' + versionesTxt.slice(versionesTxt.indexOf('[', versionesTxt.indexOf('HISTORIAL_VERSIONES')), versionesTxt.lastIndexOf(']') + 1) + ')');
const BUILD = ((fs.existsSync(path.join(raiz, 'build-info.js')) ? fs.readFileSync(path.join(raiz, 'build-info.js'), 'utf8') : '').match(/'([^']+)'/) || [])[1] || '';

/* Matriz de permisos tomada del código vigente */
const app = fs.readFileSync(path.join(raiz, 'App.jsx'), 'utf8');
const bloque = (nombre) => { const i = app.indexOf(`const ${nombre} = {`); const ini = app.indexOf('{', i); let n = 0; for (let k = ini; k < app.length; k++) { if (app[k] === '{') n++; else if (app[k] === '}') { n--; if (!n) return eval('(' + app.slice(ini, k + 1) + ')'); } } return {}; };
const PERMISOS = bloque('PERMISOS');
const NOMBRE_PASO = bloque('NOMBRE_PASO');

const alcance = (v) => (v === true ? 'en Balú y Planeta' : v === 'marca' ? 'en su marca' : v === 'propia' ? 'en su tienda' : '');
function puedeHacer(rol) {
  const p = PERMISOS[rol] || {};
  const l = [];
  const add = (clave, texto) => { if (p[clave]) l.push(`${texto} ${alcance(p[clave])}`.trim() + '.'); };
  add('verTodas', 'Ver la información');
  add('registrarIngreso', 'Registrar ingresos');
  if (p.crearSolicitud) l.push(p.tiposSolicitud ? `Crear solicitudes de tipo ${p.tiposSolicitud.map((t) => ({ PROMOCION: 'promoción', TRASLADO: 'traslado', DESINCORPORACION: 'desincorporación' }[t] || t)).join(', ')} ${alcance(p.crearSolicitud)}.` : `Crear solicitudes ${alcance(p.crearSolicitud)}.`);
  if ((p.aprobar || []).length) l.push(`Actuar en los pasos de aprobación de: ${p.aprobar.map((r) => NOMBRE_PASO[r] || r).join(', ')}.`);
  add('evaluar', 'Hacer o consultar evaluaciones');
  add('evaluarContrato', 'Evaluar período de prueba y contratos');
  add('registrarAmonestacion', 'Cargar amonestaciones');
  if (p.anularAmonestacion) l.push('Anular amonestaciones (con motivo).');
  add('editarDatosBase', 'Corregir datos base del personal');
  add('cargarPrecargados', 'Cargar el listado precargado y sincronizar datos');
  add('registrarPruebas', 'Registrar pruebas y accesos al portal');
  add('exportar', 'Exportar listados');
  if (p.configurar) l.push('Cambiar la configuración del sistema y administrar usuarios.');
  const no = [];
  if (!p.crearSolicitud) no.push('crear solicitudes');
  if (!(p.aprobar || []).length) no.push('aprobar');
  if (!p.exportar) no.push('exportar');
  if (!p.configurar) no.push('cambiar la configuración');
  return { si: l, no };
}

function entradaDe(texto) {
  if (MODULOS[texto]) return MODULOS[texto];
  return Object.values(MODULOS).find((m) => (m.alias || []).includes(texto));
}

/* Control de integridad: todo módulo visible debe estar explicado */
const faltan = new Set();
for (const rol of Object.keys(menu)) for (const g of menu[rol]) for (const m of g.modulos) if (!entradaDe(m.texto)) faltan.add(m.texto);
if (faltan.size) { console.error('FALTA explicar en manuales/contenido.cjs: ' + [...faltan].join(', ')); process.exit(1); }
for (const rol of Object.keys(menu)) if (!PERFILES[rol]) { console.error('FALTA el perfil en contenido.cjs: ' + rol); process.exit(1); }

const hoy = new Date().toLocaleDateString('es-VE', { timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: 'numeric' });
const cab = (titulo) => `# ${titulo}\n\n**Sistema de Gestión Integrado de RRHH Marcas Propias (Balú y Planeta)**  \nVersión **${VERSION}**${BUILD ? ` · compilada el ${BUILD}` : ''} · manual generado el ${hoy}\n\n`;
const novedades = () => '## Novedades de las últimas versiones\n\n' + HISTORIAL.slice(0, 4).map((h) => `**${h.version}** (${h.fecha.split('-').reverse().join('/')})\n\n${h.cambios.map((c) => `- ${c}`).join('\n')}`).join('\n\n') + '\n';

const ORDEN = ['admin', 'rrhh', 'analista', 'general', 'junta', 'marca', 'operaciones', 'tienda', 'visor', 'consulta'];
const archivos = [];
ORDEN.filter((r) => menu[r]).forEach((rol, i) => {
  const P = PERFILES[rol];
  const permisos = puedeHacer(rol);
  let md = cab(`Manual de uso · ${P.nombre}`);
  md += `## 1. Su perfil\n\n- **Alcance:** ${P.alcance}\n- **Función en el sistema:** ${P.resumen}\n\n`;
  md += `## 2. Lo que puede hacer\n\n${permisos.si.map((x) => `- ${x}`).join('\n')}\n${permisos.no.length ? `\nNo puede: ${permisos.no.join(', ')}.\n` : ''}\n`;
  md += '## 3. Su menú\n\n| Sección | Opciones |\n|---|---|\n' + menu[rol].map((g) => `| ${g.grupo || 'Inicio'} | ${g.modulos.map((m) => m.texto).join(' · ')} |`).join('\n') + '\n\n';
  const textoGeneral = (t) => (typeof t === 'string' ? t : t.roles.includes(rol) ? t.t : null);
  md += '## 4. Uso general\n\n' + GENERAL.map((c) => `### ${c.titulo}\n\n${c.texto.map(textoGeneral).filter(Boolean).map((t) => `- ${t}`).join('\n')}`).join('\n\n') + '\n\n';
  md += '## 5. Módulos, paso a paso\n\n';
  for (const g of menu[rol]) {
    md += `### ${g.grupo || 'Inicio'}\n\n`;
    for (const m of g.modulos) {
      const e = entradaDe(m.texto);
      md += `#### ${m.texto}${m.titulo && m.titulo !== m.texto ? ` — ${m.titulo}` : ''}\n\n`;
      /* El subtítulo se toma de la pantalla; se quitan las partes que dependen de los datos de la demo (tienda, fechas, conteos) */
      const sub = String(m.subtitulo || '').replace(/^(Tienda|Marca) [^·]+ · /, '');
      if (sub && !/datos al|en la vista|del \d{2}\/|Cifras al|Resumen al|^Balú y Planeta ·/.test(sub)) md += `> ${sub.charAt(0).toUpperCase() + sub.slice(1)}\n\n`;
      md += `**Para qué sirve.** ${e.para}\n\n`;
      if (m.pestanas && m.pestanas.length) md += `**Pestañas que usted ve:** ${m.pestanas.join(' · ')}.\n\n`;
      md += `**Cómo se usa:**\n\n${e.pasos.map((p, k) => `${k + 1}. ${p}`).join('\n')}\n\n`;
      if (e.notas && e.notas[rol]) md += `**En su perfil:** ${e.notas[rol]}\n\n`;
    }
  }
  md += '## 6. ' + novedades().replace(/^## /, '') + '\n';
  md += '## 7. Ayuda\n\nSi algo no funciona, anote la pantalla, la hora y el mensaje que aparece, y comuníquelo a la Gerencia de RRHH. Indique la versión que se ve en la cabecera.\n';
  const base = `${String(i + 1).padStart(2, '0')}-manual-${rol}`;
  fs.writeFileSync(path.join(salida, base + '.md'), md);
  archivos.push({ base, rol, titulo: `Manual de uso · ${P.nombre}` });
});
EXTERNOS.forEach((x, k) => {
  let md = cab(`Manual de uso · ${x.titulo}`);
  md += x.secciones.map((s) => `## ${s.titulo}\n\n${s.texto.map((t) => `- ${t}`).join('\n')}`).join('\n\n') + '\n';
  const base = `${String(ORDEN.length + k + 1).padStart(2, '0')}-manual-${x.archivo}`;
  fs.writeFileSync(path.join(salida, base + '.md'), md);
  archivos.push({ base, titulo: `Manual de uso · ${x.titulo}` });
});

/* HTML (pandoc) y PDF (Chromium) */
const css = `body{font-family:'IBM Plex Sans',Calibri,Arial,sans-serif;color:#2A1A22;max-width:46rem;margin:0 auto;padding:2rem 1.25rem;line-height:1.55;font-size:11pt}
h1{font-family:Georgia,serif;color:#6B1E3F;font-size:1.9rem;margin-bottom:.3rem}h2{color:#6B1E3F;border-bottom:2px solid #E9D7DF;padding-bottom:.2rem;margin-top:2rem;break-after:avoid}
h3{color:#3D1024;margin-top:1.5rem;break-after:avoid}h4{color:#6B1E3F;margin:1.4rem 0 .4rem;break-after:avoid}blockquote{break-inside:avoid;margin:.4rem 0;padding:.4rem .8rem;background:#F7F0F3;border-left:3px solid #B9879C;color:#5A4651}
table{border-collapse:collapse;width:100%;break-inside:avoid;font-size:10pt}th,td{border:1px solid #E1D3DA;padding:.35rem .5rem;text-align:left;vertical-align:top}th{background:#F7F0F3}
li{margin:.15rem 0}code{font-family:'IBM Plex Mono',monospace;font-size:.9em}@page{size:Letter;margin:18mm 16mm}`;
fs.writeFileSync(path.join(salida, 'manual.css'), css);
const encabezadoHtml = path.join(salida, '.encabezado.html');
fs.writeFileSync(encabezadoHtml, `<style>${css}</style><style>header#title-block-header{display:none}</style>`);
/* Manual de cada perfil incrustado en el sistema (menú «Ayuda › Manual de uso»): manuales-app.js */
const manualesApp = {};
for (const a of archivos.filter((x) => x.rol)) {
  const cuerpo = execFileSync('pandoc', [path.join(salida, a.base + '.md'), '-f', 'gfm', '-t', 'html5', '--wrap=none', '--id-prefix=man-'], { encoding: 'utf8' });
  manualesApp[a.rol] = { titulo: a.titulo, archivo: `${a.base}-v${VERSION}.pdf`, html: cuerpo };
}
fs.writeFileSync(path.join(raiz, 'manuales-app.js'), `/* Generado por manuales/generar-manuales.cjs — no editar a mano. Versión ${VERSION}. */\nexport const VERSION_MANUALES = ${JSON.stringify(VERSION)};\nexport const MANUALES = ${JSON.stringify(manualesApp)};\n`);
if (SOLO_APP) { fs.rmSync(encabezadoHtml, { force: true }); console.log(`manuales-app.js actualizado (${Object.keys(manualesApp).length} perfiles) para la versión ${VERSION}`); process.exit(0); }
const chrome = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME].filter((x) => x && fs.existsSync(x))[0];
for (const a of archivos) {
  const md = path.join(salida, a.base + '.md');
  const html = path.join(salida, a.base + '.html');
  try {
    execFileSync('pandoc', [md, '-f', 'gfm', '-t', 'html5', '-s', '--metadata', `title=${a.titulo}`, '--metadata', 'lang=es', '-H', encabezadoHtml, '-o', html]);
  } catch (e) { console.error('pandoc no disponible: solo .md para ' + a.base); continue; }
  if (chrome) {
    try { execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${path.join(salida, a.base + '.pdf')}`, 'file://' + html], { stdio: 'ignore', timeout: 120000 }); } catch (e) { console.error('No se generó el PDF de ' + a.base); }
  }
}
fs.rmSync(encabezadoHtml, { force: true });
const indice = cab('Manuales de uso por perfil') + archivos.map((a) => `- **${a.titulo}** — \`${a.base}.pdf\` (también .html y .md)`).join('\n') + '\n\nCada manual se genera desde la versión compilada: el menú, las pestañas y los textos de pantalla son los que ese perfil ve en esta versión.\n';
fs.writeFileSync(path.join(salida, '00-INDICE.md'), indice);
console.log(`Manuales generados (${archivos.length}) para la versión ${VERSION} en ${salida}`);
