#!/bin/bash
# COMANDO «EXPORTAR»: arma el paquete completo para transferir el sistema a un programador.
# Uso: bash exportar.sh
# Resultado: exportacion/SGI-RRHH-v<versión>-exportacion.zip con:
#   00-LEEME-PRIMERO.md, 01-codigo-fuente, 02-librerias (todas, sin conexión), 03-base-de-datos,
#   04-despliegue, 05-pruebas, 06-documentacion-tecnica, 07-manuales-de-uso (por perfil, PDF/HTML/MD), SHA256SUMS.txt
# Pasos: compila, ejecuta todas las pruebas, verifica el esquema de base de datos, extrae el menú real de cada
# perfil, genera manuales y documentación, actualiza la caché de librerías si cambió package-lock.json y empaqueta.
set -e
cd "$(dirname "$0")"
RAIZ=$(pwd)
V=$(grep -o "VERSION_ACTUAL = '[^']*'" versiones.js | cut -d"'" -f2)
FECHA=$(TZ=America/Caracas date '+%d/%m/%Y %H:%M')
N="SGI-RRHH-v$V"
OUT="$RAIZ/exportacion"
D="$OUT/$N"
echo "== Exportación de la versión $V ($FECHA)"

echo "-- 1/8 Compilando (y actualizando el manual de cada perfil dentro del sistema)"
bash construir-todo.sh
bash actualizar-manuales.sh >/dev/null

echo "-- 2/8 Pruebas automáticas (tarda unos minutos)"
TMPP=$(mktemp)
if ! bash probar-todo.sh "$TMPP"; then cat "$TMPP"; echo "✗ Hay pruebas con fallas: no se exporta."; exit 1; fi
tail -1 "$TMPP"

echo "-- 3/8 Esquema de base de datos"
ESQ="No verificado (PostgreSQL no instalado en este equipo)."
if ls /usr/lib/postgresql/*/bin/initdb >/dev/null 2>&1 || command -v initdb >/dev/null; then
  ESQ=$(bash supabase/probar-esquema.sh 2>&1 | grep -v NOTICE) || { echo "$ESQ"; echo "✗ El esquema no se pudo verificar: no se exporta."; exit 1; }
fi
echo "$ESQ"

echo "-- 4/8 Menú real de cada perfil (extraído en el paso 1)"

echo "-- 5/8 Librerías sin conexión"
HUELLA=$(sha256sum package-lock.json | cut -d' ' -f1)
if [ "$(cat vendor/npm-cache/.huella-lock 2>/dev/null)" != "$HUELLA" ]; then
  echo "   package-lock.json cambió: se rehace la caché de npm"
  W=$(mktemp -d); cp package.json package-lock.json "$W/"
  rm -rf vendor/npm-cache; mkdir -p vendor/npm-cache
  (cd "$W" && npm ci --cache "$RAIZ/vendor/npm-cache" --ignore-scripts --no-audit --no-fund >/dev/null)
  EV=$(node -p "require('./package-lock.json').packages['node_modules/esbuild'].version")
  for p in win32-x64 win32-arm64 darwin-arm64 darwin-x64 linux-x64 linux-arm64; do npm cache add "@esbuild/$p@$EV" --cache "$RAIZ/vendor/npm-cache" >/dev/null; done
  rm -rf "$W" vendor/npm-cache/_logs vendor/npm-cache/_update-notifier-last-checked
  echo "$HUELLA" > vendor/npm-cache/.huella-lock
fi

echo "-- 6/8 Armando carpetas"
rm -rf "$D"; mkdir -p "$D"/{01-codigo-fuente,02-librerias,03-base-de-datos,04-despliegue,05-pruebas,06-documentacion-tecnica,07-manuales-de-uso}
C="$D/01-codigo-fuente"
# Código: todo lo necesario para compilar, probar y documentar (sin respaldos, fragmentos ni scripts de edición)
FUENTES="App.jsx amonestlit.js test-amonestacion-literal.cjs test-firmantes-amon.cjs subir-codigo-github.sh test-notificacion-solicitud.cjs test-montos-autorizacion.cjs remuneracion.js kpis-adm.js test-remuneracion.cjs test-nps.cjs autenticacion.js egresos-analisis.js perfil-personal.js claves.js docsadm.js docstienda.js evalfijo.js documentos-adm.js entry.jsx entry-nube.jsx entry-prueba-nube.jsx nube.js sincronizacion.js salidas.js kitlegal.js desarrollo.js ponderacion.js intentos.js
ipv.js ipv-cuadernillo.js kostick.js kostick-cuadernillo.js logico.js logico-cuadernillo.js ipc.js disc.js integridad.js clima.js cumpleanos.js logos.js firmas.js esquema-comisiones.js visio.js
versiones.js build-info.js manuales-app.js descripciones.js perfiles-adm.js politicas.js in.css tailwind.config.js build.py build-nube.py construir-todo.sh actualizar-manuales.sh publicar.sh exportar.sh probar-todo.sh documentar.cjs
package.json package-lock.json logo-balu.png logo-planeta.png"
for f in $FUENTES; do [ -f "$f" ] && cp "$f" "$C/"; done
cp test*.cjs test*.mjs "$C/"
mkdir -p "$C/docs-adm" && cp docs-adm/construir-docs-adm.py "$C/docs-adm/" && cp -r docs-adm/originales "$C/docs-adm/"
mkdir -p "$C/manuales" && cp manuales/*.cjs manuales/menu-por-perfil.json "$C/manuales/"
cp -r figuras-logico fixtures "$C/"
mkdir -p "$C/descripciones" "$C/politicas" && cp descripciones/*.py "$C/descripciones/" && cp -r descripciones/fuente "$C/descripciones/" && cp politicas/*.mjs "$C/politicas/"
mkdir -p "$C/supabase" && cp -r supabase/migraciones supabase/pendientes supabase/functions supabase/esquema-actual.sql supabase/probar-esquema.sh supabase/probar-restablecer.sh "$C/supabase/"; mkdir -p "$C/pwa" && cp pwa/* "$C/pwa/"
mkdir -p "$C/docs-proyecto" && cp docs-proyecto/* "$C/docs-proyecto/"
cp paquete/LEEME.md "$C/LEEME-funcional.md"
cp paquete/INSTRUCCIONES-TI-PowerAutomate.md "$C/" 2>/dev/null || true
printf 'node_modules/\ndist/\nexportacion/\n*.zip\n' > "$C/.gitignore"
echo "22" > "$C/.nvmrc"
# Librerías
cp -r vendor/* "$D/02-librerias/"
cp package.json package-lock.json "$D/02-librerias/"
# Base de datos
cp -r supabase/migraciones supabase/pendientes supabase/functions supabase/esquema-actual.sql supabase/probar-esquema.sh supabase/probar-restablecer.sh "$D/03-base-de-datos/"
# Despliegue
mkdir -p "$D/04-despliegue/sitio"
cp sitio/index.html "$D/04-despliegue/sitio/"; cp pwa/* "$D/04-despliegue/sitio/"; cp paquete/sitio/vercel.json "$D/04-despliegue/sitio/"
cp talento-balu.html talento-balu-local.html "$D/04-despliegue/" 2>/dev/null || true
cp paquete/INSTRUCCIONES-TI-PowerAutomate.md "$D/04-despliegue/" 2>/dev/null || true
# Pruebas
cp "$TMPP" "$D/05-pruebas/RESULTADO-PRUEBAS.txt"; echo "$ESQ" > "$D/05-pruebas/RESULTADO-ESQUEMA-BD.txt"; rm -f "$TMPP"

echo "-- 7/8 Documentación técnica y manuales de uso"
node documentar.cjs "$D/06-documentacion-tecnica" >/dev/null
cp paquete/LEEME.md "$D/06-documentacion-tecnica/LEEME-funcional.md"
mkdir -p "$D/06-documentacion-tecnica/documentos-del-proyecto" && cp docs-proyecto/* "$D/06-documentacion-tecnica/documentos-del-proyecto/"
node -e "
const t=require('fs').readFileSync('versiones.js','utf8');const h=eval('('+t.slice(t.indexOf('[',t.indexOf('HISTORIAL_VERSIONES')),t.lastIndexOf(']')+1)+')');
console.log('# Historial de versiones\n\n'+h.map(v=>'## '+v.version+' · '+v.fecha.split('-').reverse().join('/')+'\n\n'+v.cambios.map(c=>'- '+c).join('\n')).join('\n\n'))" > "$D/06-documentacion-tecnica/HISTORIAL-VERSIONES.md"
node manuales/generar-manuales.cjs "$D/07-manuales-de-uso" >/dev/null
node politicas/generar-word.mjs "$D/08-politicas-word" >/dev/null 2>&1

cat > "$D/00-LEEME-PRIMERO.md" <<EOF
# Paquete de transferencia · SGI RRHH Marcas Propias (Balú y Planeta)

**Versión $V** · exportado el $FECHA (hora de Venezuela) · sitio en producción: https://sgi-rrhh.vercel.app

Este paquete contiene todo lo necesario para que un programador mantenga, compile, despliegue y extienda el sistema, y los manuales de uso de cada perfil de esta versión.

| Carpeta | Contenido |
|---|---|
| \`01-codigo-fuente\` | Código completo (React 18 + módulos), scripts de compilación, publicación, pruebas, documentación y manuales; migraciones y funciones de Supabase. |
| \`02-librerias\` | **Todas** las librerías: caché de npm con las 177 dependencias exactas (instalación sin Internet, Windows/macOS/Linux), SheetJS y html2pdf.js (cargadas en tiempo de ejecución), fuentes tipográficas y sus licencias. |
| \`03-base-de-datos\` | Esquema actual exacto de Supabase, las migraciones en orden, Edge Functions y el script que verifica que ambos caminos dan la misma base. |
| \`04-despliegue\` | Sitio compilado (\`sitio/index.html\` + \`vercel.json\`), demo sin servidor (\`talento-balu-local.html\`) e instrucciones para TI (Power Automate). |
| \`05-pruebas\` | Resultado de las pruebas automáticas y de la verificación del esquema de esta exportación. |
| \`06-documentacion-tecnica\` | Arquitectura, inventario de librerías, historial de versiones, manual funcional (LEEME) y documentos de diseño del proyecto. |
| \`08-politicas-word\` | Políticas de RRHH por subsistema en Word, una carpeta por marca (Balú y Planeta) con su logo y razón social. |
| \`07-manuales-de-uso\` | Un manual por perfil (Administrador, RRHH, Gerente General, Marca, Operaciones, Tienda, Visor, Consulta) y para trabajadores (portal de evaluación, clima). PDF, HTML y Markdown. |

## Inicio rápido para el programador
Requisitos: Node.js 22 (mínimo 18), npm 10, Python 3.9+. Opcionales: PostgreSQL 15+ (verificar esquema), pandoc y Chromium (manuales en PDF), Supabase CLI (desplegar funciones).

\`\`\`bash
cd 01-codigo-fuente
npm ci --offline --cache ../02-librerias/npm-cache   # o simplemente: npm ci   (con Internet)
bash construir-todo.sh                               # genera sitio/index.html y talento-balu.html
bash probar-todo.sh                                  # pruebas automáticas
bash supabase/probar-esquema.sh                      # opcional: verifica la base de datos en un PostgreSQL local
bash exportar.sh                                     # vuelve a generar este paquete
\`\`\`

## Poner el sistema en otro servidor
1. **Base de datos (Supabase):** cree un proyecto; en el editor SQL ejecute \`03-base-de-datos/esquema-actual.sql\` (o las migraciones en orden). Inserte el correo del administrador en \`public.admins_iniciales\`. En Authentication › Email desactive «Allow new users to sign up».
2. **Funciones:** \`supabase functions deploy admin-usuarios\`, \`supabase functions deploy recordatorios\`, \`supabase functions deploy notificar-solicitud\` y \`supabase functions deploy restablecer-clave --no-verify-jwt\` (más la migración de \`03-base-de-datos/pendientes\`, ver su LEEME-aplicar.md); secretos \`RESEND_API_KEY\` y \`REMITENTE_CORREO\` (Resend con dominio verificado).
3. **Sitio:** compile con \`SUPABASE_URL=… SUPABASE_ANON_KEY=… bash construir-todo.sh\` y publique \`sitio/index.html\` + \`vercel.json\` en cualquier hosting estático (hoy: GitHub \`Jossiefut/sgi-rrhh\` → Vercel).
4. **Primer acceso:** abra el sitio, «Primer acceso del Administrador» con el correo autorizado; el sistema crea tiendas, cargos y configuración.
5. **Integración del formulario:** ver \`04-despliegue/INSTRUCCIONES-TI-PowerAutomate.md\`.

## Datos y credenciales
- Este paquete **no contiene la base de datos real** ni contraseñas. La demo (\`talento-balu*.html\`) y las pruebas usan datos ficticios, más el registro de prueba de Josselyn Tovar y respuestas de prueba sin identificar (\`fixtures/\`). La clave anon de Supabase que va dentro de \`index.html\` es pública por diseño (la protección es RLS). La clave \`service_role\` y la de Resend viven solo como secretos en Supabase.
- Proyecto actual de Supabase: \`jqqzlihryancqxtswyvo\` (sgi-rrhh-marcas-propias). Vercel: equipo \`jossie-fut\`, proyecto \`sgi-rrhh\`.

## Verificación de esta exportación
$(tail -1 "$D/05-pruebas/RESULTADO-PRUEBAS.txt")

${ESQ}

Integridad de los archivos: \`SHA256SUMS.txt\` (\`sha256sum -c SHA256SUMS.txt\`). Si recibió el paquete en partes, descomprímalas todas en la misma carpeta antes de comprobar.
EOF

echo "-- 8/8 Empaquetando"
(cd "$D" && find . -type f ! -name SHA256SUMS.txt -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS.txt)
rm -f "$OUT/$N-exportacion.zip"
(cd "$OUT" && zip -qr "$N-exportacion.zip" "$N")
# Los manuales también por separado, para distribuirlos a cada perfil
rm -f "$OUT/$N-manuales-de-uso.zip"
(cd "$D" && zip -qr "$OUT/$N-manuales-de-uso.zip" 07-manuales-de-uso)
# Entrega en partes de menos de 25 MB (límite de envío por chat o correo): parte 1 = todo menos la caché de npm;
# las siguientes = la caché de npm repartida por carpetas. Se descomprimen todas en la misma carpeta.
E="$OUT/entrega-$N"; rm -rf "$E"; mkdir -p "$E"
python3 - "$D" "$E" "$N" <<'PY'
import os, sys, subprocess
d, e, n = sys.argv[1:4]
base = os.path.dirname(d)
cache = os.path.join(n, '02-librerias', 'npm-cache')
def tam(r):
    t = 0
    for a, _, fs in os.walk(os.path.join(base, r)):
        t += sum(os.path.getsize(os.path.join(a, f)) for f in fs)
    return t
grupos, actual, acum = [], [], 0
sha = os.path.join(cache, '_cacache', 'content-v2', 'sha512')
for sub in sorted(os.listdir(os.path.join(base, sha))):
    r = os.path.join(sha, sub); t = tam(r)
    if actual and acum + t > 23 * 1024 * 1024: grupos.append(actual); actual, acum = [], 0
    actual.append(r); acum += t
if actual: grupos.append(actual)
grupos[0] = [os.path.join(cache, '_cacache', 'index-v5'), os.path.join(cache, '.huella-lock')] + grupos[0]
total = 1 + len(grupos)
subprocess.run(['zip', '-qr', os.path.join(e, f'{n}-parte1-de-{total}.zip'), n, '-x', f'{cache}/*'], cwd=base, check=True)
for i, g in enumerate(grupos, start=2):
    subprocess.run(['zip', '-qr', os.path.join(e, f'{n}-parte{i}-de-{total}.zip')] + g, cwd=base, check=True)
open(os.path.join(e, 'COMO-UNIR-LAS-PARTES.txt'), 'w').write(f'Descomprima las {total} partes en la misma carpeta. Al final debe existir la carpeta {n} con 02-librerias/npm-cache completa.\nComprobación: dentro de {n}, ejecute  sha256sum -c SHA256SUMS.txt\n')
PY
echo "✓ Exportación lista:"
ls -lh "$OUT/$N-exportacion.zip" "$OUT/$N-manuales-de-uso.zip" "$E"/*.zip | awk '{print "  " $5 "  " $9}'
