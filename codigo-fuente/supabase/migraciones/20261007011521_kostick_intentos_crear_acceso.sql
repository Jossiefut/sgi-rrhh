-- Migración 20261007011521 · kostick_intentos_crear_acceso
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

create or replace function public.crear_acceso_prueba(p_id text, p_cedula text, p_clave text, p_trabajador_id text, p_solicitud_id text, p_tipo text, p_apellidos text, p_tienda_id text, p_nombre text, p_cargo_destino text, p_bateria jsonb, p_expira date) returns void
language plpgsql security definer set search_path = '' as $$
declare v_marca text;
begin
  if app.mi_rol() is null or app.mi_rol() not in ('tienda','marca','rrhh','admin') then raise exception 'Su rol no puede crear accesos a pruebas.'; end if;
  if coalesce(p_tipo, 'PROMOCION') not in ('PROMOCION','INGRESO') then raise exception 'Tipo de acceso no válido.'; end if;
  if p_tipo = 'INGRESO' and p_bateria <> '["LOGICO"]'::jsonb then raise exception 'Los candidatos a ingreso solo presentan el Indicador Lógico.'; end if;
  select r.data->>'marca' into v_marca from public.registros r where r.coleccion = 'tiendas' and r.id = p_tienda_id;
  if not app.puede_ver('solicitudes', p_tienda_id, v_marca) then raise exception 'La tienda está fuera de su alcance.'; end if;
  if length(coalesce(p_clave,'')) < 2 or length(regexp_replace(coalesce(p_cedula,''), '\D', '', 'g')) < 6 then raise exception 'Cédula o clave no válidas.'; end if;
  insert into public.accesos_prueba (id, cedula, clave_hash, trabajador_id, solicitud_id, tipo, apellidos, tienda_id, marca, nombre, cargo_destino, bateria, expira)
  values (p_id, regexp_replace(p_cedula, '\D', '', 'g'), extensions.crypt(upper(p_clave), extensions.gen_salt('bf')), nullif(p_trabajador_id, ''), nullif(p_solicitud_id, ''), coalesce(p_tipo, 'PROMOCION'), p_apellidos, p_tienda_id, v_marca, p_nombre, p_cargo_destino, coalesce(p_bateria, '[]'::jsonb), p_expira);
end $$;
revoke all on function public.crear_acceso_prueba(text, text, text, text, text, text, text, text, text, text, jsonb, date) from public, anon;
grant execute on function public.crear_acceso_prueba(text, text, text, text, text, text, text, text, text, text, jsonb, date) to authenticated;;
