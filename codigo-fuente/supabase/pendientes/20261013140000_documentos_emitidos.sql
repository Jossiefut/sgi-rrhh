-- v1.20.0 · Autenticación de documentos con código QR. Aplicar en Supabase › SQL Editor (seguro repetirlo).
-- Crea el registro de documentos emitidos y la función pública que usa la página «Verificar un documento».
-- Sin esta migración el sistema funciona y los PDF salen con QR, pero la verificación solo reconoce los documentos emitidos en el mismo equipo.

create table if not exists public.documentos_emitidos (
  codigo text primary key,                      -- SGI-XXXX-XXXX-XXXX
  tipo text,                                    -- clave del documento o «excel»
  nombre text,
  fecha text,                                   -- fecha y hora de emisión, tal como la muestra el documento
  emisor_id uuid,
  emisor_nombre text,
  emisor_rol text,
  marca text,
  huella text,                                  -- huella SHA-256 del contenido
  anulado boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);
create index if not exists documentos_emitidos_emisor on public.documentos_emitidos (emisor_id);
alter table public.documentos_emitidos enable row level security;

-- Cada usuario ve lo que emitió; RRHH, Administrador, Gerencia General y Junta ven todo.
drop policy if exists documentos_emitidos_leer on public.documentos_emitidos;
create policy documentos_emitidos_leer on public.documentos_emitidos as PERMISSIVE for SELECT to authenticated
  using (emisor_id = auth.uid() or app.mi_rol() = any (array['admin','rrhh','general','junta']));

-- Emite cualquier usuario activo, siempre a su nombre; la cuenta pendiente no emite.
drop policy if exists documentos_emitidos_insertar on public.documentos_emitidos;
create policy documentos_emitidos_insertar on public.documentos_emitidos as PERMISSIVE for INSERT to authenticated
  with check (emisor_id = auth.uid() and app.mi_rol() is not null and app.mi_rol() <> 'pendiente');

-- Solo RRHH y Administrador anulan (el registro nunca se borra).
drop policy if exists documentos_emitidos_actualizar on public.documentos_emitidos;
create policy documentos_emitidos_actualizar on public.documentos_emitidos as PERMISSIVE for UPDATE to authenticated
  using (app.mi_rol() = any (array['admin','rrhh']))
  with check (app.mi_rol() = any (array['admin','rrhh']));
-- Sin política de borrado.

revoke all on public.documentos_emitidos from anon;
grant select, insert, update on public.documentos_emitidos to authenticated;

-- Verificación pública (sin sesión): devuelve solo los datos de la emisión, nunca datos de trabajadores.
CREATE OR REPLACE FUNCTION public.verificar_documento(p_codigo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  cod text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  d public.documentos_emitidos%rowtype;
begin
  if cod ~ '^SGI[A-Z0-9]{12}$' then
    cod := 'SGI-' || substr(cod, 4, 4) || '-' || substr(cod, 8, 4) || '-' || substr(cod, 12, 4);
  elsif cod ~ '^[A-Z0-9]{12}$' then
    cod := 'SGI-' || substr(cod, 1, 4) || '-' || substr(cod, 5, 4) || '-' || substr(cod, 9, 4);
  else
    return jsonb_build_object('estado', 'INVALIDO');
  end if;
  select * into d from public.documentos_emitidos where codigo = cod;
  if not found then return jsonb_build_object('estado', 'NO_ENCONTRADO', 'codigo', cod); end if;
  return jsonb_build_object(
    'estado', case when d.anulado then 'ANULADO' else 'VIGENTE' end,
    'codigo', d.codigo, 'nombre', d.nombre, 'tipo', d.tipo, 'fecha', d.fecha,
    'emisor_nombre', d.emisor_nombre, 'emisor_rol', d.emisor_rol, 'marca', d.marca,
    'huella8', upper(left(coalesce(d.huella, ''), 8)),
    'anulado_motivo', case when d.anulado then coalesce(d.data->>'anuladoMotivo', '') else '' end);
end $function$;
revoke all on function public.verificar_documento(text) from public;
grant execute on function public.verificar_documento(text) to anon, authenticated;
