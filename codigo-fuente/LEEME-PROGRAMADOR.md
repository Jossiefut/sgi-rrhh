# SGI RRHH Marcas Propias (Balú y Planeta) — código fuente · versión 1.33.0

Sistema de Gestión Integrado de RRHH. Aplicación web de un solo archivo (React 18) que se compila con esbuild y Tailwind; la base de datos y los usuarios están en Supabase.

## Qué hay en esta carpeta
- `App.jsx` y los módulos `*.js`: el código de la aplicación (`versiones.js` trae la versión y el historial de cambios).
- `nube.js`: conexión con Supabase (consultas, guardado, funciones del servidor).
- `supabase/`: esquema de la base de datos (`esquema-actual.sql`), migraciones, scripts pendientes de aplicar (`pendientes/`, cada uno con su LEEME) y funciones del servidor (`functions/`: admin-usuarios, recordatorios, restablecer-clave, notificar-solicitud).
- `test*.cjs` / `test*.mjs`: pruebas automáticas (jsdom) sobre la versión compilada. `probar-todo.sh` las ejecuta todas.
- `manuales/`: manual de uso por perfil, generado desde `contenido.cjs` y el menú real de cada perfil.
- `pwa/`: instalación en el teléfono (manifest, service worker, íconos).
- `talento-balu.html`: la aplicación ya compilada (la que se publica en el sitio).
- `docs-proyecto/`: documentación técnica y funcional.

## Compilar y probar
```
nvm use            # Node 22
npm ci
bash construir-todo.sh   # compila (≈ 6 s) y deja talento-balu.html
bash probar-todo.sh      # ejecuta todas las pruebas
```

## Base de datos y funciones (Supabase)
1. Aplicar `supabase/esquema-actual.sql` en un proyecto nuevo, o los scripts de `supabase/pendientes/` en el proyecto existente (leer el LEEME de cada uno).
2. Desplegar las funciones: `supabase functions deploy admin-usuarios`, `recordatorios`, `notificar-solicitud` y `restablecer-clave --no-verify-jwt`.
3. Secretos de las funciones de correo: `RESEND_API_KEY` y `REMITENTE_CORREO` (ej.: "SGI RRHH <rrhh@sudominio.com>").
4. En Authentication › Sign In / Providers › Email, desactivar «Allow new users to sign up» (solo el Administrador crea cuentas).

## Lo que NO está en el repositorio
- Contraseñas, claves y tokens: ninguno se guarda aquí. Los secretos se configuran directamente en Supabase.
- Documentos originales de la empresa usados para generar plantillas (`docs-adm/originales`, `descripciones/fuente`); los resultados ya generados están incluidos (`documentos-adm.js`, `perfiles-adm.js`).
- Librerías sin conexión (`vendor`): se descargan con `npm ci`.

## Publicación
El sitio se sirve desde la raíz de este repositorio (Vercel, proyecto sgi-rrhh). `codigo-fuente/` no forma parte del sitio.
