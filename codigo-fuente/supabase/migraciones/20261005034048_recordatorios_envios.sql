-- Migración 20261005034048 · recordatorios_envios
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create table if not exists public.recordatorios_envios (
  id bigint generated always as identity primary key,
  fecha date not null default current_date,
  usuario_id uuid references public.perfiles(id) on delete set null,
  correo text,
  asunto text,
  estado text not null check (estado in ('ENVIADO','FALLIDO')),
  enviado_por uuid,
  creado timestamptz not null default now()
);
alter table public.recordatorios_envios enable row level security;
create policy "rrhh y admin leen envios" on public.recordatorios_envios for select to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activo and p.rol in ('rrhh','admin')));;
