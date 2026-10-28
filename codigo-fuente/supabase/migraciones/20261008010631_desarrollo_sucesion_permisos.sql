-- Migración 20261008010631 · desarrollo_sucesion_permisos
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create or replace function app.puede_ver(p_coleccion text, p_tienda text, p_marca text)
returns boolean language plpgsql stable security definer set search_path to '' as $function$
declare r text := app.mi_rol();
begin
  if r is null or r = 'pendiente' then return false; end if;
  if p_coleccion in ('tiendas','cargos') then return true; end if;
  -- Catálogo de formaciones: sin tienda ni marca; lo lee cualquier rol activo
  if p_coleccion = 'catalogoFormaciones' then return true; end if;
  -- Clima laboral: las respuestas solo las ven RRHH y Administrador
  if p_coleccion = 'climaRespuestas' then return r in ('admin','rrhh'); end if;
  if r in ('admin','rrhh','general') then return true; end if;
  if p_coleccion = 'bitacora' then return false; end if;
  -- Evaluaciones de oficinas: ni tienda, ni visor, ni consulta
  if p_coleccion = 'evaluaciones' and p_tienda is not null
     and exists (select 1 from public.registros t where t.coleccion = 'tiendas' and t.id = p_tienda and coalesce((t.data->>'administrativa')::boolean, false)) then
    if r in ('marca','operaciones') then return p_marca is not null and p_marca = app.mi_marca(); end if;
    return false;
  end if;
  -- Plan de sucesión: no lo ven tienda, visor ni consulta
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

create or replace function app.puede_escribir(p_coleccion text, p_tienda text, p_marca text)
returns boolean language plpgsql stable security definer set search_path to '' as $function$
declare r text := app.mi_rol();
begin
  if r is null or r in ('pendiente','visor','consulta') then return false; end if;
  if p_coleccion = 'bitacora' then return true; end if;
  if p_coleccion in ('tiendas','cargos','modelosCompensacion','catalogoFormaciones') then return r in ('admin','rrhh'); end if;
  if p_coleccion in ('climaCiclos','climaRespuestas') then return r in ('admin','rrhh'); end if;
  if p_coleccion = 'concursos' then return r in ('admin','rrhh','general'); end if;
  if p_coleccion = 'fotosSucesion' then return r in ('admin','rrhh'); end if;
  if p_coleccion in ('nominaciones','pdi') then return r in ('admin','rrhh','general','marca','operaciones') and app.puede_ver(p_coleccion, p_tienda, p_marca); end if;
  return app.puede_ver(p_coleccion, p_tienda, p_marca);
end $function$;;
