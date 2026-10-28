-- Migración 20261008185510 · recepcion_formulario_solo_si_cambia
-- Exportada de supabase_migrations.schema_migrations (proyecto sgi-rrhh-marcas-propias)

-- Si Power Automate reenvia una fila sin cambios, no vuelve a quedar por revisar: solo se actualiza cuando el contenido cambia.
create or replace function public.recibir_formulario(p_clave text, p_filas jsonb)
returns jsonb language plpgsql security definer set search_path to '' as $$
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
end $$;
revoke all on function public.recibir_formulario(text, jsonb) from public;
grant execute on function public.recibir_formulario(text, jsonb) to anon, authenticated;;
