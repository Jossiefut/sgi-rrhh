#!/bin/bash
# Prueba en un PostgreSQL local la migración pendiente de "restablecer clave con preguntas de seguridad".
set -e
cd "$(dirname "$0")"
BIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1); [ -z "$BIN" ] && BIN=$(dirname "$(command -v initdb)")
T=$(mktemp -d); chmod 777 "$T"
correr() { if [ "$(id -u)" = "0" ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
correr "$BIN/initdb -D $T/db -A trust -U postgres >/dev/null"
correr "$BIN/pg_ctl -D $T/db -o '-p 54330 -k $T' -l $T/log start >/dev/null"
trap 'correr "$BIN/pg_ctl -D $T/db stop -m fast >/dev/null"; rm -rf "$T"' EXIT
sleep 2
PSQL="$BIN/psql -h $T -p 54330 -U postgres -v ON_ERROR_STOP=1 -q -At"
sed -n "/^do \$\$ begin/,/^SQL\$/p" probar-esquema.sh | sed '$d' > "$T/stub.sql"
cat > "$T/prueba.sql" <<'SQL'
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'ana@ejemplo.test');
update public.perfiles set nombre = 'Ana', rol = 'rrhh' where id = '11111111-1111-1111-1111-111111111111';
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.guardar_preguntas_seguridad('q01','Caracas','q02','Rex','q03','Pérez');
select 'T1 tiene_preguntas=' || public.tiene_preguntas_seguridad();
select 'T2 preguntas=' || array_to_string(public.preguntas_de_correo('ANA@ejemplo.test'), ',');
select 'T3 simuladas=' || array_to_string(public.preguntas_de_correo('nadie@ejemplo.test'), ',') || ' / ' || array_to_string(public.preguntas_de_correo('nadie@ejemplo.test'), ',');
select 'T4 correcto=' || (public.verificar_respuestas_seguridad('ana@ejemplo.test', array['  CARACAS ','rex','perez']))::text;
select 'T5 fallo1=' || (public.verificar_respuestas_seguridad('ana@ejemplo.test', array['x','rex','perez']))::text;
select 'T6 fallo2=' || (public.verificar_respuestas_seguridad('ana@ejemplo.test', array['x','rex','perez'])->>'restantes');
select public.verificar_respuestas_seguridad('ana@ejemplo.test', array['x','rex','perez']);
select public.verificar_respuestas_seguridad('ana@ejemplo.test', array['x','rex','perez']);
select 'T7 bloqueo=' || (public.verificar_respuestas_seguridad('ana@ejemplo.test', array['x','rex','perez']))::text;
select 'T8 bloqueado aun con respuestas correctas=' || (public.verificar_respuestas_seguridad('ana@ejemplo.test', array['caracas','rex','perez'])->>'bloqueado');
select 'T9 desconocido=' || (public.verificar_respuestas_seguridad('nadie@ejemplo.test', array['a','b','c'])->>'ok');
select 'T10 registro=' || string_agg(resultado, ',' order by id) from public.restablecer_registro where correo = 'ana@ejemplo.test';
select 'T11 hash_no_texto=' || (h1 <> 'caracas' and h1 like '$2%') from public.preguntas_seguridad;
set role authenticated;
select 'T12 usuario_no_lee_tabla=' || (select count(*) from information_schema.table_privileges where table_name='preguntas_seguridad' and grantee='authenticated');
do $$ begin perform public.verificar_respuestas_seguridad('ana@ejemplo.test', array['a','b','c']); raise notice 'T13 FALLA: authenticated pudo verificar'; exception when insufficient_privilege then raise notice 'T13 authenticated no puede verificar: ok'; end $$;
select 'T14 admin_ve_registro=' || (select count(*) from public.restablecer_registro);
SQL
chmod 644 "$T"/*.sql
correr "$PSQL -c 'create database prueba'"
correr "$PSQL -d prueba -f $T/stub.sql" >/dev/null
correr "$PSQL -d prueba -f $PWD/esquema-actual.sql" >/dev/null 2>&1 || { echo "✗ esquema-actual.sql"; exit 1; }
correr "$PSQL -d prueba -f $PWD/pendientes/20261009120000_restablecer_clave_preguntas.sql" >/dev/null || { echo "✗ migración"; exit 1; }
correr "$PSQL -d prueba -f $T/prueba.sql" 2>&1
