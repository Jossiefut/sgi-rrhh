#!/bin/bash
# Regenera el manual de cada perfil que se ve dentro del sistema (Ayuda › Manual de uso) a partir de la versión compilada,
# y vuelve a compilar para incrustarlo. Lo llaman publicar.sh y exportar.sh en cada cambio.
set -e
cd "$(dirname "$0")"
node manuales/extraer-menu.cjs > manuales/menu-por-perfil.json
T=$(mktemp -d)
node manuales/generar-manuales.cjs "$T" --solo-app
rm -rf "$T"
bash construir-todo.sh
