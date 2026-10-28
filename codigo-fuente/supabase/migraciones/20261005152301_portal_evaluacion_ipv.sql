-- Migración 20261005152301 · portal_evaluacion_ipv
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.accesos_prueba (
  id text primary key,
  cedula text not null,
  clave_hash text not null,
  trabajador_id text,
  solicitud_id text,
  tienda_id text,
  marca text,
  nombre text,
  cargo_destino text,
  bateria jsonb not null default '[]'::jsonb,
  estado text not null default 'PENDIENTE' check (estado in ('PENDIENTE','EN_CURSO','COMPLETADA','ANULADA')),
  respuestas jsonb not null default '{}'::jsonb,
  nivel_educativo text,
  inicio timestamptz,
  fin timestamptz,
  intentos_fallidos int not null default 0,
  bloqueado_hasta timestamptz,
  creado timestamptz not null default now(),
  creado_por uuid default auth.uid(),
  expira date not null
);
create index if not exists accesos_prueba_cedula on public.accesos_prueba (cedula);
alter table public.accesos_prueba enable row level security;

-- El personal ve los accesos de su alcance; nadie lee la clave cifrada desde el navegador
revoke select on public.accesos_prueba from anon, authenticated;
grant select (id, cedula, trabajador_id, solicitud_id, tienda_id, marca, nombre, cargo_destino, bateria, estado, respuestas, nivel_educativo, inicio, fin, creado, creado_por, expira) on public.accesos_prueba to authenticated;
grant update (estado) on public.accesos_prueba to authenticated;
create policy "accesos_leer" on public.accesos_prueba for select to authenticated
  using (app.puede_ver('solicitudes', tienda_id, marca));
create policy "accesos_anular" on public.accesos_prueba for update to authenticated
  using (app.mi_rol() in ('rrhh','admin') and app.puede_ver('solicitudes', tienda_id, marca))
  with check (estado = 'ANULADA');

-- Crear acceso al solicitar una promoción (Gerente de Tienda, Marca, RRHH o Administrador)
create or replace function public.crear_acceso_prueba(p_id text, p_cedula text, p_clave text, p_trabajador_id text, p_solicitud_id text, p_tienda_id text, p_nombre text, p_cargo_destino text, p_bateria jsonb, p_expira date)
returns void language plpgsql security definer set search_path = '' as $$
declare v_marca text;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('tienda','marca','rrhh','admin') then raise exception 'Su rol no puede crear accesos a pruebas.'; end if;
  select r.data->>'marca' into v_marca from public.registros r where r.coleccion = 'tiendas' and r.id = p_tienda_id;
  if not app.puede_ver('solicitudes', p_tienda_id, v_marca) then raise exception 'La tienda está fuera de su alcance.'; end if;
  if length(coalesce(p_clave,'')) < 3 or length(regexp_replace(coalesce(p_cedula,''), '\D', '', 'g')) < 6 then raise exception 'Cédula o clave no válidas.'; end if;
  insert into public.accesos_prueba (id, cedula, clave_hash, trabajador_id, solicitud_id, tienda_id, marca, nombre, cargo_destino, bateria, expira)
  values (p_id, regexp_replace(p_cedula, '\D', '', 'g'), extensions.crypt(upper(p_clave), extensions.gen_salt('bf')), p_trabajador_id, p_solicitud_id, p_tienda_id, v_marca, p_nombre, p_cargo_destino, coalesce(p_bateria, '[]'::jsonb), p_expira);
end $$;
revoke all on function public.crear_acceso_prueba(text,text,text,text,text,text,text,text,jsonb,date) from public, anon;
grant execute on function public.crear_acceso_prueba(text,text,text,text,text,text,text,text,jsonb,date) to authenticated;

-- Accesos válidos: vigentes, sin anular y con la solicitud abierta
create or replace function public.portal_validos(p_cedula text, p_clave text)
returns setof public.accesos_prueba language plpgsql security definer set search_path = '' as $$
declare v_ced text := regexp_replace(coalesce(p_cedula,''), '\D', '', 'g');
begin
  if exists (select 1 from public.accesos_prueba a where a.cedula = v_ced and a.bloqueado_hasta > now()) then
    raise exception 'Demasiados intentos fallidos. Espere 15 minutos e intente de nuevo.';
  end if;
  return query select a.* from public.accesos_prueba a
    where a.cedula = v_ced and a.estado in ('PENDIENTE','EN_CURSO') and a.expira >= current_date
      and a.clave_hash = extensions.crypt(upper(coalesce(p_clave,'')), a.clave_hash)
      and exists (select 1 from public.registros r where r.coleccion = 'solicitudes' and r.id = a.solicitud_id and r.data->>'estado' in ('PENDIENTE','EN_REVISION','APROBADA','DEVUELTA'));
end $$;
revoke all on function public.portal_validos(text,text) from public, anon, authenticated;

create or replace function public.portal_ingresar(p_cedula text, p_clave text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_ced text := regexp_replace(coalesce(p_cedula,''), '\D', '', 'g'); v_lista jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'cedula', a.cedula, 'trabajador_id', a.trabajador_id, 'solicitud_id', a.solicitud_id, 'tienda_id', a.tienda_id, 'nombre', a.nombre, 'cargo_destino', a.cargo_destino, 'bateria', a.bateria, 'estado', a.estado, 'respuestas', a.respuestas, 'nivel_educativo', a.nivel_educativo, 'inicio', a.inicio, 'fin', a.fin, 'creado', a.creado, 'expira', a.expira)), '[]'::jsonb)
    into v_lista from public.portal_validos(v_ced, p_clave) a;
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
    'preguntas', coalesce((select data from public.ajustes where clave = 'ipvPreguntas'), '[]'::jsonb),
    'pruebas', coalesce((select jsonb_agg(jsonb_build_object('id', x->>'id', 'nombre', x->>'nombre', 'url', x->>'url')) from jsonb_array_elements(coalesce((select data from public.ajustes where clave = 'pruebas'), '[]'::jsonb)) x), '[]'::jsonb)
  );
end $$;

create or replace function public.portal_guardar(p_cedula text, p_clave text, p_id text, p_respuestas jsonb, p_nivel text, p_terminar boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v public.accesos_prueba;
begin
  select * into v from public.portal_validos(p_cedula, p_clave) a where a.id = p_id;
  if v.id is null then raise exception 'El acceso no es válido o ya fue enviado.'; end if;
  if jsonb_typeof(coalesce(p_respuestas, '{}'::jsonb)) <> 'object' or octet_length(p_respuestas::text) > 20000 then raise exception 'Respuestas no válidas.'; end if;
  update public.accesos_prueba set
    respuestas = coalesce(p_respuestas, '{}'::jsonb),
    nivel_educativo = coalesce(nullif(p_nivel, ''), nivel_educativo),
    inicio = coalesce(inicio, now()),
    estado = case when p_terminar then 'COMPLETADA' else 'EN_CURSO' end,
    fin = case when p_terminar then now() else fin end
  where id = p_id returning * into v;
  return jsonb_build_object('id', v.id, 'cedula', v.cedula, 'trabajador_id', v.trabajador_id, 'solicitud_id', v.solicitud_id, 'tienda_id', v.tienda_id, 'nombre', v.nombre, 'cargo_destino', v.cargo_destino, 'bateria', v.bateria, 'estado', v.estado, 'respuestas', v.respuestas, 'nivel_educativo', v.nivel_educativo, 'inicio', v.inicio, 'fin', v.fin, 'creado', v.creado, 'expira', v.expira);
end $$;
grant execute on function public.portal_ingresar(text,text) to anon, authenticated;
grant execute on function public.portal_guardar(text,text,text,jsonb,text,boolean) to anon, authenticated;;
