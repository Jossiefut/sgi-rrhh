-- v1.27.0 · Plan de sucesión administrativo: seguridad en el servidor.
-- Aplicar en Supabase › SQL Editor (después de las demás migraciones pendientes). Es seguro repetirlo.
-- Los registros de la colección «nominaciones» con data.administrativo = true (sucesores de cargos administrativos) quedan así:
--   · Leer: solo admin, rrhh, general y junta (ni el Analista, ni marca, ni operaciones, ni tienda).
--   · Crear, modificar y borrar: solo admin y rrhh (ni siquiera Gerencia General).
-- Las políticas son RESTRICTIVAS: se suman (AND) a las que ya existen y no las reemplazan.

drop policy if exists sucesion_adm_leer on public.registros;
create policy sucesion_adm_leer on public.registros as RESTRICTIVE for SELECT to authenticated
  using (coleccion <> 'nominaciones' or coalesce((data->>'administrativo')::boolean, false) = false
         or app.mi_rol() = any (array['admin','rrhh','general','junta']));

drop policy if exists sucesion_adm_insertar on public.registros;
create policy sucesion_adm_insertar on public.registros as RESTRICTIVE for INSERT to authenticated
  with check (coleccion <> 'nominaciones' or coalesce((data->>'administrativo')::boolean, false) = false
              or app.mi_rol() = any (array['admin','rrhh']));

drop policy if exists sucesion_adm_actualizar on public.registros;
create policy sucesion_adm_actualizar on public.registros as RESTRICTIVE for UPDATE to authenticated
  using (coleccion <> 'nominaciones' or coalesce((data->>'administrativo')::boolean, false) = false
         or app.mi_rol() = any (array['admin','rrhh']))
  with check (coleccion <> 'nominaciones' or coalesce((data->>'administrativo')::boolean, false) = false
              or app.mi_rol() = any (array['admin','rrhh']));

drop policy if exists sucesion_adm_borrar on public.registros;
create policy sucesion_adm_borrar on public.registros as RESTRICTIVE for DELETE to authenticated
  using (coleccion <> 'nominaciones' or coalesce((data->>'administrativo')::boolean, false) = false
         or app.mi_rol() = any (array['admin','rrhh']));
