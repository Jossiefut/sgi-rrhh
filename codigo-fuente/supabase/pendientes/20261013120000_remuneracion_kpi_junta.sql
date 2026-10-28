-- v1.18.0 · KPI y remuneración + rol «Junta Directiva».
-- Aplicar en Supabase › SQL Editor. Es seguro repetirlo.

-- 1) Nuevo rol: junta (por encima de Gerencia General)
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol = any (array['admin','marca','operaciones','general','junta','rrhh','tienda','visor','consulta','pendiente']));

-- La Junta consulta toda la organización (como Gerencia General) y solo escribe en la bitácora;
-- la remuneración se guarda en su tabla protegida, con sus propias reglas.
CREATE OR REPLACE FUNCTION app.puede_escribir(p_coleccion text, p_tienda text, p_marca text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r text := app.mi_rol();
begin
  if r is null or r in ('pendiente','visor','consulta') then return false; end if;
  if r = 'junta' then return p_coleccion = 'bitacora'; end if;
  if p_coleccion = 'bitacora' then return true; end if;
  if p_coleccion in ('tiendas','cargos','modelosCompensacion','catalogoFormaciones') then return r in ('admin','rrhh'); end if;
  if p_coleccion in ('climaCiclos','climaRespuestas') then return r in ('admin','rrhh'); end if;
  if p_coleccion = 'concursos' then return r in ('admin','rrhh','general'); end if;
  if p_coleccion = 'fotosSucesion' then return r in ('admin','rrhh'); end if;
  if p_coleccion in ('nominaciones','pdi') then return r in ('admin','rrhh','general','marca','operaciones') and app.puede_ver(p_coleccion, p_tienda, p_marca); end if;
  return app.puede_ver(p_coleccion, p_tienda, p_marca);
end $function$;

CREATE OR REPLACE FUNCTION app.puede_ver(p_coleccion text, p_tienda text, p_marca text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r text := app.mi_rol();
begin
  if r is null or r = 'pendiente' then return false; end if;
  if p_coleccion in ('tiendas','cargos') then return true; end if;
  if p_coleccion = 'catalogoFormaciones' then return true; end if;
  if p_coleccion = 'climaRespuestas' then return r in ('admin','rrhh'); end if;
  if r in ('admin','rrhh','general','junta') then return true; end if;
  if p_coleccion = 'bitacora' then return false; end if;
  if p_coleccion = 'evaluaciones' and p_tienda is not null
     and exists (select 1 from public.registros t where t.coleccion = 'tiendas' and t.id = p_tienda and coalesce((t.data->>'administrativa')::boolean, false)) then
    if r in ('marca','operaciones') then return p_marca is not null and p_marca = app.mi_marca(); end if;
    return false;
  end if;
  if p_coleccion in ('nominaciones','pdi','fotosSucesion') then
    if r in ('marca','operaciones') then return p_marca is not null and p_marca = app.mi_marca(); end if;
    return false;
  end if;
  if r = 'tienda' then
    if p_coleccion in ('modelosCompensacion','concursos') then return false; end if;
    return p_tienda is not null and p_tienda = app.mi_tienda();
  end if;
  return p_marca is not null and p_marca = app.mi_marca();
end $function$;

-- 2) Tabla protegida de remuneración y KPI (historial: no se borra nada)
create table if not exists public.remuneraciones (
  id text primary key,
  trabajador_id text not null,
  cedula text,
  tienda_id text,
  marca text,
  visible_para text[] not null default '{}',   -- roles que ven el registro: el jefe directo y los de arriba
  data jsonb not null default '{}'::jsonb,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);
create index if not exists remuneraciones_trabajador on public.remuneraciones (trabajador_id);
alter table public.remuneraciones enable row level security;

drop policy if exists remuneraciones_leer on public.remuneraciones;
create policy remuneraciones_leer on public.remuneraciones as PERMISSIVE for SELECT to authenticated
  using (
    app.mi_rol() = any (array['admin','rrhh','general','junta'])
    or (app.mi_rol() = any (visible_para) and (
         (app.mi_rol() = 'tienda' and tienda_id is not null and tienda_id = app.mi_tienda())
      or (app.mi_rol() = any (array['marca','operaciones']) and marca is not null and marca = app.mi_marca())
    ))
  );
drop policy if exists remuneraciones_insertar on public.remuneraciones;
create policy remuneraciones_insertar on public.remuneraciones as PERMISSIVE for INSERT to authenticated
  with check (app.mi_rol() = any (array['admin','rrhh','general','junta']));
drop policy if exists remuneraciones_actualizar on public.remuneraciones;
create policy remuneraciones_actualizar on public.remuneraciones as PERMISSIVE for UPDATE to authenticated
  using (app.mi_rol() = any (array['admin','rrhh','general','junta']))
  with check (app.mi_rol() = any (array['admin','rrhh','general','junta']));
-- Sin política de borrado: el historial no se elimina (un error se corrige anulando el registro).

revoke all on public.remuneraciones from anon;
grant select, insert, update on public.remuneraciones to authenticated;
