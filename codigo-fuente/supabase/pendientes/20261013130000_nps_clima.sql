-- v1.19.0 · eNPS en la encuesta de clima laboral. Aplicar en Supabase › SQL Editor (seguro repetirlo).
-- Sin esta migración la encuesta sigue funcionando, pero la respuesta 0–10 no se guarda en la nube.

CREATE OR REPLACE FUNCTION public.clima_ciclo(p_ciclo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c jsonb;
begin
  select data into c from public.registros where coleccion = 'climaCiclos' and id = p_ciclo;
  if c is null then return jsonb_build_object('existe', false); end if;
  return jsonb_build_object(
    'existe', true, 'id', c->>'id', 'tipo', c->>'tipo', 'nombre', c->>'nombre', 'estado', c->>'estado',
    'historico', coalesce((c->>'historico')::boolean, false), 'nps', coalesce((c->>'nps')::boolean, false),
    'fechaCierre', c->>'fechaCierre', 'mensaje', c->>'mensaje', 'marca', c->>'marca',
    'preguntas', coalesce(c->'preguntas', '[]'::jsonb), 'categorias', coalesce(c->'categorias', '[]'::jsonb),
    'hoy', to_char(current_date, 'YYYY-MM-DD'));
end $function$
;

CREATE OR REPLACE FUNCTION public.clima_enviar(p_ciclo text, p_cedula text, p_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    -- eNPS: pregunta de recomendación 0–10 (solo si el ciclo la incluye)
    if coalesce((c->>'nps')::boolean, false) then
      begin v := (p_data->>'nps')::int; exception when others then v := null; end;
      if v is null or v < 0 or v > 10 then raise exception 'Falta responder la pregunta de recomendación (0 a 10).'; end if;
      v_data := v_data || jsonb_build_object('nps', v);
    end if;
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
end $function$
;
