-- Migración 20261007011424 · kostick_intentos_columnas
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

alter table public.accesos_prueba add column if not exists ev jsonb not null default '{}'::jsonb;
alter table public.accesos_prueba add column if not exists tipo text not null default 'PROMOCION';
alter table public.accesos_prueba add column if not exists apellidos text;;
