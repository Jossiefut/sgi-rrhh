# Perfil «Analista de RRHH» y requisiciones de personal (v1.25.0) — pasos para activarlo en la nube

El sistema ya incluye el perfil y las requisiciones. Para que funcionen con el inicio de sesión real (Supabase) hacen falta dos pasos:

1. **Base de datos.** Aplique primero `20261013120000_remuneracion_kpi_junta.sql` (si aún no lo hizo) y después `20261015120000_rol_analista_requisiciones.sql` en Supabase › SQL Editor. Agrega el rol `analista` (consulta como RRHH, no escribe) y permite que la tienda y RRHH lean y firmen las requisiciones. No crea tablas nuevas.
2. **Función de servidor.** Vuelva a publicar `admin-usuarios` (Edge Functions › admin-usuarios › pegar `functions/admin-usuarios/index.ts`), para poder crear usuarios con el perfil «Analista de RRHH» desde Usuarios y accesos.

Mientras no se haga, el Administrador no podrá asignar el perfil Analista a una cuenta real; la demostración y el resto del sistema no se afectan.

Después de aplicar: mover el SQL a `supabase/migraciones/` y regenerar `esquema-actual.sql` (pídaselo a Claude: «apliqué la migración»).
