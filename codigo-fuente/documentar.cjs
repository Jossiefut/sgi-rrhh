/* Genera la documentación técnica de la versión vigente para el programador.
   Uso: node documentar.cjs <carpeta-de-salida>
   Produce ARQUITECTURA.md e INVENTARIO-LIBRERIAS.md a partir del código, del package-lock.json,
   de las migraciones de Supabase y del menú por perfil extraído de la versión compilada. */
const fs = require('fs');
const path = require('path');
const raiz = __dirname;
const salida = path.resolve(process.argv[2] || path.join(raiz, 'doc-tecnica'));
fs.mkdirSync(salida, { recursive: true });
const leer = (f) => fs.readFileSync(path.join(raiz, f), 'utf8');
const app = leer('App.jsx');
const versiones = leer('versiones.js');
const VERSION = (versiones.match(/VERSION_ACTUAL\s*=\s*'([^']+)'/) || [])[1];
const BUILD = (leer('build-info.js').match(/'([^']+)'/) || [])[1];
const bloque = (nombre) => { const i = app.indexOf(`const ${nombre} = `); const ini = app.slice(i).search(/[[{]/) + i; const abre = app[ini], cierra = abre === '{' ? '}' : ']'; let n = 0; for (let k = ini; k < app.length; k++) { if (app[k] === abre) n++; else if (app[k] === cierra) { n--; if (!n) return eval('(' + app.slice(ini, k + 1) + ')'); } } return null; };
const ROLES = bloque('ROLES');
const PERMISOS = bloque('PERMISOS');
const TIPOS_SOLICITUD = bloque('TIPOS_SOLICITUD');
const COLECCIONES = bloque('COLECCIONES_NUBE');
const lineas = (f) => leer(f).split('\n').length;

/* Acciones del reductor (estado global) */
const iniR = app.indexOf('function reducer(estado, accion)');
const finR = app.indexOf('\n}\n', iniR);
const acciones = [...new Set([...app.slice(iniR, finR).matchAll(/case '([A-Z_]+)'/g)].map((m) => m[1]))];

/* Mapa de archivos fuente */
const DESCRIPCION = {
  'App.jsx': 'Aplicación completa (React 18): estado global con reducer, pantallas de todos los módulos, permisos, documentos PDF, informes y exportaciones.',
  'entry.jsx': 'Punto de entrada de la versión de demostración (datos locales en el navegador).',
  'entry-nube.jsx': 'Punto de entrada del sitio publicado: crea el cliente de Supabase (URL y clave anon inyectadas al compilar) y monta la App.',
  'entry-prueba-nube.jsx': 'Banco de pruebas de la capa de nube (opcional).',
  'nube.js': 'Capa de datos en Supabase: sesión, carga paginada, guardado por lotes, accesos del portal, clima, recepción automática.',
  'sincronizacion.js': 'Importación de formularios y BI: normalización, cruce por cédula, tiendas reales, HC aprobado de Planeta, registros repetidos.',
  'salidas.js': 'Entrevistas de salida: lectura del Excel de Forms y análisis de egresos críticos.',
  'kitlegal.js': 'Plantillas y formato del kit legal de ingreso (contratos, acuerdos), montos y fechas en letras.',
  'desarrollo.js': 'Formación, plan de sucesión, rutas de carrera, puntaje de preparación y riesgo del titular.',
  'ponderacion.js': 'Batería por cargo, ponderación de la constancia de match, perfiles IPV, conducta.',
  'intentos.js': 'Control de intentos y tiempo de las pruebas del portal (espejo del servidor).',
  'ipv.js': 'Prueba IPV: clave, escalas, baremos, corrección e informe (no modificar).',
  'ipv-cuadernillo.js': 'Enunciados del cuadernillo IPV (87 preguntas).',
  'kostick.js': 'Inventario Kostick: corrección, 20 escalas, perfiles por cargo y match.',
  'kostick-cuadernillo.js': 'Enunciados del Kostick (90 pares).',
  'logico.js': 'Indicador Lógico I: clave, corrección y mínimos por cargo.',
  'logico-cuadernillo.js': 'Preguntas del Indicador Lógico con figuras SVG.',
  'ipc.js': 'Inventario de Personalidad Comercial (54 afirmaciones): corrección, índice de potencial y match (no modificar).',
  'disc.js': 'DISC (28 grupos): corrección, estilos e interpretación (no modificar).',
  'integridad.js': 'Prueba de Integridad Laboral (46 afirmaciones): corrección y conclusiones (no modificar).',
  'clima.js': 'Clima laboral y buzón de sugerencias: ciclos, cálculo, agrupación con mínimo de 5, enlaces.',
  'cumpleanos.js': 'Edad, rangos, cumpleaños del mes y mensajes de WhatsApp por cargo.',
  'logos.js': 'Logos de Balú y Planeta incrustados (PNG en base64).',
  'versiones.js': 'Versión vigente e historial de cambios (se muestra en la app).',
  'manuales-app.js': 'Manual de cada perfil incrustado en el sistema (Ayuda › Manual de uso); lo genera actualizar-manuales.sh.',
  'actualizar-manuales.sh': 'Regenera el manual de cada perfil dentro del sistema y recompila (lo usan publicar.sh y exportar.sh).',
  'descripciones.js': 'Descripciones de cargo de tienda estructuradas (funciones, competencias, perfil, perfil del colaborador); lo genera descripciones/construir-descripciones.py.',
  'politicas.js': 'Políticas de RRHH por subsistema: fuente única de la pantalla Ayuda › Políticas, del PDF y de los Word (politicas/generar-word.mjs).',
  'build-info.js': 'Fecha y hora de compilación (lo escribe construir-todo.sh).',
  'in.css': 'Entrada de Tailwind CSS.',
  'tailwind.config.js': 'Configuración de Tailwind (rutas de contenido).',
  'build.py': 'Arma talento-balu.html (demo) con el JS y el CSS compilados.',
  'build-nube.py': 'Arma sitio/index.html (sitio publicado).',
  'construir-todo.sh': 'Compila todo: esbuild + Tailwind + armado de demo y sitio.',
  'publicar.sh': 'Compila, prueba, actualiza el paquete y sube a GitHub (Vercel republica solo).',
  'exportar.sh': 'Genera este paquete de transferencia completo.',
  'documentar.cjs': 'Genera esta documentación técnica.',
  'probar-todo.sh': 'Ejecuta todas las pruebas automáticas.',
  'package.json': 'Dependencias npm.',
  'package-lock.json': 'Versiones exactas de las 177 dependencias.',
};
const fuentes = fs.readdirSync(raiz).filter((f) => DESCRIPCION[f] && fs.existsSync(path.join(raiz, f)));
const pruebas = fs.readdirSync(raiz).filter((f) => /^test.*\.(cjs|mjs)$/.test(f)).sort();

/* Base de datos */
const migDir = path.join(raiz, 'supabase', 'migraciones');
const migraciones = fs.existsSync(migDir) ? fs.readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort() : [];
const esquema = fs.existsSync(path.join(raiz, 'supabase', 'esquema-actual.sql')) ? leer('supabase/esquema-actual.sql') : '';
const tablas = [...esquema.matchAll(/create table if not exists public\.([a-z_]+) \(([\s\S]*?)\n\);/g)].map((m) => ({ nombre: m[1], columnas: m[2].split('\n').map((l) => l.trim().split(' ')[0]).filter(Boolean) }));
const funciones = [...esquema.matchAll(/CREATE OR REPLACE FUNCTION ([a-z_.]+)\(([^)]*)\)/g)].map((m) => `${m[1]}(${m[2]})`);
const DESC_TABLA = {
  perfiles: 'Usuarios del sistema (1:1 con auth.users): nombre, correo, rol, marca, tienda, activo.',
  registros: 'Almacén documental de la app: una fila por registro (colección + id), con tienda_id y marca para RLS y el contenido en jsonb.',
  ajustes: 'Configuración global (clave → jsonb): config, pruebas, cuadernillo IPV, conteos de cumplimiento.',
  fichas_personales: 'Ficha del formulario de actualización de datos por cédula (sin datos bancarios).',
  fichas_sensibles: 'Discapacidad y CONAPDIS por cédula. Solo RRHH.',
  accesos_prueba: 'Accesos al portal de evaluación (clave cifrada con bcrypt), batería, intentos y respuestas.',
  respuestas_pil: 'Respuestas individuales de la Integridad laboral. Solo RRHH y Administrador.',
  recordatorios_envios: 'Registro de cada correo de recordatorio enviado.',
  admins_iniciales: 'Correos autorizados para el «Primer acceso del Administrador».',
  integracion_clave: 'Huella SHA-256 de la clave de integración de Power Automate.',
  formulario_recibido: 'Respuestas del formulario recibidas automáticamente, pendientes de revisar y aplicar.',
};

const menu = fs.existsSync(path.join(raiz, 'manuales', 'menu-por-perfil.json')) ? JSON.parse(leer('manuales/menu-por-perfil.json')) : {};
const val = (v) => (v === true ? 'Ambas marcas' : v === 'marca' ? 'Su marca' : v === 'propia' ? 'Su tienda' : Array.isArray(v) ? (v.join(', ') || '—') : v ? String(v) : '—');
const CLAVES = ['verTodas', 'registrarIngreso', 'editarDatosBase', 'crearSolicitud', 'tiposSolicitud', 'aprobar', 'evaluar', 'evaluarContrato', 'registrarAmonestacion', 'anularAmonestacion', 'cargarPrecargados', 'registrarPruebas', 'exportar', 'configurar'];

let md = `# Arquitectura técnica · SGI RRHH Marcas Propias

Versión **${VERSION}** · compilada el ${BUILD} · documento generado automáticamente desde el código por \`documentar.cjs\`.

## 1. Resumen
Aplicación web de una sola página (SPA) para la gestión de RRHH de Balú (19 tiendas) y Planeta (11 tiendas), de Representaciones Ulab 24, C.A.

| Capa | Tecnología |
|---|---|
| Interfaz | React 18.3 (sin framework), íconos lucide-react, estilos Tailwind CSS 3.4 |
| Empaquetado | esbuild 0.28 (un solo JS minificado) + Tailwind CLI; Python 3 arma un único \`index.html\` autocontenido |
| Datos (sitio publicado) | Supabase: PostgreSQL con RLS por rol, marca y tienda; Auth (correo y contraseña); 2 Edge Functions (Deno) |
| Datos (demo) | Estado en el navegador (localStorage), con datos de ejemplo |
| Publicación | GitHub (repo \`Jossiefut/sgi-rrhh\`, rama \`main\`: \`index.html\` + \`vercel.json\`) → Vercel (proyecto \`sgi-rrhh\`, preset «Other», sin compilación en Vercel) |
| Librerías en tiempo de ejecución (CDN) | SheetJS 0.18.5 (Excel) y html2pdf.js 0.10.1 (PDF) desde cdnjs; fuentes Fraunces, IBM Plex Sans y Mono desde Google Fonts. Copias locales en \`02-librerias\` |
| Correo | Resend (API) desde la Edge Function \`recordatorios\` |
| Integración | Power Automate → función \`recibir_formulario\` (RPC pública protegida por clave) |

## 2. Cómo se compila
1. \`npm ci\` (o sin Internet: \`npm ci --offline --cache ../02-librerias/npm-cache\`).
2. \`bash construir-todo.sh\`:
   - escribe \`build-info.js\` con la fecha y hora (America/Caracas);
   - \`esbuild entry.jsx\` → \`dist/app.js\` (demo) y \`esbuild entry-nube.jsx\` → \`dist/nube.js\` (sitio), con \`process.env.SUPABASE_URL\` y \`SUPABASE_ANON_KEY\` inyectadas (variables de entorno \`SUPABASE_URL\` / \`SUPABASE_ANON_KEY\`; si no existen usa las del proyecto actual);
   - \`tailwindcss -i in.css\` → \`dist/app.css\`;
   - \`build.py\` → \`talento-balu.html\` (demo) y \`build-nube.py\` → \`sitio/index.html\` (sitio).
3. \`bash probar-todo.sh\`: ${pruebas.length} pruebas automáticas (jsdom) sobre la demo compilada.
4. Publicar: copiar \`sitio/index.html\` y \`sitio/vercel.json\` al repositorio y hacer \`git push\` a \`main\` (lo hace \`publicar.sh\`).

La clave anon de Supabase es pública por diseño; la seguridad la dan las políticas RLS y las funciones \`SECURITY DEFINER\`. La clave \`service_role\` solo existe en las Edge Functions (secreto de Supabase), nunca en el navegador.

## 3. Archivos fuente
| Archivo | Líneas | Función |
|---|---:|---|
${fuentes.map((f) => `| \`${f}\` | ${lineas(f)} | ${DESCRIPCION[f]} |`).join('\n')}
| \`figuras-logico/\` | — | Generador (Python) y SVG de las figuras del Indicador Lógico. |
| \`manuales/\` | — | Contenido y generadores de los manuales de uso por perfil. |
| \`supabase/\` | — | Migraciones, esquema actual, Edge Functions y prueba del esquema. |

## 4. Estado global y acciones
El estado vive en un \`useReducer\` (\`reducer\` en App.jsx). Cada acción que modifica datos agrega una entrada a la bitácora con la «foto» del usuario (nombre, rol, cargo y ubicación al momento de actuar). En el sitio publicado, \`nube.js\` guarda los cambios en la tabla \`registros\`.

**Colecciones sincronizadas con Supabase (${COLECCIONES.length}):** ${COLECCIONES.map((c) => `\`${c}\``).join(', ')}. Además: \`config\` y otros ajustes en la tabla \`ajustes\`; fichas en \`fichas_personales\`/\`fichas_sensibles\`; accesos del portal en \`accesos_prueba\`.

**Acciones del reductor (${acciones.length}):** ${acciones.map((a) => `\`${a}\``).join(', ')}.

## 5. Roles y permisos
| Rol (clave) | Nombre | ${CLAVES.join(' | ')} |
|---|---|${CLAVES.map(() => '---').join('|')}|
${Object.keys(PERMISOS).map((r) => `| \`${r}\` | ${ROLES[r]} | ${CLAVES.map((k) => val(PERMISOS[r][k])).join(' | ')} |`).join('\n')}

Los mismos límites se aplican en la base de datos con \`app.puede_ver(coleccion, tienda, marca)\` y \`app.puede_escribir(...)\`.

## 6. Menú por perfil (extraído de la versión compilada)
${Object.keys(menu).map((r) => `- **${ROLES[r]}**: ${menu[r].map((g) => `${g.grupo}: ${g.modulos.map((m) => m.texto).join(', ')}`).join(' · ')}`).join('\n')}

## 7. Flujos de aprobación
| Flujo | Ruta |
|---|---|
| Traslado y promoción | Gerente de Marca → Gerente de Operaciones → Gerente de RRHH (validación) → Gerente General (firma). Al firmar se actualizan tienda/cargo, historial, onboarding y ruta habitual. |
| Desincorporación (incluye Reporte de egresos) | Gerente de Marca → Gerente de Operaciones → Gerente General (solo si es Gerente de Tienda) → Gerente de RRHH (ejecución: el trabajador queda EGRESADO). |
| Período de prueba con limitaciones | Marca, Operaciones y RRHH (3 de 3). |
| Apoyos de personal | 2 de 3 (Marca, Operaciones, RRHH); monto distinto suma Gerencia General. |
| Pernoctas | Marca, Operaciones y RRHH. |
| Nine-Box | Evaluación → calibración (2 calibradores) → validación de RRHH → firma de Gerencia General (Gerente, Subgerente y administrativos). |
| Incentivos de ventas | RRHH registra → Gerencia General aprueba. |
| Nominación a sucesión | Gerente de Marca propone → RRHH aprueba (+ Gerencia General si es de otra marca). |

Tipos de solicitud: ${Object.entries(TIPOS_SOLICITUD).map(([k, v]) => `\`${k}\` (${v})`).join(', ')}.

## 8. Base de datos (Supabase)
**Tablas (${tablas.length}):**

| Tabla | Descripción | Columnas |
|---|---|---|
${tablas.map((t) => `| \`${t.nombre}\` | ${DESC_TABLA[t.nombre] || ''} | ${t.columnas.join(', ')} |`).join('\n')}

**Funciones (${funciones.length}):** ${funciones.map((f) => `\`${f}\``).join(', ')}.

**Disparadores:** \`al_crear_usuario\` (auth.users → crea el perfil), \`registros_sellar\` y \`fichas_sellar\` (completan marca, fecha y autor).

**Migraciones (${migraciones.length}, en orden):** ${migraciones.map((m) => `\`${m}\``).join(', ')}.

\`supabase/esquema-actual.sql\` es la foto exacta del servidor. \`supabase/probar-esquema.sh\` crea la base desde cero por los dos caminos (esquema y migraciones) en un PostgreSQL local y confirma que dan lo mismo.

**Edge Functions:** \`admin-usuarios\` (alta, actualización, restablecer clave y activación del administrador inicial; usa \`SUPABASE_SERVICE_ROLE_KEY\`) y \`recordatorios\` (envío de correos con Resend; secretos \`RESEND_API_KEY\` y \`REMITENTE_CORREO\`). Ambas con \`verify_jwt = true\`.

**Ajustes de Auth:** desactivar «Allow new users to sign up» (solo el Administrador crea cuentas desde la app).

## 9. Seguridad y datos personales
- RLS activa en todas las tablas; el rol se lee de \`perfiles\` con \`app.mi_rol()\`.
- Datos sensibles (discapacidad, CONAPDIS, respuestas del PIL) en tablas separadas con acceso exclusivo de RRHH (y Administrador para el PIL).
- No se guardan datos bancarios: la importación y \`recibir_formulario\` descartan columnas de banco o cuenta.
- Claves del portal cifradas (bcrypt); 5 intentos fallidos bloquean 15 minutos.
- Cada acción guarda quién la hizo con su cargo y ubicación; los usuarios no se reutilizan.
- \`vercel.json\` define encabezados de seguridad (CSP, X-Frame-Options, etc.).

## 10. Pendientes conocidos
Ver \`documentos-del-proyecto/BITACORA-cambios.md\` (sección Pendientes) y la sección «Pendientes» del LEEME funcional.
`;
fs.writeFileSync(path.join(salida, 'ARQUITECTURA.md'), md);

/* Inventario de librerías */
const lock = JSON.parse(leer('package-lock.json'));
const directas = Object.keys(JSON.parse(leer('package.json')).dependencies || {});
const USO = {
  react: 'Interfaz', 'react-dom': 'Interfaz (render en el navegador)', 'lucide-react': 'Íconos', '@supabase/supabase-js': 'Cliente de Supabase (sitio publicado)',
  esbuild: 'Compilador/empaquetador (solo al compilar)', tailwindcss: 'Estilos (solo al compilar)', jsdom: 'Pruebas automáticas (solo desarrollo)',
};
const filas = Object.entries(lock.packages).filter(([k]) => k).map(([k, v]) => ({ nombre: k.replace(/^.*node_modules\//, ''), version: v.version, licencia: v.license || '', directa: directas.includes(k.replace(/^node_modules\//, '')), opcional: Boolean(v.optional), dev: Boolean(v.dev) }));
filas.sort((a, b) => (b.directa - a.directa) || a.nombre.localeCompare(b.nombre));
let inv = `# Inventario de librerías · versión ${VERSION}

## 1. Dependencias directas (package.json)
| Paquete | Versión exacta | Licencia | Uso |
|---|---|---|---|
${filas.filter((f) => f.directa).map((f) => `| ${f.nombre} | ${f.version} | ${f.licencia} | ${USO[f.nombre] || ''} |`).join('\n')}

## 2. Librerías cargadas en tiempo de ejecución
| Librería | Versión | Licencia | Origen en la app | Copia local |
|---|---|---|---|---|
| SheetJS (xlsx) | 0.18.5 | Apache-2.0 | https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js | \`02-librerias/cdn/xlsx.full.min.js\` |
| html2pdf.js | 0.10.1 | MIT | https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js | \`02-librerias/cdn/html2pdf.bundle.min.js\` |
| Fraunces (600) | 5.3.0 (Fontsource) | OFL-1.1 | Google Fonts | \`02-librerias/fuentes/\` |
| IBM Plex Sans (400-700) | 5.3.0 (Fontsource) | OFL-1.1 | Google Fonts | \`02-librerias/fuentes/\` |
| IBM Plex Mono (400-500) | 5.3.0 (Fontsource) | OFL-1.1 | Google Fonts | \`02-librerias/fuentes/\` |

## 3. Edge Functions (Deno en Supabase)
| Paquete | Versión | Dónde |
|---|---|---|
| npm:@supabase/supabase-js | 2 (última 2.x al desplegar) | \`admin-usuarios\` y \`recordatorios\` |

## 4. Herramientas del entorno
| Herramienta | Versión usada | Para qué |
|---|---|---|
| Node.js | 22 (mínimo 18) | Compilar y probar |
| npm | 10 | Instalar dependencias |
| Python | 3.9 o superior (solo biblioteca estándar) | Armar los HTML (build.py, build-nube.py) y figuras del Lógico |
| pandoc y Chromium (opcional) | — | Generar los manuales en HTML y PDF |
| PostgreSQL 15+ (opcional) | — | \`supabase/probar-esquema.sh\` |
| Supabase CLI (opcional) | — | Desplegar Edge Functions y migraciones |

## 5. Todas las dependencias instaladas (${filas.length}, de package-lock.json)
| Paquete | Versión | Licencia | Tipo |
|---|---|---|---|
${filas.map((f) => `| ${f.nombre} | ${f.version} | ${f.licencia} | ${f.directa ? 'directa' : 'transitiva'}${f.opcional ? ', opcional (binario por plataforma)' : ''}${f.dev ? ', desarrollo' : ''} |`).join('\n')}
`;
fs.writeFileSync(path.join(salida, 'INVENTARIO-LIBRERIAS.md'), inv);
console.log(`Documentación técnica ${VERSION}: ${acciones.length} acciones, ${tablas.length} tablas, ${funciones.length} funciones, ${filas.length} paquetes`);
