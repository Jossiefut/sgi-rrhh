-- Migración 20261008010311 · clima_sugerencias
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create or replace function app.puede_ver(p_coleccion text, p_tienda text, p_marca text)
returns boolean language plpgsql stable security definer set search_path to '' as $function$
declare r text := app.mi_rol();
begin
  if r is null or r = 'pendiente' then return false; end if;
  if p_coleccion in ('tiendas','cargos') then return true; end if;
  if p_coleccion = 'climaRespuestas' then return r in ('admin','rrhh'); end if;
  if r in ('admin','rrhh','general') then return true; end if;
  if p_coleccion = 'bitacora' then return false; end if;
  if p_coleccion = 'evaluaciones' and p_tienda is not null
     and exists (select 1 from public.registros t where t.coleccion = 'tiendas' and t.id = p_tienda and coalesce((t.data->>'administrativa')::boolean, false)) then
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
  if p_coleccion in ('tiendas','cargos','modelosCompensacion') then return r in ('admin','rrhh'); end if;
  if p_coleccion in ('climaCiclos','climaRespuestas') then return r in ('admin','rrhh'); end if;
  if p_coleccion = 'concursos' then return r in ('admin','rrhh','general'); end if;
  return app.puede_ver(p_coleccion, p_tienda, p_marca);
end $function$;

create or replace function public.clima_ciclo(p_ciclo text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c jsonb;
begin
  select data into c from public.registros where coleccion = 'climaCiclos' and id = p_ciclo;
  if c is null then return jsonb_build_object('existe', false); end if;
  return jsonb_build_object(
    'existe', true, 'id', c->>'id', 'tipo', c->>'tipo', 'nombre', c->>'nombre', 'estado', c->>'estado',
    'historico', coalesce((c->>'historico')::boolean, false),
    'fechaCierre', c->>'fechaCierre', 'mensaje', c->>'mensaje', 'marca', c->>'marca',
    'preguntas', coalesce(c->'preguntas', '[]'::jsonb), 'categorias', coalesce(c->'categorias', '[]'::jsonb),
    'hoy', to_char(current_date, 'YYYY-MM-DD'));
end $$;
revoke all on function public.clima_ciclo(text) from public;
grant execute on function public.clima_ciclo(text) to anon, authenticated;

create or replace function public.clima_validar(p_ciclo text, p_cedula text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare c jsonb; t jsonb; ced text := regexp_replace(coalesce(p_cedula, ''), '\D', '', 'g'); n int;
begin
  select data into c from public.registros where coleccion = 'climaCiclos' and id = p_ciclo;
  if c is null then return jsonb_build_object('ok', false, 'motivo', 'La encuesta no existe.'); end if;
  if length(ced) < 6 then return jsonb_build_object('ok', false, 'motivo', 'Indique su cédula, solo números.'); end if;
  select data into t from public.registros
   where coleccion = 'trabajadores' and regexp_replace(coalesce(data->>'cedula', ''), '\D', '', 'g') = ced
     and data->>'estatus' = 'ACTIVO' and coalesce((data->>'esPrueba')::boolean, false) = false
   limit 1;
  if t is null then return jsonb_build_object('ok', false, 'motivo', 'No encontramos esa cédula entre el personal activo. Verifique el número o consulte a su tienda.'); end if;
  if coalesce(c->>'marca', 'TODAS') <> 'TODAS' and c->>'marca' <> t->>'marca' then
    return jsonb_build_object('ok', false, 'motivo', 'Esta encuesta no está dirigida a su marca.');
  end if;
  select count(*) into n from public.registros
   where coleccion = 'climaRespuestas' and data->>'cicloId' = p_ciclo and regexp_replace(coalesce(data->>'cedula', ''), '\D', '', 'g') = ced;
  return jsonb_build_object('ok', true, 'nombre', split_part(coalesce(t->>'nombres', ''), ' ', 1), 'enviadas', n);
end $$;
revoke all on function public.clima_validar(text, text) from public;
grant execute on function public.clima_validar(text, text) to anon, authenticated;

create or replace function public.clima_enviar(p_ciclo text, p_cedula text, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  c jsonb; t jsonb; ced text := regexp_replace(coalesce(p_cedula, ''), '\D', '', 'g');
  v_tipo text; v_id text; n int; q jsonb; v int; v_resp jsonb := '{}'::jsonb; v_data jsonb; v_idea text;
begin
  select data into c from public.registros where coleccion = 'climaCiclos' and id = p_ciclo;
  if c is null then raise exception 'La encuesta no existe.'; end if;
  if c->>'estado' <> 'ABIERTO' or coalesce((c->>'historico')::boolean, false) then raise exception 'La encuesta no está abierta.'; end if;
  if nullif(c->>'fechaCierre', '') is not null and current_date > (c->>'fechaCierre')::date then raise exception 'El plazo para responder terminó.'; end if;
  select data into t from public.registros
   where coleccion = 'trabajadores' and regexp_replace(coalesce(data->>'cedula', ''), '\D', '', 'g') = ced
     and data->>'estatus' = 'ACTIVO' and coalesce((data->>'esPrueba')::boolean, false) = false
   limit 1;
  if t is null then raise exception 'Cédula no válida.'; end if;
  if coalesce(c->>'marca', 'TODAS') <> 'TODAS' and c->>'marca' <> t->>'marca' then raise exception 'Esta encuesta no está dirigida a su marca.'; end if;

  if c->>'tipo' = 'CLIMA' then
    v_tipo := 'CLIMA';
    for q in select * from jsonb_array_elements(c->'preguntas') loop
      begin v := (p_data->'respuestas'->>(q->>'id'))::int; exception when others then v := null; end;
      if v is null or v < 1 or v > 5 then raise exception 'Faltan respuestas por completar.'; end if;
      v_resp := v_resp || jsonb_build_object(q->>'id', v);
    end loop;
    v_id := 'CR-' || p_ciclo || '-' || ced;
    if exists (select 1 from public.registros where coleccion = 'climaRespuestas' and id = v_id) then raise exception 'Ya respondió esta encuesta. Gracias.'; end if;
    v_data := jsonb_build_object('respuestas', v_resp, 'comentario', left(coalesce(p_data->>'comentario', ''), 600));
  else
    v_tipo := 'SUGERENCIA';
    v_idea := btrim(coalesce(p_data->>'idea', ''));
    if length(v_idea) < 15 or length(v_idea) > 1000 then raise exception 'La idea debe tener entre 15 y 1000 caracteres.'; end if;
    if not exists (select 1 from jsonb_array_elements(c->'categorias') x where x->>'id' = p_data->>'categoria') then raise exception 'Tema no válido.'; end if;
    select count(*) into n from public.registros
     where coleccion = 'climaRespuestas' and data->>'cicloId' = p_ciclo and regexp_replace(coalesce(data->>'cedula', ''), '\D', '', 'g') = ced;
    if n >= 5 then raise exception 'Llegó al máximo de 5 ideas en esta campaña.'; end if;
    v_id := 'CS-' || p_ciclo || '-' || ced || '-' || (n + 1)::text || '-' || substr(md5(random()::text), 1, 5);
    v_data := jsonb_build_object('categoria', p_data->>'categoria', 'idea', v_idea, 'beneficio', left(coalesce(p_data->>'beneficio', ''), 600), 'estadoIdea', 'RECIBIDA');
  end if;

  v_data := v_data || jsonb_build_object(
    'id', v_id, 'cicloId', p_ciclo, 'tipo', v_tipo, 'cedula', t->>'cedula', 'trabajadorId', t->>'id',
    'nombre', trim(coalesce(t->>'nombres', '') || ' ' || coalesce(t->>'apellidos', '')),
    'tiendaId', t->>'tiendaId', 'marca', t->>'marca', 'cargoId', t->>'cargoId', 'fechaIngreso', t->>'fechaIngreso',
    'fecha', to_char(now() at time zone 'America/Caracas', 'YYYY-MM-DD"T"HH24:MI'));
  insert into public.registros (coleccion, id, tienda_id, marca, data, actualizado_por)
  values ('climaRespuestas', v_id, t->>'tiendaId', t->>'marca', v_data, null);
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;
revoke all on function public.clima_enviar(text, text, jsonb) from public;
grant execute on function public.clima_enviar(text, text, jsonb) to anon, authenticated;;
