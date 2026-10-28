-- v1.16.0 · Restablecer la contraseña con preguntas de seguridad (autoservicio con bloqueo).
-- PENDIENTE DE APLICAR: cuando se aplique en Supabase, mover este archivo a supabase/migraciones/ y regenerar esquema-actual.sql.
-- Las respuestas se guardan SOLO como hash (bcrypt) y se comparan en el servidor; ninguna tabla es legible desde el navegador
-- salvo el registro de restablecimientos, que ve únicamente el Administrador.

create table if not exists public.preguntas_seguridad (
  user_id uuid primary key references auth.users(id) on delete cascade,
  p1 text not null, p2 text not null, p3 text not null,
  h1 text not null, h2 text not null, h3 text not null,
  actualizado timestamptz not null default now()
);
alter table public.preguntas_seguridad enable row level security;
revoke all on public.preguntas_seguridad from anon, authenticated;

create table if not exists public.restablecer_intentos (
  correo text primary key,
  intentos int not null default 0,
  bloqueado_hasta timestamptz,
  ultimo timestamptz not null default now()
);
alter table public.restablecer_intentos enable row level security;
revoke all on public.restablecer_intentos from anon, authenticated;

create table if not exists public.restablecer_registro (
  id bigint generated always as identity primary key,
  correo text not null,
  momento timestamptz not null default now(),
  resultado text not null
);
alter table public.restablecer_registro enable row level security;
revoke all on public.restablecer_registro from anon, authenticated;
grant select on public.restablecer_registro to authenticated;
drop policy if exists restablecer_registro_admin on public.restablecer_registro;
create policy restablecer_registro_admin on public.restablecer_registro for select to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin' and p.activo));

-- Respuesta normalizada: sin tildes, sin espacios ni signos, en minúsculas
create or replace function public.normalizar_respuesta(t text) returns text
language sql immutable set search_path = public as $$
  select lower(regexp_replace(translate(coalesce(t, ''), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'), '[^A-Za-z0-9]', '', 'g'))
$$;

-- La persona autenticada define o cambia sus preguntas (3 preguntas distintas, respuestas de 3 o más caracteres)
create or replace function public.guardar_preguntas_seguridad(p1 text, r1 text, p2 text, r2 text, p3 text, r3 text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sesión no válida.'; end if;
  if p1 is null or p2 is null or p3 is null or p1 = p2 or p1 = p3 or p2 = p3 then raise exception 'Elija tres preguntas distintas.'; end if;
  if length(normalizar_respuesta(r1)) < 3 or length(normalizar_respuesta(r2)) < 3 or length(normalizar_respuesta(r3)) < 3 then
    raise exception 'Cada respuesta debe tener al menos 3 caracteres.';
  end if;
  insert into preguntas_seguridad (user_id, p1, p2, p3, h1, h2, h3, actualizado)
  values (uid, p1, p2, p3, crypt(normalizar_respuesta(r1), gen_salt('bf')), crypt(normalizar_respuesta(r2), gen_salt('bf')), crypt(normalizar_respuesta(r3), gen_salt('bf')), now())
  on conflict (user_id) do update set p1 = excluded.p1, p2 = excluded.p2, p3 = excluded.p3, h1 = excluded.h1, h2 = excluded.h2, h3 = excluded.h3, actualizado = now();
end $$;

create or replace function public.tiene_preguntas_seguridad() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from preguntas_seguridad where user_id = auth.uid())
$$;

-- Preguntas de un correo. Si el correo no existe o no las configuró, devuelve tres preguntas simuladas fijas
-- (derivadas del correo) para no revelar si la cuenta existe.
create or replace function public.preguntas_de_correo(p_correo text) returns text[]
language plpgsql stable security definer set search_path = public, extensions as $$
declare c text := lower(trim(coalesce(p_correo, ''))); q record; h text; n int;
begin
  select ps.p1, ps.p2, ps.p3 into q from preguntas_seguridad ps join perfiles pf on pf.id = ps.user_id where pf.correo = c and pf.activo;
  if found then return array[q.p1, q.p2, q.p3]; end if;
  h := md5(c);
  n := (get_byte(decode(substr(h, 1, 2), 'hex'), 0) % 10) + 1;
  return array['q' || lpad(n::text, 2, '0'), 'q' || lpad((((n + 2) % 10) + 1)::text, 2, '0'), 'q' || lpad((((n + 5) % 10) + 1)::text, 2, '0')];
end $$;
grant execute on function public.preguntas_de_correo(text) to anon, authenticated;
grant execute on function public.guardar_preguntas_seguridad(text, text, text, text, text, text) to authenticated;
grant execute on function public.tiene_preguntas_seguridad() to authenticated;

-- Verificación de las respuestas: solo la función de servidor (service_role) puede llamarla.
-- Bloqueo: 5 intentos fallidos = 30 minutos. Cada intento queda en restablecer_registro.
create or replace function public.verificar_respuestas_seguridad(p_correo text, p_resp text[]) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare c text := lower(trim(coalesce(p_correo, ''))); t restablecer_intentos; ps preguntas_seguridad; uid uuid; bien boolean;
begin
  insert into restablecer_intentos (correo) values (c) on conflict (correo) do nothing;
  select * into t from restablecer_intentos where correo = c for update;
  if t.bloqueado_hasta is not null and t.bloqueado_hasta > now() then
    insert into restablecer_registro (correo, resultado) values (c, 'BLOQUEADO');
    return jsonb_build_object('ok', false, 'bloqueado', true, 'minutos', greatest(1, ceil(extract(epoch from (t.bloqueado_hasta - now())) / 60)::int));
  end if;
  select pf.id into uid from perfiles pf where pf.correo = c and pf.activo;
  if uid is not null then select * into ps from preguntas_seguridad where user_id = uid; end if;
  bien := uid is not null and ps.user_id is not null and array_length(p_resp, 1) = 3
    and ps.h1 = crypt(normalizar_respuesta(p_resp[1]), ps.h1) and ps.h2 = crypt(normalizar_respuesta(p_resp[2]), ps.h2) and ps.h3 = crypt(normalizar_respuesta(p_resp[3]), ps.h3);
  if bien then
    update restablecer_intentos set intentos = 0, bloqueado_hasta = null, ultimo = now() where correo = c;
    insert into restablecer_registro (correo, resultado) values (c, 'OK');
    return jsonb_build_object('ok', true, 'user_id', uid);
  end if;
  update restablecer_intentos set intentos = case when t.intentos + 1 >= 5 then 0 else t.intentos + 1 end,
    bloqueado_hasta = case when t.intentos + 1 >= 5 then now() + interval '30 minutes' else null end, ultimo = now() where correo = c;
  insert into restablecer_registro (correo, resultado) values (c, case when t.intentos + 1 >= 5 then 'BLOQUEO_30_MIN' else 'FALLIDO' end);
  return jsonb_build_object('ok', false, 'bloqueado', t.intentos + 1 >= 5, 'minutos', case when t.intentos + 1 >= 5 then 30 else 0 end, 'restantes', greatest(0, 4 - t.intentos));
end $$;
revoke all on function public.verificar_respuestas_seguridad(text, text[]) from public, anon, authenticated;
grant execute on function public.verificar_respuestas_seguridad(text, text[]) to service_role;
