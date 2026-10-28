#!/bin/bash
# Publica un cambio en todos los lugares a la vez: compila, prueba, actualiza el paquete (.zip) y sube a GitHub (Vercel republica solo).
# Uso: bash publicar.sh "Descripción corta del cambio"
# Antes de ejecutarlo: subir la versión en versiones.js (VERSION_ACTUAL) y agregar su entrada en HISTORIAL_VERSIONES.
set -e
cd "$(dirname "$0")"
MSG="${1:?Indique la descripción del cambio}"
REPO="${REPO_SGI:-/home/claude/sgi-rrhh}"
bash construir-todo.sh
bash actualizar-manuales.sh   # manual de cada perfil dentro del sistema, al día con esta versión
VERSION=$(grep -oP "VERSION_ACTUAL = '\K[^']+" versiones.js)
for t in test-trazabilidad.cjs test-egresos.cjs test-manual.cjs; do node $t | grep -q "✗" && { echo "Falla $t: no se publica"; exit 1; } || true; done
cp App.jsx firmas.js esquema-comisiones.js visio.js test-firmas.cjs test-esquema-comisiones.cjs test-visio.cjs test-analista-requisicion.cjs nube.js cumpleanos.js clima.js salidas.js remuneracion.js kpis-adm.js test-remuneracion.cjs test-nps.cjs autenticacion.js egresos-analisis.js perfil-personal.js test-perfil-personal.cjs claves.js test-claves-portal.cjs test-acceso-todos.cjs test-egresos-analisis.cjs test-movimiento-nomina.cjs docsadm.js docstienda.js evalfijo.js amonestlit.js test-amonestacion-literal.cjs test-firmantes-amon.cjs subir-codigo-github.sh test-notificacion-solicitud.cjs test-montos-autorizacion.cjs documentos-adm.js test-docs-adm.cjs test-docs-tienda-oficiales.cjs test-sucesion-adm.cjs test-eval-fijo.cjs test-pernoctas-motivos.cjs test-incremento-plantilla.cjs test-docs-tiendas.cjs test-programa-formacion.cjs test-qr.cjs package.json package-lock.json sincronizacion.js versiones.js manuales-app.js construir-todo.sh publicar.sh exportar.sh actualizar-manuales.sh probar-todo.sh documentar.cjs paquete/codigo/
mkdir -p paquete/codigo/docs-adm && cp docs-adm/construir-docs-adm.py paquete/codigo/docs-adm/
mkdir -p paquete/codigo/manuales paquete/supabase/migraciones && cp manuales/*.cjs paquete/codigo/manuales/ && cp supabase/migraciones/*.sql paquete/supabase/migraciones/ && cp supabase/esquema-actual.sql supabase/probar-esquema.sh supabase/probar-restablecer.sh paquete/supabase/; mkdir -p paquete/supabase/pendientes paquete/supabase/functions && cp supabase/pendientes/* paquete/supabase/pendientes/ && cp -r supabase/functions/* paquete/supabase/functions/
cp sitio/index.html paquete/sitio/index.html; cp pwa/* paquete/sitio/; cp ../sgi-rrhh/vercel.json paquete/sitio/vercel.json 2>/dev/null || true; cp talento-balu.html paquete/talento-balu.html
rm -f sgi-rrhh-marcas-propias.zip; (cd paquete && zip -qr ../sgi-rrhh-marcas-propias.zip .)
cp sitio/index.html "$REPO/index.html"; cp pwa/* "$REPO/"
bash subir-codigo-github.sh "$REPO"
cd "$REPO"
git add -A
git commit -q -m "v$VERSION: $MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017RzeEQtqFFWPeXinoA2wCL" || echo "(sin cambios nuevos en el sitio)"
git push -q origin main
echo "PUBLICADO versión $VERSION ($(git rev-parse --short HEAD)) — Vercel republica en ~1 minuto: https://sgi-rrhh.vercel.app"
