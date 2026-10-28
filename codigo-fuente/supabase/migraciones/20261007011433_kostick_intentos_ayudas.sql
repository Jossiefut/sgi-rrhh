-- Migración 20261007011433 · kostick_intentos_ayudas
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create or replace function app.minutos_prueba(p_prueba text) returns integer
language sql stable security definer set search_path = '' as $$
  select coalesce(nullif((select (a.data->'minutosPrueba'->>p_prueba)::int from public.ajustes a where a.clave = 'config'), 0), case when p_prueba = 'LOGICO' then 25 else 40 end)
$$;

create or replace function app.ev_vacio() returns jsonb language sql immutable as $$
  select '{"respuestas":{},"intentos":[],"extra":0,"completada":false}'::jsonb
$$;

create or replace function app.ev_cerrar(p_ev jsonb, p_min integer, p_ahora timestamptz) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare v_int jsonb := '[]'::jsonb; it jsonb; v_lim timestamptz;
begin
  for it in select x from jsonb_array_elements(coalesce(p_ev->'intentos','[]'::jsonb)) x loop
    if coalesce(it->>'fin','') = '' then
      v_lim := (it->>'inicio')::timestamptz + make_interval(mins => p_min);
      if p_ahora > v_lim + interval '10 seconds' then
        it := it || jsonb_build_object('fin', to_char(v_lim at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'cierre', 'TIEMPO');
      end if;
    end if;
    v_int := v_int || jsonb_build_array(it);
  end loop;
  return jsonb_set(p_ev, '{intentos}', v_int);
end $$;

create or replace function app.ev_estado(p_ev jsonb) returns text
language plpgsql immutable set search_path = '' as $$
declare v_usados int := jsonb_array_length(coalesce(p_ev->'intentos','[]'::jsonb)); v_extra int := coalesce((p_ev->>'extra')::int, 0);
begin
  if coalesce((p_ev->>'completada')::boolean, false) then return 'COMPLETADA'; end if;
  if exists (select 1 from jsonb_array_elements(coalesce(p_ev->'intentos','[]'::jsonb)) x where coalesce(x->>'fin','') = '') then return 'EN_CURSO'; end if;
  if v_usados < 2 + v_extra then return 'PENDIENTE'; end if;
  return case when v_extra = 1 then 'CERRADA' else 'BLOQUEADA' end;
end $$;

create or replace function app.estado_general(p_bateria jsonb, p_ev jsonb) returns text
language plpgsql immutable set search_path = '' as $$
declare t text; e jsonb; s text; n int := 0; def int := 0; act int := 0;
begin
  for t in select x from jsonb_array_elements_text(coalesce(p_bateria,'[]'::jsonb)) x where x in ('IPV','KOSTICK','LOGICO') loop
    n := n + 1; e := coalesce(p_ev->t, app.ev_vacio()); s := app.ev_estado(e);
    if s in ('COMPLETADA','CERRADA') then def := def + 1; end if;
    if s <> 'PENDIENTE' or jsonb_typeof(e->'respuestas') = 'object' and e->'respuestas' <> '{}'::jsonb then act := act + 1; end if;
  end loop;
  if n > 0 and def = n then return 'COMPLETADA'; end if;
  if act > 0 then return 'EN_CURSO'; end if;
  return 'PENDIENTE';
end $$;

create or replace function app.acceso_json(a public.accesos_prueba) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('id', a.id, 'cedula', a.cedula, 'trabajador_id', a.trabajador_id, 'solicitud_id', a.solicitud_id, 'tipo', a.tipo, 'apellidos', a.apellidos, 'tienda_id', a.tienda_id, 'nombre', a.nombre, 'cargo_destino', a.cargo_destino, 'bateria', a.bateria, 'estado', a.estado, 'respuestas', a.respuestas, 'ev', a.ev, 'nivel_educativo', a.nivel_educativo, 'inicio', a.inicio, 'fin', a.fin, 'creado', a.creado, 'expira', a.expira)
$$;;
