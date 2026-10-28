-- Migración 20261007011440 · kostick_intentos_validos_ingresar
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

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
      and (a.tipo = 'INGRESO' or exists (select 1 from public.registros r where r.coleccion = 'solicitudes' and r.id = a.solicitud_id and r.data->>'estado' in ('PENDIENTE','EN_REVISION','APROBADA','DEVUELTA')));
end $$;

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
    'minutos', jsonb_build_object('IPV', app.minutos_prueba('IPV'), 'KOSTICK', app.minutos_prueba('KOSTICK'), 'LOGICO', app.minutos_prueba('LOGICO')),
    'preguntas', coalesce((select data from public.ajustes where clave = 'ipvPreguntas'), '[]'::jsonb),
    'pruebas', coalesce((select jsonb_agg(jsonb_build_object('id', x->>'id', 'nombre', x->>'nombre', 'url', x->>'url', 'minutos', x->'minutos', 'proposito', x->>'proposito')) from jsonb_array_elements(coalesce((select data from public.ajustes where clave = 'pruebas'), '[]'::jsonb)) x), '[]'::jsonb)
  );
end $$;;
