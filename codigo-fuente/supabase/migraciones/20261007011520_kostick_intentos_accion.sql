-- Migración 20261007011520 · kostick_intentos_accion
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create or replace function public.portal_accion(p_cedula text, p_clave text, p_id text, p_prueba text, p_tipo text, p_respuestas jsonb, p_nivel text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v public.accesos_prueba; v_ev jsonb; v_min int; v_ahora timestamptz := clock_timestamp(); v_est text; v_err text := '';
  v_iso text := to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'); k text; val text;
begin
  if p_prueba not in ('IPV','KOSTICK','LOGICO') then raise exception 'Prueba no válida.'; end if;
  select * into v from public.portal_validos(p_cedula, p_clave) a where a.id = p_id;
  if v.id is null then raise exception 'El acceso no es válido o ya fue enviado.'; end if;
  if not (v.bateria ? p_prueba) then raise exception 'Esta prueba no forma parte de su batería.'; end if;
  v_min := app.minutos_prueba(p_prueba);
  v_ev := app.ev_cerrar(coalesce(v.ev->p_prueba, app.ev_vacio()), v_min, v_ahora);
  v_est := app.ev_estado(v_ev);
  if p_tipo = 'iniciar' then
    if v_est = 'COMPLETADA' then v_err := 'Esta prueba ya fue enviada.';
    elsif v_est = 'BLOQUEADA' then v_err := 'Usó sus oportunidades sin terminar la prueba. Comuníquese con RRHH para que autorice un último intento.';
    elsif v_est = 'CERRADA' then v_err := 'La prueba quedó cerrada de forma definitiva.';
    elsif v_est = 'PENDIENTE' then v_ev := jsonb_set(v_ev, '{intentos}', (v_ev->'intentos') || jsonb_build_array(jsonb_build_object('inicio', v_iso, 'fin', '', 'cierre', '')));
    end if;
  elsif p_tipo in ('guardar','terminar') then
    if v_est <> 'EN_CURSO' then v_err := case when v_est = 'COMPLETADA' then 'Esta prueba ya fue enviada.' else 'Se agotó el tiempo de la prueba.' end;
    else
      if jsonb_typeof(coalesce(p_respuestas, '{}'::jsonb)) <> 'object' or octet_length(coalesce(p_respuestas, '{}'::jsonb)::text) > 20000 then raise exception 'Respuestas no válidas.'; end if;
      for k, val in select key, value #>> '{}' from jsonb_each(coalesce(p_respuestas, '{}'::jsonb)) loop
        if k !~ '^\d{1,2}$' then raise exception 'Respuestas no válidas.'; end if;
        if p_prueba = 'LOGICO' then
          if k::int < 1 or k::int > 50 or val !~ '^(-?[0-9]{1,6}([.,][0-9]{1,3})?|[A-Ea-e])$' then raise exception 'Respuestas no válidas.'; end if;
        elsif k::int < 1 or k::int > 90 or val not in ('a','b','c') then raise exception 'Respuestas no válidas.'; end if;
      end loop;
      v_ev := jsonb_set(v_ev, '{respuestas}', coalesce(v_ev->'respuestas', '{}'::jsonb) || coalesce(p_respuestas, '{}'::jsonb));
      if p_tipo = 'terminar' then
        v_ev := jsonb_set(v_ev, '{completada}', 'true'::jsonb);
        v_ev := jsonb_set(v_ev, '{intentos}', (select jsonb_agg(case when coalesce(x->>'fin','') = '' then x || jsonb_build_object('fin', v_iso, 'cierre', 'ENVIADA') else x end) from jsonb_array_elements(v_ev->'intentos') x));
      end if;
    end if;
  else raise exception 'Acción no válida.';
  end if;
  update public.accesos_prueba set
    ev = jsonb_set(coalesce(ev, '{}'::jsonb), array[p_prueba], v_ev),
    nivel_educativo = coalesce(nullif(p_nivel, ''), nivel_educativo),
    inicio = coalesce(inicio, case when jsonb_array_length(v_ev->'intentos') > 0 then (v_ev->'intentos'->0->>'inicio')::timestamptz end)
  where id = p_id returning * into v;
  update public.accesos_prueba set estado = app.estado_general(v.bateria, v.ev), fin = case when app.estado_general(v.bateria, v.ev) = 'COMPLETADA' then coalesce(fin, now()) else null end where id = p_id returning * into v;
  return jsonb_build_object('acceso', app.acceso_json(v), 'error', v_err, 'ahora', (extract(epoch from clock_timestamp()) * 1000)::bigint);
end $$;

create or replace function public.autorizar_reintento(p_id text, p_prueba text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.accesos_prueba; v_ev jsonb; v_dias int;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('rrhh','admin') then raise exception 'Solo RRHH o el Administrador pueden autorizar un reintento.'; end if;
  if p_prueba not in ('IPV','KOSTICK','LOGICO') then raise exception 'Prueba no válida.'; end if;
  select * into v from public.accesos_prueba where id = p_id;
  if v.id is null or not (v.bateria ? p_prueba) then raise exception 'No se encontró la prueba.'; end if;
  v_ev := app.ev_cerrar(coalesce(v.ev->p_prueba, app.ev_vacio()), app.minutos_prueba(p_prueba), clock_timestamp());
  if app.ev_estado(v_ev) <> 'BLOQUEADA' then raise exception 'Solo se puede autorizar cuando el trabajador agotó sus intentos sin terminar, y una sola vez.'; end if;
  v_ev := jsonb_set(v_ev, '{extra}', '1'::jsonb);
  v_dias := coalesce((select (a.data->>'diasAccesoPrueba')::int from public.ajustes a where a.clave = 'config'), 15);
  update public.accesos_prueba set ev = jsonb_set(coalesce(ev, '{}'::jsonb), array[p_prueba], v_ev), expira = greatest(expira, current_date + v_dias) where id = p_id returning * into v;
  update public.accesos_prueba set estado = app.estado_general(v.bateria, v.ev), fin = null where id = p_id returning * into v;
  return app.acceso_json(v);
end $$;

revoke all on function public.portal_accion(text, text, text, text, text, jsonb, text) from public;
grant execute on function public.portal_accion(text, text, text, text, text, jsonb, text) to anon, authenticated;
revoke all on function public.autorizar_reintento(text, text) from public, anon;
grant execute on function public.autorizar_reintento(text, text) to authenticated;;
