-- Migración 20261008185343 · recepcion_formulario_automatica
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

-- Recepcion automatica del formulario de actualizacion de datos (Power Automate -> Supabase).
-- Power Automate envia filas a recibir_formulario() con una clave de integracion; la clave se genera desde la aplicacion
-- (solo Administrador o RRHH la ven una vez) y aqui solo se guarda su huella (sha256). Las filas quedan en una tabla de
-- recepcion que leen solo admin y rrhh; no se aplican a las fichas hasta que RRHH confirma en la aplicacion.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.integracion_clave (
  id int primary key default 1 check (id = 1),
  huella text not null,
  creada timestamptz not null default now(),
  creada_por uuid
);
alter table public.integracion_clave enable row level security;
-- sin politicas: nadie la lee ni escribe por la API; solo las funciones SECURITY DEFINER

create table if not exists public.formulario_recibido (
  id_formulario text primary key,
  cedula text,
  data jsonb not null,
  recibido timestamptz not null default now(),
  procesado boolean not null default false,
  procesado_en timestamptz
);
alter table public.formulario_recibido enable row level security;
create policy formulario_recibido_leer on public.formulario_recibido for select to authenticated using (app.mi_rol() in ('admin','rrhh'));
create policy formulario_recibido_marcar on public.formulario_recibido for update to authenticated using (app.mi_rol() in ('admin','rrhh')) with check (app.mi_rol() in ('admin','rrhh'));
revoke all on public.formulario_recibido from anon, authenticated;
grant select on public.formulario_recibido to authenticated;
grant update (procesado, procesado_en) on public.formulario_recibido to authenticated;

-- Genera (o reemplaza) la clave de integracion; devuelve el texto una sola vez
create or replace function public.generar_clave_integracion()
returns text language plpgsql security definer set search_path to '' as $$
declare k text;
begin
  if app.mi_rol() not in ('admin','rrhh') then raise exception 'Solo el Administrador o RRHH pueden generar la clave'; end if;
  k := 'sgi_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.integracion_clave(id, huella, creada, creada_por) values (1, encode(extensions.digest(k, 'sha256'), 'hex'), now(), auth.uid())
  on conflict (id) do update set huella = excluded.huella, creada = now(), creada_por = auth.uid();
  return k;
end $$;
revoke all on function public.generar_clave_integracion() from public, anon;
grant execute on function public.generar_clave_integracion() to authenticated;

-- Recibe filas del formulario. p_filas: arreglo JSON de objetos {nombre de columna: valor}. Descarta datos bancarios.
create or replace function public.recibir_formulario(p_clave text, p_filas jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare h text; f jsonb; limpia jsonb; n int := 0; idf text; ced text; k text;
begin
  select huella into h from public.integracion_clave where id = 1;
  if h is null or p_clave is null or encode(extensions.digest(p_clave, 'sha256'), 'hex') <> h then
    raise exception 'Clave de integracion no valida' using errcode = '28000';
  end if;
  if jsonb_typeof(p_filas) = 'object' then p_filas := jsonb_build_array(p_filas); end if;
  if jsonb_typeof(p_filas) <> 'array' or jsonb_array_length(p_filas) > 500 then raise exception 'Formato no valido (maximo 500 filas por envio)'; end if;
  for f in select * from jsonb_array_elements(p_filas) loop
    limpia := '{}'::jsonb;
    for k in select jsonb_object_keys(f) loop
      if lower(k) ~ '(banco|cuenta|declaro)' then continue; end if;
      limpia := limpia || jsonb_build_object(k, f -> k);
    end loop;
    idf := coalesce(f ->> 'Id', f ->> 'id', md5(limpia::text));
    ced := regexp_replace(coalesce(f ->> 'Cédula de Identidad', f ->> 'Cedula de Identidad', ''), '\D', '', 'g');
    insert into public.formulario_recibido(id_formulario, cedula, data, procesado) values (idf, nullif(ced, ''), limpia, false)
    on conflict (id_formulario) do update set data = excluded.data, cedula = excluded.cedula, recibido = now(), procesado = false, procesado_en = null;
    n := n + 1;
  end loop;
  return jsonb_build_object('recibidas', n);
end $$;
revoke all on function public.recibir_formulario(text, jsonb) from public;
grant execute on function public.recibir_formulario(text, jsonb) to anon, authenticated;;
