-- Migración 20261005021543 · esquema_inicial_sgi_rrhh
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

-- Perfiles de usuario (1:1 con auth.users)
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre text not null default '',
  rol text not null default 'pendiente' check (rol in ('admin','marca','operaciones','general','rrhh','tienda','visor','pendiente')),
  marca text check (marca in ('BALU','PLANETA')),
  tienda_id text,
  activo boolean not null default true,
  debe_cambiar_clave boolean not null default true,
  creado timestamptz not null default now()
);
create table public.admins_iniciales (correo text primary key);

-- Registros de la aplicación (una fila por elemento de cada colección)
create table public.registros (
  coleccion text not null,
  id text not null,
  tienda_id text,
  marca text,
  data jsonb not null,
  actualizado timestamptz not null default now(),
  actualizado_por uuid default auth.uid(),
  primary key (coleccion, id)
);
create index registros_coleccion_tienda on public.registros (coleccion, tienda_id);
create index registros_marca on public.registros (marca);

-- Ajustes globales (config, plantillas, HC, montos, pruebas)
create table public.ajustes (
  clave text primary key,
  data jsonb not null,
  actualizado timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);

-- Ficha personal (formulario de actualización de datos), sin datos bancarios
create table public.fichas_personales (
  cedula text primary key,
  trabajador_id text,
  tienda_id text,
  marca text,
  data jsonb not null,
  fuente text,
  actualizado timestamptz not null default now(),
  actualizado_por uuid default auth.uid()
);
create index fichas_tienda on public.fichas_personales (tienda_id);

alter table public.perfiles enable row level security;
alter table public.admins_iniciales enable row level security;
alter table public.registros enable row level security;
alter table public.ajustes enable row level security;
alter table public.fichas_personales enable row level security;

-- Funciones de alcance (esquema no expuesto por la API)
create schema if not exists app;
grant usage on schema app to authenticated;

create or replace function app.mi_rol() returns text language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = (select auth.uid()) and activo
$$;
create or replace function app.mi_marca() returns text language sql stable security definer set search_path = '' as $$
  select marca from public.perfiles where id = (select auth.uid()) and activo
$$;
create or replace function app.mi_tienda() returns text language sql stable security definer set search_path = '' as $$
  select tienda_id from public.perfiles where id = (select auth.uid()) and activo
$$;

create or replace function app.puede_ver(p_coleccion text, p_tienda text, p_marca text) returns boolean language plpgsql stable security definer set search_path = '' as $$
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
  -- marca, operaciones, visor: solo su marca
  return p_marca is not null and p_marca = app.mi_marca();
end $$;

create or replace function app.puede_escribir(p_coleccion text, p_tienda text, p_marca text) returns boolean language plpgsql stable security definer set search_path = '' as $$
declare r text := app.mi_rol();
begin
  if r is null or r in ('pendiente','visor') then return false; end if;
  if p_coleccion = 'bitacora' then return true; end if;
  if p_coleccion in ('tiendas','cargos','modelosCompensacion') then return r in ('admin','rrhh'); end if;
  if p_coleccion = 'concursos' then return r in ('admin','rrhh','general'); end if;
  return app.puede_ver(p_coleccion, p_tienda, p_marca);
end $$;

grant execute on function app.mi_rol(), app.mi_marca(), app.mi_tienda(), app.puede_ver(text,text,text), app.puede_escribir(text,text,text) to authenticated;

-- Marca y sello de auditoría calculados en el servidor
create or replace function app.sellar_registro() returns trigger language plpgsql security definer set search_path = '' as $$
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
end $$;
create trigger registros_sellar before insert or update on public.registros for each row execute function app.sellar_registro();

create or replace function app.sellar_ficha() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.tienda_id is not null then
    select r.data->>'marca' into new.marca from public.registros r where r.coleccion = 'tiendas' and r.id = new.tienda_id;
  end if;
  new.actualizado := now();
  new.actualizado_por := coalesce(auth.uid(), new.actualizado_por);
  return new;
end $$;
create trigger fichas_sellar before insert or update on public.fichas_personales for each row execute function app.sellar_ficha();

-- Perfil automático al crear un usuario de autenticación
create or replace function app.nuevo_perfil() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, correo, nombre, rol)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data->>'nombre', ''),
          case when exists (select 1 from public.admins_iniciales a where a.correo = lower(new.email)) then 'admin' else 'pendiente' end);
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users for each row execute function app.nuevo_perfil();

-- Políticas
create policy perfiles_leer on public.perfiles for select to authenticated using (app.mi_rol() is not null and (app.mi_rol() <> 'pendiente' or id = (select auth.uid())));
create policy perfiles_admin on public.perfiles for update to authenticated using (app.mi_rol() = 'admin') with check (app.mi_rol() = 'admin');

create policy registros_leer on public.registros for select to authenticated using (app.puede_ver(coleccion, tienda_id, marca));
create policy registros_insertar on public.registros for insert to authenticated with check (app.puede_escribir(coleccion, tienda_id, marca));
create policy registros_actualizar on public.registros for update to authenticated using (app.puede_ver(coleccion, tienda_id, marca) and coleccion <> 'bitacora') with check (app.puede_escribir(coleccion, tienda_id, marca));
create policy registros_borrar on public.registros for delete to authenticated using (app.puede_escribir(coleccion, tienda_id, marca) and coleccion <> 'bitacora');

create policy ajustes_leer on public.ajustes for select to authenticated using (app.mi_rol() is not null and app.mi_rol() <> 'pendiente');
create policy ajustes_escribir on public.ajustes for insert to authenticated with check (app.mi_rol() in ('admin','rrhh'));
create policy ajustes_actualizar on public.ajustes for update to authenticated using (app.mi_rol() in ('admin','rrhh')) with check (app.mi_rol() in ('admin','rrhh'));

create policy fichas_leer on public.fichas_personales for select to authenticated using (app.mi_rol() in ('admin','rrhh') or (app.mi_rol() = 'tienda' and tienda_id = app.mi_tienda()));
create policy fichas_insertar on public.fichas_personales for insert to authenticated with check (app.mi_rol() in ('admin','rrhh') or (app.mi_rol() = 'tienda' and tienda_id = app.mi_tienda()));
create policy fichas_actualizar on public.fichas_personales for update to authenticated using (app.mi_rol() in ('admin','rrhh') or (app.mi_rol() = 'tienda' and tienda_id = app.mi_tienda())) with check (app.mi_rol() in ('admin','rrhh') or (app.mi_rol() = 'tienda' and tienda_id = app.mi_tienda()));

-- RPC: marcar que el usuario ya cambió su clave inicial
create or replace function public.clave_cambiada() returns void language sql security definer set search_path = '' as $$
  update public.perfiles set debe_cambiar_clave = false where id = (select auth.uid());
$$;
revoke execute on function public.clave_cambiada() from public, anon;
grant execute on function public.clave_cambiada() to authenticated;;
