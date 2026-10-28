-- Migración 20261005143119 · rol_consulta_rrhh_futura
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

alter table public.perfiles drop constraint perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol = any (array['admin','marca','operaciones','general','rrhh','tienda','visor','consulta','pendiente']));

-- Consulta RRHH Futura: lee su marca (rama por defecto de app.puede_ver) y no escribe nada.
create or replace function app.puede_escribir(p_coleccion text, p_tienda text, p_marca text)
 returns boolean
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
declare r text := app.mi_rol();
begin
  if r is null or r in ('pendiente','visor','consulta') then return false; end if;
  if p_coleccion = 'bitacora' then return true; end if;
  if p_coleccion in ('tiendas','cargos','modelosCompensacion') then return r in ('admin','rrhh'); end if;
  if p_coleccion = 'concursos' then return r in ('admin','rrhh','general'); end if;
  return app.puede_ver(p_coleccion, p_tienda, p_marca);
end $function$;

create or replace function app.puede_ver(p_coleccion text, p_tienda text, p_marca text)
 returns boolean
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
declare r text := app.mi_rol();
begin
  if r is null or r = 'pendiente' then return false; end if;
  if p_coleccion in ('tiendas','cargos') then return true; end if;
  if r in ('admin','rrhh','general') then return true; end if;
  if p_coleccion = 'bitacora' then return false; end if;
  if r = 'tienda' then
    if p_coleccion in ('modelosCompensacion','concursos') then return false; end if;
    return p_tienda is not null and p_tienda = app.mi_tienda();
  end if;
  -- marca, operaciones, visor y consulta: solo su marca
  return p_marca is not null and p_marca = app.mi_marca();
end $function$;;
