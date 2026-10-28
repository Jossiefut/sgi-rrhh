-- =====================================================================================
-- ESQUEMA ACTUAL de la base de datos (Supabase, proyecto sgi-rrhh-marcas-propias)
-- Foto tomada del servidor el 08/10/2026 con consultas al catálogo de PostgreSQL.
-- Es la referencia exacta de lo que hay hoy: tablas, restricciones, índices, RLS, políticas,
-- funciones, disparadores y permisos de los esquemas public y app.
-- Para crear una base nueva:  (1) aplique las migraciones de la carpeta migraciones/ en orden, o
--                             (2) ejecute este archivo completo en una base Supabase vacía.
-- Requiere las extensiones pgcrypto (en el esquema extensions) y uuid-ossp, que Supabase trae activas.
-- =====================================================================================
create extension if not exists pgcrypto with schema extensions;
set check_function_bodies = off;

create schema if not exists app;

create table if not exists public.accesos_prueba (
  id text not null,
  cedula text not null,
  clave_hash text not null,
  trabajador_id text,
  solicitud_id text,
  tienda_id text,
  marca text,
  nombre text,
  cargo_destino text,
  bateria jsonb not null default '[]'::jsonb,
  estado text not null default 'PENDIENTE'::text,
  respuestas jsonb not null default '{}'::jsonb,
  nivel_educativo text,
  inicio timestamp with time zone,
  fin timestamp with time zone,
  intentos_fallidos integer not null default 0,
  bloqueado_hasta timestamp with time zone,
  creado timestamp with time zone not null default now(),
  creado_por uuid default auth.uid(),
  expira date not null,
  ev jsonb not null default '{}'::jsonb,
  tipo text not null default 'PROMOCION'::text,
  apellidos text,
  pil jsonb not null default '{}'::jsonb
);

create table if not exists public.admins_iniciales (
  correo text not null
);

create table if not exists public.ajustes (
  clave text not null,
  data jsonb not null,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);

create table if not exists public.fichas_personales (
  cedula text not null,
  trabajador_id text,
  tienda_id text,
  marca text,
  data jsonb not null,
  fuente text,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);

create table if not exists public.fichas_sensibles (
  cedula text not null,
  data jsonb not null default '{}'::jsonb,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);

create table if not exists public.formulario_recibido (
  id_formulario text not null,
  cedula text,
  data jsonb not null,
  recibido timestamp with time zone not null default now(),
  procesado boolean not null default false,
  procesado_en timestamp with time zone
);

create table if not exists public.integracion_clave (
  id integer not null default 1,
  huella text not null,
  creada timestamp with time zone not null default now(),
  creada_por uuid
);

create table if not exists public.perfiles (
  id uuid not null,
  correo text not null,
  nombre text not null default ''::text,
  rol text not null default 'pendiente'::text,
  marca text,
  tienda_id text,
  activo boolean not null default true,
  debe_cambiar_clave boolean not null default true,
  creado timestamp with time zone not null default now()
);

create table if not exists public.recordatorios_envios (
  id bigint not null,
  fecha date not null default CURRENT_DATE,
  usuario_id uuid,
  correo text,
  asunto text,
  estado text not null,
  enviado_por uuid,
  creado timestamp with time zone not null default now()
);

create table if not exists public.registros (
  coleccion text not null,
  id text not null,
  tienda_id text,
  marca text,
  data jsonb not null,
  actualizado timestamp with time zone not null default now(),
  actualizado_por uuid default auth.uid()
);

create table if not exists public.respuestas_pil (
  acceso_id text not null,
  respuestas jsonb not null default '{}'::jsonb,
  creado timestamp with time zone not null default now()
);

alter table accesos_prueba add constraint accesos_prueba_estado_check CHECK ((estado = ANY (ARRAY['PENDIENTE'::text, 'EN_CURSO'::text, 'COMPLETADA'::text, 'ANULADA'::text])));

alter table accesos_prueba add constraint accesos_prueba_pkey PRIMARY KEY (id);

alter table admins_iniciales add constraint admins_iniciales_pkey PRIMARY KEY (correo);

alter table ajustes add constraint ajustes_pkey PRIMARY KEY (clave);

alter table fichas_personales add constraint fichas_personales_pkey PRIMARY KEY (cedula);

alter table fichas_sensibles add constraint fichas_sensibles_pkey PRIMARY KEY (cedula);

alter table formulario_recibido add constraint formulario_recibido_pkey PRIMARY KEY (id_formulario);

alter table integracion_clave add constraint integracion_clave_id_check CHECK ((id = 1));

alter table integracion_clave add constraint integracion_clave_pkey PRIMARY KEY (id);

alter table perfiles add constraint perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table perfiles add constraint perfiles_marca_check CHECK ((marca = ANY (ARRAY['BALU'::text, 'PLANETA'::text])));

alter table perfiles add constraint perfiles_pkey PRIMARY KEY (id);

alter table perfiles add constraint perfiles_rol_check CHECK ((rol = ANY (ARRAY['admin'::text, 'marca'::text, 'operaciones'::text, 'general'::text, 'rrhh'::text, 'tienda'::text, 'visor'::text, 'consulta'::text, 'pendiente'::text])));

alter table recordatorios_envios add constraint recordatorios_envios_estado_check CHECK ((estado = ANY (ARRAY['ENVIADO'::text, 'FALLIDO'::text])));

alter table recordatorios_envios add constraint recordatorios_envios_pkey PRIMARY KEY (id);

alter table recordatorios_envios add constraint recordatorios_envios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE SET NULL;

alter table registros add constraint registros_pkey PRIMARY KEY (coleccion, id);

alter table respuestas_pil add constraint respuestas_pil_acceso_id_fkey FOREIGN KEY (acceso_id) REFERENCES accesos_prueba(id) ON DELETE CASCADE;

alter table respuestas_pil add constraint respuestas_pil_pkey PRIMARY KEY (acceso_id);

CREATE INDEX accesos_prueba_cedula ON public.accesos_prueba USING btree (cedula);

CREATE INDEX fichas_tienda ON public.fichas_personales USING btree (tienda_id);

CREATE INDEX registros_coleccion_tienda ON public.registros USING btree (coleccion, tienda_id);

CREATE INDEX registros_marca ON public.registros USING btree (marca);

alter table public.accesos_prueba enable row level security;

alter table public.admins_iniciales enable row level security;

alter table public.ajustes enable row level security;

alter table public.fichas_personales enable row level security;

alter table public.fichas_sensibles enable row level security;

alter table public.formulario_recibido enable row level security;

alter table public.integracion_clave enable row level security;

alter table public.perfiles enable row level security;

alter table public.recordatorios_envios enable row level security;

alter table public.registros enable row level security;

alter table public.respuestas_pil enable row level security;

CREATE OR REPLACE FUNCTION app.acceso_json(a accesos_prueba)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select jsonb_build_object('id', a.id, 'cedula', a.cedula, 'trabajador_id', a.trabajador_id, 'solicitud_id', a.solicitud_id, 'tipo', a.tipo, 'apellidos', a.apellidos, 'tienda_id', a.tienda_id, 'nombre', a.nombre, 'cargo_destino', a.cargo_destino, 'bateria', a.bateria, 'estado', a.estado, 'respuestas', a.respuestas,
    'ev', case when coalesce((a.ev->'PIL'->>'completada')::boolean, false) and app.mi_rol() is distinct from 'rrhh' and app.mi_rol() is distinct from 'admin' then jsonb_set(a.ev, '{PIL,respuestas}', '{}'::jsonb) else a.ev end,
    'pil', case when app.mi_rol() in ('rrhh','admin') then a.pil else '{}'::jsonb end,
    'nivel_educativo', a.nivel_educativo, 'inicio', a.inicio, 'fin', a.fin, 'creado', a.creado, 'expira', a.expira)
$function$
;

CREATE OR REPLACE FUNCTION app.bateria_valida(p_bateria jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare t text; n int := 0; v_disc int := 0;
begin
  if jsonb_typeof(coalesce(p_bateria,'[]'::jsonb)) <> 'array' or jsonb_array_length(p_bateria) = 0 then return false; end if;
  for t in select x from jsonb_array_elements_text(p_bateria) x loop
    if t not in ('IPV','IPC','KOSTICK','LOGICO','PIL','DISC') then return false; end if;
    if t = 'DISC' then v_disc := v_disc + 1; else n := n + 1; end if;
  end loop;
  return n <= 3 and v_disc <= 1 and (n + v_disc) = jsonb_array_length(p_bateria) and (select count(distinct x) from jsonb_array_elements_text(p_bateria) x) = jsonb_array_length(p_bateria);
end $function$
;

CREATE OR REPLACE FUNCTION app.estado_general(p_bateria jsonb, p_ev jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION app.ev_cerrar(p_ev jsonb, p_min integer, p_ahora timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION app.ev_estado(p_ev jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare v_usados int := jsonb_array_length(coalesce(p_ev->'intentos','[]'::jsonb)); v_extra int := coalesce((p_ev->>'extra')::int, 0);
begin
  if coalesce((p_ev->>'completada')::boolean, false) then return 'COMPLETADA'; end if;
  if exists (select 1 from jsonb_array_elements(coalesce(p_ev->'intentos','[]'::jsonb)) x where coalesce(x->>'fin','') = '') then return 'EN_CURSO'; end if;
  if v_usados < 2 + v_extra then return 'PENDIENTE'; end if;
  return case when v_extra = 1 then 'CERRADA' else 'BLOQUEADA' end;
end $function$
;

CREATE OR REPLACE FUNCTION app.ev_vacio()
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select '{"respuestas":{},"intentos":[],"extra":0,"completada":false}'::jsonb
$function$
;

CREATE OR REPLACE FUNCTION app.mi_marca()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select marca from public.perfiles where id = (select auth.uid()) and activo
$function$
;

CREATE OR REPLACE FUNCTION app.mi_rol()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select rol from public.perfiles where id = (select auth.uid()) and activo
$function$
;

CREATE OR REPLACE FUNCTION app.mi_tienda()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select tienda_id from public.perfiles where id = (select auth.uid()) and activo
$function$
;

CREATE OR REPLACE FUNCTION app.minutos_prueba(p_prueba text)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select coalesce(
    nullif((select (a.data->'minutosPrueba'->>p_prueba)::int from public.ajustes a where a.clave = 'config'), 0),
    case p_prueba when 'LOGICO' then 25 when 'PIL' then 15 when 'IPC' then 20 when 'DISC' then 20 else 40 end)
$function$
;

CREATE OR REPLACE FUNCTION app.nuevo_perfil()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.perfiles (id, correo, nombre, rol)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'nombre', ''),
          case when exists (select 1 from public.admins_iniciales a where a.correo = lower(new.email)) then 'admin' else 'pendiente' end);
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION app.puede_escribir(p_coleccion text, p_tienda text, p_marca text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

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
end $function$
;

CREATE OR REPLACE FUNCTION app.sellar_ficha()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.tienda_id is not null then
    select r.data->>'marca' into new.marca from public.registros r where r.coleccion = 'tiendas' and r.id = new.tienda_id;
  end if;
  new.actualizado := now();
  new.actualizado_por := coalesce(auth.uid(), new.actualizado_por);
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION app.sellar_registro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if new.coleccion = 'tiendas' then
    new.tienda_id := new.id;
    new.marca := new.data->>'marca';
  elsif new.tienda_id is not null then
    select r.data->>'marca' into new.marca from public.registros r where r.coleccion = 'tiendas' and r.id = new.tienda_id;
  elsif new.coleccion = 'modelosCompensacion' then
    new.marca := new.data->>'marca';
  end if;
  new.actualizado := now();
  new.actualizado_por := auth.uid();
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.agregar_prueba_acceso(p_id text, p_prueba text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.autorizar_reintento(p_id text, p_prueba text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.clave_cambiada()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  update public.perfiles set debe_cambiar_clave = false where id = (select auth.uid());
$function$
;

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
    'historico', coalesce((c->>'historico')::boolean, false),
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

CREATE OR REPLACE FUNCTION public.clima_validar(p_ciclo text, p_cedula text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.crear_acceso_prueba(p_id text, p_cedula text, p_clave text, p_trabajador_id text, p_solicitud_id text, p_tipo text, p_apellidos text, p_tienda_id text, p_nombre text, p_cargo_destino text, p_bateria jsonb, p_expira date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.generar_clave_integracion()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare k text;
begin
  if app.mi_rol() not in ('admin','rrhh') then raise exception 'Solo el Administrador o RRHH pueden generar la clave'; end if;
  k := 'sgi_' || encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.integracion_clave(id, huella, creada, creada_por) values (1, encode(extensions.digest(k, 'sha256'), 'hex'), now(), auth.uid())
  on conflict (id) do update set huella = excluded.huella, creada = now(), creada_por = auth.uid();
  return k;
end $function$
;

CREATE OR REPLACE FUNCTION public.guardar_pil(p_id text, p_pil jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.accesos_prueba;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('rrhh','admin') then raise exception 'Solo RRHH o el Administrador registran el resultado de integridad.'; end if;
  update public.accesos_prueba set pil = coalesce(pil, '{}'::jsonb) || coalesce(p_pil, '{}'::jsonb) where id = p_id returning * into v;
  if v.id is null then raise exception 'No se encontró el acceso.'; end if;
  return app.acceso_json(v);
end $function$
;

CREATE OR REPLACE FUNCTION public.portal_accion(p_cedula text, p_clave text, p_id text, p_prueba text, p_tipo text, p_respuestas jsonb, p_nivel text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.portal_ingresar(p_cedula text, p_clave text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end $function$
;

CREATE OR REPLACE FUNCTION public.portal_validos(p_cedula text, p_clave text)
 RETURNS SETOF accesos_prueba
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_ced text := regexp_replace(coalesce(p_cedula,''), '\D', '', 'g');
begin
  if exists (select 1 from public.accesos_prueba a where a.cedula = v_ced and a.bloqueado_hasta > now()) then
    raise exception 'Demasiados intentos fallidos. Espere 15 minutos e intente de nuevo.';
  end if;
  return query select a.* from public.accesos_prueba a
    where a.cedula = v_ced and a.estado in ('PENDIENTE','EN_CURSO') and a.expira >= current_date
      and a.clave_hash = extensions.crypt(upper(coalesce(p_clave,'')), a.clave_hash)
      and (a.tipo in ('INGRESO','DIRECTO','VALIDACION') or exists (select 1 from public.registros r where r.coleccion = 'solicitudes' and r.id = a.solicitud_id and r.data->>'estado' in ('PENDIENTE','EN_REVISION','APROBADA','DEVUELTA')));
end $function$
;

CREATE OR REPLACE FUNCTION public.recibir_formulario(p_clave text, p_filas jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare h text; f jsonb; limpia jsonb; n int := 0; nuevas int := 0; cambiadas int := 0; idf text; ced text; k text; antes jsonb; existe boolean;
begin
  select huella into h from public.integracion_clave where id = 1;
  if h is null or p_clave is null or encode(extensions.digest(p_clave, 'sha256'), 'hex') <> h then
    raise exception 'Clave de integracion no valida' using errcode = '28000';
  end if;
  if jsonb_typeof(p_filas) = 'object' then p_filas := jsonb_build_array(p_filas); end if;
  if jsonb_typeof(p_filas) <> 'array' or jsonb_array_length(p_filas) > 500 then raise exception 'Formato no valido (maximo 500 filas por envio)'; end if;
  for f in select * from jsonb_array_elements(p_filas) loop
    limpia := '{}'::jsonb;
    for k in select jsonb_object_keys(f) loop
      if lower(k) ~ '(banco|cuenta|declaro)' then continue; end if;
      limpia := limpia || jsonb_build_object(k, f -> k);
    end loop;
    idf := coalesce(f ->> 'Id', f ->> 'id', md5(limpia::text));
    ced := regexp_replace(coalesce(f ->> 'Cédula de Identidad', f ->> 'Cedula de Identidad', ''), '\D', '', 'g');
    select data into antes from public.formulario_recibido where id_formulario = idf;
    existe := found;
    if not existe then
      insert into public.formulario_recibido(id_formulario, cedula, data, procesado) values (idf, nullif(ced, ''), limpia, false);
      nuevas := nuevas + 1;
    elsif antes is distinct from limpia then
      update public.formulario_recibido set data = limpia, cedula = nullif(ced, ''), recibido = now(), procesado = false, procesado_en = null where id_formulario = idf;
      cambiadas := cambiadas + 1;
    end if;
    n := n + 1;
  end loop;
  return jsonb_build_object('recibidas', n, 'nuevas', nuevas, 'cambiadas', cambiadas, 'sin_cambios', n - nuevas - cambiadas);
end $function$
;

-- Políticas de acceso por fila (RLS)

create policy "rrhh y admin leen envios" on public.recordatorios_envios as PERMISSIVE for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM perfiles p
  WHERE ((p.id = auth.uid()) AND p.activo AND (p.rol = ANY (ARRAY['rrhh'::text, 'admin'::text]))))));

create policy accesos_anular on public.accesos_prueba as PERMISSIVE for UPDATE to authenticated
  using (((app.mi_rol() = ANY (ARRAY['rrhh'::text, 'admin'::text])) AND app.puede_ver('solicitudes'::text, tienda_id, marca)))
  with check ((estado = 'ANULADA'::text));

create policy accesos_leer on public.accesos_prueba as PERMISSIVE for SELECT to authenticated
  using (app.puede_ver('solicitudes'::text, tienda_id, marca));

create policy ajustes_actualizar on public.ajustes as PERMISSIVE for UPDATE to authenticated
  using ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])))
  with check ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])));

create policy ajustes_escribir on public.ajustes as PERMISSIVE for INSERT to authenticated
  with check ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])));

create policy ajustes_leer on public.ajustes as PERMISSIVE for SELECT to authenticated
  using (((app.mi_rol() IS NOT NULL) AND (app.mi_rol() <> 'pendiente'::text)));

create policy fichas_actualizar on public.fichas_personales as PERMISSIVE for UPDATE to authenticated
  using (((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])) OR ((app.mi_rol() = 'tienda'::text) AND (tienda_id = app.mi_tienda()))))
  with check (((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])) OR ((app.mi_rol() = 'tienda'::text) AND (tienda_id = app.mi_tienda()))));

create policy fichas_insertar on public.fichas_personales as PERMISSIVE for INSERT to authenticated
  with check (((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])) OR ((app.mi_rol() = 'tienda'::text) AND (tienda_id = app.mi_tienda()))));

create policy fichas_leer on public.fichas_personales as PERMISSIVE for SELECT to authenticated
  using (((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])) OR ((app.mi_rol() = 'tienda'::text) AND (tienda_id = app.mi_tienda()))));

create policy fichas_sensibles_actualizar on public.fichas_sensibles as PERMISSIVE for UPDATE to authenticated
  using ((app.mi_rol() = 'rrhh'::text))
  with check ((app.mi_rol() = 'rrhh'::text));

create policy fichas_sensibles_insertar on public.fichas_sensibles as PERMISSIVE for INSERT to authenticated
  with check ((app.mi_rol() = 'rrhh'::text));

create policy fichas_sensibles_leer on public.fichas_sensibles as PERMISSIVE for SELECT to authenticated
  using ((app.mi_rol() = 'rrhh'::text));

create policy formulario_recibido_leer on public.formulario_recibido as PERMISSIVE for SELECT to authenticated
  using ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])));

create policy formulario_recibido_marcar on public.formulario_recibido as PERMISSIVE for UPDATE to authenticated
  using ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])))
  with check ((app.mi_rol() = ANY (ARRAY['admin'::text, 'rrhh'::text])));

create policy perfiles_admin on public.perfiles as PERMISSIVE for UPDATE to authenticated
  using ((app.mi_rol() = 'admin'::text))
  with check ((app.mi_rol() = 'admin'::text));

create policy perfiles_leer on public.perfiles as PERMISSIVE for SELECT to authenticated
  using (((app.mi_rol() IS NOT NULL) AND ((app.mi_rol() <> 'pendiente'::text) OR (id = ( SELECT auth.uid() AS uid)))));

create policy registros_actualizar on public.registros as PERMISSIVE for UPDATE to authenticated
  using ((app.puede_ver(coleccion, tienda_id, marca) AND (coleccion <> 'bitacora'::text)))
  with check (app.puede_escribir(coleccion, tienda_id, marca));

create policy registros_borrar on public.registros as PERMISSIVE for DELETE to authenticated
  using ((app.puede_escribir(coleccion, tienda_id, marca) AND (coleccion <> 'bitacora'::text)));

create policy registros_insertar on public.registros as PERMISSIVE for INSERT to authenticated
  with check (app.puede_escribir(coleccion, tienda_id, marca));

create policy registros_leer on public.registros as PERMISSIVE for SELECT to authenticated
  using (app.puede_ver(coleccion, tienda_id, marca));

create policy respuestas_pil_leer on public.respuestas_pil as PERMISSIVE for SELECT to authenticated
  using ((app.mi_rol() = ANY (ARRAY['rrhh'::text, 'admin'::text])));

CREATE TRIGGER fichas_sellar BEFORE INSERT OR UPDATE ON public.fichas_personales FOR EACH ROW EXECUTE FUNCTION app.sellar_ficha();

CREATE TRIGGER registros_sellar BEFORE INSERT OR UPDATE ON public.registros FOR EACH ROW EXECUTE FUNCTION app.sellar_registro();

grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER on public.ajustes to anon;

grant INSERT, TRIGGER, DELETE, UPDATE, REFERENCES, TRUNCATE, SELECT on public.registros to anon;

grant INSERT, TRIGGER, REFERENCES, TRUNCATE, DELETE, UPDATE, SELECT on public.fichas_sensibles to authenticated;

grant INSERT, TRIGGER, REFERENCES, TRUNCATE, DELETE, UPDATE, SELECT on public.integracion_clave to anon;

grant INSERT, TRIGGER, REFERENCES, TRUNCATE, DELETE, UPDATE, SELECT on public.integracion_clave to authenticated;

grant INSERT, TRIGGER, REFERENCES, TRUNCATE, DELETE, UPDATE, SELECT on public.recordatorios_envios to anon;

grant INSERT, TRIGGER, TRUNCATE, REFERENCES, DELETE, UPDATE, SELECT on public.admins_iniciales to authenticated;

grant INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER on public.accesos_prueba to authenticated;

grant INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, SELECT on public.respuestas_pil to anon;

grant REFERENCES, TRUNCATE, DELETE, UPDATE, SELECT, INSERT, TRIGGER on public.respuestas_pil to authenticated;

grant SELECT on public.formulario_recibido to authenticated;

grant SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, INSERT, TRIGGER on public.admins_iniciales to anon;

grant SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, INSERT on public.fichas_personales to authenticated;

grant TRIGGER, INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES on public.perfiles to anon;

grant TRIGGER, INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES on public.perfiles to authenticated;

grant TRIGGER, REFERENCES, TRUNCATE, DELETE, UPDATE, INSERT on public.accesos_prueba to anon;

grant TRUNCATE, DELETE, UPDATE, TRIGGER, REFERENCES, INSERT, SELECT on public.recordatorios_envios to authenticated;

grant TRUNCATE, TRIGGER, REFERENCES, INSERT, SELECT, UPDATE, DELETE on public.ajustes to authenticated;

grant UPDATE, INSERT, SELECT, TRIGGER, REFERENCES, TRUNCATE, DELETE on public.registros to authenticated;

grant UPDATE, SELECT, DELETE, TRUNCATE, REFERENCES, TRIGGER, INSERT on public.fichas_personales to anon;

grant SELECT (trabajador_id, bateria, cargo_destino, cedula, creado, creado_por, estado, ev, expira, fin, id, inicio, marca, nivel_educativo, nombre, tipo, apellidos, respuestas, solicitud_id, tienda_id) on public.accesos_prueba to authenticated;

grant UPDATE (procesado, procesado_en) on public.formulario_recibido to authenticated;

grant execute on function agregar_prueba_acceso(text,text) to authenticated;

grant execute on function autorizar_reintento(text,text) to authenticated;

grant execute on function clave_cambiada() to authenticated;

grant execute on function clima_ciclo(text) to anon, authenticated;

grant execute on function clima_enviar(text,text,jsonb) to anon, authenticated;

grant execute on function clima_validar(text,text) to anon, authenticated;

grant execute on function crear_acceso_prueba(text,text,text,text,text,text,text,text,text,text,jsonb,date) to authenticated;

grant execute on function generar_clave_integracion() to authenticated;

grant execute on function guardar_pil(text,jsonb) to authenticated;

grant execute on function portal_accion(text,text,text,text,text,jsonb,text) to anon, authenticated;

grant execute on function portal_ingresar(text,text) to anon, authenticated;

grant execute on function recibir_formulario(text,jsonb) to anon, authenticated;

-- Disparador sobre auth.users (crea el perfil al registrar un usuario; el correo de admins_iniciales nace como admin)
CREATE TRIGGER al_crear_usuario AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION app.nuevo_perfil();

-- Datos iniciales obligatorios: correo autorizado para el «Primer acceso del Administrador»
-- insert into public.admins_iniciales (correo) values ('correo.del.administrador@empresa.com');
