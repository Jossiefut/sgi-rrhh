-- Migración 20261008200000 · retirar_funciones_antiguas
-- Reproduce la limpieza que se hizo en producción al aplicar el control de intentos (LEEME 4.14):
-- se retiraron portal_guardar y la versión antigua de crear_acceso_prueba (10 parámetros).
-- Con esta migración, aplicar todas las migraciones en orden da exactamente el esquema actual (esquema-actual.sql).
drop function if exists public.portal_guardar(text, text, text, jsonb, text, boolean);
drop function if exists public.crear_acceso_prueba(text, text, text, text, text, text, text, text, jsonb, date);
