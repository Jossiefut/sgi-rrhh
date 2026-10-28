#!/bin/bash
# Ejecuta todas las pruebas automáticas (test*.cjs y test*.mjs) sobre la versión compilada.
# Uso: bash probar-todo.sh [archivo-de-resumen]
# Requiere haber compilado antes (bash construir-todo.sh). Sale con error si alguna prueba falla.
cd "$(dirname "$0")"
RES="${1:-/dev/stdout}"
LOGS=$(mktemp -d)
ok=0; mal=0; fallidas=""
for f in test*.cjs test*.mjs; do
  [ -f "$f" ] || continue
  if timeout 300 node "$f" > "$LOGS/$f.log" 2>&1 && ! grep -q '^✗' "$LOGS/$f.log"; then
    ok=$((ok+1)); estado="OK   "
  else
    mal=$((mal+1)); estado="FALLA"; fallidas="$fallidas $f"
  fi
  verif=$(grep -c '^✓' "$LOGS/$f.log")
  printf '%s  %-40s %s verificaciones\n' "$estado" "$f" "$verif"
done > "$LOGS/resumen.txt"
{
  echo "Pruebas automáticas · $(TZ=America/Caracas date '+%d/%m/%Y %H:%M') · versión $(grep -o "VERSION_ACTUAL = '[^']*'" versiones.js | cut -d"'" -f2)"
  cat "$LOGS/resumen.txt"
  echo "Total: $((ok+mal)) archivos · $ok correctos · $mal con fallas · $(cat "$LOGS"/*.log | grep -c '^✓') verificaciones superadas"
  [ $mal -gt 0 ] && { echo "Con fallas:$fallidas"; for f in $fallidas; do echo "--- $f"; grep -E '^✗|Error' "$LOGS/$f.log" | head -5; done; }
} > "$RES"
rm -rf "$LOGS"
[ $mal -eq 0 ]
