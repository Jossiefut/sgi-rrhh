#!/bin/bash
# Reconstruye la demo (talento-balu.html), el sitio publicado (sitio/index.html) y el paquete de pruebas de la nube.
set -e
cd "$(dirname "$0")"
E=node_modules/.bin/esbuild
# Fecha y hora de la compilación (hora de Caracas) para mostrar la versión publicada
echo "export const APP_BUILD = '$(TZ=America/Caracas date '+%d/%m/%Y %H:%M')';" > build-info.js
F="--bundle --minify --charset=ascii --define:process.env.NODE_ENV=\"production\" --log-level=warning"
$E entry.jsx $F --outfile=dist/app.js
node_modules/.bin/tailwindcss -i in.css -o dist/app.css --minify 2>/dev/null
python3 build.py >/dev/null
# Conexion publica de Supabase (URL y clave anon, publicas por diseno; la proteccion es RLS)
SB_URL="${SUPABASE_URL:-https://jqqzlihryancqxtswyvo.supabase.co}"
SB_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcXpsaWhyeWFuY3F4dHN3eXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNjMxMjYsImV4cCI6MjEwNjczOTEyNn0.hDW9qX1V5uipX6wgzg_M4u3rRgScNgX8seJpszD7T1k}"
$E entry-nube.jsx $F --define:process.env.SUPABASE_URL="\"$SB_URL\"" --define:process.env.SUPABASE_ANON_KEY="\"$SB_KEY\"" --outfile=dist/nube.js
python3 build-nube.py >/dev/null
if [ -f entry-prueba-nube.jsx ]; then $E entry-prueba-nube.jsx $F --outfile=dist/prueba-nube.js; python3 -c "
css=open('dist/app.css').read(); js=open('dist/prueba-nube.js').read().replace('</script','<\\\\/script')
open('prueba-nube.html','w').write(f'<style>{css}</style><div id=\"root\"></div><script>{js}</script>')"; fi
# Copia para abrir directamente en el navegador desde el disco (declara la codificación)
python3 -c "
h=open('talento-balu.html',encoding='utf8').read()
open('talento-balu-local.html','w',encoding='utf8').write('<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"></head><body>'+h+'</body></html>')"
