#!/bin/bash
# Verifica que la base de datos se pueda crear desde cero en un PostgreSQL 15+ local, por dos caminos:
#   1) esquema-actual.sql (foto exacta del servidor)   2) todas las migraciones de migraciones/ en orden
# y que ambos caminos den lo mismo: tablas, columnas, políticas RLS y funciones (con el mismo código).
# Simula lo mínimo de Supabase: roles anon/authenticated/service_role, esquema auth (users, uid()) y extensiones.
# Uso: bash supabase/probar-esquema.sh      (requiere PostgreSQL instalado: initdb, pg_ctl y psql)
set -e
cd "$(dirname "$0")"
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)
[ -z "$BIN" ] && BIN=$(dirname "$(command -v initdb)")
T=$(mktemp -d); chmod 777 "$T"
correr() { if [ "$(id -u)" = "0" ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
correr "$BIN/initdb -D $T/db -A trust -U postgres >/dev/null"
correr "$BIN/pg_ctl -D $T/db -o '-p 54329 -k $T' -l $T/log start >/dev/null"
trap 'correr "$BIN/pg_ctl -D $T/db stop -m fast >/dev/null"; rm -rf "$T"' EXIT
sleep 2
PSQL="$BIN/psql -h $T -p 54329 -U postgres -v ON_ERROR_STOP=1 -q"
cat > "$T/stub.sql" <<'SQL'
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin; create role authenticated nologin; create role service_role nologin;
  end if;
end $$;
create schema auth; create schema extensions;
create extension pgcrypto with schema extensions; create extension "uuid-ossp" with schema extensions;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
SQL
cat > "$T/huella.sql" <<'SQL'
select p.oid::regprocedure::text || ' ' || md5(regexp_replace(p.prosrc, '\s+', ' ', 'g'))
  from pg_proc p where p.pronamespace in ('public'::regnamespace, 'app'::regnamespace)
union all
select 'politica ' || tablename || '.' || policyname || ' ' || cmd || ' ' || md5(regexp_replace(coalesce(qual, '') || coalesce(with_check, ''), '\s+', '', 'g'))
  from pg_policies where schemaname = 'public'
union all
select 'columna ' || table_name || '.' || column_name || ' ' || data_type
  from information_schema.columns where table_schema = 'public'
order by 1;
SQL
chmod 644 "$T"/*.sql
for modo in esquema migraciones; do
  correr "$PSQL -c 'create database prueba_$modo'"
  correr "$PSQL -d prueba_$modo -f $T/stub.sql"
  if [ $modo = esquema ]; then
    correr "$PSQL -d prueba_$modo -f $PWD/esquema-actual.sql" >/dev/null 2>&1 || { echo "✗ Falla al aplicar esquema-actual.sql"; exit 1; }
  else
    for f in migraciones/*.sql; do correr "$PSQL -d prueba_$modo -f $PWD/$f" >/dev/null 2>&1 || { echo "✗ Falla al aplicar $f"; exit 1; }; done
  fi
  N=$(correr "$PSQL -d prueba_$modo -At -c \"select (select count(*) from pg_tables where schemaname='public')||' tablas, '||(select count(*) from pg_policies where schemaname='public')||' políticas, '||(select count(*) from pg_proc where pronamespace in ('public'::regnamespace,'app'::regnamespace))||' funciones'\"")
  echo "✓ $modo: $N"
  correr "$PSQL -d prueba_$modo -At -f $T/huella.sql" > "$T/huella_$modo.txt"
done
if diff "$T/huella_esquema.txt" "$T/huella_migraciones.txt" > "$T/dif.txt"; then
  echo "✓ Las migraciones dan exactamente el esquema actual (tablas, columnas, políticas y código de funciones)"
else
  echo "✗ Diferencias (< esquema actual, > migraciones):"; cat "$T/dif.txt"; exit 1
fi
