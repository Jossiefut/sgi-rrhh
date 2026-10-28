-- ============================================================================
-- MIGRACIÓN ÚNICA: pruebas nuevas del portal (PIL, IPC, DISC), batería por cargo y Nine-Box administrativa.
-- ESTADO: APLICADA el 07/10/2026 desde el editor SQL (por eso no figura en el historial de migraciones de Supabase).
-- Se ubica aquí para reproducir el orden real: después de kostick_intentos_* y fichas_sensibles, antes de clima_sugerencias.
-- Requiere haber aplicado antes: migracion-kostick-intentos.sql (y, si se decide, migracion-desarrollo-sucesion.sql).
--
-- Qué hace:
--  1. Tiempos por prueba: IPV 40, Kostick 40, Lógico 25, PIL 15, IPC 20, DISC 20 min (se pueden cambiar en ajustes.config.minutosPrueba).
--  2. El portal acepta las seis pruebas; valida el formato de las respuestas de cada una.
--  3. Tipos de acceso: PROMOCION, INGRESO, DIRECTO y VALIDACION (validación del Indicador Lógico). Batería de hasta 3 pruebas
--     de ajuste al cargo (IPV, IPC, Kostick, Lógico, PIL) más el DISC opcional.
--  4. Las respuestas del PIL (integridad) se guardan aparte, en una tabla que solo leen RRHH y el Administrador.
--  5. Función agregar_prueba_acceso: añadir una prueba a un acceso existente (respeta el máximo).
--  6. Nine-Box administrativa: las evaluaciones de las oficinas (tiendas administrativas) dejan de ser legibles por
--     tienda, visor y consulta. Marca y operaciones solo las leen si son de la marca de la oficina (el filtro fino por
--     supervisor inmediato lo aplica la pantalla; ver nota al final).
-- No se borra ni se modifica ningún dato existente.
-- ============================================================================

-- 1. Tiempos por prueba -------------------------------------------------------
create or replace function app.minutos_prueba(p_prueba text) returns integer
language sql stable security definer set search_path = '' as $$
  select coalesce(
    nullif((select (a.data->'minutosPrueba'->>p_prueba)::int from public.ajustes a where a.clave = 'config'), 0),
    case p_prueba when 'LOGICO' then 25 when 'PIL' then 15 when 'IPC' then 20 when 'DISC' then 20 else 40 end)
$$;

-- 2. Estado general: considera las seis pruebas del portal -------------------------
create or replace function app.estado_general(p_bateria jsonb, p_ev jsonb) returns text
language plpgsql immutable set search_path = '' as $$
declare t text; e jsonb; s text; n int := 0; def int := 0; act int := 0;
begin
  for t in select x from jsonb_array_elements_text(coalesce(p_bateria,'[]'::jsonb)) x where x in ('IPV','KOSTICK','LOGICO','PIL','IPC','DISC') loop
    n := n + 1; e := coalesce(p_ev->t, app.ev_vacio()); s := app.ev_estado(e);
    if s in ('COMPLETADA','CERRADA') then def := def + 1; end if;
    if s <> 'PENDIENTE' or jsonb_typeof(e->'respuestas') = 'object' and e->'respuestas' <> '{}'::jsonb then act := act + 1; end if;
  end loop;
  if n > 0 and def = n then return 'COMPLETADA'; end if;
  if act > 0 then return 'EN_CURSO'; end if;
  return 'PENDIENTE';
end $$;

-- 3. Tabla privada de respuestas del PIL y datos de integridad -------------------------
alter table public.accesos_prueba add column if not exists pil jsonb not null default '{}'::jsonb;  -- resumen y entrevista (solo RRHH/Admin escriben)

create table if not exists public.respuestas_pil (
  acceso_id text primary key references public.accesos_prueba(id) on delete cascade,
  respuestas jsonb not null default '{}'::jsonb,
  creado timestamptz not null default now()
);
alter table public.respuestas_pil enable row level security;
drop policy if exists respuestas_pil_leer on public.respuestas_pil;
create policy respuestas_pil_leer on public.respuestas_pil for select to authenticated using (app.mi_rol() in ('rrhh','admin'));
-- Nadie escribe directamente: solo la función del portal (security definer).

-- El resumen y la entrevista de integridad los guarda únicamente RRHH o el Administrador
create or replace function public.guardar_pil(p_id text, p_pil jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.accesos_prueba;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('rrhh','admin') then raise exception 'Solo RRHH o el Administrador registran el resultado de integridad.'; end if;
  update public.accesos_prueba set pil = coalesce(pil, '{}'::jsonb) || coalesce(p_pil, '{}'::jsonb) where id = p_id returning * into v;
  if v.id is null then raise exception 'No se encontró el acceso.'; end if;
  return app.acceso_json(v);
end $$;
revoke all on function public.guardar_pil(text, jsonb) from public, anon;
grant execute on function public.guardar_pil(text, jsonb) to authenticated;

-- Una vez enviado el PIL, sus respuestas y la entrevista solo salen para RRHH y el Administrador
create or replace function app.acceso_json(a public.accesos_prueba) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('id', a.id, 'cedula', a.cedula, 'trabajador_id', a.trabajador_id, 'solicitud_id', a.solicitud_id, 'tipo', a.tipo, 'apellidos', a.apellidos, 'tienda_id', a.tienda_id, 'nombre', a.nombre, 'cargo_destino', a.cargo_destino, 'bateria', a.bateria, 'estado', a.estado, 'respuestas', a.respuestas,
    'ev', case when coalesce((a.ev->'PIL'->>'completada')::boolean, false) and app.mi_rol() is distinct from 'rrhh' and app.mi_rol() is distinct from 'admin' then jsonb_set(a.ev, '{PIL,respuestas}', '{}'::jsonb) else a.ev end,
    'pil', case when app.mi_rol() in ('rrhh','admin') then a.pil else '{}'::jsonb end,
    'nivel_educativo', a.nivel_educativo, 'inicio', a.inicio, 'fin', a.fin, 'creado', a.creado, 'expira', a.expira)
$$;

-- 4. Portal: entrada con los tiempos de las seis pruebas ----------------------------
create or replace function public.portal_ingresar(p_cedula text, p_clave text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ced text := regexp_replace(coalesce(p_cedula,''), '\D', '', 'g'); v_lista jsonb;
begin
  select coalesce(jsonb_agg(app.acceso_json(a)), '[]'::jsonb) into v_lista from public.portal_validos(v_ced, p_clave) a;
  if jsonb_array_length(v_lista) = 0 then
    update public.accesos_prueba set intentos_fallidos = intentos_fallidos + 1,
      bloqueado_hasta = case when intentos_fallidos + 1 >= 5 then now() + interval '15 minutes' else bloqueado_hasta end
      where cedula = v_ced and estado in ('PENDIENTE','EN_CURSO');
    update public.accesos_prueba set intentos_fallidos = 0 where cedula = v_ced and bloqueado_hasta > now() and intentos_fallidos >= 5;
    return jsonb_build_object('accesos', '[]'::jsonb);
  end if;
  update public.accesos_prueba set intentos_fallidos = 0 where cedula = v_ced;
  return jsonb_build_object(
    'accesos', v_lista,
    'ahora', (extract(epoch from clock_timestamp()) * 1000)::bigint,
    'minutos', jsonb_build_object('IPV', app.minutos_prueba('IPV'), 'KOSTICK', app.minutos_prueba('KOSTICK'), 'LOGICO', app.minutos_prueba('LOGICO'), 'PIL', app.minutos_prueba('PIL'), 'IPC', app.minutos_prueba('IPC'), 'DISC', app.minutos_prueba('DISC')),
    'preguntas', coalesce((select data from public.ajustes where clave = 'ipvPreguntas'), '[]'::jsonb),
    'pruebas', coalesce((select jsonb_agg(jsonb_build_object('id', x->>'id', 'nombre', x->>'nombre', 'url', x->>'url', 'minutos', x->'minutos', 'proposito', x->>'proposito')) from jsonb_array_elements(coalesce((select data from public.ajustes where clave = 'pruebas'), '[]'::jsonb)) x), '[]'::jsonb)
  );
end $$;

-- 5. Portal: acción con validación de respuestas por prueba ----------------------------
--    IPV y Kostick: a/b/c (1–90) · Lógico: número o A–E (1–50) · PIL: 1–5 (1–46) · IPC: 1–5 (1–54)
--    DISC: grupo 1–28 con {"mas": palabra, "menos": palabra}, palabras distintas.
create or replace function public.portal_accion(p_cedula text, p_clave text, p_id text, p_prueba text, p_tipo text, p_respuestas jsonb, p_nivel text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v public.accesos_prueba; v_ev jsonb; v_min int; v_ahora timestamptz := clock_timestamp(); v_est text; v_err text := '';
  v_iso text := to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'); k text; val jsonb; txt text;
begin
  if p_prueba not in ('IPV','KOSTICK','LOGICO','PIL','IPC','DISC') then raise exception 'Prueba no válida.'; end if;
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
      for k, val in select key, value from jsonb_each(coalesce(p_respuestas, '{}'::jsonb)) loop
        if k !~ '^\d{1,2}$' then raise exception 'Respuestas no válidas.'; end if;
        txt := val #>> '{}';
        if p_prueba = 'LOGICO' then
          if k::int < 1 or k::int > 50 or txt is null or txt !~ '^(-?[0-9]{1,6}([.,][0-9]{1,3})?|[A-Ea-e])$' then raise exception 'Respuestas no válidas.'; end if;
        elsif p_prueba = 'PIL' then
          if k::int < 1 or k::int > 46 or txt is null or txt !~ '^[1-5]$' then raise exception 'Respuestas no válidas.'; end if;
        elsif p_prueba = 'IPC' then
          if k::int < 1 or k::int > 54 or txt is null or txt !~ '^[1-5]$' then raise exception 'Respuestas no válidas.'; end if;
        elsif p_prueba = 'DISC' then
          if k::int < 1 or k::int > 28 or jsonb_typeof(val) <> 'object' or length(coalesce(val->>'mas','')) not between 1 and 30 or length(coalesce(val->>'menos','')) not between 1 and 30
             or lower(val->>'mas') = lower(val->>'menos') then raise exception 'Respuestas no válidas.'; end if;
        elsif k::int < 1 or k::int > 90 or txt is null or txt not in ('a','b','c') then raise exception 'Respuestas no válidas.'; end if;
      end loop;
      v_ev := jsonb_set(v_ev, '{respuestas}', coalesce(v_ev->'respuestas', '{}'::jsonb) || coalesce(p_respuestas, '{}'::jsonb));
      if p_tipo = 'terminar' then
        v_ev := jsonb_set(v_ev, '{completada}', 'true'::jsonb);
        v_ev := jsonb_set(v_ev, '{intentos}', (select jsonb_agg(case when coalesce(x->>'fin','') = '' then x || jsonb_build_object('fin', v_iso, 'cierre', 'ENVIADA') else x end) from jsonb_array_elements(v_ev->'intentos') x));
        -- Al terminar, las respuestas del PIL se copian a la tabla privada (solo RRHH/Admin); acceso_json las oculta a los demás
        if p_prueba = 'PIL' then
          insert into public.respuestas_pil (acceso_id, respuestas) values (p_id, v_ev->'respuestas')
            on conflict (acceso_id) do update set respuestas = excluded.respuestas;
        end if;
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
revoke all on function public.portal_accion(text, text, text, text, text, jsonb, text) from public;
grant execute on function public.portal_accion(text, text, text, text, text, jsonb, text) to anon, authenticated;

-- 6. Reintento autorizado: vale para las seis pruebas ----------------------------------
create or replace function public.autorizar_reintento(p_id text, p_prueba text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.accesos_prueba; v_ev jsonb; v_dias int;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('rrhh','admin') then raise exception 'Solo RRHH o el Administrador pueden autorizar un reintento.'; end if;
  if p_prueba not in ('IPV','KOSTICK','LOGICO','PIL','IPC','DISC') then raise exception 'Prueba no válida.'; end if;
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

-- 7. Acceso vigente: PROMOCION exige su solicitud abierta; INGRESO, DIRECTO y VALIDACION no -----
create or replace function public.portal_validos(p_cedula text, p_clave text) returns setof public.accesos_prueba
language plpgsql security definer set search_path = '' as $$
declare v_ced text := regexp_replace(coalesce(p_cedula,''), '\D', '', 'g');
begin
  if exists (select 1 from public.accesos_prueba a where a.cedula = v_ced and a.bloqueado_hasta > now()) then
    raise exception 'Demasiados intentos fallidos. Espere 15 minutos e intente de nuevo.';
  end if;
  return query select a.* from public.accesos_prueba a
    where a.cedula = v_ced and a.estado in ('PENDIENTE','EN_CURSO') and a.expira >= current_date
      and a.clave_hash = extensions.crypt(upper(coalesce(p_clave,'')), a.clave_hash)
      and (a.tipo in ('INGRESO','DIRECTO','VALIDACION') or exists (select 1 from public.registros r where r.coleccion = 'solicitudes' and r.id = a.solicitud_id and r.data->>'estado' in ('PENDIENTE','EN_REVISION','APROBADA','DEVUELTA')));
end $$;

-- 8. Crear acceso: batería por cargo (máximo 3 pruebas de ajuste + DISC opcional) ---------------
create or replace function app.bateria_valida(p_bateria jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare t text; n int := 0; v_disc int := 0;
begin
  if jsonb_typeof(coalesce(p_bateria,'[]'::jsonb)) <> 'array' or jsonb_array_length(p_bateria) = 0 then return false; end if;
  for t in select x from jsonb_array_elements_text(p_bateria) x loop
    if t not in ('IPV','IPC','KOSTICK','LOGICO','PIL','DISC') then return false; end if;
    if t = 'DISC' then v_disc := v_disc + 1; else n := n + 1; end if;
  end loop;
  return n <= 3 and v_disc <= 1 and (n + v_disc) = jsonb_array_length(p_bateria) and (select count(distinct x) from jsonb_array_elements_text(p_bateria) x) = jsonb_array_length(p_bateria);
end $$;

drop function if exists public.crear_acceso_prueba(text, text, text, text, text, text, text, text, text, text, jsonb, date);
create or replace function public.crear_acceso_prueba(p_id text, p_cedula text, p_clave text, p_trabajador_id text, p_solicitud_id text, p_tipo text, p_apellidos text, p_tienda_id text, p_nombre text, p_cargo_destino text, p_bateria jsonb, p_expira date) returns void
language plpgsql security definer set search_path = '' as $$
declare v_marca text;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('tienda','marca','rrhh','admin') then raise exception 'Su rol no puede crear accesos a pruebas.'; end if;
  if coalesce(p_tipo, 'PROMOCION') not in ('PROMOCION','INGRESO','DIRECTO','VALIDACION') then raise exception 'Tipo de acceso no válido.'; end if;
  if p_tipo = 'VALIDACION' and (app.mi_rol() not in ('rrhh','admin') or p_bateria <> '["LOGICO"]'::jsonb) then raise exception 'La validación del Indicador Lógico la crea RRHH y solo incluye esa prueba.'; end if;
  if not app.bateria_valida(p_bateria) then raise exception 'La batería no es válida: máximo 3 pruebas de ajuste al cargo y el DISC opcional.'; end if;
  select r.data->>'marca' into v_marca from public.registros r where r.coleccion = 'tiendas' and r.id = p_tienda_id;
  if not app.puede_ver('solicitudes', p_tienda_id, v_marca) then raise exception 'La tienda está fuera de su alcance.'; end if;
  if length(coalesce(p_clave,'')) < 2 or length(regexp_replace(coalesce(p_cedula,''), '\D', '', 'g')) < 6 then raise exception 'Cédula o clave no válidas.'; end if;
  insert into public.accesos_prueba (id, cedula, clave_hash, trabajador_id, solicitud_id, tipo, apellidos, tienda_id, marca, nombre, cargo_destino, bateria, expira)
  values (p_id, regexp_replace(p_cedula, '\D', '', 'g'), extensions.crypt(upper(p_clave), extensions.gen_salt('bf')), nullif(p_trabajador_id, ''), nullif(p_solicitud_id, ''), coalesce(p_tipo, 'PROMOCION'), p_apellidos, p_tienda_id, v_marca, p_nombre, p_cargo_destino, p_bateria, p_expira);
end $$;
revoke all on function public.crear_acceso_prueba(text, text, text, text, text, text, text, text, text, text, jsonb, date) from public, anon;
grant execute on function public.crear_acceso_prueba(text, text, text, text, text, text, text, text, text, text, jsonb, date) to authenticated;

-- 9. Añadir una prueba a un acceso existente ------------------------------------------
create or replace function public.agregar_prueba_acceso(p_id text, p_prueba text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.accesos_prueba; v_nueva jsonb;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('tienda','marca','rrhh','admin') then raise exception 'Su rol no puede modificar accesos.'; end if;
  select * into v from public.accesos_prueba where id = p_id;
  if v.id is null then raise exception 'No se encontró el acceso.'; end if;
  if not app.puede_ver('solicitudes', v.tienda_id, v.marca) then raise exception 'El acceso está fuera de su alcance.'; end if;
  if v.bateria ? p_prueba then return app.acceso_json(v); end if;
  v_nueva := v.bateria || to_jsonb(p_prueba);
  if not app.bateria_valida(v_nueva) then raise exception 'No se puede agregar: máximo 3 pruebas de ajuste al cargo y el DISC opcional.'; end if;
  update public.accesos_prueba set bateria = v_nueva, estado = case when estado = 'COMPLETADA' then 'EN_CURSO' else estado end, fin = null where id = p_id returning * into v;
  return app.acceso_json(v);
end $$;
revoke all on function public.agregar_prueba_acceso(text, text) from public, anon;
grant execute on function public.agregar_prueba_acceso(text, text) to authenticated;

-- 10. Nine-Box administrativa: visibilidad en base de datos --------------------------------
--    Las evaluaciones de las tiendas administrativas (oficinas) no las leen tienda, visor ni consulta;
--    marca y operaciones solo las de su marca. Admin, RRHH y Gerencia General las leen todas.
--    (Se parte de la función vigente en la base; no incluye la lógica de desarrollo y sucesión, que sigue sin aplicarse.)
create or replace function app.puede_ver(p_coleccion text, p_tienda text, p_marca text)
returns boolean language plpgsql stable security definer set search_path to '' as $function$
declare r text := app.mi_rol();
begin
  if r is null or r = 'pendiente' then return false; end if;
  if p_coleccion in ('tiendas','cargos') then return true; end if;
  if r in ('admin','rrhh','general') then return true; end if;
  if p_coleccion = 'bitacora' then return false; end if;
  -- Evaluaciones de oficinas: ni tienda, ni visor, ni consulta
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

-- Nota: puede_ver solo recibe colección, tienda y marca; no conoce al supervisor inmediato del registro. Por eso, en base de
-- datos, marca y operaciones ven las evaluaciones de oficina de su marca, y la pantalla las limita al supervisor inmediato.
-- Si se quiere el filtro por supervisor también en la base de datos, hay que cambiar las políticas RLS para pasar el
-- contenido del registro (decisión pendiente).
