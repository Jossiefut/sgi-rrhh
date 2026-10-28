-- Migración 20261008175904 · accesos_prueba_select_columnas_app
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

-- La aplicacion lee tipo, apellidos y ev de accesos_prueba (nube.js, cargar). Solo se concede SELECT a esas tres columnas.
-- Siguen sin SELECT para authenticated: clave_hash, intentos_fallidos, bloqueado_hasta y pil. Las filas las filtra RLS.
grant select (tipo, apellidos, ev) on public.accesos_prueba to authenticated;;
