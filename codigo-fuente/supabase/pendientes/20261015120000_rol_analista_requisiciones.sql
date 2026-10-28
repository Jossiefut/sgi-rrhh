-- v1.25.0 · Rol «Analista de RRHH» y colección de requisiciones de personal.
-- Aplicar en Supabase › SQL Editor DESPUÉS de 20261013120000_remuneracion_kpi_junta.sql (este archivo parte de sus funciones).
-- Es seguro repetirlo.

-- 1) Nuevo rol: analista (consulta y descarga como RRHH; no aprueba ni escribe, salvo la bitácora)
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol = any (array['admin','marca','operaciones','general','junta','rrhh','analista','tienda','visor','consulta','pendiente']));

CREATE OR REPLACE FUNCTION app.puede_escribir(p_coleccion text, p_tienda text, p_marca text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r text := app.mi_rol();
begin
  if r is null or r in ('pendiente','visor','consulta') then return false; end if;
  if r in ('junta','analista') then return p_coleccion = 'bitacora'; end if;
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
  if r in ('admin','rrhh','analista','general','junta') then return true; end if;
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

-- 2) Requisiciones de personal: usan la tabla general «registros» (coleccion = 'requisiciones'); no necesitan tabla nueva.
--    Las ven RRHH, el Analista y los niveles superiores; la tienda y la marca ven las suyas y la tienda puede firmarlas.
