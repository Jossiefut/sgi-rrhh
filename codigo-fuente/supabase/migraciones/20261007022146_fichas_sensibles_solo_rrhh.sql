-- Migración 20261007022146 · fichas_sensibles_solo_rrhh
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create table if not exists public.fichas_sensibles (
  cedula text primary key,
  data jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);
alter table public.fichas_sensibles enable row level security;
create policy fichas_sensibles_leer on public.fichas_sensibles for select to authenticated using (app.mi_rol() = 'rrhh');
create policy fichas_sensibles_insertar on public.fichas_sensibles for insert to authenticated with check (app.mi_rol() = 'rrhh');
create policy fichas_sensibles_actualizar on public.fichas_sensibles for update to authenticated using (app.mi_rol() = 'rrhh') with check (app.mi_rol() = 'rrhh');
revoke all on public.fichas_sensibles from anon;
grant select, insert, update on public.fichas_sensibles to authenticated;
comment on table public.fichas_sensibles is 'Datos sensibles de la ficha (discapacidad, CONAPDIS): solo el rol RRHH puede leer y escribir.';;
